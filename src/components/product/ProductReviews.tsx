'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { StarRating } from '@/components/common';
import { Button, Input, useToast } from '@/components/ui';
import { useAuthStore } from '@/store';
import { apiClient } from '@/lib/api-client';
import { ProductReview, ReviewSummary } from '@/types/review';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const emptySummary: ReviewSummary = { averageRating: 0, reviewCount: 0 };

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
  const { showToast } = useToast();
  const { isAuthenticated, hasCheckedAuth } = useAuthStore();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [summary, setSummary] = useState(emptySummary);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void apiClient.getReviews(productId, productName).then((response) => {
      if (cancelled) return;
      if (response.success && response.data) {
        setReviews(response.data.reviews);
        setSummary(response.data.summary);
        setError(null);
      } else {
        setError(response.error || 'Reviews are unavailable right now.');
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [productId, productName]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isAuthenticated) {
      showToast('Please login to share a review.', 'error');
      return;
    }
    if (rating === 0) {
      showToast('Please choose a star rating.', 'error');
      return;
    }
    setIsSubmitting(true);
    const response = await apiClient.createReview(productId, {
      productName,
      rating,
      title,
      comment,
    });
    if (!response.success || !response.data) {
      showToast(response.error || 'Unable to submit your review.', 'error');
      setIsSubmitting(false);
      return;
    }
    const nextReviews = [response.data, ...reviews];
    setReviews(nextReviews);
    setSummary({
      averageRating: Number((nextReviews.reduce((sum, review) => sum + review.rating, 0) / nextReviews.length).toFixed(1)),
      reviewCount: nextReviews.length,
    });
    setRating(0);
    setTitle('');
    setComment('');
    setIsSubmitting(false);
    showToast('Your review has been published.', 'success');
  };

  return (
    <section className="mt-20 w-full border-t border-line pt-12" aria-labelledby="reviews-heading">
      <div className="grid min-w-0 w-full gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
        <div className="min-w-0">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">The community</p>
          <h2 id="reviews-heading" className="text-3xl font-light tracking-[-0.04em] text-ink">Reviews</h2>
          <div className="mt-5 flex items-center gap-3">
            <span className="text-4xl font-light text-ink">{summary.averageRating.toFixed(1)}</span>
            <div><StarRating rating={summary.averageRating} size={18} /><p className="mt-1 text-xs text-muted">{summary.reviewCount} {summary.reviewCount === 1 ? 'review' : 'reviews'}</p></div>
          </div>
          {hasCheckedAuth && isAuthenticated ? (
            <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4 rounded-md border border-line bg-white p-5 sm:p-6">
              <h3 className="text-lg font-medium text-ink">Share your experience</h3>
              <div className="min-w-0">
                <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted">Your rating</p>
                <StarRating rating={rating} interactive onRatingChange={setRating} size={23} />
              </div>
              <Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} minLength={5} maxLength={100} required />
              <div>
                <label htmlFor="review-comment" className="mb-2 block text-xs font-medium uppercase tracking-[0.1em] text-muted">Review</label>
                <textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} minLength={20} maxLength={2000} required rows={5} className="w-full resize-y rounded-md border border-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-colors placeholder:text-gray-400 focus:border-olive focus:ring-1 focus:ring-olive" />
                <p className="mt-1 text-xs text-muted">At least 20 characters.</p>
              </div>
              <Button type="submit" variant="primary" isLoading={isSubmitting}><Send size={15} /> Submit review</Button>
            </form>
          ) : (
            <p className="mt-8 text-sm leading-6 text-muted">Sign in to share your experience with this piece.</p>
          )}
        </div>
        <div>
          {isLoading && <p className="text-sm text-muted">Loading reviews...</p>}
          {!isLoading && error && <p className="rounded-md border border-line bg-white p-5 text-sm text-muted">{error}</p>}
          {!isLoading && !error && reviews.length === 0 && <p className="rounded-md border border-dashed border-line bg-white p-8 text-sm text-muted">No reviews yet. Be the first to share your experience.</p>}
          {!isLoading && !error && reviews.length > 0 && <div className="divide-y divide-line rounded-md border border-line bg-white px-5">{reviews.map((review) => <article key={review.id} className="py-6"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><StarRating rating={review.rating} size={15} /><span className="text-sm font-medium text-ink">{review.user.firstName} {review.user.lastName}</span>{review.verified && <span className="inline-flex items-center gap-1 text-xs text-olive"><CheckCircle2 size={13} /> Verified purchase</span>}</div><time dateTime={review.createdAt} className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</time></div>{review.title && <h3 className="mt-4 text-base font-medium text-ink">{review.title}</h3>}<p className="mt-2 text-sm leading-6 text-muted">{review.comment}</p></article>)}</div>}
        </div>
      </div>
    </section>
  );
}

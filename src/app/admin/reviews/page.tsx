'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, ShieldAlert, Trash2 } from 'lucide-react';
import { Badge } from '@/components/common';
import { Button } from '@/components/ui';
import { apiClient, type AdminReview } from '@/lib/api-client';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = useMemo(() => reviews.filter((review) => !review.published).length, [reviews]);

  const loadReviews = async () => {
    setIsLoading(true);
    const response = await apiClient.getAdminReviews();
    if (response.success && response.data) {
      setReviews(response.data as AdminReview[]);
      setError(null);
    } else {
      setError(response.error || 'Unable to load reviews.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    void apiClient.getAdminReviews().then((response) => {
      if (cancelled) return;
      if (response.success && response.data) {
        setReviews(response.data);
        setError(null);
      } else {
        setError(response.error || 'Unable to load reviews.');
      }
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const moderate = async (review: AdminReview, published: boolean) => {
    setUpdatingId(review.id);
    const response = await apiClient.moderateReview(review.id, published);
    if (response.success) {
      setReviews((current) => current.map((item) => item.id === review.id ? { ...item, published } : item));
    } else {
      setError(response.error || 'Unable to update review.');
    }
    setUpdatingId(null);
  };

  const remove = async (review: AdminReview) => {
    if (!window.confirm('Delete this review permanently?')) return;
    setUpdatingId(review.id);
    const response = await apiClient.deleteReview(review.id);
    if (response.success) {
      setReviews((current) => current.filter((item) => item.id !== review.id));
    } else {
      setError(response.error || 'Unable to delete review.');
    }
    setUpdatingId(null);
  };

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Admin / Moderation</p>
            <h1 className="text-4xl font-light tracking-[-0.04em] text-ink">Product reviews</h1>
            <p className="mt-2 text-sm text-muted">Keep customer feedback useful, accurate, and considered.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted"><ShieldAlert size={17} className="text-brown" /> {pendingCount} hidden</div>
        </header>

        {isLoading && <p className="rounded-md border border-line bg-white p-8 text-sm text-muted">Loading moderation queue...</p>}
        {!isLoading && error && <div className="rounded-md border border-[#e4c9c0] bg-[#fbefeb] p-5 text-sm text-clay"><p>{error}</p><button type="button" onClick={() => void loadReviews()} className="mt-3 underline underline-offset-4">Try again</button></div>}
        {!isLoading && !error && reviews.length === 0 && <p className="rounded-md border border-dashed border-line bg-white p-10 text-center text-sm text-muted">No reviews have been submitted yet.</p>}
        {!isLoading && !error && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <article key={review.id} className="rounded-md border border-line bg-white p-5 sm:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={review.published ? 'success' : 'warning'} size="sm">{review.published ? 'Published' : 'Hidden'}</Badge>
                      {review.verified && <span className="inline-flex items-center gap-1 text-xs text-olive"><CheckCircle2 size={13} /> Verified purchase</span>}
                      <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="mt-3 text-lg font-medium text-ink">{review.title || 'Untitled review'}</h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.1em] text-brown">{review.product.name}</p>
                  </div>
                  <div className="text-left text-sm text-muted sm:text-right"><p>{review.user.firstName} {review.user.lastName}</p><p>{review.user.email}</p><p className="mt-1 text-brown">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p></div>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-6 text-muted">{review.comment}</p>
                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  <Button size="sm" variant="outline" disabled={updatingId === review.id} onClick={() => void moderate(review, !review.published)}>{review.published ? <EyeOff size={14} /> : <Eye size={14} />}{review.published ? 'Hide review' : 'Publish review'}</Button>
                  <Button size="sm" variant="danger" disabled={updatingId === review.id} onClick={() => void remove(review)}><Trash2 size={14} /> Delete</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

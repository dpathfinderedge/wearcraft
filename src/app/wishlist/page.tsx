'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function WishlistPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasCheckedAuth } = useAuthStore();
  const { items, isLoading, error, loadWishlist, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    if (!hasCheckedAuth) return;
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/wishlist');
      return;
    }
    void loadWishlist();
  }, [hasCheckedAuth, isAuthenticated, loadWishlist, router]);

  if (!user) return null;

  const moveToCart = (item: (typeof items)[number]) => {
    const size = item.product.sizes[0] || '';
    const color = item.product.colors[0] || '';
    addItem(item.product, size, color);
    void toggleWishlist(item.product);
  };

  return (
    <main className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <header className="mb-10 border-b border-line pb-7">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Saved pieces</p>
          <h1 className="text-4xl font-light tracking-[-0.04em] text-ink md:text-5xl">Your wishlist</h1>
          <p className="mt-2 text-muted">Keep the pieces you are considering close.</p>
        </header>

        {isLoading ? (
          <p className="rounded-md border border-line bg-white py-16 text-center text-sm text-muted">Loading your wishlist...</p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-clay">{error}</p>
            <button className="mt-4 text-sm underline underline-offset-4" onClick={() => void loadWishlist()}>
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart size={36} strokeWidth={1.2} className="mb-5 text-gray-400" />
            <h2 className="text-xl font-medium text-gray-900">Nothing saved yet</h2>
            <p className="mt-2 max-w-sm text-gray-600">Save pieces here while you decide what belongs in your wardrobe.</p>
            <Link href="/shop" className="mt-8">
              <Button variant="primary">Browse the collection</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {items.map((item) => (
              <article key={item.id} className="group">
                <Link href={`/shop/${encodeURIComponent(item.product.name)}`}>
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#ebe8e1]">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                </Link>
                <div className="pt-4">
                  <p className="text-xs uppercase tracking-[0.12em] text-muted">{item.product.category}</p>
                  <h2 className="mt-1 text-sm font-medium text-ink">{item.product.name}</h2>
                  <p className="mt-2 text-sm text-ink">{formatPrice(item.product.price)}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => moveToCart(item)}>
                      <ShoppingBag size={15} /> Move to cart
                    </Button>
                    <button type="button" aria-label={`Remove ${item.product.name} from wishlist`} className="rounded-md border border-line px-3 text-muted transition-colors hover:text-ink" onClick={() => void toggleWishlist(item.product)}>
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

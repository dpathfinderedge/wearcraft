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
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 border-b border-gray-200 pb-6">
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gray-500">Saved pieces</p>
          <h1 className="text-3xl font-light text-gray-900 md:text-4xl">Your wishlist</h1>
          <p className="mt-2 text-gray-600">Keep the pieces you are considering close.</p>
        </header>

        {isLoading ? (
          <p className="py-16 text-center text-sm text-gray-600">Loading your wishlist...</p>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-red-700">{error}</p>
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
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                </Link>
                <div className="pt-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500">{item.product.category}</p>
                  <h2 className="mt-1 text-sm font-medium text-gray-900">{item.product.name}</h2>
                  <p className="mt-2 text-sm text-gray-900">{formatPrice(item.product.price)}</p>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => moveToCart(item)}>
                      <ShoppingBag size={15} /> Move to cart
                    </Button>
                    <button aria-label={`Remove ${item.product.name} from wishlist`} className="border border-gray-300 px-3 text-gray-600 hover:text-gray-900" onClick={() => void toggleWishlist(item.product)}>
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

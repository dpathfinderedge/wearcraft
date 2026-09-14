'use client';

import React from 'react';
import Link from 'next/link';
import { useCartStore } from '@/store';
import { CartItem, CartSummary, EmptyCart } from '@/components/cart';
import { ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { items, getCartSummary } = useCartStore();
  const summary = getCartSummary();

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        <div className="mb-10">
          <Link
            href="/shop"
            className="mb-5 inline-flex items-center text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft size={16} className="mr-1" />
            Continue Shopping
          </Link>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Your selection</p>
          <h1 className="text-4xl font-light tracking-[-0.04em] text-ink md:text-5xl">
            Shopping bag
          </h1>
        </div>


        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">

            <div className="lg:col-span-2">
              <div className="rounded-md border border-line bg-white px-5 sm:px-7">
                <div className="border-b border-line py-5">
                  <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-ink">
                    Cart Items ({summary.itemCount})
                  </h2>
                </div>
                <div className="px-6">
                  {items.map((item) => (
                    <CartItem key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} item={item} />
                  ))}
                </div>
              </div>
            </div>


            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <CartSummary
                  subtotal={summary.subtotal}
                  shipping={summary.shipping}
                  tax={summary.tax}
                  total={summary.total}
                  itemCount={summary.itemCount}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

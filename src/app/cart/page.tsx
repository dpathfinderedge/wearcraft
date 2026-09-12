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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="mb-8">
          <Link
            href="/shop"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900">
            Shopping Cart
          </h1>
        </div>


        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2">
              <div className="bg-white border border-gray-200 rounded-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
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

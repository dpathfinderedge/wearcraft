import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { formatPrice } from '@/lib/utils';
import { Truck } from 'lucide-react';

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  itemCount: number;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  shipping,
  tax,
  total,
  itemCount,
}) => {
  const freeShippingThreshold = 100;
  const amountToFreeShipping = freeShippingThreshold - subtotal;
  const hasFreeShipping = shipping === 0 && subtotal > 0;

  return (
    <div className="rounded-md border border-line bg-white p-6 sm:p-7">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-brown">At a glance</p>
      <h2 className="mb-6 text-2xl font-light tracking-[-0.03em] text-ink">Order summary</h2>
      {subtotal > 0 && subtotal < freeShippingThreshold && (
        <div className="mb-6 rounded-md border border-[#d8cbbd] bg-[#f5efe9] p-4">
          <div className="flex items-start gap-2">
            <Truck size={18} className="mt-0.5 flex-shrink-0 text-brown" />
            <p className="text-sm text-ink">
              Add <span className="font-semibold">{formatPrice(amountToFreeShipping)}</span> more
              to get <span className="font-semibold">free shipping!</span>
            </p>
          </div>
        </div>
      )}

      {hasFreeShipping && (
        <div className="mb-6 rounded-md border border-[#cbd7c8] bg-[#edf3eb] p-4">
          <div className="flex items-start gap-2">
            <Truck size={18} className="mt-0.5 flex-shrink-0 text-olive" />
            <p className="text-sm font-medium text-olive-dark">
              You&apos;ve got free shipping.
            </p>
          </div>
        </div>
      )}


      <div className="mb-6 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Shipping</span>
          <span className="font-medium text-ink">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tax (8.5%)</span>
          <span className="font-medium text-ink">{formatPrice(tax)}</span>
        </div>
      </div>


      <div className="mb-6 border-t border-line pt-4">
        <div className="flex justify-between">
          <span className="text-base font-medium text-ink">Total</span>
          <span className="text-xl font-medium text-ink">{formatPrice(total)}</span>
        </div>
      </div>


      <Link href="/checkout">
        <Button variant="primary" size="lg" className="w-full mb-3">
          Proceed to Checkout
        </Button>
      </Link>

      <Link href="/shop">
        <Button variant="outline" size="lg" className="w-full">
          Continue Shopping
        </Button>
      </Link>
    </div>
  );
};
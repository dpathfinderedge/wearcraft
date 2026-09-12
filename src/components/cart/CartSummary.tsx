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
    <div className="bg-gray-50 rounded-sm p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>


      {subtotal > 0 && subtotal < freeShippingThreshold && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
          <div className="flex items-start gap-2">
            <Truck size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Add <span className="font-semibold">{formatPrice(amountToFreeShipping)}</span> more
              to get <span className="font-semibold">free shipping!</span>
            </p>
          </div>
        </div>
      )}

      {hasFreeShipping && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
          <div className="flex items-start gap-2">
            <Truck size={18} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">
              You&apos;ve got free shipping! 🎉
            </p>
          </div>
        </div>
      )}


      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
          </span>
          <span className="text-gray-900 font-medium">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900 font-medium">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (8.5%)</span>
          <span className="text-gray-900 font-medium">{formatPrice(tax)}</span>
        </div>
      </div>


      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
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
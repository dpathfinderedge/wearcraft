import React from 'react';
import Image from 'next/image';
import { CartItem } from '@/types/cart';
import { formatPrice } from '@/lib/utils';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shipping,
  tax,
  total,
}) => {
  return (
    <div className="rounded-md border border-line bg-white p-6 sm:p-7">
      <p className="mb-2 text-xs uppercase tracking-[0.16em] text-brown">Your order</p>
      <h3 className="mb-6 text-2xl font-light tracking-[-0.03em] text-ink">Order summary</h3>
      <div className="mb-6 space-y-4">
        {items.map((item) => (
          <div
            key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
            className="flex gap-3"
          >
            <div className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-[#ebe8e1]">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="truncate text-sm font-medium text-ink">
                {item.product.name}
              </h4>
              <p className="mt-1 text-xs uppercase tracking-[0.06em] text-muted">
                {item.selectedColor} / {item.selectedSize}
              </p>
              <p className="mt-1 text-xs text-muted">Qty: {item.quantity}</p>
            </div>
            <div className="text-sm font-medium text-ink">
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>


      <div className="space-y-2 border-t border-line pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Subtotal</span>
          <span className="font-medium text-ink">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Shipping</span>
          <span className="font-medium text-ink">
            {shipping === 0 ? 'Free' : formatPrice(shipping)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Tax</span>
          <span className="font-medium text-ink">{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between border-t border-line pt-2">
          <span className="text-base font-medium text-ink">Total</span>
          <span className="text-xl font-medium text-ink">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};
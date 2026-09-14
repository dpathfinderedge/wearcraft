'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types/cart';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/store';

interface CartItemProps {
  item: CartItemType;
}

export const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeItem } = useCartStore();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(item.product.id, item.selectedSize, item.selectedColor);
    } else {
      updateQuantity(
        item.product.id,
        item.selectedSize,
        item.selectedColor,
        newQuantity
      );
    }
  };

  const handleRemove = () => {
    removeItem(item.product.id, item.selectedSize, item.selectedColor);
  };

  const itemTotal = item.product.price * item.quantity;

  return (
    <div className="flex gap-4 border-b border-line py-6 last:border-b-0 sm:gap-6">

      <Link
        href={`/shop/${item.product.id}`}
        className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md bg-[#ebe8e1] sm:h-36 sm:w-28"
      >
        <Image
          src={item.product.images[0]}
          alt={item.product.name}
          fill
          sizes="112px"
          className="object-cover transition-opacity hover:opacity-75"
        />
      </Link>


      <div className="flex-1 flex flex-col">
        <div className="flex justify-between mb-2">
          <div>
            <Link
              href={`/shop/${item.product.id}`}
              className="text-sm font-medium text-ink transition-colors hover:text-brown sm:text-base"
            >
              {item.product.name}
            </Link>
            <p className="mt-1 text-xs uppercase tracking-[0.08em] text-muted">
              {item.selectedColor} / {item.selectedSize}
            </p>
          </div>
          <p className="text-sm font-medium text-ink sm:text-base">
            {formatPrice(itemTotal)}
          </p>
        </div>


        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
                type="button"
                aria-label={`Decrease quantity of ${item.product.name}`}
                className="rounded-md p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              <Minus size={14} />
            </button>
            <span className="w-7 text-center text-sm font-medium text-ink">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
                type="button"
                aria-label={`Increase quantity of ${item.product.name}`}
                className="rounded-md p-2 text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={handleRemove}
            type="button"
            className="flex items-center gap-1.5 text-xs uppercase tracking-[0.08em] text-clay transition-colors hover:text-brown"
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
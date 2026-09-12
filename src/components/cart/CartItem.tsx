'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
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
    <div className="flex gap-4 py-6 border-b border-gray-200">

      <Link
        href={`/shop/${item.product.id}`}
        className="flex-shrink-0 w-24 h-32 bg-gray-100 overflow-hidden"
      >
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="w-full h-full object-cover hover:opacity-75 transition"
        />
      </Link>


      <div className="flex-1 flex flex-col">
        <div className="flex justify-between mb-2">
          <div>
            <Link
              href={`/shop/${item.product.id}`}
              className="text-base font-medium text-gray-900 hover:text-gray-700 transition"
            >
              {item.product.name}
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              {item.selectedColor} / {item.selectedSize}
            </p>
          </div>
          <p className="text-base font-medium text-gray-900">
            {formatPrice(itemTotal)}
          </p>
        </div>


        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="w-8 h-8 border border-gray-300 rounded-sm hover:bg-gray-50 transition text-sm"
            >
              −
            </button>
            <span className="text-sm font-medium w-8 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="w-8 h-8 border border-gray-300 rounded-sm hover:bg-gray-50 transition text-sm"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 transition"
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
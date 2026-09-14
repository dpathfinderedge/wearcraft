'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product } from '@/types/product';
import { StarRating, Badge } from '@/components/common';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAuthStore, useWishlistStore } from '@/store';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [imageError, setImageError] = useState(false);
  const { isAuthenticated, hasCheckedAuth } = useAuthStore();
  const { hasLoaded, loadWishlist, isWishlisted, toggleWishlist } = useWishlistStore();

  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated && !hasLoaded) {
      void loadWishlist();
    }
  }, [hasCheckedAuth, hasLoaded, isAuthenticated, loadWishlist]);

  const wishlisted = isWishlisted(product);

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  return (
    <div className="group relative">
      <Link href={`/shop/${product.id}`}>
        <div className="relative mb-3 aspect-[3/4] overflow-hidden rounded-md bg-gray-100">
          {!imageError ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-sm">Image unavailable</span>
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-2 left-2">
              <Badge variant="error">{discount}% OFF</Badge>
            </div>
          )}

          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-[0.4] transition-all duration-300" />
        </div>
      </Link>

      <button
        aria-label={`${wishlisted ? 'Remove' : 'Add'} ${product.name} ${wishlisted ? 'from' : 'to'} wishlist`}
        onClick={() => {
          if (!isAuthenticated) {
            window.location.href = `/auth/login?redirect=/shop/${product.id}`;
            return;
          }
          void toggleWishlist(product);
        }}
        className="absolute right-2 top-2 z-10 rounded-full bg-white p-2 shadow-sm transition-all hover:shadow-md"
      >
        <Heart
          size={18}
          className={cn(
            'transition-colors',
            wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'
          )}
        />
      </button>

      <Link href={`/shop/${product.id}`}>
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {product.category}
          </p>

          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-gray-700 transition">
            {product.name}
          </h3>

          <StarRating
            rating={product.rating}
            size={14}
            reviewCount={product.reviewCount}
          />

          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {!product.inStock && (
            <Badge variant="error" size="sm">Out of Stock</Badge>
          )}
        </div>
      </Link>
    </div>
  );
};
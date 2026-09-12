'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { products } from '@/data/products';
import { SizeSelector, ColorSelector } from '@/components/product';
import { StarRating, Badge } from '@/components/common';
import { Button } from '@/components/ui';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { useToast } from '@/components/ui';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { Heart, Truck, Package, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem } = useCartStore();
  const { isAuthenticated, hasCheckedAuth } = useAuthStore();
  const { hasLoaded, loadWishlist, isWishlisted, toggleWishlist } = useWishlistStore();

  const productKey = decodeURIComponent(String(params.id));
  const product = products.find((p) => p.id === productKey || p.name === productKey);

  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => {
    if (hasCheckedAuth && isAuthenticated && !hasLoaded) {
      void loadWishlist();
    }
  }, [hasCheckedAuth, hasLoaded, isAuthenticated, loadWishlist]);

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-gray-900 mb-2">Product not found</h1>
          <Link href="/shop">
            <Button variant="outline">Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? calculateDiscount(product.originalPrice, product.price)
    : 0;

  const handleAddToCart = () => {
    if (!selectedSize) {
      showToast('Please select a size', 'error');
      return;
    }
    if (!selectedColor) {
      showToast('Please select a color', 'error');
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedSize, selectedColor);
    }

    showToast('Added to cart successfully!', 'success');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-gray-900">
            Shop
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <div className="aspect-[3/4] bg-gray-100 mb-4 overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 overflow-hidden border-2 transition ${
                      selectedImage === index
                        ? 'border-gray-900'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm text-gray-500 uppercase tracking-wide">
                {product.category}
              </p>
              {discount > 0 && <Badge variant="error">{discount}% OFF</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="mb-6">
              <StarRating
                rating={product.rating}
                showNumber
                reviewCount={product.reviewCount}
                size={18}
              />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-medium text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-gray-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="text-gray-600 mb-8">{product.description}</p>

            <div className="mb-6">
              <SizeSelector
                sizes={product.sizes}
                selectedSize={selectedSize}
                onSizeSelect={setSelectedSize}
              />
            </div>

            <div className="mb-8">
              <ColorSelector
                colors={product.colors}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
              />
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 rounded-sm hover:bg-gray-50 transition"
                >
                  −
                </button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 rounded-sm hover:bg-gray-50 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1"
                disabled={!product.inStock}
              >
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push('/auth/login?redirect=/shop/' + product.id);
                    return;
                  }
                  void toggleWishlist(product);
                }}
              >
                <Heart
                  size={20}
                  className={isWishlisted(product) ? 'fill-red-500 text-red-500' : ''}
                />
              </Button>
            </div>

            <div className="border-t border-gray-200 pt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Truck size={20} className="text-gray-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Free Shipping
                  </h4>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package size={20} className="text-gray-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Easy Returns
                  </h4>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="text-gray-600 mt-0.5" strokeWidth={1.5} />
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">
                    Secure Payment
                  </h4>
                  <p className="text-sm text-gray-600">100% secure checkout</p>
                </div>
              </div>
            </div>

            {(product.material || product.care) && (
              <div className="border-t border-gray-200 mt-8 pt-8 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Product Details
                </h3>
                {product.material && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Material</h4>
                    <p className="text-sm text-gray-600">{product.material}</p>
                  </div>
                )}
                {product.care && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Care</h4>
                    <p className="text-sm text-gray-600">{product.care}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
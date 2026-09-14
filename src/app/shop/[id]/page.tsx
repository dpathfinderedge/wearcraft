'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Heart, Minus, Package, Plus, ShieldCheck, Truck } from 'lucide-react';
import { products } from '@/data/products';
import { Badge, StarRating } from '@/components/common';
import { ColorSelector, ProductReviews, SizeSelector } from '@/components/product';
import { Button, useToast } from '@/components/ui';
import { useAuthStore, useCartStore, useWishlistStore } from '@/store';
import { calculateDiscount, formatPrice } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { addItem } = useCartStore();
  const { isAuthenticated, hasCheckedAuth } = useAuthStore();
  const { hasLoaded, loadWishlist, isWishlisted, toggleWishlist } = useWishlistStore();
  const productKey = decodeURIComponent(String(params.id));
  const product = products.find((item) => item.id === productKey || item.name === productKey);
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
      <div className="flex min-h-[70vh] items-center justify-center bg-paper px-4">
        <div className="max-w-md text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">WearCraft / Shop</p>
          <h1 className="mb-3 text-3xl font-light tracking-[-0.03em] text-ink">We couldn&apos;t find that piece.</h1>
          <p className="mb-7 text-sm leading-6 text-muted">The product may have moved or is no longer available.</p>
          <Link href="/shop">
            <Button variant="primary">Return to shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice ? calculateDiscount(product.originalPrice, product.price) : 0;
  const wishlisted = isWishlisted(product);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      showToast('Please select a size and color before adding this item.', 'error');
      return;
    }
    addItem(product, selectedSize, selectedColor, quantity);
    showToast('Added to cart successfully!', 'success');
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=/shop/${product.id}`);
      return;
    }
    void toggleWishlist(product);
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.12em] text-muted">
          <Link href="/" className="transition-colors hover:text-ink">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/shop" className="transition-colors hover:text-ink">Shop</Link>
          <span aria-hidden="true">/</span>
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-16">
          <section aria-label="Product images">
            <div className="relative aspect-[3/4] overflow-hidden rounded-md bg-[#ebe8e1]">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-opacity duration-500"
              />
              {discount > 0 && (
                <div className="absolute left-4 top-4">
                  <Badge variant="error">{discount}% OFF</Badge>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  aria-label={`View image ${index + 1} of ${product.name}`}
                  aria-pressed={selectedImage === index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square overflow-hidden rounded-md border-2 bg-[#ebe8e1] transition ${
                    selectedImage === index ? 'border-brown' : 'border-transparent hover:border-line'
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 22vw, 12vw"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </section>

          <section className="lg:pt-2">
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.2em] text-brown">{product.category}</p>
              <span className={`text-xs uppercase tracking-[0.12em] ${product.inStock ? 'text-olive' : 'text-clay'}`}>
                {product.inStock ? 'In stock' : 'Currently unavailable'}
              </span>
            </div>

            <h1 className="max-w-xl text-4xl font-light tracking-[-0.04em] text-ink sm:text-5xl">{product.name}</h1>
            <div className="mt-5">
              <StarRating rating={product.rating} showNumber reviewCount={product.reviewCount} size={17} />
            </div>

            <div className="mt-6 flex items-baseline gap-3 border-b border-line pb-7">
              <span className="text-2xl font-medium text-ink">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-base text-muted line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="mt-7 max-w-xl text-base leading-7 text-muted">{product.description}</p>

            <div className="mt-8 space-y-7">
              <SizeSelector sizes={product.sizes} selectedSize={selectedSize} onSizeSelect={setSelectedSize} />
              <ColorSelector colors={product.colors} selectedColor={selectedColor} onColorSelect={setSelectedColor} />
            </div>

            <div className="mt-8">
              <label htmlFor="quantity" className="mb-3 block text-sm font-medium text-ink">Quantity</label>
              <div className="flex w-fit items-center rounded-md border border-line bg-white">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 text-muted transition-colors hover:text-ink"
                >
                  <Minus size={16} />
                </button>
                <span id="quantity" aria-live="polite" className="min-w-10 text-center text-sm font-medium text-ink">{quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 text-muted transition-colors hover:text-ink"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1"
              >
                {product.inStock ? 'Add to cart' : 'Out of stock'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className="px-4"
              >
                <Heart size={20} className={wishlisted ? 'fill-clay text-clay' : 'text-ink'} />
              </Button>
            </div>

            <div className="mt-9 grid gap-5 border-y border-line py-7 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex items-start gap-3">
                <Truck size={19} className="mt-0.5 shrink-0 text-brown" strokeWidth={1.5} />
                <div><h2 className="text-sm font-medium text-ink">Free shipping</h2><p className="mt-1 text-xs leading-5 text-muted">On orders over $100</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Package size={19} className="mt-0.5 shrink-0 text-brown" strokeWidth={1.5} />
                <div><h2 className="text-sm font-medium text-ink">Easy returns</h2><p className="mt-1 text-xs leading-5 text-muted">30-day return policy</p></div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={19} className="mt-0.5 shrink-0 text-brown" strokeWidth={1.5} />
                <div><h2 className="text-sm font-medium text-ink">Secure payment</h2><p className="mt-1 text-xs leading-5 text-muted">Protected checkout</p></div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 border-b border-line pb-2 sm:grid-cols-2 lg:grid-cols-1">
              {product.material && (
                <div className="border-t border-line py-5">
                  <h2 className="text-xs uppercase tracking-[0.15em] text-brown">Material</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{product.material}</p>
                </div>
              )}
              {product.care && (
                <div className="border-t border-line py-5">
                  <h2 className="text-xs uppercase tracking-[0.15em] text-brown">Care</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">{product.care}</p>
                </div>
              )}
            </div>
          </section>
        </div>
        <ProductReviews productId={product.id} productName={product.name} />
      </div>
    </div>
  );
}

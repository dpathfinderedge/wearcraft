import React from 'react';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui';

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export const FeaturedProducts: React.FC<FeaturedProductsProps> = ({
  products,
  title = 'Featured Products',
  subtitle = 'Carefully selected pieces for your wardrobe',
}) => {
  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-gray-600">{subtitle}</p>
          </div>
          <Link href="/shop" className="hidden md:block">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </div>


        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>


        <div className="mt-12 text-center md:hidden">
          <Link href="/shop">
            <Button variant="outline" className="w-full sm:w-auto">
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
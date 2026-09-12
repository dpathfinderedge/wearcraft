import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-gray-900 mb-6">
            Timeless style.
            <br />
            <span className="font-normal">Made simple.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl font-light">
            Carefully curated wardrobe essentials designed for the way you live.
            Quality craftsmanship meets modern sensibility.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/shop">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Explore Collection
              </Button>
            </Link>
            <Link href="/shop?category=womens">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Shop Women&apos;s
              </Button>
            </Link>
          </div>
        </div>
      </div>


      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-gray-100 rounded-full blur-3xl opacity-50" />
      </div>
    </section>
  );
};
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1400&fit=crop',
    alt: 'Woman wearing a considered neutral outfit',
    label: "The women's edit",
    href: '/shop?category=womens',
  },
  {
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=1200&h=1400&fit=crop',
    alt: 'Man wearing a timeless neutral outfit',
    label: "The men's edit",
    href: '/shop?category=mens',
  },
  {
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=1200&h=1400&fit=crop',
    alt: 'Unisex wardrobe essentials arranged together',
    label: 'The unisex edit',
    href: '/shop?category=unisex',
  },
];

export function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, []);

  const slide = slides[activeSlide];

  return (
    <section className="bg-[#e9e4da]">
      <div className="mx-auto grid max-w-7xl items-stretch lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 md:py-24 lg:px-8 lg:py-28">
          <p className="mb-5 text-xs uppercase tracking-[0.22em] text-[#80533f]">The autumn edit</p>
          <h1 className="max-w-xl text-5xl font-light tracking-[-0.04em] text-ink md:text-6xl lg:text-7xl">
            Quiet pieces.
            <br />
            <span className="text-[#80533f]">Strong presence.</span>
          </h1>
          <p className="mb-8 mt-6 max-w-lg text-base leading-7 text-muted md:text-lg">
            Carefully considered wardrobe essentials for the everyday. Natural textures, generous silhouettes, and a palette made to live together.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop">
              <Button variant="primary" size="lg" className="w-full bg-[#80533f] text-white hover:bg-[#684232] sm:w-auto">Explore the edit</Button>
            </Link>
            <Link href={slide.href}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Shop {slide.label.replace('The ', '').replace(' edit', '')}</Button>
            </Link>
          </div>
        </div>
        <div className="relative min-h-[28rem] overflow-hidden lg:min-h-[38rem]">
          {slides.map((item, index) => (
            <Image
              key={item.image}
              src={item.image}
              alt={item.alt}
              fill
              priority={index === 0}
              className={`object-cover object-center transition-opacity duration-1000 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 text-xs uppercase tracking-[0.2em] text-white">{slide.label}</p>
          <div className="absolute bottom-5 right-5 flex gap-2">
            <button type="button" aria-label="Previous hero image" onClick={() => setActiveSlide((activeSlide - 1 + slides.length) % slides.length)} className="rounded-md border border-white/60 bg-black/20 p-2 text-white backdrop-blur transition-colors hover:bg-black/40">
              <ChevronLeft size={17} />
            </button>
            <button type="button" aria-label="Next hero image" onClick={() => setActiveSlide((activeSlide + 1) % slides.length)} className="rounded-md border border-white/60 bg-black/20 p-2 text-white backdrop-blur transition-colors hover:bg-black/40">
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

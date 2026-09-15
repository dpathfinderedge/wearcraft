import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  name: string;
  href: string;
  image: string;
  description?: string;
}

const categories: Category[] = [
  {
    name: "Women's Collection",
    href: '/shop?category=womens',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800&fit=crop',
    description: 'Elegant essentials',
  },
  {
    name: "Men's Collection",
    href: '/shop?category=mens',
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=600&h=800&fit=crop',
    description: 'Timeless classics',
  },
  {
    name: 'Accessories',
    href: '/shop?category=accessories',
    image: 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=600&h=800&fit=crop',
    description: 'Complete your look',
  },
  {
    name: 'Unisex Basics',
    href: '/shop?category=unisex',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=800&fit=crop',
    description: 'Everyday essentials',
  },
];

export const CategoryGrid: React.FC = () => {
  return (
    <section className="bg-[#eeede7] py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-10 flex flex-col justify-between gap-3 md:mb-12 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-brown">Find your uniform</p>
            <h2 className="text-3xl font-light tracking-tight text-ink md:text-4xl">Shop by category</h2>
          </div>
          <p className="max-w-xs text-sm leading-6 text-muted">Four considered starting points for building a wardrobe that feels like you.</p>
        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-gray-100"
            >

              <Image
                src={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />


              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-xs uppercase tracking-wider mb-1 opacity-90">
                  {category.description}
                </p>
                <h3 className="text-xl font-medium mb-2">{category.name}</h3>
                <span className="text-sm underline underline-offset-4 group-hover:underline-offset-8 transition-all">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
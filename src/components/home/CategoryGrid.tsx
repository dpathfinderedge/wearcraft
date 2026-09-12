import React from 'react';
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
    <section className="py-16 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
            Shop by Category
          </h2>
          <p className="text-gray-600">Explore our curated collections</p>
        </div>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group relative aspect-[3/4] overflow-hidden bg-gray-100"
            >

              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />


              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
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
'use client';

import React, { useState, useMemo } from 'react';
import { products } from '@/data/products';
import { ProductCategory, SortOption } from '@/types/product';
import { FilterSidebar, SearchBar, ProductGrid } from '@/components/shop';
import { Button } from '@/components/ui';
import { SlidersHorizontal } from 'lucide-react';

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedSizes.length > 0) {
        const hasMatchingSize = product.sizes.some((size) =>
          selectedSizes.includes(size)
        );
        if (!hasMatchingSize) return false;
      }
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedSizes, priceRange]);
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];

    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSelectedSizes([]);
    setPriceRange([0, 200]);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

        <div className="mb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#80533f]">The collection</p>
          <h1 className="mb-2 text-3xl font-light tracking-tight text-ink md:text-4xl">
            Find your everyday pieces
          </h1>
          <p className="text-muted">
            {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
          </p>
        </div>


        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by product name..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-md border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-olive focus:ring-1 focus:ring-olive"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
            <Button
              variant="outline"
              className="lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={18} className="mr-2" />
              Filters
            </Button>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row gap-8">

          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20">
              <FilterSidebar
                selectedCategory={selectedCategory}
                selectedSizes={selectedSizes}
                priceRange={priceRange}
                onCategoryChange={setSelectedCategory}
                onSizeToggle={handleSizeToggle}
                onPriceChange={setPriceRange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>


          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white overflow-y-auto">
                <FilterSidebar
                  selectedCategory={selectedCategory}
                  selectedSizes={selectedSizes}
                  priceRange={priceRange}
                  onCategoryChange={setSelectedCategory}
                  onSizeToggle={handleSizeToggle}
                  onPriceChange={setPriceRange}
                  onClearFilters={handleClearFilters}
                  isMobile
                  onClose={() => setMobileFiltersOpen(false)}
                />
              </div>
            </div>
          )}


          <div className="flex-1">
            <ProductGrid products={sortedProducts} />
          </div>
        </div>
      </div>
    </div>
  );
}

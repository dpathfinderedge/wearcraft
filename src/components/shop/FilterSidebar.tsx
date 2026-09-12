'use client';

import React from 'react';
import { ProductCategory } from '@/types/product';
import { X } from 'lucide-react';
import { Button } from '@/components/ui';

interface FilterSidebarProps {
  selectedCategory: ProductCategory | 'all';
  selectedSizes: string[];
  priceRange: [number, number];
  onCategoryChange: (category: ProductCategory | 'all') => void;
  onSizeToggle: (size: string) => void;
  onPriceChange: (range: [number, number]) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

const categories: { value: ProductCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All Products' },
  { value: 'womens', label: "Women's" },
  { value: 'mens', label: "Men's" },
  { value: 'unisex', label: 'Unisex' },
  { value: 'accessories', label: 'Accessories' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  selectedCategory,
  selectedSizes,
  priceRange,
  onCategoryChange,
  onSizeToggle,
  onPriceChange,
  onClearFilters,
  isMobile,
  onClose,
}) => {
  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSizes.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 200;

  return (
    <div className="bg-white">

      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2">
            <X size={20} />
          </button>
        </div>
      )}

      <div className="p-6 space-y-8">

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        )}


        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Category</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => onCategoryChange(category.value)}
                className={`block w-full text-left px-3 py-2 text-sm rounded-sm transition ${
                  selectedCategory === category.value
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>


        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Size</h3>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => onSizeToggle(size)}
                className={`px-3 py-2 text-sm border rounded-sm transition ${
                  selectedSizes.includes(size)
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>


        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Price Range</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={priceRange[1]}
              onChange={(e) =>
                onPriceChange([priceRange[0], parseInt(e.target.value)])
              }
              className="w-full accent-gray-900"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) =>
                    onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) =>
                    onPriceChange([priceRange[0], parseInt(e.target.value) || 200])
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
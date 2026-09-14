'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search products...',
}) => {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <Search size={18} className="text-muted" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-line bg-white py-3 pl-10 pr-10 text-sm text-ink outline-none placeholder:text-gray-400 focus:border-olive focus:ring-1 focus:ring-olive"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          type="button"
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted transition-colors hover:text-ink"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};
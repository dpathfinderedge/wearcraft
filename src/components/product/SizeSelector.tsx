import React from 'react';
import { cn } from '@/lib/utils';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeSelect: (size: string) => void;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeSelect,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Size</h3>
        <button type="button" className="text-xs text-muted underline underline-offset-2 hover:text-ink">
          Size Guide
        </button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeSelect(size)}
            className={cn(
              'rounded-md border px-4 py-3 text-sm font-medium transition',
              selectedSize === size
                ? 'border-brown bg-brown text-white'
                : 'border-line text-muted hover:border-brown hover:text-ink'
            )}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};
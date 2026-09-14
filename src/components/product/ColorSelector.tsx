import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onColorSelect,
}) => {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Color: <span className="font-normal text-gray-600">{selectedColor}</span>
      </h3>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onColorSelect(color)}
            className={cn(
              'rounded-md border px-4 py-2 text-sm transition',
              selectedColor === color
                ? 'border-brown bg-[#f1ebe5] text-ink'
                : 'border-line text-muted hover:border-brown hover:text-ink'
            )}
          >
            <span className="flex items-center gap-2">
              {selectedColor === color && <Check size={14} />}
              {color}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
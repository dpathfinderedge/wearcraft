import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showNumber?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  showNumber = false,
  reviewCount,
  interactive = false,
  onRatingChange,
  className,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= Math.floor(displayRating);
          const isPartial = starValue === Math.ceil(displayRating) && displayRating % 1 !== 0;

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              disabled={!interactive}
              className={cn(
                'relative',
                interactive && 'cursor-pointer hover:scale-110 transition-transform',
                !interactive && 'cursor-default'
              )}
            >
              <Star
                size={size}
                className={cn(
                  'transition-colors',
                  isFilled
                    ? 'fill-[#80533f] text-[#80533f]'
                    : 'fill-none text-line'
                )}
              />
              {isPartial && (
                <div
                  className="absolute top-0 left-0 overflow-hidden"
                  style={{ width: `${(displayRating % 1) * 100}%` }}
                >
                  <Star
                    size={size}
                    className="fill-[#80533f] text-[#80533f]"
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-sm text-gray-500 ml-1">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};
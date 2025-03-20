import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Rating({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 'md',
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const handleClick = (index: number) => {
    if (readOnly) return;
    onChange?.(index + 1);
  };

  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverValue(index + 1);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverValue(null);
  };

  const getStarSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3.5 w-3.5';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-5 w-5';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-0.5',
        readOnly ? 'pointer-events-none' : 'cursor-pointer',
        className
      )}
    >
      {Array.from({ length: max }).map((_, index) => {
        const filled = (hoverValue || value) > index;
        return (
          <Star
            key={index}
            className={cn(
              getStarSize(),
              'transition-colors',
              filled
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground'
            )}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
    </div>
  );
}

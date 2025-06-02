import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import './CategoryCarousel.css';

interface CategoryCarouselProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

const CategoryCarousel = ({
  categories,
  activeCategory,
  onCategoryChange,
  className = '',
}: CategoryCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Check if scroll arrows should be shown
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
  };

  // Scroll left or right
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 200; // Adjust scroll amount as needed
    const newScrollLeft =
      direction === 'left'
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollPosition();
      scrollContainer.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);

      return () => {
        scrollContainer.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);

  return (
    <div className={cn('relative group', className)}>
      {/* Left scroll button */}
      {showLeftArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/30 opacity-80 hover:opacity-100"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      {/* Categories scroll container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto py-2 px-1 hide-scrollbar scroll-smooth"
      >
        {/* All category always first */}
        <Badge
          variant={activeCategory === 'All' ? 'default' : 'outline'}
          className={cn(
            'mr-2 px-3 py-1 cursor-pointer transition-all hover:shadow-sm',
            activeCategory === 'All'
              ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-transparent'
              : 'hover:bg-secondary/50 border-border/50'
          )}
          onClick={() => onCategoryChange('All')}
        >
          All
        </Badge>

        {/* Other categories */}
        {categories
          .filter((cat) => cat !== 'All')
          .map((category) => (
            <Badge
              key={category}
              variant={activeCategory === category ? 'default' : 'outline'}
              className={cn(
                'mr-2 px-3 py-1 cursor-pointer transition-all hover:shadow-sm whitespace-nowrap',
                activeCategory === category
                  ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white hover:from-violet-600 hover:to-indigo-600 border-transparent'
                  : 'hover:bg-secondary/50 border-border/50'
              )}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Badge>
          ))}
      </div>

      {/* Right scroll button */}
      {showRightArrow && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm border border-border/30 opacity-80 hover:opacity-100"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default CategoryCarousel;

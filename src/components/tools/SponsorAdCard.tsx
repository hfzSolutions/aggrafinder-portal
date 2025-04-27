import { useState } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';

interface SponsorAdCardProps {
  viewType?: 'grid' | 'list';
  compact?: boolean;
}

export const SponsorAdCard = ({
  viewType = 'grid',
  compact = false,
}: SponsorAdCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { trackEvent } = useToolAnalytics();

  const handleAdClick = () => {
    window.open('https://example.com/sponsor', '_blank');
    trackEvent('sponsor-ad', 'click_url');
  };

  if (viewType === 'grid') {
    return (
      <div
        className="group relative rounded-xl overflow-hidden bg-background border border-primary/30 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer"
        onClick={handleAdClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-br-xl"></div>
        </div>

        <div className="relative pt-[56.25%] w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          <img
            src="/images/sponsor-ad.jpg"
            alt="Sponsored Advertisement"
            className={cn(
              'absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105',
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setIsImageLoaded(true)}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20"
            >
              <Sparkles className="h-3 w-3 text-primary" /> Sponsored
            </Badge>
          </div>

          {/* Button moved to bottom of card */}
        </div>

        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-medium text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors duration-200">
            Premium AI Solution
          </h3>
          <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
            Boost your productivity with our cutting-edge AI tools. Try our
            premium features today and transform your workflow.
          </p>
          <div className="mt-auto pt-2">
            <Button
              size="sm"
              className="w-full justify-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                window.open('https://example.com/sponsor', '_blank');
                trackEvent('sponsor-ad', 'click_url');
              }}
            >
              Learn More <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className="group flex items-start gap-4 p-4 border border-primary/30 rounded-lg hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer bg-background"
      onClick={handleAdClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-24 w-24 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}

        <img
          src="/images/sponsor-ad.jpg"
          alt="Sponsored Advertisement"
          className={cn(
            'h-full w-full object-cover transition-opacity',
            isImageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsImageLoaded(true)}
        />

        <div className="absolute top-1 left-1">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-1.5 py-0.5"
          >
            <Sparkles className="h-2.5 w-2.5 text-primary" /> Ad
          </Badge>
        </div>
      </div>

      <div className="flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-base group-hover:text-primary transition-colors duration-200">
            Premium AI Solution
          </h3>
        </div>

        {!compact && (
          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
            Boost your productivity with our cutting-edge AI tools. Try our
            premium features today.
          </p>
        )}

        <div className="flex items-center justify-between mt-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-2 text-xs rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              window.open('https://example.com/sponsor', '_blank');
              trackEvent('sponsor-ad', 'click_url');
            }}
          >
            Learn More <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
          <span className="text-xs text-muted-foreground">Sponsored</span>
        </div>
      </div>
    </div>
  );
};

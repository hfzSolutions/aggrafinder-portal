import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';

interface SponsorAd {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  link_text: string;
  is_active: boolean;
}

interface SponsorAdCardProps {
  viewType?: 'grid' | 'list';
  compact?: boolean;
  adData?: SponsorAd; // For preview in admin panel
}

export const SponsorAdCard = ({
  viewType = 'grid',
  compact = false,
  adData,
}: SponsorAdCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [sponsorAd, setSponsorAd] = useState<SponsorAd | null>(null);
  const { trackEvent } = useAnalytics();

  // Fetch active sponsor ad from database if not provided via props
  useEffect(() => {
    const fetchActiveSponsorAd = async () => {
      // If ad data is provided via props (for preview), use that
      if (adData) {
        setSponsorAd(adData);
        return;
      }

      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('sponsor_ads')
          .select('*')
          .lte('start_date', now) // Start date is before or equal to current date
          .gte('end_date', now) // End date is after or equal to current date
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            // PGRST116 is the error code for no rows returned
            console.error('Error fetching active sponsor ad:', error);
          }
          return;
        }

        if (data) {
          setSponsorAd(data);
        }
      } catch (error) {
        console.error('Error fetching sponsor ad:', error);
      }
    };

    fetchActiveSponsorAd();
  }, [adData]);

  // If no sponsor ad is available, don't render anything
  if (!sponsorAd && !adData) {
    return null;
  }

  const ad = sponsorAd || adData;
  if (!ad) return null;

  const handleAdClick = () => {
    window.open(ad.link, '_blank');
    trackEvent('sponsor_ad', 'click_url', {
      ad_id: ad.id,
      ad_title: ad.title,
      ad_link: ad.link,
      view_type: viewType,
      click_type: 'card',
    });
  };

  // Grid view
  if (viewType === 'grid') {
    return (
      <div
        className={cn(
          'group relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer p-1 animate-float'
        )}
        onClick={handleAdClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Moving gradient border */}
        <div className="absolute inset-0 animate-moving-gradient rounded-xl opacity-80"></div>

        {/* Shine effect overlay */}
        <div className="absolute inset-0 animate-shine rounded-xl z-10 opacity-40"></div>

        {/* Content container */}
        <div className="relative bg-background/95 dark:bg-background/95 rounded-xl z-20 flex flex-col h-full px-5 py-3">
          <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 mb-3 shadow-md">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}

            <img
              src={ad.image_url}
              alt={ad.title}
              className={cn(
                'h-full w-full object-cover transition-all duration-500 transform group-hover:scale-105',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsImageLoaded(true)}
            />

            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 text-xs px-2 py-0.5 font-medium shadow-sm"
              >
                <Sparkles className="h-2.5 w-2.5 text-primary" /> Ad
              </Badge>
            </div>
          </div>

          <h3 className="font-semibold text-base text-foreground/90 mb-2 line-clamp-1">
            {ad.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-3 flex-grow line-clamp-2">
            {ad.description}
          </p>

          <div className="mt-auto">
            <Button
              size="sm"
              variant="default"
              className="w-full h-8 rounded-full bg-primary hover:bg-primary/90 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                window.open(ad.link, '_blank');
                trackEvent('sponsor_ad', 'click_url', {
                  ad_id: ad.id,
                  ad_title: ad.title,
                  ad_link: ad.link,
                  view_type: viewType,
                  click_type: 'button',
                });
              }}
            >
              {ad.link_text} <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className={cn(
        'group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer p-1 animate-pulse-glow',
        compact ? 'max-w-md' : 'w-full'
      )}
      onClick={handleAdClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Moving gradient border */}
      <div className="absolute inset-0 animate-moving-gradient rounded-lg opacity-80"></div>

      {/* Shine effect overlay */}
      <div className="absolute inset-0 animate-shine rounded-lg z-10 opacity-40"></div>

      {/* Content container */}
      <div className="relative bg-background/95 dark:bg-background/95 rounded-lg z-20 px-5 py-3 w-full">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 shadow-md">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}

            <img
              src={ad.image_url}
              alt={ad.title}
              className={cn(
                'h-full w-full object-cover transition-all duration-500 transform group-hover:scale-105',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsImageLoaded(true)}
            />

            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 text-xs px-2 py-0.5 font-medium shadow-sm"
              >
                <Sparkles className="h-2.5 w-2.5 text-primary" /> Ad
              </Badge>
            </div>
          </div>

          <div className="flex-grow">
            <h3 className="font-semibold text-base text-foreground/90 mb-2">
              {ad.title}
            </h3>

            {!compact && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {ad.description}
              </p>
            )}

            <div className="flex items-center justify-between mt-1">
              <Button
                size="sm"
                variant="default"
                className="h-8 px-3 text-xs rounded-full bg-primary hover:bg-primary/90 transition-all duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(ad.link, '_blank');
                  trackEvent('sponsor_ad', 'click_url', {
                    ad_id: ad.id,
                    ad_title: ad.title,
                    ad_link: ad.link,
                    view_type: viewType,
                    click_type: 'button',
                    compact: compact,
                  });
                }}
              >
                {ad.link_text} <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/50">
                Sponsored
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

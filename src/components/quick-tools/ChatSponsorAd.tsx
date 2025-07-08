import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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

interface ChatSponsorAdProps {
  messageCount: number;
  onAdComplete?: () => void;
  isComplete?: boolean;
}

const checkForSponsorAds = async () => {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('sponsor_ads')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      if (error.code !== 'PGRST116') {
        console.error('Error checking sponsor ads:', error);
      }
      return { available: false, data: null };
    }

    return {
      available: data && data.length > 0,
      data: data && data.length > 0 ? data[0] : null,
    };
  } catch (error) {
    console.error('Error checking sponsor ads:', error);
    return { available: false, data: null };
  }
};

export const ChatSponsorAd = ({
  messageCount,
  onAdComplete,
  isComplete = false,
}: ChatSponsorAdProps) => {
  const { trackEvent } = useAnalytics();
  const [sponsorAd, setSponsorAd] = useState<SponsorAd | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); // 10 seconds timer
  const [isAdComplete, setIsAdComplete] = useState(isComplete);
  const adRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (isComplete) {
      setIsAdComplete(true);
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isAdComplete) {
      setIsAdComplete(true);
      onAdComplete?.();
    }
  }, [timeLeft, isAdComplete, onAdComplete, isComplete]);

  // Scroll to ad when it appears
  useEffect(() => {
    if (adRef.current && sponsorAd) {
      adRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [sponsorAd]);

  useEffect(() => {
    // Only fetch ad when the component mounts
    const fetchActiveSponsorAd = async () => {
      try {
        // Use the shared function to check for ads and get the data in one call
        const { available, data } = await checkForSponsorAds();

        if (!available || !data) {
          return;
        }

        // Set the sponsor ad directly from the returned data
        setSponsorAd(data);
      } catch (error) {
        console.error('Error fetching sponsor ad:', error);
      }
    };

    fetchActiveSponsorAd();
  }, []);

  // If no sponsor ad is available, don't render anything
  if (!sponsorAd) {
    return null;
  }

  const handleAdClick = () => {
    window.open(sponsorAd.link, '_blank');
    trackEvent('sponsor_ad', 'click_url', {
      ad_id: sponsorAd.id,
      ad_title: sponsorAd.title,
      ad_link: sponsorAd.link,
      view_type: 'chat',
      click_type: 'card',
    });
  };

  return (
    <motion.div
      ref={adRef}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-start gap-2 justify-start my-6"
    >
      <div className="flex flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 items-center justify-center animate-pulse-glow">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-[95%] rounded-2xl rounded-tl-sm p-0.5 ml-1 shadow-md overflow-hidden relative animate-pulse-glow"
        onClick={handleAdClick}
        style={{ cursor: 'pointer' }}
        whileHover={{ scale: 1.01 }}
      >
        {/* Moving gradient border */}
        <div className="absolute inset-0 animate-moving-gradient rounded-2xl rounded-tl-sm opacity-80"></div>

        {/* Shine effect overlay */}
        <div className="absolute inset-0 animate-shine rounded-2xl rounded-tl-sm z-10 opacity-40"></div>

        {/* Content container */}
        <div className="relative bg-background/95 dark:bg-background/95 rounded-2xl rounded-tl-sm px-5 py-3 z-20">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 shadow-md">
              {!isImageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
                  <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
              )}

              <img
                src={sponsorAd.image_url}
                alt="Sponsored"
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
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-base text-foreground/90">
                  {sponsorAd.title}
                </h3>
              </div>

              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {sponsorAd.description}
              </p>

              <div className="flex items-center justify-between mt-2">
                <Button
                  size="sm"
                  variant={isAdComplete ? 'default' : 'outline'}
                  className={cn(
                    'h-8 px-3 text-xs rounded-full transition-all duration-300',
                    isAdComplete
                      ? 'bg-primary hover:bg-primary/90'
                      : 'opacity-70'
                  )}
                  disabled={!isAdComplete}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAdComplete) {
                      window.open(sponsorAd.link, '_blank');
                      trackEvent('sponsor_ad', 'click_url', {
                        ad_id: sponsorAd.id,
                        ad_title: sponsorAd.title,
                        ad_link: sponsorAd.link,
                        view_type: 'chat',
                        click_type: 'button',
                      });
                    }
                  }}
                >
                  {sponsorAd.link_text}{' '}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/50">
                  {isAdComplete ? 'Sponsored' : `Ad ends in ${timeLeft}s`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export { checkForSponsorAds };

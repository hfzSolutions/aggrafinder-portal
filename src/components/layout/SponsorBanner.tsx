import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface SponsorBannerProps {
  message?: string;
  link?: string;
  linkText?: string;
  backgroundColor?: string;
  textColor?: string;
}

const SponsorBanner = (props: SponsorBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [bannerData, setBannerData] = useState<{
    id: string;
    message: string;
    link: string;
    link_text: string;
    background_color: string;
    text_color: string;
  } | null>(null);

  // Fetch active banner from Supabase
  useEffect(() => {
    const fetchActiveBanner = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('sponsor_banners')
          .select('*')
          .lte('start_date', now) // Start date is before or equal to current date
          .gte('end_date', now) // End date is after or equal to current date
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // The query above is actually filtering for banners where:
        // 1. start_date <= now (banner has started)
        // 2. end_date >= now (banner hasn't ended yet)

        if (error) {
          if (error.code !== 'PGRST116') {
            // PGRST116 is the error code for no rows returned
            console.error('Error fetching active banner:', error);
          }
          // If no active banner or error, use props as fallback
          return;
        }

        if (data) {
          setBannerData(data);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
      }
    };

    fetchActiveBanner();
  }, []);

  useEffect(() => {
    // Check if the current banner has been dismissed before
    const dismissedBanners = JSON.parse(
      localStorage.getItem('dismissed_sponsor_banners') || '[]'
    );

    // If we have a banner from the database with an ID
    if (bannerData?.id) {
      // Check if this specific banner ID is in the dismissed list
      const isBannerDismissed = dismissedBanners.includes(bannerData.id);
      if (!isBannerDismissed) {
        setIsVisible(true);
      }
    }
    // For banners passed via props (no ID), use the message as identifier
    else if (props.message) {
      const propsBannerKey = `props_${props.message}`;
      const isBannerDismissed = dismissedBanners.includes(propsBannerKey);
      if (!isBannerDismissed) {
        setIsVisible(true);
      }
    }
  }, [bannerData, props.message]);

  const handleDismiss = () => {
    setIsVisible(false);

    // Get current list of dismissed banners
    const dismissedBanners = JSON.parse(
      localStorage.getItem('dismissed_sponsor_banners') || '[]'
    );

    // Add the current banner ID to the list
    let bannerId;
    if (bannerData?.id) {
      bannerId = bannerData.id;
    } else if (props.message) {
      // For banners passed via props (no ID), use the message as identifier
      bannerId = `props_${props.message}`;
    } else {
      return; // No banner to dismiss
    }

    // Only add if not already in the list
    if (!dismissedBanners.includes(bannerId)) {
      dismissedBanners.push(bannerId);
    }

    // Set expiration date (30 days from now)
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);

    // Save the updated list with expiration
    localStorage.setItem(
      'dismissed_sponsor_banners',
      JSON.stringify(dismissedBanners)
    );
    localStorage.setItem(
      'dismissed_banners_expiration',
      expirationDate.toISOString()
    );
  };

  // Clean up expired dismissed banners
  useEffect(() => {
    const expirationDate = localStorage.getItem('dismissed_banners_expiration');
    if (expirationDate) {
      const expiration = new Date(expirationDate);
      const now = new Date();

      // If expired, clear the dismissed banners
      if (now > expiration) {
        localStorage.removeItem('dismissed_sponsor_banners');
        localStorage.removeItem('dismissed_banners_expiration');
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`w-full ${
        bannerData?.background_color || props.backgroundColor || 'bg-primary'
      } ${
        bannerData?.text_color || props.textColor || 'text-primary-foreground'
      } py-2 px-4`}
    >
      <div className="container mx-auto flex items-center justify-center relative">
        <div className="flex items-center justify-center space-x-3 text-center">
          <p className="text-sm font-medium">
            {bannerData?.message ||
              props.message ||
              'This site is sponsored by our partners.'}
          </p>
          <a
            href={bannerData?.link || props.link || 'https://example.com'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold underline underline-offset-2"
          >
            {bannerData?.link_text || props.linkText || 'Learn more'}
          </a>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full absolute right-0"
          onClick={handleDismiss}
          aria-label="Dismiss banner"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default SponsorBanner;

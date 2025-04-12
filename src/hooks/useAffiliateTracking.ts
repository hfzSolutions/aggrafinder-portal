
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/utils/analytics';

/**
 * Hook to track affiliate referrals from URL parameters
 * Must be used within a Router context
 */
export const useAffiliateTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if the URL contains an affiliate code
    const searchParams = new URLSearchParams(location.search);
    const affiliateCode = searchParams.get('ref');
    
    if (!affiliateCode) return;
    
    // Store the affiliate code in local storage for attribution
    localStorage.setItem('affiliate_code', affiliateCode);
    
    // If we're on a tool details page, record the affiliate click
    const pathMatch = location.pathname.match(/\/tools\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      const toolId = pathMatch[1];
      recordAffiliateClick(affiliateCode, toolId);
    }
    
    // Track the referral event
    trackEvent('affiliate', 'referral', affiliateCode);
    
  }, [location]);

  const recordAffiliateClick = async (affiliateCode: string, toolId: string) => {
    try {
      // Track in GA
      trackEvent('affiliate', 'referral', affiliateCode);
      
      // Track in Supabase
      await supabase.functions.invoke('track-affiliate', {
        body: {
          affiliateCode,
          toolId,
          userAgent: navigator.userAgent,
        },
      });
    } catch (error) {
      console.error('Error recording affiliate click:', error);
    }
  };

  /**
   * Get the current affiliate code from URL or localStorage
   */
  const getCurrentAffiliateCode = (): string | null => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('ref');
    
    if (codeFromUrl) {
      return codeFromUrl;
    }
    
    return localStorage.getItem('affiliate_code');
  };

  return {
    getCurrentAffiliateCode,
  };
};

// Add this to be used in each page that needs affiliate tracking
export const AffiliateTracker = () => {
  useAffiliateTracking();
  return null;
};

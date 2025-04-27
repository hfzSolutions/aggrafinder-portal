import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '@/utils/analytics';
import {
  extractUTMParams,
  saveUTMParams,
  getStoredUTMParams,
} from '@/utils/utmTracker';

/**
 * UTMTracker component
 *
 * This component tracks UTM parameters from URLs and integrates with the analytics system.
 * It should be placed at the application root level to track all page visits.
 */
const UTMTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Extract UTM parameters from URL
    const searchParams = new URLSearchParams(location.search);
    const utmParams = extractUTMParams(searchParams);

    // Save UTM parameters if they exist
    if (Object.keys(utmParams).length > 0) {
      saveUTMParams(utmParams);

      // Track the source in analytics
      if (utmParams.source) {
        trackEvent(
          'traffic_source',
          'utm_detected',
          `source: ${utmParams.source}${
            utmParams.medium ? `, medium: ${utmParams.medium}` : ''
          }${utmParams.campaign ? `, campaign: ${utmParams.campaign}` : ''}`
        );
      }
    }

    // Track page view with UTM data
    const storedUTMParams = getStoredUTMParams();
    if (storedUTMParams && storedUTMParams.source) {
      // Add UTM data as custom dimensions to page view tracking
      // This would typically be handled by your analytics implementation
      console.log('Page viewed with UTM source:', storedUTMParams.source);
    }
  }, [location.search, location.pathname]);

  // This is a tracking component that doesn't render anything
  return null;
};

export default UTMTracker;

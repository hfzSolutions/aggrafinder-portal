import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { getStoredUTMParams } from '@/utils/utmTracker';

type AnalyticsEventType =
  | 'newsletter'
  | 'sponsor_ad_banner'
  | 'sponsor_ad'
  | 'page_view'
  | 'traffic_source';

export const useAnalytics = () => {
  const [isTracking, setIsTracking] = useState(false);

  // Get or create a unique identifier for this user/browser
  const getUserId = () => {
    let userId = localStorage.getItem('user_analytics_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('user_analytics_id', userId);
    }
    return userId;
  };

  const trackEvent = async (
    eventType: AnalyticsEventType,
    action: string,
    metadata?: Record<string, any>
  ) => {
    if (isTracking) return false; // Prevent duplicate tracking
    console.log('tracking event');
    // Track the event in Supabase analytics channe
    try {
      setIsTracking(true);
      const userId = getUserId();

      // Get UTM parameters from storage
      const utmParams = getStoredUTMParams();

      // Combine provided metadata with UTM parameters
      const enhancedMetadata = {
        ...metadata,
        ...(utmParams && { utm: utmParams }),
      };

      const { error } = await supabase.from('general_analytics').insert([
        {
          event_type: eventType,
          user_id: userId,
          action,
          metadata: enhancedMetadata,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      return false;
    } finally {
      setIsTracking(false);
    }
  };

  return { trackEvent };
};

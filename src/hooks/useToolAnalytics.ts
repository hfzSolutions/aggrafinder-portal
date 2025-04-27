import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { AnalyticsAction } from '@/types/tools';
import { getStoredUTMParams } from '@/utils/utmTracker';

export const useToolAnalytics = () => {
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
    toolId: string,
    action: AnalyticsAction,
    metadata?: Record<string, any>
  ) => {
    if (isTracking) return false; // Prevent duplicate tracking

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

      const { error } = await supabase.from('tool_analytics').insert([
        {
          tool_id: toolId,
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

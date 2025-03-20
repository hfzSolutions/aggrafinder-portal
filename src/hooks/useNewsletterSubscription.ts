import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseNewsletterSubscriptionReturn {
  subscribe: (email: string) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
}

export const useNewsletterSubscription =
  (): UseNewsletterSubscriptionReturn => {
    const [isLoading, setIsLoading] = useState(false);

    const subscribe = async (email: string) => {
      try {
        setIsLoading(true);

        // Check if email already exists
        const { data: existingSubscriber } = await supabase
          .from('subscribers')
          .select('email')
          .eq('email', email)
          .single();

        if (existingSubscriber) {
          return {
            success: false,
            error: 'This email is already subscribed to the newsletter.',
          };
        }

        const { error } = await supabase
          .from('subscribers')
          .insert([{ email }]);

        if (error) throw error;

        return { success: true };
      } catch (error: unknown) {
        console.error('Error subscribing to newsletter:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to subscribe. Please try again.';
        return {
          success: false,
          error: errorMessage,
        };
      } finally {
        setIsLoading(false);
      }
    };

    return { subscribe, isLoading };
  };

import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

type AIChatAction = 'open' | 'message_sent' | 'close';

/**
 * Hook for tracking AI chat interactions on tool cards
 * This helps measure user engagement with the AI chat feature
 */
export const useAIChatAnalytics = () => {
  /**
   * Track an AI chat interaction event
   * @param toolId - The ID of the tool being interacted with
   * @param action - The type of interaction (open, message_sent, close)
   * @param messageCount - Optional count of messages in the conversation
   */

  // Get or create a unique identifier for this user/browser
  const getUserId = () => {
    let userId = localStorage.getItem('user_analytics_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('user_analytics_id', userId);
    }
    return userId;
  };

  const trackChatEvent = useCallback(
    async (toolId: string, action: AIChatAction, messageCount?: number) => {
      try {
        const userId = getUserId();

        const { error } = await supabase.from('tool_analytics').insert({
          tool_id: toolId,
          user_id: userId,
          action: `ai_chat_${action}`,
          metadata: messageCount ? { message_count: messageCount } : {},
          created_at: new Date().toISOString(),
        });

        if (error) {
          console.error('Error tracking AI chat event:', error);
        }
      } catch (err) {
        console.error('Failed to track AI chat event:', err);
      }
    },
    [supabase]
  );

  return { trackChatEvent };
};

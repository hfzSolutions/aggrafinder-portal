import { supabase } from '@/integrations/supabase/client';
import { useCallback } from 'react';

/**
 * Hook for tracking quick tool usage count
 * This helps measure how many conversations are started with each quick tool
 */
export const useQuickToolUsage = () => {
  /**
   * Increment the usage count for a quick tool
   * @param toolId - The ID of the quick tool being used
   */
  const incrementUsageCount = useCallback(async (toolId: string) => {
    try {
      // Update the usage_count for the tool by incrementing it by 1
      const { error } = await supabase.rpc('increment_tool_usage_count', {
        tool_id: toolId,
      });

      if (error) {
        console.error('Error incrementing tool usage count:', error);
      }
    } catch (err) {
      console.error('Failed to increment tool usage count:', err);
    }
  }, []);

  return { incrementUsageCount };
};

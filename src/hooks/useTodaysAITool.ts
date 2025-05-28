import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';
import { useToolAnalytics } from './useToolAnalytics';
import { toast } from 'sonner';

/**
 * Custom hook to manage the "Today's AI Tools" feature
 * Selects multiple tools to feature on the homepage
 */
export const useTodaysAITool = () => {
  const [todaysTools, setTodaysTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { trackEvent } = useToolAnalytics();

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          const { data } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };

    checkAdminStatus();
  }, []);

  useEffect(() => {
    const fetchTodaysTools = async () => {
      try {
        setLoading(true);

        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const dateString = `${today.getFullYear()}-${
          today.getMonth() + 1
        }-${today.getDate()}`;

        // Create a simple hash from the date string to use as a seed
        const hash = dateString.split('').reduce((acc, char) => {
          return acc + char.charCodeAt(0);
        }, 0);

        // First check if we have featured tools specifically set for today
        const { data: featuredData, error: featuredError } = await supabase
          .from('daily_featured_tools')
          .select('tool_id')
          .eq('feature_date', dateString);

        let selectedTools: AITool[] = [];

        if (!featuredError && featuredData && featuredData.length > 0) {
          // We have manually set featured tools for today
          const toolIds = featuredData.map((item) => item.tool_id);

          const { data: toolsData, error: toolsError } = await supabase
            .from('ai_tools_random')
            .select('*')
            .in('id', toolIds)
            .eq('approval_status', 'approved')
            .eq('tool_type', 'external');

          if (!toolsError && toolsData && toolsData.length > 0) {
            selectedTools = toolsData.map((tool) => transformToolData(tool));
          }
        }

        // If we don't have enough manually featured tools, select some algorithmically
        if (selectedTools.length < 4) {
          // Get a selection of high-quality tools
          const { data, error } = await supabase
            .from('ai_tools_random')
            .select('*')
            .eq('approval_status', 'approved')
            .eq('tool_type', 'external')
            .order('created_at', { ascending: false })
            .limit(4);

          if (error) throw error;

          if (data && data.length > 0) {
            // Filter out any tools that are already in selectedTools
            const existingIds = selectedTools.map((tool) => tool.id);
            const remainingTools = data.filter(
              (tool) => !existingIds.includes(tool.id)
            );

            // Use the hash to select tools from the available tools
            const neededCount = 4 - selectedTools.length;
            for (let i = 0; i < neededCount && i < remainingTools.length; i++) {
              const index = (hash + i) % remainingTools.length;
              selectedTools.push(transformToolData(remainingTools[index]));
            }
          }
        }

        // Limit to 4 tools maximum
        setTodaysTools(selectedTools.slice(0, 4));
      } catch (error) {
        console.error("Error fetching today's AI tools:", error);
        setTodaysTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysTools();
  }, []);

  // Transform the raw database tool data into the AITool type
  const transformToolData = (item: any): AITool => ({
    id: item.id,
    name: item.name,
    tagline: item.tagline,
    description: item.description,
    imageUrl: item.image_url
      ? `${import.meta.env.VITE_STORAGE_URL}/${item.image_url}`
      : '',
    category: item.category,
    url: item.url,
    youtubeUrl: item.youtube_url || '',
    featured: item.featured,
    pricing: item.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
    tags: item.tags || [],
    userId: item.user_id,
    approvalStatus: item.approval_status,
    isAdminAdded: item.is_admin_added || false,
  });

  // Track when a user views or interacts with today's tools
  const trackTodaysToolEvent = (
    eventType: 'view' | 'click_url',
    toolId?: string
  ) => {
    if (toolId) {
      trackEvent(toolId, eventType, { source: 'todays_pick' });
    } else if (todaysTools.length > 0) {
      // If no specific tool ID is provided, track the first tool as a fallback
      trackEvent(todaysTools[0].id, eventType, { source: 'todays_pick' });
    }
  };

  return {
    todaysTools,
    loading,
    trackTodaysToolEvent,
  };
};

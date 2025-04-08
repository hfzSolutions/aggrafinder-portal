import { useState, useEffect, useMemo } from 'react';
import { AITool } from '@/types/tools';
import { useSupabaseTools } from './useSupabaseTools';

interface UseRecentlyViewedToolsReturn {
  recentlyViewedTools: AITool[];
  addRecentlyViewed: (toolId: string) => void;
  clearRecentlyViewed: () => void;
  isLoading: boolean;
}

export const useRecentlyViewedTools = (
  limit = 4
): UseRecentlyViewedToolsReturn => {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the query configuration to prevent unnecessary re-renders
  const queryConfig = useMemo(
    () => ({
      limit,
      loadMore: false,
      ...(recentIds.length > 0
        ? {
            customQuery: (query) => query.in('id', recentIds),
          }
        : {
            customQuery: (query) => query.eq('id', 'no-results'),
          }),
    }),
    [limit, recentIds]
  );

  // Use the existing hook to fetch the actual tool data with memoized config
  const { tools: recentlyViewedTools, loading } = useSupabaseTools(queryConfig);

  // Load recently viewed from localStorage on initial render
  useEffect(() => {
    const storedRecent = localStorage.getItem('recently_viewed_tools');
    if (storedRecent) {
      try {
        const parsed = JSON.parse(storedRecent);
        setRecentIds(parsed.slice(0, limit));
      } catch (error) {
        console.error('Error parsing recently viewed tools:', error);
        localStorage.removeItem('recently_viewed_tools');
      }
    }
    setIsLoading(false);
  }, [limit]);

  // Save to localStorage whenever they change
  useEffect(() => {
    if (recentIds.length > 0) {
      localStorage.setItem('recently_viewed_tools', JSON.stringify(recentIds));
    }
  }, [recentIds]);

  const addRecentlyViewed = (toolId: string) => {
    setRecentIds((prev) => {
      // Remove the tool if it already exists to avoid duplicates
      const filtered = prev.filter((id) => id !== toolId);
      // Add the tool to the beginning of the array
      return [toolId, ...filtered].slice(0, limit);
    });
  };

  const clearRecentlyViewed = () => {
    setRecentIds([]);
    localStorage.removeItem('recently_viewed_tools');
  };

  // Memoize the sorted tools array to prevent unnecessary re-renders
  const sortedTools = useMemo(() => {
    if (recentIds.length === 0) return [];
    return recentlyViewedTools.sort((a, b) => {
      return recentIds.indexOf(a.id) - recentIds.indexOf(b.id);
    });
  }, [recentIds, recentlyViewedTools]);

  return {
    recentlyViewedTools: sortedTools,
    addRecentlyViewed,
    clearRecentlyViewed,
    isLoading: isLoading || loading,
  };
};

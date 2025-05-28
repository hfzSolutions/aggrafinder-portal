import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';

interface UseSupabaseToolsOptions {
  featured?: boolean;
  category?: string;
  search?: string;
  pricing?: string;
  limit?: number;
  page?: number;
  loadMore?: boolean;
  excludeId?: string; // Add this to exclude specific tools (useful for related tools)
  userId?: string; // Add this to filter by user ID
  includeUnapproved?: boolean; // Add this to include unapproved tools (for admin views)
  sortBy?: 'created_at' | 'popularity' | 'random';
  customQuery?: (query: any) => any; // Allow custom query modifications
  toolType?: 'all' | 'quick' | 'external'; // Add this to filter by tool type
}

// Helper function to fetch tools with common filtering logic
const fetchToolsFromSupabase = async ({
  featured,
  category,
  search,
  pricing,
  limit,
  pageToFetch,
  excludeId,
  userId,
  includeUnapproved,
  sortBy,
  customQuery,
  toolType,
  tableName = 'ai_tools_random', // Default to random view
}: UseSupabaseToolsOptions & { pageToFetch: number; tableName?: string }) => {
  try {
    let query = supabase.from(tableName).select('*');

    if (featured !== undefined) {
      query = query.eq('featured', featured);
    }

    if (category && category !== 'All') {
      query = query.contains('category', [category]);
    }

    if (pricing && pricing !== 'All') {
      query = query.eq('pricing', pricing);
    }

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by approval status unless explicitly including unapproved
    if (!includeUnapproved && !userId) {
      query = query.eq('approval_status', 'approved');
    }

    // Filter by tool type (only if not 'all')
    if (toolType !== 'all') {
      query = query.eq('tool_type', toolType);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      query = query.or(
        `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
    }

    // Apply custom query modifications if provided
    if (typeof customQuery === 'function') {
      query = customQuery(query);
    }

    // Apply sorting
    if (sortBy === 'popularity') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'name') {
      query = query.order('name', { ascending: true });
    } else if (sortBy === 'created_at') {
      query = query.order('created_at', { ascending: false });
    }
    // For random sorting, we rely on the randomized view

    query = query.range(pageToFetch * limit, pageToFetch * limit + limit - 1);

    const { data, error: supabaseError } = await query;

    if (supabaseError) {
      throw new Error(supabaseError.message);
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching tools:', error);
    return { data: null, error };
  }
};

export const useSupabaseTools = ({
  featured,
  category,
  search,
  pricing,
  limit = 25,
  page = 0,
  loadMore = false,
  excludeId,
  userId,
  includeUnapproved = false,
  sortBy,
  customQuery,
  toolType = 'all',
}: UseSupabaseToolsOptions = {}) => {
  // Separate states for quick tools and external tools
  const [quickTools, setQuickTools] = useState<AITool[]>([]);
  const [externalTools, setExternalTools] = useState<AITool[]>([]);

  // Separate loading states
  const [quickToolsLoading, setQuickToolsLoading] = useState(true);
  const [externalToolsLoading, setExternalToolsLoading] = useState(true);

  // Separate error states
  const [quickToolsError, setQuickToolsError] = useState<Error | null>(null);
  const [externalToolsError, setExternalToolsError] = useState<Error | null>(
    null
  );

  // Separate hasMore flags
  const [hasMoreQuickTools, setHasMoreQuickTools] = useState(true);
  const [hasMoreExternalTools, setHasMoreExternalTools] = useState(true);

  // Separate current page states
  const [currentQuickToolsPage, setCurrentQuickToolsPage] = useState(page);
  const [currentExternalToolsPage, setCurrentExternalToolsPage] =
    useState(page);

  // Combined loading state for UI purposes
  const loading =
    toolType === 'quick' || toolType === 'all'
      ? quickToolsLoading
      : toolType === 'external'
      ? externalToolsLoading
      : quickToolsLoading || externalToolsLoading;

  // Combined error state
  const error = quickToolsError || externalToolsError;

  // Combined hasMore flag based on tool type
  const hasMore =
    toolType === 'quick'
      ? hasMoreQuickTools
      : toolType === 'external'
      ? hasMoreExternalTools
      : hasMoreQuickTools || hasMoreExternalTools;

  const prevFiltersRef = useRef({
    featured,
    category,
    search,
    pricing,
    excludeId,
    userId,
    includeUnapproved,
    sortBy,
    customQuery,
    toolType,
  });

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.featured !== featured ||
      prevFiltersRef.current.category !== category ||
      prevFiltersRef.current.search !== search ||
      prevFiltersRef.current.pricing !== pricing ||
      prevFiltersRef.current.excludeId !== excludeId ||
      prevFiltersRef.current.userId !== userId ||
      prevFiltersRef.current.includeUnapproved !== includeUnapproved ||
      prevFiltersRef.current.sortBy !== sortBy ||
      prevFiltersRef.current.customQuery !== customQuery ||
      prevFiltersRef.current.toolType !== toolType;

    if (filtersChanged && loadMore) {
      // Reset states when filters change
      setQuickTools([]);
      setExternalTools([]);
      setCurrentQuickToolsPage(0);
      setCurrentExternalToolsPage(0);
      setHasMoreQuickTools(true);
      setHasMoreExternalTools(true);
    }

    prevFiltersRef.current = {
      featured,
      category,
      search,
      pricing,
      excludeId,
      userId,
      includeUnapproved,
      sortBy,
      customQuery,
      toolType,
    };

    const fetchTools = async () => {
      // Always fetch both quick tools and external tools regardless of toolType
      // This ensures we have both types of tools available when needed

      // Fetch quick tools
      try {
        setQuickToolsLoading(true);

        // Determine which page to fetch for quick tools
        const pageToFetch = loadMore ? currentQuickToolsPage : page;

        // For quick tools, we use the ai_tools_random view for randomness
        const quickToolsResult = await fetchToolsFromSupabase({
          featured,
          category,
          search,
          pricing,
          limit,
          pageToFetch,
          excludeId,
          userId,
          includeUnapproved,
          sortBy,
          customQuery,
          toolType: 'quick',
          tableName: 'ai_tools_random',
        });

        if (quickToolsResult.error) {
          throw quickToolsResult.error;
        }

        if (!quickToolsResult.data || quickToolsResult.data.length === 0) {
          setQuickTools(loadMore ? (prevQuickTools) => prevQuickTools : []);
          setHasMoreQuickTools(false);
        } else {
          // Process quick tools data
          const quickToolsData = quickToolsResult.data;
          const quickToolIds = quickToolsData.map((tool) => tool.id);

          // Fetch vote counts for quick tools
          let quickToolsVoteCountsMap: Record<string, number> = {};
          try {
            const { data: voteCounts, error: voteCountsError } = await supabase
              .from('tool_vote_counts')
              .select('tool_id, upvotes')
              .in('tool_id', quickToolIds);

            if (!voteCountsError && voteCounts) {
              quickToolsVoteCountsMap = voteCounts.reduce((acc, item) => {
                acc[item.tool_id] = item.upvotes || 0;
                return acc;
              }, {} as Record<string, number>);
            }
          } catch (err) {
            console.error('Error fetching quick tools vote counts:', err);
          }

          // Transform quick tools data
          let transformedQuickTools: AITool[] = quickToolsData.map((item) => ({
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
            pricing: item.pricing as
              | 'Free'
              | 'Freemium'
              | 'Paid'
              | 'Free Trial',
            tags: item.tags || [],
            userId: item.user_id,
            approvalStatus: item.approval_status as
              | 'pending'
              | 'approved'
              | 'rejected',
            upvotes: quickToolsVoteCountsMap[item.id] || 0,
            isAdminAdded: item.is_admin_added || false,
            tool_type: item.tool_type as 'external' | 'quick',
            is_public: item.is_public || true,
            usage_count: item.usage_count || 0,
            prompt: item.prompt || '',
          }));

          // Apply client-side sorting for quick tools
          if (sortBy === 'popularity') {
            transformedQuickTools = transformedQuickTools.sort(
              (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
            );
          }

          setHasMoreQuickTools(transformedQuickTools.length === limit);

          if (loadMore) {
            setQuickTools((prevTools) => [
              ...prevTools,
              ...transformedQuickTools,
            ]);
          } else {
            setQuickTools(transformedQuickTools);
          }
        }
      } catch (err) {
        console.error('Error fetching quick tools:', err);
        setQuickToolsError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setQuickToolsLoading(false);
      }

      // Fetch external tools
      try {
        setExternalToolsLoading(true);

        // Determine which page to fetch for external tools
        const pageToFetch = loadMore ? currentExternalToolsPage : page;

        // For external tools, we use the ai_tools_random view
        const externalToolsResult = await fetchToolsFromSupabase({
          featured,
          category,
          search,
          pricing,
          limit,
          pageToFetch,
          excludeId,
          userId,
          includeUnapproved,
          sortBy,
          customQuery,
          toolType: 'external',
          tableName: 'ai_tools_random',
        });

        if (externalToolsResult.error) {
          throw externalToolsResult.error;
        }

        if (
          !externalToolsResult.data ||
          externalToolsResult.data.length === 0
        ) {
          setExternalTools(
            loadMore ? (prevExternalTools) => prevExternalTools : []
          );
          setHasMoreExternalTools(false);
        } else {
          // Process external tools data
          const externalToolsData = externalToolsResult.data;
          const externalToolIds = externalToolsData.map((tool) => tool.id);

          // Fetch vote counts for external tools
          let externalToolsVoteCountsMap: Record<string, number> = {};
          try {
            const { data: voteCounts, error: voteCountsError } = await supabase
              .from('tool_vote_counts')
              .select('tool_id, upvotes')
              .in('tool_id', externalToolIds);

            if (!voteCountsError && voteCounts) {
              externalToolsVoteCountsMap = voteCounts.reduce((acc, item) => {
                acc[item.tool_id] = item.upvotes || 0;
                return acc;
              }, {} as Record<string, number>);
            }
          } catch (err) {
            console.error('Error fetching external tools vote counts:', err);
          }

          // Transform external tools data
          let transformedExternalTools: AITool[] = externalToolsData.map(
            (item) => ({
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
              pricing: item.pricing as
                | 'Free'
                | 'Freemium'
                | 'Paid'
                | 'Free Trial',
              tags: item.tags || [],
              userId: item.user_id,
              approvalStatus: item.approval_status as
                | 'pending'
                | 'approved'
                | 'rejected',
              upvotes: externalToolsVoteCountsMap[item.id] || 0,
              isAdminAdded: item.is_admin_added || false,
              tool_type: item.tool_type as 'external' | 'quick',
              is_public: item.is_public || true,
              usage_count: item.usage_count || 0,
              prompt: item.prompt || '',
            })
          );

          // Apply client-side sorting for external tools
          if (sortBy === 'popularity') {
            transformedExternalTools = transformedExternalTools.sort(
              (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
            );
          }

          setHasMoreExternalTools(transformedExternalTools.length === limit);

          if (loadMore) {
            setExternalTools((prevTools) => [
              ...prevTools,
              ...transformedExternalTools,
            ]);
          } else {
            setExternalTools(transformedExternalTools);
          }
        }
      } catch (err) {
        console.error('Error fetching external tools:', err);
        setExternalToolsError(
          err instanceof Error ? err : new Error(String(err))
        );
      } finally {
        setExternalToolsLoading(false);
      }
    };

    fetchTools();
  }, [
    featured,
    category,
    search,
    pricing,
    limit,
    currentQuickToolsPage,
    currentExternalToolsPage,
    page,
    loadMore,
    excludeId,
    userId,
    includeUnapproved,
    sortBy,
    customQuery,
    toolType,
  ]);

  // Separate load more functions for each tool type
  const loadNextQuickToolsPage = () => {
    console.log('hihi');
    if (!quickToolsLoading && hasMoreQuickTools) {
      setCurrentQuickToolsPage((prev) => prev + 1);
    }
  };

  const loadNextExternalToolsPage = () => {
    console.log('haha');
    if (!externalToolsLoading && hasMoreExternalTools) {
      setCurrentExternalToolsPage((prev) => prev + 1);
    }
  };

  // Combine tools based on toolType for backward compatibility
  const tools =
    toolType === 'quick'
      ? quickTools
      : toolType === 'external'
      ? externalTools
      : [...quickTools, ...externalTools];

  return {
    tools,
    loading,
    error,
    hasMore,
    // Properties for separate tool types
    quickTools,
    externalTools,
    quickToolsLoading,
    externalToolsLoading,
    hasMoreQuickTools,
    hasMoreExternalTools,
    loadNextQuickToolsPage,
    loadNextExternalToolsPage,
  };
};

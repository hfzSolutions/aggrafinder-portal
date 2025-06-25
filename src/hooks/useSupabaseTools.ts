import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';
import { detectUserCountryWithFallback } from '@/utils/countryDetection';

interface UseSupabaseToolsOptions {
  featured?: boolean;
  category?: string;
  search?: string;
  pricing?: string;
  country?: string; // Add country filter option
  limit?: number;
  page?: number;
  loadMore?: boolean;
  excludeId?: string; // Add this to exclude specific tools (useful for related tools)
  userId?: string; // Add this to filter by user ID
  includeUnapproved?: boolean; // Add this to include unapproved tools (for admin views)
  sortBy?: 'created_at' | 'popularity' | 'random';
  customQuery?: (query: any) => any; // Allow custom query modifications
  toolType?: 'all' | 'quick' | 'external'; // Add this to filter by tool type
  autoDetectCountry?: boolean; // Add option to enable/disable automatic country detection
}

// Helper function to fetch tools with smart country-based prioritization
const fetchToolsFromSupabase = async ({
  featured,
  category,
  search,
  pricing,
  country, // This will be the user's detected country
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
    // Build the query with smart country filtering
    let query = (supabase as any).from(tableName).select('*');

    // Smart country filtering: Always include Global + user's country
    // This ensures users never get empty results
    if (country && country !== 'Global') {
      // PostgreSQL array overlap operator - matches if ANY tag overlaps
      // This will match tools with ['Global'], ['Malaysia'], or ['Global', 'Malaysia']
      query = query.overlaps('tags', ['Global', country]);
    } else {
      // If no specific country or is Global, don't filter by country
      // This shows all tools
    }

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

    // Smart sorting: Prioritize user's country tools, then by specified sort
    if (country && country !== 'Global') {
      // First sort by country relevance (user's country tools first)
      // Then by the requested sort criteria
      if (sortBy === 'popularity') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
      }
      // Note: We'll do client-side sorting for country priority + popularity
    } else {
      // Apply normal sorting when no country preference
      if (sortBy === 'popularity') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'created_at') {
        query = query.order('created_at', { ascending: false });
      }
    }

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
  country, // Add country parameter
  limit = 25,
  page = 0,
  loadMore = false,
  excludeId,
  userId,
  includeUnapproved = false,
  sortBy,
  customQuery,
  toolType = 'all',
  autoDetectCountry = true, // Enable automatic country detection by default
}: UseSupabaseToolsOptions = {}) => {
  // State for detected user country
  const [detectedCountry, setDetectedCountry] = useState<string>('Global');
  const [countryDetected, setCountryDetected] = useState(false);

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
    country, // Add country to filters tracking
    excludeId,
    userId,
    includeUnapproved,
    sortBy,
    customQuery,
    toolType,
    detectedCountry, // Add detected country to filters tracking
  });

  // Effect to detect user's country
  useEffect(() => {
    if (autoDetectCountry && !countryDetected) {
      const detectCountry = async () => {
        try {
          const userCountry = await detectUserCountryWithFallback();
          setDetectedCountry(userCountry);
          setCountryDetected(true);
          console.log('Detected user country:', userCountry);
        } catch (error) {
          console.error('Error detecting country:', error);
          setDetectedCountry('Global');
          setCountryDetected(true);
        }
      };

      detectCountry();
    } else if (!autoDetectCountry) {
      setCountryDetected(true);
    }
  }, [autoDetectCountry, countryDetected]);

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.featured !== featured ||
      prevFiltersRef.current.category !== category ||
      prevFiltersRef.current.search !== search ||
      prevFiltersRef.current.pricing !== pricing ||
      prevFiltersRef.current.country !== country || // Add country check
      prevFiltersRef.current.excludeId !== excludeId ||
      prevFiltersRef.current.userId !== userId ||
      prevFiltersRef.current.includeUnapproved !== includeUnapproved ||
      prevFiltersRef.current.sortBy !== sortBy ||
      prevFiltersRef.current.customQuery !== customQuery ||
      prevFiltersRef.current.toolType !== toolType ||
      prevFiltersRef.current.detectedCountry !== detectedCountry; // Add detected country check

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
      country, // Add country
      excludeId,
      userId,
      includeUnapproved,
      sortBy,
      customQuery,
      toolType,
      detectedCountry, // Add detected country
    };

    // Only fetch tools after country detection is complete (or if auto-detection is disabled)
    if (!countryDetected) {
      return;
    }

    const fetchTools = async () => {
      // Determine which country to use for filtering
      const effectiveCountry =
        country || (autoDetectCountry ? detectedCountry : undefined);

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
          country: effectiveCountry, // Use effective country
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

          // Apply smart sorting: Country priority + popularity/date
          if (effectiveCountry && effectiveCountry !== 'Global') {
            // Sort by country relevance first, then by popularity/date
            transformedQuickTools = transformedQuickTools.sort((a, b) => {
              const aHasUserCountry =
                a.tags?.includes(effectiveCountry) || false;
              const bHasUserCountry =
                b.tags?.includes(effectiveCountry) || false;

              // Prioritize tools with user's country tag
              if (aHasUserCountry && !bHasUserCountry) return -1;
              if (!aHasUserCountry && bHasUserCountry) return 1;

              // If both have same country priority, sort by specified criteria
              if (sortBy === 'popularity') {
                return (b.upvotes || 0) - (a.upvotes || 0);
              }
              // For other sorts, maintain order
              return 0;
            });
          } else {
            // Apply traditional sorting when no country preference
            if (sortBy === 'popularity') {
              transformedQuickTools = transformedQuickTools.sort(
                (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
              );
            }
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
          country: effectiveCountry, // Use effective country
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

          // Apply smart sorting: Country priority + popularity/date
          if (effectiveCountry && effectiveCountry !== 'Global') {
            // Sort by country relevance first, then by popularity/date
            transformedExternalTools = transformedExternalTools.sort((a, b) => {
              const aHasUserCountry =
                a.tags?.includes(effectiveCountry) || false;
              const bHasUserCountry =
                b.tags?.includes(effectiveCountry) || false;

              // Prioritize tools with user's country tag
              if (aHasUserCountry && !bHasUserCountry) return -1;
              if (!aHasUserCountry && bHasUserCountry) return 1;

              // If both have same country priority, sort by specified criteria
              if (sortBy === 'popularity') {
                return (b.upvotes || 0) - (a.upvotes || 0);
              }
              // For other sorts, maintain order
              return 0;
            });
          } else {
            // Apply traditional sorting when no country preference
            if (sortBy === 'popularity') {
              transformedExternalTools = transformedExternalTools.sort(
                (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
              );
            }
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
    country,
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
    detectedCountry,
    countryDetected,
    autoDetectCountry,
  ]);

  // Separate load more functions for each tool type
  const loadNextQuickToolsPage = () => {
    if (!quickToolsLoading && hasMoreQuickTools) {
      setCurrentQuickToolsPage((prev) => prev + 1);
    }
  };

  const loadNextExternalToolsPage = () => {
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
    // Country detection properties
    detectedCountry,
    countryDetected,
  };
};

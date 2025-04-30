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
  sortBy?: 'created_at' | 'popularity';
  customQuery?: (query: any) => any; // Allow custom query modifications
}

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
}: UseSupabaseToolsOptions = {}) => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(page);

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
      prevFiltersRef.current.customQuery !== customQuery;

    if (filtersChanged && loadMore) {
      setTools([]);
      setCurrentPage(0);
      setHasMore(true);
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
    };

    const fetchTools = async () => {
      try {
        setLoading(true);

        let query = supabase.from('ai_tools_random').select('*'); // "VIEW" OF AI TOOLS TABLE

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

        if (search) {
          const searchTerm = search.toLowerCase();
          query = query.or(
            `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          );
        }

        const pageToFetch = loadMore ? currentPage : page;
        // Apply custom query modifications if provided
        if (typeof customQuery === 'function') {
          query = customQuery(query);
        }

        // Apply sorting
        if (sortBy === 'popularity') {
          // We'll handle popularity sorting after fetching the data
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'name') {
          query = query.order('name', { ascending: true });
        } else if (sortBy === 'created_at') {
          query = query.order('created_at', { ascending: false });
        }

        query = query.range(
          pageToFetch * limit,
          pageToFetch * limit + limit - 1
        );

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!data) {
          setTools([]);
          setHasMore(false);
          return;
        }

        // First, get all the tool IDs to fetch their vote counts
        const toolIds = data.map((tool) => tool.id);

        // Fetch the vote counts for these tools
        let voteCountsMap: Record<string, number> = {};

        try {
          const { data: voteCounts, error: voteCountsError } = await supabase
            .from('tool_vote_counts')
            .select('tool_id, upvotes')
            .in('tool_id', toolIds);

          if (!voteCountsError && voteCounts) {
            voteCountsMap = voteCounts.reduce((acc, item) => {
              acc[item.tool_id] = item.upvotes || 0;
              return acc;
            }, {} as Record<string, number>);
          }
        } catch (err) {
          console.error('Error fetching vote counts:', err);
          // Continue without the vote counts if there's an error
        }

        let transformedData: AITool[] = data.map((item) => ({
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
          approvalStatus: item.approval_status as
            | 'pending'
            | 'approved'
            | 'rejected',
          upvotes: voteCountsMap[item.id] || 0,
          isAdminAdded: item.is_admin_added || false,
        }));

        // Apply client-side sorting
        if (sortBy === 'popularity') {
          transformedData = transformedData.sort(
            (a, b) => (b.upvotes || 0) - (a.upvotes || 0)
          );
        }

        setHasMore(transformedData.length === limit);

        if (loadMore) {
          setTools((prevTools) => [...prevTools, ...transformedData]);
        } else {
          setTools(transformedData);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [
    featured,
    category,
    search,
    pricing,
    limit,
    currentPage,
    page,
    loadMore,
    excludeId,
    userId,
    includeUnapproved,
    sortBy,
    customQuery,
  ]);

  const loadNextPage = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return { tools, loading, error, hasMore, loadNextPage };
};

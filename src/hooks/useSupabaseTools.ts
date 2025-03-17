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
}

export const useSupabaseTools = ({
  featured,
  category,
  search,
  pricing,
  limit = 12,
  page = 0,
  loadMore = false,
  excludeId,
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
  });

  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.featured !== featured ||
      prevFiltersRef.current.category !== category ||
      prevFiltersRef.current.search !== search ||
      prevFiltersRef.current.pricing !== pricing ||
      prevFiltersRef.current.excludeId !== excludeId;

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
    };

    const fetchTools = async () => {
      try {
        setLoading(true);

        let query = supabase.from('ai_tools').select('*');

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

        if (search) {
          const searchTerm = search.toLowerCase();
          query = query.or(
            `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
          );
        }

        const pageToFetch = loadMore ? currentPage : page;
        query = query
          .range(pageToFetch * limit, pageToFetch * limit + limit - 1)
          .order('created_at', { ascending: false });

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        const transformedData: AITool[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.image_url,
          category: item.category,
          url: item.url,
          featured: item.featured,
          pricing: item.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
          tags: item.tags,
        }));

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
  ]);

  const loadNextPage = () => {
    if (!loading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return { tools, loading, error, hasMore, loadNextPage };
};

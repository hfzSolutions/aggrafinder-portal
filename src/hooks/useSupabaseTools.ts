
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AITool } from "@/types/tools";

interface UseSupabaseToolsOptions {
  featured?: boolean;
  category?: string;
  search?: string;
  pricing?: string;
  limit?: number;
}

export const useSupabaseTools = ({
  featured,
  category,
  search,
  pricing,
  limit
}: UseSupabaseToolsOptions = {}) => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('ai_tools')
          .select('*');
        
        // Apply filters
        if (featured !== undefined) {
          query = query.eq('featured', featured);
        }
        
        if (category && category !== 'All') {
          query = query.contains('category', [category]);
        }
        
        if (pricing && pricing !== 'All') {
          query = query.eq('pricing', pricing);
        }
        
        if (search) {
          const searchTerm = search.toLowerCase();
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error: supabaseError } = await query;
        
        if (supabaseError) {
          throw new Error(supabaseError.message);
        }
        
        // Transform the data to match our AITool type
        const transformedData: AITool[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.image_url,
          category: item.category,
          url: item.url,
          featured: item.featured,
          pricing: item.pricing as "Free" | "Freemium" | "Paid" | "Free Trial",
          tags: item.tags
        }));
        
        setTools(transformedData);
      } catch (err) {
        console.error("Error fetching tools:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, [featured, category, search, pricing, limit]);

  return { tools, loading, error };
};

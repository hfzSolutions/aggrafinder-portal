import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';

interface UseSupabaseToolsByIdsOptions {
  ids: string[];
}

export const useSupabaseToolsByIds = ({
  ids,
}: UseSupabaseToolsByIdsOptions) => {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchToolsByIds = async () => {
      if (!ids.length) {
        setTools([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch only the tools with the specified IDs
        const { data, error: supabaseError } = await supabase
          .from('ai_tools')
          .select('*')
          .in('id', ids)
          .eq('approval_status', 'approved');

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!data) {
          setTools([]);
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

        const transformedData: AITool[] = data.map((item) => ({
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

        // Preserve the order of tools as specified in the ids array
        const orderedTools = ids
          .map((id) => transformedData.find((tool) => tool.id === id))
          .filter((tool): tool is AITool => tool !== undefined);

        setTools(orderedTools);
      } catch (err) {
        console.error('Error fetching tools by IDs:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchToolsByIds();
  }, [ids]);

  return { tools, loading, error };
};

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useToolComments = (toolId: string) => {
  const [commentCount, setCommentCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);

        // Fetch comments for this tool
        const { data, error } = await supabase
          .from('tool_reviews')
          .select('*')
          .eq('tool_id', toolId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setComments(data || []);
        setCommentCount(data?.length || 0);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [toolId, refreshKey]);

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return { comments, commentCount, loading, refresh };
};

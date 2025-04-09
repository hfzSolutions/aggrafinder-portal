
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PendingCounts {
  tools: number;
  supportMessages: number;
  claimRequests: number;
}

export function useAdminPendingCounts() {
  const [counts, setCounts] = useState<PendingCounts>({
    tools: 0,
    supportMessages: 0,
    claimRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        
        // Get count of pending tool approvals
        const { count: toolsCount, error: toolsError } = await supabase
          .from('ai_tools')
          .select('*', { count: 'exact', head: true })
          .eq('approval_status', 'pending');
        
        if (toolsError) throw toolsError;

        // Get count of pending support messages
        // Use any type to bypass TypeScript checking for the table name
        const { count: messagesCount, error: messagesError } = await (supabase as any)
          .from('support_messages')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        if (messagesError) throw messagesError;

        // Get count of pending claim requests
        const { count: claimsCount, error: claimsError } = await (supabase as any)
          .from('tool_requests')
          .select('*', { count: 'exact', head: true })
          .eq('request_type', 'claim')
          .eq('status', 'pending');
        
        if (claimsError) throw claimsError;

        setCounts({
          tools: toolsCount || 0,
          supportMessages: messagesCount || 0,
          claimRequests: claimsCount || 0,
        });
      } catch (error) {
        console.error('Error fetching pending counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    
    // Set up a polling interval to refresh counts
    const interval = setInterval(fetchCounts, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  return { counts, loading };
}


import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Wrench 
} from 'lucide-react';

export function AdminSummary() {
  const [pendingToolsCount, setPendingToolsCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [pendingSupportCount, setPendingSupportCount] = useState(0);
  const [pendingClaimsCount, setPendingClaimsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadCounts = async () => {
    setIsLoading(true);
    try {
      // Get count of pending tools
      const { count: toolsCount, error: toolsError } = await supabase
        .from('ai_tools')
        .select('id', { count: 'exact', head: true })
        .eq('approval_status', 'pending');

      if (toolsError) throw toolsError;
      setPendingToolsCount(toolsCount || 0);

      // Get count of pending tool requests
      const { count: requestsCount, error: requestsError } = await supabase
        .from('tool_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (requestsError) throw requestsError;
      setPendingRequestsCount(requestsCount || 0);

      // Get count of pending support messages
      const { count: supportCount, error: supportError } = await supabase
        .from('support_messages')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (supportError) throw supportError;
      setPendingSupportCount(supportCount || 0);

      // Get count of pending ownership claims using the RPC function
      const { data: claimsCount, error: claimsError } = await supabase
        .rpc('count_pending_claims');

      if (claimsError) throw claimsError;
      setPendingClaimsCount(claimsCount || 0);
    } catch (error) {
      console.error('Error loading admin summary counts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCounts();
    
    // Refresh counts every 5 minutes
    const interval = setInterval(loadCounts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Pending Tools" 
          count={pendingToolsCount} 
          icon={<Wrench className="h-5 w-5 text-blue-600" />} 
          description="Tools awaiting approval"
          isLoading={isLoading}
        />
        <SummaryCard 
          title="Pending Requests" 
          count={pendingRequestsCount} 
          icon={<Clock className="h-5 w-5 text-amber-600" />} 
          description="Tool update/add requests"
          isLoading={isLoading}
        />
        <SummaryCard 
          title="Support Messages" 
          count={pendingSupportCount} 
          icon={<MessageSquare className="h-5 w-5 text-purple-600" />} 
          description="Unanswered support requests"
          isLoading={isLoading}
        />
        <SummaryCard 
          title="Ownership Claims" 
          count={pendingClaimsCount} 
          icon={<AlertCircle className="h-5 w-5 text-red-600" />} 
          description="Claims awaiting verification"
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

interface SummaryCardProps {
  title: string;
  count: number;
  icon: React.ReactNode;
  description: string;
  isLoading: boolean;
}

function SummaryCard({ title, count, icon, description, isLoading }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">
              {isLoading ? '...' : count}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-background rounded-full border">
            {icon}
          </div>
        </div>
        {count > 0 && !isLoading && (
          <div className="mt-4 text-xs">
            <span className="flex items-center text-amber-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Requires attention
            </span>
          </div>
        )}
        {count === 0 && !isLoading && (
          <div className="mt-4 text-xs">
            <span className="flex items-center text-green-600">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              All caught up
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  MessageSquare,
  Tool,
  User
} from 'lucide-react';

export function AdminSummary() {
  const [pendingTools, setPendingTools] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingClaims, setPendingClaims] = useState(0);
  const [supportMessages, setSupportMessages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);

        // Fetch pending tools count
        const { count: toolsCount, error: toolsError } = await supabase
          .from('ai_tools')
          .select('id', { count: 'exact', head: true })
          .eq('approval_status', 'pending');

        if (toolsError) throw toolsError;
        setPendingTools(toolsCount || 0);

        // Fetch pending tool requests count
        const { count: requestsCount, error: requestsError } = await supabase
          .from('tool_requests')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (requestsError) throw requestsError;
        setPendingRequests(requestsCount || 0);

        // Fetch unread support messages count
        const { count: messagesCount, error: messagesError } = await supabase
          .from('support_messages')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (messagesError) throw messagesError;
        setSupportMessages(messagesCount || 0);

        // Fetch pending ownership claims count
        const { count: claimsCount, error: claimsError } = await supabase
          .from('tool_ownership_claims')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending');

        if (claimsError) throw claimsError;
        setPendingClaims(claimsCount || 0);

      } catch (error) {
        console.error('Error fetching counts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();

    // Set up a refresh interval - every 5 minutes
    const intervalId = setInterval(fetchCounts, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const totalPending = pendingTools + pendingRequests + pendingClaims + supportMessages;

  return (
    <Card className="mb-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-l-4 border-l-primary">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Dashboard Summary</h3>
            {totalPending > 0 ? (
              <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                {totalPending} Pending {totalPending === 1 ? 'Item' : 'Items'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                All Clear
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <Tool className="w-5 h-5 text-primary mr-2" />
                <span className="font-medium">Pending Tools</span>
                {pendingTools > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingTools}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <HelpCircle className="w-5 h-5 text-amber-500 mr-2" />
                <span className="font-medium">Tool Requests</span>
                {pendingRequests > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingRequests}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                <span className="font-medium">Support Messages</span>
                {supportMessages > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {supportMessages}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center">
                <User className="w-5 h-5 text-green-500 mr-2" />
                <span className="font-medium">Ownership Claims</span>
                {pendingClaims > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {pendingClaims}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

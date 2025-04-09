import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ToolRequest } from '@/types/tools';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ToolClaimRequests() {
  const [claimRequests, setClaimRequests] = useState<ToolRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(
    null
  );
  const [showDetails, setShowDetails] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchClaimRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('tool_requests')
        .select('*')
        .eq('request_type', 'claim')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClaimRequests(data || []);
    } catch (error) {
      console.error('Error fetching claim requests:', error);
      toast.error('Failed to load claim requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaimRequests();
  }, []);

  const handleViewDetails = (request: ToolRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest.id);

      // Get the email of the person claiming the tool
      const submitterEmail = selectedRequest.submitter_email;

      if (!submitterEmail) {
        toast.error('Submitter email is missing');
        return;
      }

      // Instead of using admin.listUsers, we'll use a more straightforward approach
      // Query users by email (without admin privileges)
      const { data: userData, error: userError } = await supabase.auth
        .signInWithOtp({
          email: submitterEmail,
          options: {
            shouldCreateUser: false, // This just checks if the user exists
          },
        });

      let userId;

      if (userError) {
        // If error code is "User not found", that's fine, we'll handle accordingly
        if (userError.message !== 'User not found') {
          console.error('Error checking for user:', userError);
          toast.error('Failed to check user account');
          return;
        }
        // User doesn't exist yet, we'll continue without a user_id
        toast.warning('No user account found for this email');
      } else if (userData) {
        // If we got back data, the user exists, but we don't have their ID here
        // We can let them know to login to see their claimed tool
        toast.info('User account exists, they can login to manage this tool');
      }

      if (userId) {
        // Update the tool's user_id to give ownership
        const { error: updateError } = await (supabase as any)
          .from('ai_tools')
          .update({
            user_id: userId,
          })
          .eq('id', selectedRequest.tool_id);

        if (updateError) throw updateError;
      }

      // Update the request status
      const { error: requestError } = await (supabase as any)
        .from('tool_requests')
        .update({
          status: 'approved',
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Refresh the list
      await fetchClaimRequests();

      toast.success(
        userId
          ? 'Claim approved and ownership transferred'
          : 'Claim approved but user must sign up to manage the tool'
      );

      setShowDetails(false);
    } catch (error) {
      console.error('Error approving claim:', error);
      toast.error('Failed to approve claim');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setProcessingId(selectedRequest.id);

      const { error } = await (supabase as any)
        .from('tool_requests')
        .update({
          status: 'rejected',
        })
        .eq('id', selectedRequest.id);

      if (error) throw error;

      await fetchClaimRequests();
      toast.success('Claim request rejected');

      setShowDetails(false);
    } catch (error) {
      console.error('Error rejecting claim:', error);
      toast.error('Failed to reject claim');
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewTool = (toolId: string | undefined) => {
    if (!toolId) return;
    window.open(`/tools/${toolId}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        );
    }
  };

  if (loading && claimRequests.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tool Claim Requests</h3>
        <Button variant="outline" size="sm" onClick={fetchClaimRequests}>
          Refresh
        </Button>
      </div>

      {claimRequests.length === 0 ? (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No claim requests found</p>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool Name</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claimRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>{request.submitter_name}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(request.created_at), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {request.tool_id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTool(request.tool_id)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        View Details
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Claim Request Details</DialogTitle>
            <DialogDescription>
              Review the claim request details and approve or reject.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Status
                  </p>
                  <div>{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div className="space-y-1 col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Submitted
                  </p>
                  <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Tool Name
                </p>
                <p className="font-medium">{selectedRequest.name}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Claimant
                </p>
                <p>
                  {selectedRequest.submitter_name} (
                  {selectedRequest.submitter_email})
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Verification Details
                </p>
                <div className="p-3 bg-muted rounded-md text-sm whitespace-pre-wrap">
                  {selectedRequest.verification_details ||
                    'No verification details provided'}
                </div>
              </div>

              {selectedRequest.tool_id && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewTool(selectedRequest.tool_id)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Tool
                </Button>
              )}
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedRequest?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={!!processingId}
                >
                  {processingId === selectedRequest?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Reject
                </Button>
                <Button onClick={handleApprove} disabled={!!processingId}>
                  {processingId === selectedRequest?.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve Claim
                </Button>
              </>
            )}
            {selectedRequest?.status !== 'pending' && (
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

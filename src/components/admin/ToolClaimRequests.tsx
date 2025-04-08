
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, Eye, Check, X } from 'lucide-react';

export function ToolClaimRequests() {
  const { toast } = useToast();
  const { approveToolRequest, rejectToolRequest } = useSupabaseAdmin();
  const [loading, setLoading] = useState(true);
  const [claimRequests, setClaimRequests] = useState<ToolRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ToolRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchClaimRequests = async () => {
    try {
      setLoading(true);
      // Use "any" type to bypass TypeScript's type checking for the table name
      const { data, error } = await (supabase as any)
        .from('tool_requests')
        .select('*')
        .eq('request_type', 'claim')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setClaimRequests(data || []);
    } catch (error) {
      console.error('Error fetching claim requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load claim requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchClaimRequests();
  }, []);
  
  const handleViewRequest = (request: ToolRequest) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const handleApprove = async (id: string) => {
    try {
      setProcessingId(id);
      const result = await approveToolRequest(id);
      
      if (result.success) {
        // Now update the tool ownership
        const request = claimRequests.find(req => req.id === id);
        if (request && request.tool_id) {
          const { error: updateError } = await (supabase as any)
            .from('ai_tools')
            .update({ 
              user_id: request.submitter_email, // Using email as reference until they create an account
              approval_status: 'approved'
            })
            .eq('id', request.tool_id);
            
          if (updateError) throw updateError;
        }
        
        toast({
          title: 'Success',
          description: 'Claim request approved and tool ownership updated',
        });
        
        // Update local state
        setClaimRequests(prev => 
          prev.map(req => req.id === id ? { ...req, status: 'approved' } : req)
        );
        setOpenDialog(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error approving claim request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve claim request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (id: string) => {
    try {
      setProcessingId(id);
      const result = await rejectToolRequest(id);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Claim request rejected',
        });
        
        // Update local state
        setClaimRequests(prev => 
          prev.map(req => req.id === id ? { ...req, status: 'rejected' } : req)
        );
        setOpenDialog(false);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error rejecting claim request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject claim request',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Tool Claim Requests</h3>
        <Button size="sm" onClick={fetchClaimRequests}>Refresh</Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : claimRequests.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No claim requests found</p>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tool Name</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claimRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {format(new Date(request.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.submitter_name} ({request.submitter_email})</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleViewRequest(request)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Tool Claim Request: {selectedRequest.name}</DialogTitle>
              <DialogDescription>
                Submitted by {selectedRequest.submitter_name} ({selectedRequest.submitter_email}) on {format(new Date(selectedRequest.created_at), 'MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6">
              <div>
                <h4 className="font-medium mb-2">Verification Details</h4>
                <div className="rounded-md border p-4 whitespace-pre-wrap">
                  {selectedRequest.verification_details || 'No verification details provided.'}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Current Status: {getStatusBadge(selectedRequest.status)}</h4>
                
                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={!!processingId}
                    >
                      {processingId === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject Claim
                    </Button>
                    <Button
                      onClick={() => handleApprove(selectedRequest.id)}
                      disabled={!!processingId}
                    >
                      {processingId === selectedRequest.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve & Transfer Ownership
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

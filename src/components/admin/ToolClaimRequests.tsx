import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CheckCircle, XCircle, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface ToolClaimRequest {
  id: string;
  tool_id: string;
  name: string;
  description: string;
  url: string;
  category: string[];
  pricing: string | null;
  status: string;
  submitter_name: string | null;
  submitter_email: string | null;
  created_at: string;
  request_type: 'new' | 'update' | 'claim';
  tool_id_fkey: {
    name: string;
  } | null;
  verification_details?: string;
}

interface PageParams {
  page: number;
  pageSize: number;
}

export function ToolClaimRequests() {
  const [requests, setRequests] = useState<ToolClaimRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [pageParams, setPageParams] = useState<PageParams>({ page: 1, pageSize: 10 });
  const [selectedRequest, setSelectedRequest] = useState<ToolClaimRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const initialParams: PageParams = { page: 1, pageSize: 10 };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError, count } = await supabase
          .from('tool_requests')
          .select('*, tool_id_fkey(name)', { count: 'exact' })
          .eq('request_type', 'claim')
          .range((pageParams.page - 1) * pageParams.pageSize, pageParams.page * pageParams.pageSize - 1)
          .order('created_at', { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        setRequests(data || []);
        setTotalCount(count || 0);
      } catch (e: any) {
        setError(e);
        toast.error('Failed to load tool claim requests');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [pageParams]);

  const handlePageChange = (newPage: number) => {
    setPageParams({ ...pageParams, page: newPage });
  };

  const handleViewDetails = (request: ToolClaimRequest) => {
    setSelectedRequest(request);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsDialog(false);
    setSelectedRequest(null);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Claim Requests</CardTitle>
        <CardDescription>
          Review and manage tool claim requests submitted by users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error: {error.message}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No tool claim requests found
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tool</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.tool_id_fkey?.name || 'Unknown Tool'}
                    </TableCell>
                    <TableCell>{request.submitter_name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalCount > pageParams.pageSize && (
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    href="#"
                    onClick={() => handlePageChange(pageParams.page - 1)}
                    disabled={pageParams.page === 1}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </PaginationPrevious>
                  {Array.from({ length: Math.ceil(totalCount / pageParams.pageSize) }, (_, i) => i + 1)
                    .slice(0, 5)
                    .map((page) => (
                      <PaginationItem key={page} active={page === pageParams.page}>
                        <PaginationLink
                          href="#"
                          onClick={() => handlePageChange(page)}
                          className={cn({
                            "bg-blue-500 text-white": page === pageParams.page,
                          })}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                  <PaginationNext
                    href="#"
                    onClick={() => handlePageChange(pageParams.page + 1)}
                    disabled={pageParams.page === Math.ceil(totalCount / pageParams.pageSize)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </PaginationNext>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Tool Claim Request Details</DialogTitle>
              <DialogDescription>
                View the details of the tool claim request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium">Tool</h4>
                  <p>{selectedRequest.tool_id_fkey?.name || 'Unknown Tool'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Submitter</h4>
                  <p>{selectedRequest.submitter_name || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Email</h4>
                  <p>{selectedRequest.submitter_email || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Verification Details</h4>
                  <p className="whitespace-pre-wrap">{selectedRequest.verification_details || 'N/A'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <p>{getStatusBadge(selectedRequest.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Submitted On</h4>
                  <p>{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDetails}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

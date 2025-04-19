import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check,
  X,
  FileText,
  Search,
  ArrowUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type RequestType = 'new' | 'update' | 'claim';

interface ToolClaimRequest {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string[];
  pricing: string;
  submitter_name: string;
  submitter_email: string;
  created_at: string;
  status: string;
  request_type: RequestType;
  tool_id: string | null;
  migrated: boolean;
}

interface PageParams {
  page: number;
  pageSize: number;
  status: string;
}

export function ToolClaimRequests() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState<ToolClaimRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ToolClaimRequest | null>(
    null
  );
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageParams, setPageParams] = useState<PageParams>({
    page: parseInt(searchParams.get('page') || '1'),
    pageSize: 10,
    status: searchParams.get('status') || 'pending',
  });
  const navigate = useNavigate();
  const totalPages = Math.ceil(totalCount / pageParams.pageSize);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('tool_reports')
        .select('*', { count: 'exact' })
        .eq('request_type', 'claim')
        .eq('status', pageParams.status)
        .order('created_at', { ascending: false })
        .range(
          (pageParams.page - 1) * pageParams.pageSize,
          pageParams.page * pageParams.pageSize - 1
        );

      if (searchTerm) {
        query = query.or(
          `name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,submitter_name.ilike.%${searchTerm}%,submitter_email.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Convert strings to the correct RequestType enum
      const typedData = data.map(item => ({
        ...item,
        request_type: item.request_type as RequestType
      }));

      setRequests(typedData);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching tool requests:', error);
      toast.error('Failed to load tool requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Update search params when page changes
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', pageParams.page.toString());
    newSearchParams.set('status', pageParams.status);
    setSearchParams(newSearchParams);
  }, [pageParams, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPageParams({ ...pageParams, page: newPage });
  };

  const handleStatusChange = (status: string) => {
    setPageParams({ ...pageParams, page: 1, status });
  };

  const handleApprove = (request: ToolClaimRequest) => {
    setSelectedRequest(request);
    setFeedbackDialogOpen(true);
  };

  const handleReject = (request: ToolClaimRequest) => {
    setSelectedRequest(request);
    setFeedbackDialogOpen(true);
    setIsRejecting(true);
  };

  const confirmAction = async () => {
    if (!selectedRequest) return;

    try {
      if (isRejecting) {
        // Reject the request
        const { error } = await supabase
          .from('tool_reports')
          .update({
            status: 'rejected',
            admin_feedback: feedback,
          })
          .eq('id', selectedRequest.id);

        if (error) throw error;
        toast.success('Request rejected successfully');
      } else {
        setIsApproving(true);
        // Approve the request - first create the tool
        const { error: approvalError } = await supabase
          .from('tool_reports')
          .update({
            status: 'approved',
            admin_feedback: feedback,
          })
          .eq('id', selectedRequest.id);

        if (approvalError) throw approvalError;

        // Migrate the data if this is referring to an existing tool
        if (selectedRequest.tool_id) {
          const { error: updateError } = await supabase
            .from('tool_reports')
            .update({
              migrated: true,
            })
            .eq('id', selectedRequest.id);

          if (updateError) throw updateError;
        }

        toast.success('Request approved successfully');
      }

      // Refresh the data
      fetchRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast.error(
        `Failed to ${isRejecting ? 'reject' : 'approve'} the request`
      );
    } finally {
      setFeedbackDialogOpen(false);
      setSelectedRequest(null);
      setFeedback('');
      setIsApproving(false);
      setIsRejecting(false);
    }
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageParams.page - 1)}
            disabled={pageParams.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <Button
                key={i}
                variant={pageParams.page === i + 1 ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pageParams.page + 1)}
            disabled={pageParams.page === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          Page {pageParams.page} of {totalPages || 1}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Claim Requests</CardTitle>
        <CardDescription>
          Manage requests to claim ownership of AI tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={pageParams.status === 'pending' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('pending')}
            >
              Pending
            </Button>
            <Button
              variant={pageParams.status === 'approved' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('approved')}
            >
              Approved
            </Button>
            <Button
              variant={pageParams.status === 'rejected' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('rejected')}
            >
              Rejected
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-lg font-semibold">No requests found</h3>
            <p className="text-sm text-muted-foreground">
              {pageParams.status === 'pending'
                ? 'There are currently no pending tool claim requests.'
                : pageParams.status === 'approved'
                ? 'No approved tool claim requests yet.'
                : 'No rejected tool claim requests yet.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 bg-background hover:bg-secondary/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-base">{request.name}</h3>
                        <Badge variant="outline">{request.request_type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {request.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {request.category.map((cat) => (
                          <Badge key={cat} variant="secondary" className="text-xs">
                            {cat}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        <span>
                          Submitted by {request.submitter_name} (
                          {request.submitter_email})
                        </span>
                        <span className="ml-2">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleApprove(request)}
                          disabled={pageParams.status !== 'pending'}
                          className="text-green-600"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleReject(request)}
                          disabled={pageParams.status !== 'pending'}
                          className="text-red-600"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(request.url, '_blank')}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Website
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {renderPagination()}

            <AlertDialog
              open={feedbackDialogOpen}
              onOpenChange={setFeedbackDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isRejecting ? 'Reject Request' : 'Approve Request'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRejecting
                      ? 'The user will be notified that their request was rejected.'
                      : 'The user will be notified that their request was approved.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Label htmlFor="admin-feedback">Feedback (Optional)</Label>
                  <Textarea
                    id="admin-feedback"
                    placeholder="Provide feedback to the submitter..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmAction}
                    className={
                      isRejecting
                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                        : ''
                    }
                    disabled={isApproving}
                  >
                    {isApproving
                      ? 'Processing...'
                      : isRejecting
                      ? 'Reject'
                      : 'Approve'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardContent>
    </Card>
  );
}

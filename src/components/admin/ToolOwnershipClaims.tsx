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

interface ToolOwnershipClaim {
  id: string;
  tool_id: string;
  user_id: string;
  submitter_name: string;
  submitter_email: string;
  verification_details: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  admin_feedback?: string | null;
  ai_tools?: {
    name: string;
  };
}

export function ToolOwnershipClaims() {
  const [claims, setClaims] = useState<ToolOwnershipClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<ToolOwnershipClaim | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.rpc('get_tool_ownership_claims_with_tools');

      if (error) throw error;
      setClaims(data as ToolOwnershipClaim[]);
    } catch (error) {
      console.error('Error fetching ownership claims:', error);
      toast.error('Failed to load ownership claims');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleViewDetails = (claim: ToolOwnershipClaim) => {
    setSelectedClaim(claim);
    setShowDetailsDialog(true);
  };

  const handleUpdateStatus = async (
    claimId: string,
    status: 'approved' | 'rejected',
    feedback?: string
  ) => {
    try {
      setProcessingId(claimId);

      const { error } = await supabase.rpc('update_tool_ownership_claim_status', {
        p_claim_id: claimId,
        p_status: status,
        p_admin_feedback: feedback || null
      });

      if (error) throw error;

      if (status === 'approved') {
        const claim = claims.find((c) => c.id === claimId);
        if (claim) {
          const { error: toolUpdateError } = await supabase.rpc('approve_tool_ownership_claim', {
            p_claim_id: claimId
          });

          if (toolUpdateError) throw toolUpdateError;
        }
      }

      toast.success(
        `Claim ${
          status === 'approved'
            ? 'approved and ownership transferred'
            : 'rejected'
        } successfully`
      );
      fetchClaims();
      if (showDetailsDialog) setShowDetailsDialog(false);
    } catch (error) {
      console.error(
        `Error ${status === 'approved' ? 'approving' : 'rejecting'} claim:`,
        error
      );
      toast.error(
        `Failed to ${status === 'approved' ? 'approve' : 'reject'} claim`
      );
    } finally {
      setProcessingId(null);
    }
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
        <CardTitle>Tool Ownership Claims</CardTitle>
        <CardDescription>
          Review and manage ownership claims for AI tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No ownership claims found
          </div>
        ) : (
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
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell className="font-medium">
                    {claim.ai_tools?.name || 'Unknown Tool'}
                  </TableCell>
                  <TableCell>{claim.submitter_name}</TableCell>
                  <TableCell>
                    {new Date(claim.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(claim.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(claim)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {claim.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() =>
                              handleUpdateStatus(claim.id, 'approved')
                            }
                            disabled={processingId === claim.id}
                          >
                            {processingId === claim.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={processingId === claim.id}
                              >
                                {processingId === claim.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <XCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle>Reject Claim</DialogTitle>
                                <DialogDescription>
                                  Provide feedback to the user about why their
                                  claim was rejected (optional)
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Textarea
                                  id={`feedback-${claim.id}`}
                                  placeholder="Explain why this claim is being rejected..."
                                  className="min-h-[100px]"
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={(e) => {
                                    const dialogContainer = (
                                      e.target as HTMLElement
                                    ).closest('[role="dialog"]');
                                    if (dialogContainer) {
                                      const closeButton =
                                        dialogContainer.querySelector(
                                          'button[data-state="closed"]'
                                        );
                                      if (closeButton) {
                                        (
                                          closeButton as HTMLButtonElement
                                        ).click();
                                      }
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    const feedback = (
                                      document.getElementById(
                                        `feedback-${claim.id}`
                                      ) as HTMLTextAreaElement
                                    )?.value;
                                    handleUpdateStatus(
                                      claim.id,
                                      'rejected',
                                      feedback
                                    );
                                  }}
                                >
                                  Reject Claim
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {selectedClaim && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Ownership Claim Details</DialogTitle>
                <DialogDescription>
                  Review the details of this ownership claim
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h4 className="text-sm font-medium">Tool</h4>
                  <p>{selectedClaim.ai_tools?.name || 'Unknown Tool'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Submitter</h4>
                  <p>{selectedClaim.submitter_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Email</h4>
                  <p>{selectedClaim.submitter_email}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Verification Details</h4>
                  <p className="whitespace-pre-wrap">
                    {selectedClaim.verification_details}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <p>{getStatusBadge(selectedClaim.status)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Submitted On</h4>
                  <p>{new Date(selectedClaim.created_at).toLocaleString()}</p>
                </div>
                {selectedClaim.status === 'rejected' &&
                  selectedClaim.admin_feedback && (
                    <div>
                      <h4 className="text-sm font-medium">Admin Feedback</h4>
                      <p className="whitespace-pre-wrap text-red-600">
                        {selectedClaim.admin_feedback}
                      </p>
                    </div>
                  )}
              </div>

              {selectedClaim.status === 'pending' && (
                <>
                  <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-700">
                    <p className="font-medium">Important:</p>
                    <p>
                      Approving this claim will transfer ownership of the tool
                      to the requesting user account.
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50"
                      onClick={() =>
                        handleUpdateStatus(selectedClaim.id, 'approved')
                      }
                      disabled={processingId === selectedClaim.id}
                    >
                      {processingId === selectedClaim.id ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve & Transfer Ownership
                        </>
                      )}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-red-500 text-red-600 hover:bg-red-50"
                          disabled={processingId === selectedClaim.id}
                        >
                          {processingId === selectedClaim.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Claim
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Reject Claim</DialogTitle>
                          <DialogDescription>
                            Provide feedback to the user about why their claim
                            was rejected (optional)
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <Textarea
                            id="feedback"
                            placeholder="Explain why this claim is being rejected..."
                            className="min-h-[100px]"
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={(e) => {
                              setShowDetailsDialog(false);
                              const dialogContainer = (
                                e.target as HTMLElement
                              ).closest('[role="dialog"]');
                              if (dialogContainer) {
                                const closeButton =
                                  dialogContainer.querySelector(
                                    'button[data-state="closed"]'
                                  );
                                if (closeButton) {
                                  (closeButton as HTMLButtonElement).click();
                                }
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const feedback = (
                                document.getElementById(
                                  'feedback'
                                ) as HTMLTextAreaElement
                              )?.value;
                              handleUpdateStatus(
                                selectedClaim.id,
                                'rejected',
                                feedback
                              );
                            }}
                          >
                            Reject Claim
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}

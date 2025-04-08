
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ClaimToolForm } from './ClaimToolForm';
import { Flag, CheckCircle } from 'lucide-react';

interface ClaimToolButtonProps {
  toolId: string;
  toolName: string;
}

export function ClaimToolButton({ toolId, toolName }: ClaimToolButtonProps) {
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  const handleSuccess = () => {
    setClaimSubmitted(true);
  };

  const handleClose = () => {
    setShowClaimDialog(false);
    // Reset the form state after dialog is closed
    setTimeout(() => {
      setClaimSubmitted(false);
    }, 300);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex gap-1 items-center"
        onClick={() => setShowClaimDialog(true)}
      >
        <Flag className="h-4 w-4" />
        <span>Claim this tool</span>
      </Button>

      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-lg">
          {claimSubmitted ? (
            <div className="py-6 text-center space-y-4">
              <div className="mx-auto bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium">Claim Request Submitted</h3>
              <p className="text-muted-foreground">
                Thank you for your request. Our team will review your claim and get back to you via the provided email.
              </p>
              <Button onClick={handleClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Claim Tool Ownership</DialogTitle>
                <DialogDescription>
                  Request ownership of this tool listing to manage its information and updates.
                </DialogDescription>
              </DialogHeader>
              <ClaimToolForm
                toolId={toolId}
                toolName={toolName}
                onSuccess={handleSuccess}
                onCancel={handleClose}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

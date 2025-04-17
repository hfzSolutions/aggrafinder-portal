
import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportToolDialog } from './ReportToolDialog';

interface ReportToolButtonProps {
  toolId: string;
  toolName: string;
  className?: string;
  showText?: boolean;
}

export function ReportToolButton({
  toolId,
  toolName,
  className = '',
  showText = false,
}: ReportToolButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className={`flex items-center gap-2 ${className}`}
        onClick={() => setIsDialogOpen(true)}
      >
        <Flag className="h-4 w-4 text-destructive" />
        {showText && <span>Report Tool</span>}
      </Button>

      <ReportToolDialog 
        toolId={toolId}
        toolName={toolName}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}

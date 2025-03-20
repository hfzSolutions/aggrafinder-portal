import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ReviewActionsProps {
  userId: string;
  reviewUserId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ReviewActions({
  userId,
  reviewUserId,
  onEdit,
  onDelete,
}: ReviewActionsProps) {
  // Only show actions if the review belongs to the current user
  if (userId !== reviewUserId) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0"
        title="Edit review"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        title="Delete review"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

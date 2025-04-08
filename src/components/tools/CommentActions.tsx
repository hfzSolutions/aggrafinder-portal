import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface CommentActionsProps {
  userId: string;
  commentUserId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function CommentActions({
  userId,
  commentUserId,
  onEdit,
  onDelete,
}: CommentActionsProps) {
  // Only show actions if the comment belongs to the current user
  if (userId !== commentUserId) return null;

  return (
    <div className="flex gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="h-8 w-8 p-0"
        title="Edit comment"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        title="Delete comment"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

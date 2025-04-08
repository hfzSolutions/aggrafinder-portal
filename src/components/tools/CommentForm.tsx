import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface CommentFormProps {
  toolId: string;
  onCommentSubmitted?: () => void;
  initialComment?: {
    id: string;
    comment: string;
  };
  onCancelEdit?: () => void;
}

export function CommentForm({
  toolId,
  onCommentSubmitted,
  initialComment,
  onCancelEdit,
}: CommentFormProps) {
  const [comment, setComment] = useState(initialComment?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    try {
      if (!user) {
        toast.error('Please sign in to add a comment');
        navigate('/auth');
        return;
      }

      setIsSubmitting(true);
      const userId = user.id;
      const { error } = initialComment
        ? await supabase
            .from('tool_reviews')
            .update({ comment, updated_at: new Date().toISOString() })
            .eq('id', initialComment.id)
        : await supabase.from('tool_reviews').insert([
            {
              tool_id: toolId,
              user_id: userId,
              comment,
              created_at: new Date().toISOString(),
            },
          ]);

      if (error) throw error;

      toast.success(
        `Comment ${initialComment ? 'updated' : 'added'} successfully`
      );
      setComment('');

      // Track this engagement for analytics
      await supabase.from('tool_analytics').insert([
        {
          tool_id: toolId,
          user_id: userId,
          action: 'comment_submitted',
          created_at: new Date().toISOString(),
        },
      ]);

      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Your Comment
        </label>
        <Textarea
          id="comment"
          placeholder="Share your thoughts about this tool..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex gap-2">
        {initialComment && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !comment.trim()}
          className="flex-1"
        >
          {isSubmitting
            ? 'Submitting...'
            : initialComment
            ? 'Update Comment'
            : 'Add Comment'}
        </Button>
      </div>
    </form>
  );
}

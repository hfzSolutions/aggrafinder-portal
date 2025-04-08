import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { CommentActions } from './CommentActions';
import { CommentForm } from './CommentForm';

interface Comment {
  id: string;
  tool_id: string;
  user_id: string;
  comment: string;
  created_at: string;
}

interface CommentsListProps {
  toolId: string;
  limit?: number;
  onCommentSubmitted?: () => void;
}

export function CommentsList({
  toolId,
  limit = 5,
  onCommentSubmitted,
}: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalComments, setTotalComments] = useState(0);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);

      // Fetch comments for this tool
      const { data, error } = await supabase
        .from('tool_reviews')
        .select('*')
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setComments(data || []);

      // Set total comments count
      if (data) {
        setTotalComments(data.length);
      } else {
        setTotalComments(0);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [toolId, limit, refreshKey]);

  const handleCommentSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
    if (onCommentSubmitted) {
      onCommentSubmitted();
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 space-y-2 bg-background/50 rounded-lg">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div>
        <CommentForm
          toolId={toolId}
          onCommentSubmitted={() => {
            handleCommentSubmitted();
            if (onCommentSubmitted) onCommentSubmitted();
          }}
        />
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            No comments yet. Be the first to share your thoughts on this tool!
          </p>
        </div>
      </div>
    );
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('tool_reviews')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      await fetchComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="space-y-4">
      {/* Community Discussion Header */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Community Discussion
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>

      {/* Comment Form and List */}
      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
          {!editingComment && (
            <CommentForm
              toolId={toolId}
              onCommentSubmitted={handleCommentSubmitted}
            />
          )}
        </div>

        {editingComment ? (
          <CommentForm
            toolId={toolId}
            initialComment={editingComment}
            onCommentSubmitted={() => {
              setEditingComment(null);
              handleCommentSubmitted();
            }}
            onCancelEdit={() => setEditingComment(null)}
          />
        ) : null}

        {comments.map((comment) => (
          <div
            key={comment.id}
            className="p-4 bg-background/50 rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {user && (
                <CommentActions
                  userId={user.id}
                  commentUserId={comment.user_id}
                  onEdit={() => setEditingComment(comment)}
                  onDelete={() => handleDeleteComment(comment.id)}
                />
              )}
            </div>
            {comment.comment && <p className="text-sm">{comment.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

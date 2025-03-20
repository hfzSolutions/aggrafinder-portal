import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Rating } from '@/components/ui/rating';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface ReviewFormProps {
  toolId: string;
  onReviewSubmitted?: () => void;
  initialReview?: {
    id: string;
    rating: number;
    comment: string;
  };
  onCancelEdit?: () => void;
}

export function ReviewForm({
  toolId,
  onReviewSubmitted,
  initialReview,
  onCancelEdit,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || '');
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

    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      if (!user) {
        toast.error('Please sign in to submit a review');
        navigate('/auth');
        return;
      }

      setIsSubmitting(true);
      const userId = user.id;
      const { error } = initialReview
        ? await supabase
            .from('tool_reviews')
            .update({ rating, comment, updated_at: new Date().toISOString() })
            .eq('id', initialReview.id)
        : await supabase.from('tool_reviews').insert([
            {
              tool_id: toolId,
              user_id: userId,
              rating,
              comment,
              created_at: new Date().toISOString(),
            },
          ]);

      if (error) throw error;

      toast.success(
        `Review ${initialReview ? 'updated' : 'submitted'} successfully`
      );
      setRating(0);
      setComment('');

      // Track this engagement for analytics
      await supabase.from('tool_analytics').insert([
        {
          tool_id: toolId,
          user_id: userId,
          action: 'review_submitted',
          created_at: new Date().toISOString(),
        },
      ]);

      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm font-medium">Your Rating</label>
      <div className="flex items-center gap-2">
        <Rating value={rating} onChange={setRating} size="lg" />
        <span className="text-sm text-muted-foreground">
          {rating > 0 ? `${rating} stars` : 'Click to rate'}
        </span>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium mb-1">
          Your Review (Optional)
        </label>
        <Textarea
          id="comment"
          placeholder="Share your experience with this tool..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>

      <div className="flex gap-2">
        {initialReview && (
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
          disabled={isSubmitting || rating === 0}
          className="flex-1"
        >
          {isSubmitting
            ? 'Submitting...'
            : initialReview
            ? 'Update Review'
            : 'Submit Review'}
        </Button>
      </div>
    </form>
  );
}

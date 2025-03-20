import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Rating } from '@/components/ui/rating';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { ReviewActions } from './ReviewActions';
import { ReviewForm } from './ReviewForm';

interface Review {
  id: string;
  tool_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsListProps {
  toolId: string;
  limit?: number;
  onReviewSubmitted?: () => void;
}

export function ReviewsList({
  toolId,
  limit = 5,
  onReviewSubmitted,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
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

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // Fetch reviews for this tool
      const { data, error } = await supabase
        .from('tool_reviews')
        .select('*')
        .eq('tool_id', toolId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setReviews(data || []);

      // Calculate average rating
      if (data && data.length > 0) {
        const total = data.reduce((sum, review) => sum + review.rating, 0);
        setAverageRating(total / data.length);
        setTotalReviews(data.length);
      } else {
        setAverageRating(0);
        setTotalReviews(0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [toolId, limit, refreshKey]);

  const handleReviewSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
    if (onReviewSubmitted) {
      onReviewSubmitted();
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

  if (reviews.length === 0) {
    return (
      <div>
        <ReviewForm
          toolId={toolId}
          onReviewSubmitted={() => {
            handleReviewSubmitted();
            if (onReviewSubmitted) onReviewSubmitted();
          }}
        />
        <div className="text-center py-6">
          <p className="text-muted-foreground">
            No reviews yet. Be the first to review this tool!
          </p>
        </div>
      </div>
    );
  }

  const handleDeleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('tool_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      await fetchReviews();
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="space-y-4">
      {/* Community Rating Card */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Community Rating
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Rating value={averageRating} readOnly size="lg" />
              <span className="text-lg font-semibold">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        </div>
      </div>

      {/* Review Form and List */}
      <div className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
          {!editingReview && (
            <ReviewForm
              toolId={toolId}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}
        </div>

        {editingReview ? (
          <ReviewForm
            toolId={toolId}
            initialReview={editingReview}
            onReviewSubmitted={() => {
              setEditingReview(null);
              handleReviewSubmitted();
            }}
            onCancelEdit={() => setEditingReview(null)}
          />
        ) : null}

        {reviews.map((review) => (
          <div
            key={review.id}
            className="p-4 bg-background/50 rounded-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Rating value={review.rating} readOnly size="sm" />
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              {user && (
                <ReviewActions
                  userId={user.id}
                  reviewUserId={review.user_id}
                  onEdit={() => setEditingReview(review)}
                  onDelete={() => handleDeleteReview(review.id)}
                />
              )}
            </div>
            {review.comment && <p className="text-sm">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

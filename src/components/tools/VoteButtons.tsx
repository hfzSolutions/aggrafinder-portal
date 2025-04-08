import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolVotes } from '@/hooks/useToolVotes';
import { useToolComments } from '@/hooks/useToolComments';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface VoteButtonsProps {
  toolId: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export const VoteButtons = ({
  toolId,
  variant = 'default',
  className,
}: VoteButtonsProps) => {
  const { voteCount, userVote, loading, vote } = useToolVotes(toolId);
  const { commentCount, loading: commentsLoading } = useToolComments(toolId);
  const [processingVote, setProcessingVote] = useState<string | null>(null);

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (processingVote !== null) return;

    try {
      setProcessingVote(voteType);
      await vote(voteType);
    } finally {
      setProcessingVote(null);
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isCompact ? 'text-xs' : 'text-sm',
        className
      )}
    >
      <Button
        variant="ghost"
        size={isCompact ? 'sm' : 'default'}
        className={cn(
          'flex items-center gap-1 px-2 relative',
          userVote === 'upvote'
            ? 'text-green-600 hover:text-green-700'
            : 'text-muted-foreground hover:text-foreground',
          (loading || processingVote === 'upvote') &&
            'opacity-70 pointer-events-none'
        )}
        onClick={() => handleVote('upvote')}
        disabled={loading || processingVote !== null}
      >
        <ThumbsUp className={cn('h-4 w-4', isCompact && 'h-3.5 w-3.5')} />
        <span>{voteCount.upvotes}</span>
        {processingVote === 'upvote' && (
          <span className="absolute inset-0 flex items-center justify-center bg-background/50">
            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        size={isCompact ? 'sm' : 'default'}
        className={cn(
          'flex items-center gap-1 px-2 relative',
          'text-muted-foreground hover:text-foreground'
        )}
        onClick={() => {
          const commentsSection = document.querySelector('.comments-section');
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      >
        <MessageSquare className={cn('h-4 w-4', isCompact && 'h-3.5 w-3.5')} />
        <span>{commentsLoading ? '...' : commentCount}</span>
      </Button>

      {/* {!isCompact && (
        <div className="text-muted-foreground text-xs">
          Score: {voteCount.score}
        </div>
      )} */}
    </div>
  );
};

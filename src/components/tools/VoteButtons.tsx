
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToolVotes } from "@/hooks/useToolVotes";
import { cn } from "@/lib/utils";

interface VoteButtonsProps {
  toolId: string;
  variant?: "default" | "compact";
  className?: string;
}

export const VoteButtons = ({ toolId, variant = "default", className }: VoteButtonsProps) => {
  const { voteCount, userVote, loading, vote } = useToolVotes(toolId);
  
  const handleVote = (voteType: 'upvote' | 'downvote') => {
    if (!loading) {
      vote(voteType);
    }
  };
  
  const isCompact = variant === "compact";
  
  return (
    <div className={cn(
      "flex items-center gap-2",
      isCompact ? "text-xs" : "text-sm",
      className
    )}>
      <Button
        variant="ghost"
        size={isCompact ? "sm" : "default"}
        className={cn(
          "flex items-center gap-1 px-2",
          userVote === 'upvote' ? "text-green-600 hover:text-green-700" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleVote('upvote')}
        disabled={loading}
      >
        <ThumbsUp className={cn(
          "h-4 w-4",
          isCompact && "h-3.5 w-3.5"
        )} />
        <span>{voteCount.upvotes}</span>
      </Button>
      
      <Button
        variant="ghost"
        size={isCompact ? "sm" : "default"}
        className={cn(
          "flex items-center gap-1 px-2",
          userVote === 'downvote' ? "text-red-600 hover:text-red-700" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={() => handleVote('downvote')}
        disabled={loading}
      >
        <ThumbsDown className={cn(
          "h-4 w-4",
          isCompact && "h-3.5 w-3.5"
        )} />
        <span>{voteCount.downvotes}</span>
      </Button>
      
      {!isCompact && (
        <div className="text-muted-foreground text-xs">
          Score: {voteCount.score}
        </div>
      )}
    </div>
  );
};


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface VoteCount {
  upvotes: number;
  downvotes: number;
  score: number;
}

export const useToolVotes = (toolId: string) => {
  const [voteCount, setVoteCount] = useState<VoteCount>({
    upvotes: 0,
    downvotes: 0,
    score: 0
  });
  const [userVote, setUserVote] = useState<'upvote' | 'downvote' | null>(null);
  const [loading, setLoading] = useState(false);

  // Get or create a unique identifier for this user/browser
  const getUserId = () => {
    let userId = localStorage.getItem('user_vote_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('user_vote_id', userId);
    }
    return userId;
  };

  // Fetch vote counts and user's vote
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        setLoading(true);
        
        // Get vote counts for this tool
        const { data: voteCounts, error: countError } = await supabase
          .from('tool_vote_counts')
          .select('upvotes, downvotes, vote_score')
          .eq('tool_id', toolId)
          .single();
        
        if (countError && countError.code !== 'PGRST116') { // Not found error is expected if no votes yet
          console.error("Error fetching vote counts:", countError);
        }
        
        // Get user's vote using the browser's unique ID
        const userId = getUserId();
        const { data: userVoteData, error: voteError } = await supabase
          .from('tool_votes')
          .select('vote_type')
          .eq('tool_id', toolId)
          .eq('ip_address', userId)
          .maybeSingle();
        
        if (voteError) {
          console.error("Error fetching user vote:", voteError);
        }
        
        // Update state
        setVoteCount({
          upvotes: voteCounts?.upvotes || 0,
          downvotes: voteCounts?.downvotes || 0,
          score: voteCounts?.vote_score || 0
        });
        
        setUserVote(userVoteData?.vote_type as 'upvote' | 'downvote' | null || null);
      } catch (err) {
        console.error("Error in useToolVotes hook:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVotes();
  }, [toolId]);
  
  // Vote function
  const vote = async (voteType: 'upvote' | 'downvote') => {
    try {
      setLoading(true);
      
      // Get unique ID for this user/browser
      const userId = getUserId();
      
      // Optimistic UI update - Record original vote state in case of error
      const originalVote = userVote;
      const originalCounts = { ...voteCount };
      
      // Check if user is removing a previous vote of the same type
      if (userVote === voteType) {
        // Optimistically update UI
        setUserVote(null);
        setVoteCount(prev => ({
          upvotes: voteType === 'upvote' ? Math.max(0, prev.upvotes - 1) : prev.upvotes,
          downvotes: voteType === 'downvote' ? Math.max(0, prev.downvotes - 1) : prev.downvotes,
          score: voteType === 'upvote' ? prev.score - 1 : prev.score + 1
        }));
        
        // Delete the vote from database
        const { error } = await supabase
          .from('tool_votes')
          .delete()
          .eq('tool_id', toolId)
          .eq('ip_address', userId);
        
        if (error) {
          console.error("Error removing vote:", error);
          // Revert UI on error
          setUserVote(originalVote);
          setVoteCount(originalCounts);
          toast.error("Failed to remove vote. Please try again.");
          return;
        }
        
        toast.success("Vote removed");
      } 
      // User is adding a new vote or changing vote type
      else {
        // First, ensure any existing vote is removed to avoid constraint errors
        if (userVote !== null) {
          // Delete existing vote first
          const { error: deleteError } = await supabase
            .from('tool_votes')
            .delete()
            .eq('tool_id', toolId)
            .eq('ip_address', userId);
            
          if (deleteError) {
            console.error("Error removing previous vote:", deleteError);
            toast.error("Failed to update your vote. Please try again.");
            return;
          }
        }
        
        // Calculate the new vote state for optimistic update
        let newVoteCount;
        if (userVote === null) {
          // Adding new vote
          newVoteCount = {
            upvotes: voteType === 'upvote' ? voteCount.upvotes + 1 : voteCount.upvotes,
            downvotes: voteType === 'downvote' ? voteCount.downvotes + 1 : voteCount.downvotes,
            score: voteType === 'upvote' ? voteCount.score + 1 : voteCount.score - 1
          };
        } else {
          // Changing vote type (e.g., from upvote to downvote)
          newVoteCount = {
            upvotes: voteType === 'upvote' ? voteCount.upvotes + 1 : voteCount.upvotes - 1,
            downvotes: voteType === 'downvote' ? voteCount.downvotes + 1 : voteCount.downvotes - 1,
            score: voteType === 'upvote' ? voteCount.score + 2 : voteCount.score - 2
          };
        }
        
        // Optimistically update UI
        setUserVote(voteType);
        setVoteCount(newVoteCount);
        
        // Short delay to ensure previous delete operation completes
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Now insert the new vote
        const { error: insertError } = await supabase
          .from('tool_votes')
          .insert({
            tool_id: toolId,
            ip_address: userId,
            vote_type: voteType
          });
        
        if (insertError) {
          console.error("Error recording vote:", insertError);
          // Revert UI on error
          setUserVote(originalVote);
          setVoteCount(originalCounts);
          toast.error("Failed to record vote. Please try again.");
          return;
        }
        
        toast.success(`Vote ${userVote ? 'changed' : 'recorded'}`);
      }
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Failed to process your vote. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return {
    voteCount,
    userVote,
    loading,
    vote
  };
};

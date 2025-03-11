
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
      
      // Check if user is changing their vote
      let method = 'insert';
      if (userVote) {
        if (userVote === voteType) {
          // User is trying to vote the same way again - treat as removing vote
          const { error } = await supabase
            .from('tool_votes')
            .delete()
            .eq('tool_id', toolId)
            .eq('ip_address', userId);
          
          if (error) throw error;
          
          // Update local state
          setUserVote(null);
          setVoteCount(prev => ({
            upvotes: voteType === 'upvote' ? prev.upvotes - 1 : prev.upvotes,
            downvotes: voteType === 'downvote' ? prev.downvotes - 1 : prev.downvotes,
            score: voteType === 'upvote' ? prev.score - 1 : prev.score + 1
          }));
          
          toast.success("Vote removed");
          return;
        } else {
          // User is changing vote from up to down or vice versa
          method = 'upsert';
        }
      }
      
      // Insert or update vote
      const { error } = await supabase
        .from('tool_votes')
        .upsert({
          tool_id: toolId,
          ip_address: userId,
          vote_type: voteType
        });
      
      if (error) throw error;
      
      // Update local state
      const oldVote = userVote;
      setUserVote(voteType);
      
      if (oldVote) {
        // Switching vote type
        setVoteCount(prev => ({
          upvotes: voteType === 'upvote' ? prev.upvotes + 1 : prev.upvotes - 1,
          downvotes: voteType === 'upvote' ? prev.downvotes - 1 : prev.downvotes + 1,
          score: voteType === 'upvote' ? prev.score + 2 : prev.score - 2
        }));
      } else {
        // New vote
        setVoteCount(prev => ({
          upvotes: voteType === 'upvote' ? prev.upvotes + 1 : prev.upvotes,
          downvotes: voteType === 'downvote' ? prev.downvotes + 1 : prev.downvotes,
          score: voteType === 'upvote' ? prev.score + 1 : prev.score - 1
        }));
      }
      
      toast.success(`Vote ${method === 'insert' ? 'recorded' : 'updated'}`);
    } catch (err) {
      console.error("Error voting:", err);
      toast.error("Failed to record vote. Please try again.");
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


import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
          return;
        }
        
        // Get user's IP address to check their vote
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const { ip } = await ipResponse.json();
          
          // Check if user has already voted
          const { data: userVoteData, error: voteError } = await supabase
            .from('tool_votes')
            .select('vote_type')
            .eq('tool_id', toolId)
            .eq('ip_address', ip)
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
        } catch (ipErr) {
          console.error("Error getting IP address:", ipErr);
          // Still update vote counts even if we can't get the IP
          setVoteCount({
            upvotes: voteCounts?.upvotes || 0,
            downvotes: voteCounts?.downvotes || 0,
            score: voteCounts?.vote_score || 0
          });
        }
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
      
      // Get user's IP address
      let ip;
      try {
        const ipResponse = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipResponse.json();
        ip = ipData.ip;
      } catch (ipErr) {
        console.error("Error getting IP address:", ipErr);
        toast.error("Unable to get your IP address to record vote");
        return;
      }
      
      // Check if user is changing their vote
      let method = 'insert';
      if (userVote) {
        if (userVote === voteType) {
          // User is trying to vote the same way again - treat as removing vote
          const { error } = await supabase
            .from('tool_votes')
            .delete()
            .eq('tool_id', toolId)
            .eq('ip_address', ip);
          
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
          ip_address: ip,
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

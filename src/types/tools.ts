
export interface AITool {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string[];
  url: string;
  featured: boolean;
  pricing: "Free" | "Freemium" | "Paid" | "Free Trial";
  tags: string[];
  userId?: string;
  approvalStatus?: "pending" | "approved" | "rejected";
}

// Add specific analytics actions enum
export type AnalyticsAction = 
  | "view" 
  | "click" 
  | "search" 
  | "filter" 
  | "upvote" 
  | "downvote" 
  | "compare_add" 
  | "compare_remove" 
  | "share_copy_link" 
  | "share_native" 
  | "share_twitter" 
  | "share_facebook" 
  | "share_linkedin" 
  | "share_email";

export interface ToolRequest {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string[];
  pricing?: string;
  submitter_email?: string;
  submitter_name?: string;
  status: string;
  created_at: string;
  request_type: 'new' | 'update'; 
  tool_id?: string;
}

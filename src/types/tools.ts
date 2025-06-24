export interface AITool {
  id: string;
  name: string;
  description: string;
  tagline: string;
  imageUrl: string;
  category: string[];
  url: string;
  youtubeUrl?: string; // YouTube URL field
  featured: boolean;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Free Trial';
  tags: string[];
  country?: string; // Country where the tool originates/is based
  userId?: string;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  popularity?: number;
  upvotes?: number; // Add upvotes property for sorting
  isAdminAdded?: boolean; // Flag to indicate if the tool was added by an admin
  aiChatEnabled?: boolean; // Flag to enable AI chat for this tool
  // New properties for quick tools
  tool_type?: 'external' | 'quick'; // Type of tool (external link or quick AI tool)
  is_public?: boolean; // Whether the tool is publicly visible
  usage_count?: number; // Number of times the tool has been used
  prompt?: string; // AI prompt for quick tools
}

export type AnalyticsAction =
  | 'view'
  | 'click_url'
  | 'share_copy_link'
  | 'share_native'
  | 'share_twitter'
  | 'share_facebook'
  | 'share_linkedin'
  | 'share_email'
  | 'upvote'
  | 'downvote'
  | 'submit_review'
  | 'submit_outcome'
  | 'favorite_toggle';

export interface ToolRequest {
  id: string;
  name: string;
  description: string;
  tagline: string;
  url: string;
  youtubeUrl?: string; // Add YouTube URL field
  category: string[];
  pricing?: string;
  submitter_email?: string;
  submitter_name?: string;
  status: string;
  created_at: string;
  request_type: 'new' | 'update' | 'claim';
  tool_id?: string;
  verification_details?: string;
}

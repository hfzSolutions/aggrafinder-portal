export type AITool = {
  id: string;
  name: string;
  tagline: string | null;
  description: string;
  imageUrl: string;
  category: string[];
  url: string;
  youtubeUrl: string;
  featured: boolean;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Free Trial';
  tags: string[];
  userId: string | null;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  upvotes: number;
  isAdminAdded: boolean;
};

export type AIOucome = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  toolId: string;
  toolName: string;
  createdAt: string;
  submitterName: string;
  submitterEmail: string | null;
  userId: string | null;
};

export type AnalyticsAction = 
  | 'view'
  | 'click'
  | 'search'
  | 'filter'
  | 'save'
  | 'share'
  | 'vote_up'
  | 'vote_down' 
  | 'watch_demo'
  | 'affiliate_click';

export type ToolRequest = {
  id: string;
  name: string;
  description: string;
  url: string;
  youtube_url: string | null;
  category: string[];
  pricing: string | null;
  submitter_name: string | null;
  submitter_email: string | null;
  created_at: string;
  status: string;
  tool_id: string | null;
  request_type: string;
  migrated: boolean | null;
};

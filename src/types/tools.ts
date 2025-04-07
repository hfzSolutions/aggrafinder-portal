
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

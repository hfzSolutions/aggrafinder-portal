
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
}

export const aiTools: AITool[] = [
  {
    id: "1",
    name: "ChatGPT",
    description: "Advanced AI language model for conversations and content generation.",
    imageUrl: "https://cdn.thenewstack.io/media/2023/03/e03ac653-img_0395-1024x1024.jpg",
    category: ["Text Generation", "Conversational AI"],
    url: "https://chat.openai.com",
    featured: true,
    pricing: "Freemium",
    tags: ["ChatBot", "Writing Assistant", "Popular"]
  },
  {
    id: "2",
    name: "Midjourney",
    description: "AI image generation tool creating detailed artworks from text descriptions.",
    imageUrl: "https://assets-global.website-files.com/61fd4eb76a8d78bc0676b47d/62a199f8ce8a3c844d93bfea_midjourney.jpg",
    category: ["Image Generation"],
    url: "https://www.midjourney.com",
    featured: true,
    pricing: "Paid",
    tags: ["Art", "Design", "Creative"]
  },
  {
    id: "3",
    name: "GitHub Copilot",
    description: "AI pair programmer that helps you write code faster with less work.",
    imageUrl: "https://github.blog/wp-content/uploads/2022/06/GitHub-Copilot_social-card.png",
    category: ["Code Generation", "Development"],
    url: "https://github.com/features/copilot",
    featured: true,
    pricing: "Paid",
    tags: ["Coding", "Productivity", "Developer Tools"]
  },
  {
    id: "4",
    name: "Claude",
    description: "AI assistant by Anthropic focused on helpfulness, harmlessness, and honesty.",
    imageUrl: "https://uploads-ssl.webflow.com/5bff8886c3964a992e90d465/65c68a3e6953b2ed57fa1a3c_Claude-Hero-Image.jpg",
    category: ["Text Generation", "Conversational AI"],
    url: "https://www.anthropic.com/claude",
    featured: true,
    pricing: "Freemium",
    tags: ["ChatBot", "Research", "Writing"]
  },
  {
    id: "5",
    name: "DALL-E",
    description: "Creates images from textual descriptions with remarkable accuracy.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/DALL-E_2_Main_Webfrontend.jpg/1200px-DALL-E_2_Main_Webfrontend.jpg",
    category: ["Image Generation"],
    url: "https://openai.com/dall-e-3",
    featured: false,
    pricing: "Paid",
    tags: ["Art", "Design", "Creative"]
  },
  {
    id: "6",
    name: "Jasper",
    description: "AI content writing assistant for marketing teams and content creators.",
    imageUrl: "https://www.jasper.ai/images/og-image.png",
    category: ["Text Generation", "Marketing"],
    url: "https://www.jasper.ai",
    featured: false,
    pricing: "Paid",
    tags: ["Writing", "Marketing", "SEO"]
  },
  {
    id: "7",
    name: "Synthesia",
    description: "Create AI videos by simply typing text. No actors, no camera, no studio.",
    imageUrl: "https://i.pcmag.com/imagery/reviews/04iFQAytqYDxSLrFP8u3THS-15.fit_scale.size_760x427.v1670950567.jpg",
    category: ["Video Generation"],
    url: "https://www.synthesia.io",
    featured: false,
    pricing: "Paid",
    tags: ["Video", "Marketing", "Presentations"]
  },
  {
    id: "8",
    name: "Stable Diffusion",
    description: "Open-source AI art generator with exceptional image creation capabilities.",
    imageUrl: "https://mpost.io/wp-content/uploads/2023/01/image-106.png",
    category: ["Image Generation"],
    url: "https://stability.ai",
    featured: true,
    pricing: "Free",
    tags: ["Art", "Open Source", "Creative"]
  },
  {
    id: "9",
    name: "Otter.ai",
    description: "AI meeting assistant that records, transcribes, and takes notes in real-time.",
    imageUrl: "https://blog.otter.ai/wp-content/uploads/2021/10/otter-logo-blog-transparent-1.png",
    category: ["Transcription", "Productivity"],
    url: "https://otter.ai",
    featured: false,
    pricing: "Freemium",
    tags: ["Meetings", "Transcription", "Productivity"]
  },
  {
    id: "10",
    name: "Grammarly",
    description: "AI writing assistant for grammar, clarity, and style suggestions.",
    imageUrl: "https://i.pcmag.com/imagery/reviews/04C8j7WW7LnPnoH3J67xWVz-26.fit_scale.size_760x427.v1625759628.jpg",
    category: ["Writing Assistance"],
    url: "https://www.grammarly.com",
    featured: false,
    pricing: "Freemium",
    tags: ["Writing", "Grammar", "Productivity"]
  },
];

export const categories = [
  "All",
  "Text Generation",
  "Image Generation",
  "Video Generation",
  "Code Generation",
  "Conversational AI",
  "Writing Assistance",
  "Transcription",
  "Marketing",
  "Development",
  "Productivity"
];

export const pricingOptions = ["All", "Free", "Freemium", "Paid", "Free Trial"];

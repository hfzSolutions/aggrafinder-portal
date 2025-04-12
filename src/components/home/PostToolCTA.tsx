
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/utils/analytics';

const PostToolCTA = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  const handlePostTool = () => {
    trackEvent('user_engagement', 'click_post_tool_cta');
    navigate('/dashboard');
  };

  return (
    <section className="w-full py-12 md:py-16 bg-gradient-to-r from-primary/5 to-secondary/5 border-t border-b">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full border bg-background text-primary text-sm font-medium">
              <Gift className="h-3.5 w-3.5 mr-1.5" />
              Share your AI tool with the world
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Post Your AI Tool For Free
            </h2>
            <p className="text-muted-foreground max-w-[600px]">
              Showcase your AI tool to our growing community of AI enthusiasts and early adopters. 
              Get visibility, feedback, and users – all at no cost.
            </p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Reach thousands of AI enthusiasts and early adopters</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Get valuable feedback from actual users</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-0.5 h-5 w-5 text-primary flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Build your brand in the AI community</span>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-auto">
            <div 
              className="relative bg-card border rounded-lg p-6 shadow-sm transition-all duration-300 overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 transform scale-105 opacity-0 transition-opacity duration-300" 
                style={{ opacity: isHovered ? 0.5 : 0 }}
              />
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Upload className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Add Your AI Tool</h3>
              <p className="text-muted-foreground mb-4">
                Just fill out a simple form with details about your tool. No complicated process.
              </p>
              <Button 
                onClick={handlePostTool} 
                className="w-full group"
                size="lg"
              >
                Post Your Tool
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostToolCTA;

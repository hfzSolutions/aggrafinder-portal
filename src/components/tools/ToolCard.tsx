import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { AITool } from "@/types/tools";
import { cn } from "@/lib/utils";
import { CompareButton } from "./CompareButton";
import { useToolsCompare } from "@/hooks/useToolsCompare";

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard = ({ tool }: ToolCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const navigate = useNavigate();
  const { isToolSelected, toggleToolSelection } = useToolsCompare();
  
  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "Free": return "bg-green-100 text-green-800";
      case "Freemium": return "bg-blue-100 text-blue-800";
      case "Paid": return "bg-purple-100 text-purple-800";
      case "Free Trial": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  const handleCardClick = () => {
    navigate(`/tools/${tool.id}`);
  };
  
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking on the link
  };
  
  const handleCompareClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking compare
    toggleToolSelection(tool);
  };
  
  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-md hover:border-border/80 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image container with aspect ratio */}
      <div className="relative pt-[56.25%] w-full overflow-hidden bg-secondary/30">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
        <img
          src={tool.imageUrl}
          alt={tool.name}
          className={cn(
            "absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105",
            isImageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Pricing badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPricingColor(tool.pricing)}`}>
            {tool.pricing}
          </span>
        </div>
        
        {/* Compare button */}
        <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <CompareButton 
            isActive={isToolSelected(tool.id)} 
            onClick={handleCompareClick}
            buttonText="Compare"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow">
          {tool.description}
        </p>
        
        {/* Tags */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-1 mb-4">
            {tool.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          
          {/* Visit link */}
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            onClick={handleLinkClick}
          >
            Visit website
            <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-xl pointer-events-none transition-all duration-300"></div>
    </div>
  );
};

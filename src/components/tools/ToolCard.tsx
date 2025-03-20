import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, ImageOff, Star, Users, Calendar } from 'lucide-react';
import { AITool } from '@/types/tools';
import { cn } from '@/lib/utils';
import { CompareButton } from './CompareButton';
import { useToolsCompare } from '@/hooks/useToolsCompare';
import { VoteButtons } from './VoteButtons';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ToolCardProps {
  tool: AITool;
}

export const ToolCard = ({ tool }: ToolCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isToolSelected, toggleToolSelection } = useToolsCompare();

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free':
        return 'bg-green-100 text-green-800';
      case 'Freemium':
        return 'bg-blue-100 text-blue-800';
      case 'Paid':
        return 'bg-purple-100 text-purple-800';
      case 'Free Trial':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleImageError = () => {
    setIsImageError(true);
    setIsImageLoaded(true); // We consider it "loaded" to stop the loading spinner
  };

  const getGradientForTool = () => {
    const sumChars = tool.name
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const gradientIndex = sumChars % 5; // 5 different gradients

    switch (gradientIndex) {
      case 0:
        return 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20';
      case 1:
        return 'bg-gradient-to-br from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20';
      case 2:
        return 'bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20';
      case 3:
        return 'bg-gradient-to-br from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20';
      case 4:
        return 'bg-gradient-to-br from-indigo-100 to-cyan-100 dark:from-indigo-900/20 dark:to-cyan-900/20';
      default:
        return 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20';
    }
  };

  const formatReleaseDate = () => {
    // Placeholder for potential future release date field
    return '2023';
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-br-xl"></div>
      </div>

      <div className="relative pt-[56.25%] w-full overflow-hidden bg-secondary/30">
        {!isImageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}

        {isImageError ? (
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center ${getGradientForTool()}`}
          >
            <ImageOff className="h-10 w-10 mb-2 text-primary/40" />
            <span className="text-xs text-primary/60 font-medium">
              Preview not available
            </span>
          </div>
        ) : (
          <img
            src={tool.imageUrl}
            alt={tool.name}
            className={cn(
              'absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105',
              isImageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setIsImageLoaded(true)}
            onError={handleImageError}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        {tool.featured && (
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant="secondary"
              className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border border-yellow-200"
            >
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{' '}
              Featured
            </Badge>
          </div>
        )}

        <div className="absolute top-3 right-3 z-10">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${getPricingColor(
              tool.pricing
            )}`}
          >
            {tool.pricing}
          </span>
        </div>

        <div
          className={cn(
            'absolute bottom-3 left-3 z-10 transition-all duration-300',
            isHovered || isToolSelected(tool.id) ? 'opacity-100' : 'opacity-0'
          )}
        >
          <CompareButton
            isActive={isToolSelected(tool.id)}
            onClick={handleCompareClick}
            buttonText="Compare"
          />
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col">
        <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">
          {tool.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
          {tool.description}
        </p>

        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {tool.category &&
              tool.category.slice(0, 2).map((category, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-secondary/40 hover:bg-secondary"
                >
                  {category}
                </Badge>
              ))}
            {tool.category && tool.category.length > 2 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs bg-secondary/40 hover:bg-secondary cursor-help"
                    >
                      +{tool.category.length - 2}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      {tool.category.slice(2).join(', ')}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

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
            {tool.tags.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground cursor-help">
                      +{tool.tags.length - 3}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      {tool.tags.slice(3).join(', ')}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
              <VoteButtons toolId={tool.id} variant="compact" />
            </div>

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
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-xl pointer-events-none transition-all duration-300"></div>
    </div>
  );
};

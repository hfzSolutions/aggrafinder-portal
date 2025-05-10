import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  ImageOff,
  Star,
  Heart,
  MessageSquare,
} from 'lucide-react';
import { AITool } from '@/types/tools';
import { cn } from '@/lib/utils';
import { CompareButton } from './CompareButton';
import { useToolsCompare } from '@/hooks/useToolsCompare';
import { VoteButtons } from './VoteButtons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import ToolChatModal from './ToolChatModal';
import { AskAIButton } from './AskAIButton';

interface ToolCardProps {
  tool: AITool;
  viewType?: 'grid' | 'list';
  compact?: boolean;
  onFavoriteToggle?: (toolId: string, isFavorite: boolean) => void;
  isFavorite?: boolean;
  todaysPick?: boolean;
}

export const ToolCard = ({
  tool,
  viewType = 'grid',
  compact = false,
  onFavoriteToggle,
  isFavorite = false,
  todaysPick = false,
}: ToolCardProps) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFavoriteState, setIsFavoriteState] = useState(isFavorite);
  const [showChatModal, setShowChatModal] = useState(false);
  const navigate = useNavigate();
  const { isToolSelected, toggleToolSelection } = useToolsCompare();
  const { trackEvent } = useToolAnalytics();

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
    trackEvent(tool.id, 'view');
  };

  const handleCategoryClick = (category: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking category
    navigate(`/tools?category=${encodeURIComponent(category)}`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking on the link
    trackEvent(tool.id, 'click_url');
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

  if (viewType === 'grid') {
    return (
      <div
        className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col cursor-pointer touch-manipulation"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-br-xl"></div>
        </div>

        {tool.featured && (
          <div className="absolute inset-0 border-2 border-yellow-200 dark:border-yellow-500/40 rounded-xl pointer-events-none z-10"></div>
        )}

        <div className="relative pt-[56.25%] w-full overflow-hidden bg-secondary/30">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          {isImageError ? (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${getGradientForTool()}`}
              onClick={handleCardClick}
            >
              <ImageOff className="h-10 w-10 mb-2 text-primary/40" />
              <span className="text-xs text-primary/60 font-medium">
                Preview not available
              </span>
            </div>
          ) : (
            <div onClick={handleCardClick}>
              <img
                src={tool.imageUrl}
                alt={tool.name}
                className={cn(
                  'absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105',
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setIsImageLoaded(true)}
                onError={handleImageError}
                onClick={handleCardClick}
              />
            </div>
          )}

          <div
            onClick={handleCardClick}
            className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>

          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {tool.featured && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border border-yellow-200"
              >
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{' '}
                Featured
              </Badge>
            )}
            {todaysPick && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary text-primary-foreground"
              >
                <Star className="h-3 w-3 fill-current" /> Today's Pick
              </Badge>
            )}
            {/* {tool.isAdminAdded && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200"
              >
                Admin Information
              </Badge>
            )} */}
          </div>

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
              'opacity-100 md:opacity-0 md:group-hover:opacity-100',
              isToolSelected(tool.id) && 'md:opacity-100'
            )}
          >
            <div className="flex space-x-2">
              <CompareButton
                isActive={isToolSelected(tool.id)}
                onClick={handleCompareClick}
                buttonText="Compare"
                className="h-10 px-4 shadow-sm hover:shadow-md"
              />

              <AskAIButton
                tool={tool}
                buttonText="Ask AI"
                className="h-10 px-4 shadow-sm hover:shadow-md"
              />

              {/* {onFavoriteToggle && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-8 px-3 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFavoriteState(!isFavoriteState);
                    onFavoriteToggle(tool.id, !isFavoriteState);
                  }}
                >
                  <Heart
                    className={`h-4 w-4 mr-1 ${
                      isFavoriteState ? 'fill-current text-red-500' : ''
                    }`}
                  />
                  {isFavoriteState ? 'Saved' : 'Save'}
                </Button>
              )} */}
            </div>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <h3
            onClick={handleCardClick}
            className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300"
          >
            {tool.name}
          </h3>
          {tool.tagline && (
            <p
              onClick={handleCardClick}
              className="text-sm font-medium text-primary/90 mb-2.5 line-clamp-2 leading-snug"
            >
              {tool.tagline}
            </p>
          )}
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
                    className="text-xs bg-secondary/40 hover:bg-secondary cursor-pointer"
                    onClick={(e) => handleCategoryClick(category, e)}
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
                        onClick={(e) => e.stopPropagation()}
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
            <div className="flex items-center justify-between">
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0"
              >
                <VoteButtons toolId={tool.id} variant="compact" />
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={handleLinkClick}
                >
                  <span className="hidden sm:inline">Visit website</span>
                  <ExternalLink className="sm:ml-1 h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-xl pointer-events-none transition-all duration-300"></div>

        {/* Shared chat modal is now rendered at the app level */}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex cursor-pointer animate-fade-in touch-manipulation">
        <div
          className="relative w-1/3 overflow-hidden bg-secondary/30"
          onClick={handleCardClick}
        >
          {isImageError ? (
            <div
              className={`absolute inset-0 flex items-center justify-center ${getGradientForTool()}`}
            >
              <ImageOff className="h-6 w-6 text-primary/40" />
            </div>
          ) : (
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
              onError={handleImageError}
            />
          )}
        </div>

        <div className="flex-1 p-3 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3
              className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors duration-300"
              onClick={handleCardClick}
            >
              {tool.name}
            </h3>
            <div className="flex flex-col gap-1">
              {tool.featured && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border border-yellow-200 ml-1 text-[10px] px-1.5 py-0"
                >
                  <Star className="h-2 w-2 fill-yellow-500 text-yellow-500" />
                  Featured
                </Badge>
              )}
              {todaysPick && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 bg-primary text-primary-foreground ml-1 text-[10px] px-1.5 py-0"
                >
                  <Star className="h-2 w-2 fill-current" />
                  Today's Pick
                </Badge>
              )}
            </div>
          </div>
          {tool.tagline && (
            <p
              className="text-xs font-medium text-primary/80 mb-1.5 line-clamp-1 leading-snug"
              onClick={handleCardClick}
            >
              {tool.tagline}
            </p>
          )}
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
            {tool.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center space-x-2">
              <div onClick={(e) => e.stopPropagation()}>
                <CompareButton
                  isActive={isToolSelected(tool.id)}
                  onClick={handleCompareClick}
                  buttonText=""
                  className="h-9 w-9 p-0 rounded-full flex items-center justify-center border shadow-sm hover:shadow-md active:scale-95 transition-all"
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <AskAIButton
                  tool={tool}
                  buttonText=""
                  className="h-9 w-9 p-0 rounded-full flex items-center justify-center border shadow-sm hover:shadow-md active:scale-95 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shared chat modal is now rendered at the app level */}
      </div>
    );
  }

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-manipulation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-br-xl"></div>
      </div>

      {tool.featured && (
        <div className="absolute inset-0 border-2 border-yellow-300 dark:border-yellow-500/40 rounded-xl pointer-events-none"></div>
      )}

      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-1/4 min-w-[120px] h-48 sm:h-auto overflow-hidden bg-secondary/30">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          {isImageError ? (
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center ${getGradientForTool()}`}
              onClick={handleCardClick}
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
                'w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsImageLoaded(true)}
              onError={handleImageError}
              onClick={handleCardClick}
            />
          )}

          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {tool.featured && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-yellow-100 text-yellow-800 border border-yellow-200"
              >
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />{' '}
                Featured
              </Badge>
            )}
            {todaysPick && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary text-primary-foreground"
              >
                <Star className="h-3 w-3 fill-current" /> Today's Pick
              </Badge>
            )}
            {/* {tool.isAdminAdded && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-200"
              >
                Admin Information
              </Badge>
            )} */}
          </div>

          <div className="absolute top-3 right-3 z-10 sm:hidden">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${getPricingColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
          </div>
        </div>

        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <h3
              onClick={handleCardClick}
              className="text-lg font-medium group-hover:text-primary transition-colors duration-300"
            >
              {tool.name}
            </h3>
            <div className="hidden sm:block">
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${getPricingColor(
                  tool.pricing
                )}`}
              >
                {tool.pricing}
              </span>
            </div>
          </div>

          {tool.tagline && (
            <p
              onClick={handleCardClick}
              className="text-sm font-medium text-primary/90 mb-2.5 line-clamp-1 leading-snug"
            >
              {tool.tagline}
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">
            {tool.description}
          </p>

          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {tool.category &&
                tool.category.slice(0, 3).map((category, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-secondary/40 hover:bg-secondary cursor-pointer"
                    onClick={(e) => handleCategoryClick(category, e)}
                  >
                    {category}
                  </Badge>
                ))}
              {tool.category && tool.category.length > 3 && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="text-xs bg-secondary/40 hover:bg-secondary cursor-help"
                        onClick={(e) => e.stopPropagation()}
                      >
                        +{tool.category.length - 3}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">
                        {tool.category.slice(3).join(', ')}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 mt-auto">
            <div className="flex items-center gap-3">
              <div
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0"
              >
                <VoteButtons toolId={tool.id} variant="compact" />
              </div>

              <div
                className={cn(
                  'transition-all duration-300',
                  'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                  isToolSelected(tool.id) && 'md:opacity-100'
                )}
              >
                <CompareButton
                  isActive={isToolSelected(tool.id)}
                  onClick={handleCompareClick}
                  buttonText="Compare"
                />
              </div>

              <div
                className={cn(
                  'transition-all duration-300',
                  'opacity-100 md:opacity-0 md:group-hover:opacity-100',
                  isToolSelected(tool.id) && 'md:opacity-100'
                )}
              >
                <AskAIButton tool={tool} buttonText="Ask AI" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                onClick={handleLinkClick}
              >
                <span className="hidden sm:inline">Visit website</span>
                <ExternalLink className="sm:ml-1 h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-xl pointer-events-none transition-all duration-300"></div>

      <ToolChatModal
        tool={tool}
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </div>
  );
};

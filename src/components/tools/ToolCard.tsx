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
    window.open(`/tools/${tool.id}`, '_blank');
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
        className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer touch-manipulation h-full flex flex-col overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Featured border overlay */}
        {tool.featured && (
          <div className="absolute inset-0 border-2 border-yellow-300/60 dark:border-yellow-500/40 rounded-2xl pointer-events-none z-10"></div>
        )}

        {/* Image Section - Compact and balanced like quick tools */}
        <div className="relative w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          {isImageError ? (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
              <ImageOff className="h-6 w-6" />
            </div>
          ) : (
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className={cn(
                'w-full h-full object-cover group-hover:scale-105 transition-transform duration-300',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsImageLoaded(true)}
              onError={handleImageError}
            />
          )}

          {/* Overlay gradient for better readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Top badges - Featured and Today's Pick */}
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            {tool.featured && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-yellow-100/90 text-yellow-800 border border-yellow-200/50 backdrop-blur-sm text-xs px-2 py-0.5"
              >
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Featured
              </Badge>
            )}
            {todaysPick && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/90 text-primary-foreground backdrop-blur-sm text-xs px-2 py-0.5"
              >
                <Star className="h-3 w-3 fill-current" />
                Today's Pick
              </Badge>
            )}
          </div>

          {/* Pricing badge - Top right */}
          <div className="absolute top-2 right-2 z-10">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${getPricingColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-1">
            {tool.name}
          </h3>

          {tool.tagline && (
            <p className="text-xs font-medium text-primary/80 mb-1 line-clamp-1 leading-relaxed">
              {tool.tagline}
            </p>
          )}

          <p className="text-xs text-muted-foreground line-clamp-3 flex-grow mb-3 leading-relaxed">
            {tool.description}
          </p>

          {/* Categories and actions footer */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center overflow-hidden max-w-[60%]">
              {tool.category && tool.category.length > 0 && (
                <div className="flex flex-wrap gap-1 overflow-hidden">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 h-5 bg-primary/10 text-primary border-primary/20 truncate max-w-[80px] font-medium cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(tool.category[0], e);
                    }}
                  >
                    {tool.category[0]}
                  </Badge>
                  {tool.category.length > 1 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0.5 h-5 cursor-help hover:bg-primary/5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            +{tool.category.length - 1}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <div className="text-xs">
                            {tool.category.slice(1).join(', ')}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1">
              <div onClick={(e) => e.stopPropagation()}>
                <CompareButton
                  isActive={isToolSelected(tool.id)}
                  onClick={handleCompareClick}
                  buttonText=""
                  className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10"
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <AskAIButton
                  tool={tool}
                  buttonText=""
                  className="h-7 w-7 p-0 rounded-lg hover:bg-primary/10"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full flex cursor-pointer touch-manipulation">
        {/* Image section */}
        <div className="relative w-1/3 min-w-[80px] overflow-hidden rounded-l-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {isImageError ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
                <ImageOff className="h-4 w-4" />
              </div>
            </div>
          ) : (
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
              onError={handleImageError}
              onClick={handleCardClick}
            />
          )}

          {/* External link indicator */}
          <div className="absolute bottom-1 right-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-4 h-4 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center">
              <ExternalLink className="h-2.5 w-2.5 text-primary" />
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="flex-1 p-3 flex flex-col min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3
              className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-200 flex-1 mr-2"
              onClick={handleCardClick}
            >
              {tool.name}
            </h3>
            {/* Pricing badge */}
            <span
              className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${getPricingColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
          </div>

          {tool.tagline && (
            <p
              className="text-xs font-medium text-primary/70 mb-1 truncate leading-tight"
              onClick={handleCardClick}
            >
              {tool.tagline}
            </p>
          )}

          <p
            className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-grow leading-relaxed"
            onClick={handleCardClick}
          >
            {tool.description}
          </p>

          {/* Footer with actions */}
          <div className="flex items-center justify-between mt-auto">
            {/* Category badge */}
            <div className="flex-1 min-w-0 mr-2">
              {tool.category && tool.category.length > 0 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 truncate max-w-full font-medium cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(tool.category[0], e);
                  }}
                >
                  {tool.category[0]}
                </Badge>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <div onClick={(e) => e.stopPropagation()}>
                <CompareButton
                  isActive={isToolSelected(tool.id)}
                  onClick={handleCompareClick}
                  buttonText=""
                  className="h-6 w-6 p-0 rounded-md hover:bg-primary/10"
                />
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <AskAIButton
                  tool={tool}
                  buttonText=""
                  className="h-6 w-6 p-0 rounded-md hover:bg-primary/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Featured overlay */}
        {(tool.featured || todaysPick) && (
          <div className="absolute top-1 left-1 z-10 flex flex-col gap-1">
            {tool.featured && (
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
            )}
            {todaysPick && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-manipulation"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Featured border overlay */}
      {tool.featured && (
        <div className="absolute inset-0 border-2 border-yellow-300/60 dark:border-yellow-500/40 rounded-2xl pointer-events-none z-10"></div>
      )}

      <div className="flex flex-col sm:flex-row">
        {/* Image Section */}
        <div className="relative sm:w-1/4 min-w-[120px] h-48 sm:h-auto overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
          )}

          {isImageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
                <ImageOff className="h-6 w-6" />
              </div>
              <span className="text-xs text-primary/60 font-medium mt-2">
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
            />
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            {tool.featured && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-yellow-100/90 text-yellow-800 border border-yellow-200/50 backdrop-blur-sm"
              >
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                Featured
              </Badge>
            )}
            {todaysPick && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/90 text-primary-foreground backdrop-blur-sm"
              >
                <Star className="h-3 w-3 fill-current" />
                Today's Pick
              </Badge>
            )}
          </div>

          {/* Pricing badge - only visible on mobile */}
          <div className="absolute top-3 right-3 z-10 sm:hidden">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${getPricingColor(
                tool.pricing
              )}`}
            >
              {tool.pricing}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300 flex-1 mr-4">
              {tool.name}
            </h3>
            {/* Pricing badge - desktop */}
            <div className="hidden sm:block flex-shrink-0">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${getPricingColor(
                  tool.pricing
                )}`}
              >
                {tool.pricing}
              </span>
            </div>
          </div>

          {tool.tagline && (
            <p className="text-sm font-medium text-primary/80 mb-1 line-clamp-1 leading-snug">
              {tool.tagline}
            </p>
          )}

          <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2 leading-relaxed">
            {tool.description}
          </p>

          {/* Categories */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1.5">
              {tool.category &&
                tool.category.slice(0, 3).map((category, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCategoryClick(category, e);
                    }}
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

          {/* Actions Footer */}
          <div className="flex items-center justify-between gap-4 mt-auto pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div onClick={(e) => e.stopPropagation()}>
                <CompareButton
                  isActive={isToolSelected(tool.id)}
                  onClick={handleCompareClick}
                  buttonText="Compare"
                  className="h-8 px-3"
                />
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <AskAIButton
                  tool={tool}
                  buttonText="Ask AI"
                  className="h-8 px-3"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToolChatModal
        tool={tool}
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
      />
    </div>
  );
};

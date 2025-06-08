import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Sparkles,
  ArrowRight,
  Zap,
  MoreHorizontal,
  SquareArrowOutUpRight,
  Star,
  Bot,
  ArrowDown,
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AITool } from '@/types/tools';
import { useEffect, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';

interface QuickToolsSectionProps {
  category?: string;
  searchTerm?: string;
  showHeader?: boolean; // Control whether to show the section header
  showAllTools?: boolean; // Flag to show all tools instead of just featured ones
  tools?: AITool[]; // Add prop to accept AITool array from parent component
  view?: 'grid' | 'list'; // View mode for displaying tools
  isMobile?: boolean; // Flag to indicate mobile view
  setToolType?: (type: 'all' | 'quick' | 'external') => void; // Function to update toolType state
}

// Helper function to convert AITool to QuickTool
const convertToQuickTool = (aiTool: AITool): QuickTool => ({
  id: aiTool.id,
  name: aiTool.name,
  description: aiTool.description,
  imageUrl: aiTool.imageUrl,
  category: aiTool.category,
  createdBy: aiTool.userId || 'Anonymous',
  createdAt: new Date().toISOString(), // We don't have this data in AITool
  isPublic: aiTool.is_public ?? true,
  usageCount: aiTool.usage_count || 0,
  rating: aiTool.upvotes
    ? Math.min(5, Math.max(0, aiTool.upvotes / 20))
    : undefined, // Convert upvotes to a 0-5 rating scale
});

const QuickToolsSection = ({
  category,
  searchTerm,
  showHeader = true, // Default to showing the header
  showAllTools = false, // Default to not showing all tools
  tools = [], // Default to empty array
  view = 'grid',
  isMobile = false,
  setToolType,
}: QuickToolsSectionProps) => {
  const navigate = useNavigate();
  // Always use scroll view for better user experience
  const displayMode = 'scroll';
  const { trackEvent } = useToolAnalytics();

  // Load saved state from sessionStorage when component mounts
  useEffect(() => {
    const savedState = sessionStorage.getItem('quickToolsState');
    if (savedState) {
      const state = JSON.parse(savedState);
      // We don't need to restore state if we're already on the right view
      if (
        view !== state.view ||
        category !== state.category ||
        searchTerm !== state.searchTerm
      ) {
        // Only restore if we're coming back from a quick tool page
        const referrer = document.referrer;
        if (referrer && referrer.includes('/quick-tools/')) {
          // Could implement state restoration here if needed
          // This would require lifting state up to parent component
        }
      }
    }
  }, []);

  // Handle navigation to a quick tool
  const handleQuickToolClick = (
    toolId: string,
    openInNewTab: boolean = true // Always open in new tab
  ) => {
    // Save current state to sessionStorage
    const currentState = {
      view,
      category,
      searchTerm,
      scrollPosition: window.scrollY,
    };
    sessionStorage.setItem('quickToolsState', JSON.stringify(currentState));

    // Always open in a new tab
    window.open(`/quick-tools/${toolId}`, '_blank');
    trackEvent(toolId, 'view');
  };

  // Use provided tools if available
  const sourceTools = tools
    .filter((tool) => tool.tool_type === 'quick')
    .map(convertToQuickTool);

  // Filter tools based on category and search term
  const filteredTools = sourceTools.filter((tool) => {
    // Filter by category if specified
    if (category && category !== 'All') {
      if (!tool.category.includes(category)) {
        return false;
      }
    }

    // Filter by search term if specified
    if (searchTerm && searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      return (
        tool.name.toLowerCase().includes(search) ||
        tool.description.toLowerCase().includes(search) ||
        tool.category.some((cat) => cat.toLowerCase().includes(search))
      );
    }

    return true;
  });

  // Determine how many tools to display based on view type and showAllTools flag
  // If view is 'quick', show all tools, otherwise limit to 9 tools unless showAllTools is true
  const displayTools =
    showAllTools || view === 'quick'
      ? filteredTools
      : filteredTools.slice(0, 9);

  // Flag to determine if we need to show the "See More" button
  const hasMoreTools =
    filteredTools.length > 6 && !showAllTools && view !== 'quick';

  // New state for pagination
  const [page, setPage] = useState(1);
  const toolsPerPage = 9;

  // Function to load more tools
  const loadMoreTools = () => {
    setPage((prev) => prev + 1);
    // Don't navigate or change tool type, just load more tools in place
  };

  // Calculate tools to display with pagination
  const paginatedTools = filteredTools.slice(0, page * toolsPerPage);

  // Check if there are more tools to load
  const hasMoreToolsToLoad = filteredTools.length > page * toolsPerPage;

  if (filteredTools.length === 0) {
    return null; // Don't show section if no tools match filters
  }

  return (
    <div className={`animate-fade-in`}>
      {showHeader && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-1 flex items-center">
              <Zap className="h-4 w-4 mr-2 text-primary" />
              Quick Tools
              <Badge
                variant="outline"
                className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0 h-5"
              >
                Fast & Simple
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Instant AI tools for quick tasks - no setup required
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 md:mt-0 ml-auto">
            <Button
              variant="outline"
              asChild
              className="text-xs px-3 border-primary/30 text-primary hover:bg-primary/10"
            >
              <Link to="/dashboard">
                <Plus className="h-3.5 w-3.5" />
                Create Quick Tool
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {paginatedTools.map((tool) => (
            <div key={tool.id} className="w-full">
              {isMobile ? (
                // Mobile view (same for homepage and non-homepage)
                <div
                  className="group relative rounded-md overflow-hidden bg-background border border-primary/20 hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-row items-center cursor-pointer p-3 touch-manipulation"
                  onClick={() => handleQuickToolClick(tool.id)}
                >
                  <div className="flex-shrink-0">
                    {tool.imageUrl ? (
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="h-8 w-8 object-contain rounded-md mr-2.5"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mr-2.5 text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate group-hover:text-primary transition-colors duration-200">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {tool.description}
                    </p>
                    {tool.usageCount > 0 && (
                      <div className="mt-1 flex items-center">
                        <span className="text-[10px] text-primary/70 font-medium">
                          {tool.usageCount.toLocaleString()}+ uses
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-1 h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickToolClick(tool.id);
                    }}
                  >
                    <SquareArrowOutUpRight className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                // Regular view for homepage - improved card layout
                <div
                  className="bg-background border border-border/50 rounded-lg hover:border-primary/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer touch-manipulation h-full flex flex-col"
                  onClick={() => handleQuickToolClick(tool.id)}
                >
                  <div className="p-4 flex flex-col h-full">
                    <div className="flex items-center mb-3">
                      {tool.imageUrl ? (
                        <img
                          src={tool.imageUrl}
                          alt={tool.name}
                          className="w-10 h-10 object-contain rounded-md mr-3 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3 text-primary flex-shrink-0">
                          <Bot className="h-5 w-5" />
                        </div>
                      )}
                      <h3 className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors duration-200">
                        {tool.name}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2 flex-grow">
                      {tool.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center overflow-hidden max-w-[60%]">
                        {tool.category.length > 0 && (
                          <div className="flex flex-wrap gap-1 overflow-hidden">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 h-4 bg-secondary/40 truncate max-w-[100px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {tool.category[0]}
                            </Badge>
                            {tool.category.length > 1 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1 py-0 h-4 bg-secondary/30 cursor-help"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      +{tool.category.length - 1}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom">
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
                      {tool.usageCount > 0 && (
                        <div className="flex items-center">
                          <span className="text-xs text-primary/70 font-medium">
                            {tool.usageCount.toLocaleString()}+ uses
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMoreToolsToLoad && (
          <div className="flex justify-center mt-6 md:mt-10">
            <Button
              variant="default"
              onClick={loadMoreTools}
              className="w-full max-w-md py-2 md:py-3 font-medium flex items-center justify-center gap-2 rounded-xl"
            >
              <span>Load More Quick Tools</span>
              <ArrowDown className="h-4 w-4 md:h-5 md:w-5 animate-bounce" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickToolsSection;

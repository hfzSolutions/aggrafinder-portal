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
  setToolType?: (type: 'quick' | 'external') => void; // Function to update toolType state
}

// QuickTool interface for converted tools
interface QuickTool {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string[];
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  usageCount: number;
  rating?: number;
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

  // New state for pagination
  const [page, setPage] = useState(1);
  const toolsPerPage = 18; // Increased from 9 to 18 tools per page

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
        <div
          className={
            view === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6'
              : 'grid grid-cols-1 gap-3 md:gap-4'
          }
        >
          {paginatedTools.map((tool) => (
            <div key={tool.id} className="w-full">
              {isMobile || view === 'list' ? (
                // Mobile view or List view - horizontal card layout
                <div
                  className="group relative rounded-xl overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-primary/40 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-row items-center cursor-pointer p-4 touch-manipulation"
                  onClick={() => handleQuickToolClick(tool.id)}
                >
                  <div className="flex-shrink-0">
                    {tool.imageUrl ? (
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="h-12 w-12 object-cover rounded-lg mr-4 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mr-4 text-primary shadow-sm">
                        <Bot className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-200 mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mb-2">
                      {tool.description}
                    </p>
                    {tool.usageCount > 0 && (
                      <div className="flex items-center">
                        <span className="text-[10px] text-primary/70 font-medium px-2 py-0.5 bg-primary/10 rounded-full">
                          {tool.usageCount.toLocaleString()}+ uses
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Desktop grid view - vertical card layout with larger image
                <div
                  className="group bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-2xl hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer touch-manipulation h-full flex flex-col overflow-hidden"
                  onClick={() => handleQuickToolClick(tool.id)}
                >
                  {/* Image Section - Compact and balanced */}
                  <div className="relative w-full h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center overflow-hidden">
                    {tool.imageUrl ? (
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    {/* Overlay gradient for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>

                  {/* Content Section */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 flex-grow mb-3 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Footer Section */}
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center overflow-hidden max-w-[60%]">
                        {tool.category.length > 0 && (
                          <div className="flex flex-wrap gap-1 overflow-hidden">
                            <Badge
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 h-5 bg-primary/10 text-primary border-primary/20 truncate max-w-[80px] font-medium"
                              onClick={(e) => e.stopPropagation()}
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
                                  <TooltipContent
                                    side="bottom"
                                    className="max-w-xs"
                                  >
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
                          <span className="text-[10px] text-primary/70 font-medium px-2 py-0.5 bg-primary/5 rounded-full">
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
          <div className="flex justify-center mt-8 md:mt-12">
            <Button
              variant="default"
              onClick={loadMoreTools}
              className="group w-full max-w-sm py-3 md:py-4 font-semibold flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
            >
              <span>Load More Tools</span>
              <ArrowDown className="h-4 w-4 md:h-5 md:w-5 group-hover:animate-bounce transition-all duration-300" />
              <Badge
                variant="secondary"
                className="ml-2 bg-white/20 text-white border-0 text-xs px-2 py-0 h-5"
              >
                {filteredTools.length - page * toolsPerPage} left
              </Badge>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickToolsSection;

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
              : 'grid grid-cols-1 gap-2 md:gap-3'
          }
        >
          {paginatedTools.map((tool) => (
            <div key={tool.id} className="w-full">
              {isMobile || view === 'list' ? (
                // Mobile view or List view - Ultra compact chat contact style
                <div
                  className="group relative rounded-xl bg-white dark:bg-gray-900 border border-gray-200/40 dark:border-gray-700/40 hover:border-primary/30 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-all duration-300 cursor-pointer p-3 touch-manipulation overflow-hidden active:scale-[0.99]"
                  onClick={() => handleQuickToolClick(tool.id)}
                >
                  {/* Subtle active state background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative flex items-center space-x-3">
                    {/* Compact Avatar Section */}
                    <div className="flex-shrink-0">
                      {tool.imageUrl ? (
                        <div className="relative">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-0.5 shadow-sm">
                            <img
                              src={tool.imageUrl}
                              alt={tool.name}
                              className="w-full h-full object-cover rounded-full"
                            />
                          </div>
                          {/* Compact status dot */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[1.5px] border-white dark:border-gray-900 rounded-full">
                            <div className="absolute inset-0 w-full h-full bg-green-400 rounded-full animate-ping opacity-40"></div>
                          </div>
                          {/* Compact typing indicator on hover */}
                          <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white dark:bg-gray-800 rounded-md px-1.5 py-0.5 shadow-md border border-gray-200 dark:border-gray-700">
                              <div className="flex space-x-0.5">
                                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: '0.1s' }}
                                ></div>
                                <div
                                  className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: '0.2s' }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/25 via-primary/15 to-primary/10 border-[1.5px] border-white dark:border-gray-800 flex items-center justify-center text-primary shadow-sm">
                            <Bot className="h-5 w-5" />
                          </div>
                          {/* Compact status dot */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-[1.5px] border-white dark:border-gray-900 rounded-full">
                            <div className="absolute inset-0 w-full h-full bg-green-400 rounded-full animate-ping opacity-40"></div>
                          </div>
                          {/* Compact typing indicator on hover */}
                          <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white dark:bg-gray-800 rounded-md px-1.5 py-0.5 shadow-md border border-gray-200 dark:border-gray-700">
                              <div className="flex space-x-0.5">
                                <div className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"></div>
                                <div
                                  className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: '0.1s' }}
                                ></div>
                                <div
                                  className="w-0.5 h-0.5 bg-gray-400 rounded-full animate-bounce"
                                  style={{ animationDelay: '0.2s' }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Content Section - Single line compact layout */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors duration-200">
                              {tool.name}
                            </h3>
                            {tool.usageCount > 0 && (
                              <span className="text-[9px] text-muted-foreground/50 font-normal">
                                {tool.usageCount > 999
                                  ? `${Math.floor(tool.usageCount / 1000)}k`
                                  : tool.usageCount}
                                +
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5 pr-2">
                            {tool.description}
                          </p>
                        </div>

                        {/* Minimal action button */}
                        <div className="flex-shrink-0 ml-3">
                          <button
                            className="text-[9px] text-primary/60 group-hover:text-white font-medium px-2 py-1 bg-transparent group-hover:bg-primary/90 rounded-md transition-all duration-300 border border-primary/20 group-hover:border-primary/0 shadow-none group-hover:shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickToolClick(tool.id);
                            }}
                          >
                            Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Desktop grid view - Premium chat contact card
                <div
                  className="group bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-3xl hover:border-primary/40 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 cursor-pointer touch-manipulation h-full flex flex-col overflow-hidden relative"
                  onClick={() => handleQuickToolClick(tool.id)}
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-primary/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Header */}
                  <div className="relative p-4 pb-3">
                    {/* Enhanced Avatar Section */}
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4">
                        {tool.imageUrl ? (
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 p-1 shadow-xl">
                              <img
                                src={tool.imageUrl}
                                alt={tool.name}
                                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-[2.5px] border-white dark:border-gray-900 rounded-full shadow-lg">
                              <div className="absolute inset-0 w-full h-full bg-green-400 rounded-full animate-ping opacity-30"></div>
                            </div>
                            {/* Typing indicator on hover */}
                            <div className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                  ></div>
                                  <div
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 border-3 border-white dark:border-gray-800 flex items-center justify-center text-primary shadow-xl group-hover:scale-105 transition-transform duration-500">
                              <Bot className="h-9 w-9" />
                            </div>
                            <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-[2.5px] border-white dark:border-gray-900 rounded-full shadow-lg">
                              <div className="absolute inset-0 w-full h-full bg-green-400 rounded-full animate-ping opacity-30"></div>
                            </div>
                            {/* Typing indicator on hover */}
                            <div className="absolute -top-3 -left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 py-2 shadow-xl border border-gray-200 dark:border-gray-700">
                                <div className="flex space-x-1">
                                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.1s' }}
                                  ></div>
                                  <div
                                    className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                                    style={{ animationDelay: '0.2s' }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-center mb-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300 mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed px-2 mb-2">
                          {tool.description}
                        </p>

                        {/* Quick stats */}
                        <div className="flex items-center justify-center space-x-3 text-[10px] text-muted-foreground/70 mb-3">
                          {tool.category.length > 0 && (
                            <span>{tool.category[0]}</span>
                          )}
                          {tool.usageCount > 0 && (
                            <span>
                              {tool.usageCount.toLocaleString()}+ chats
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action button - transforms on card hover */}
                      <button
                        className="w-full py-2 px-4 bg-primary/10 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-primary/80 text-primary group-hover:text-white text-sm font-medium group-hover:font-semibold rounded-xl border border-primary/20 group-hover:border-primary/0 group-hover:shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.99]"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickToolClick(tool.id);
                        }}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <span>Chat now</span>
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                      </button>
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

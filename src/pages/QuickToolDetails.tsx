import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft,
  Tag,
  User,
  Settings,
  MessageSquare,
  Sparkles,
  Code,
  Calendar,
  Info,
  ChevronUp,
  ChevronDown,
  SquareArrowOutUpRight,
  Bot,
  Zap,
  MoreVertical,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { VoteButtons } from '@/components/tools/VoteButtons';
import { CommentsList } from '@/components/tools/CommentsList';
import ShareButton from '@/components/tools/ShareButton';
import QuickToolChat from '@/components/quick-tools/QuickToolChat';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HelpCircle } from 'lucide-react';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface QuickTool {
  id: string;
  name: string;
  description: string;
  prompt?: string;
  category: string[];
  image_url?: string;
  user_id: string;
  created_at: string;
  updated_at?: string;
  usage_count?: number;
  user_profile?: {
    full_name?: string;
    avatar_url?: string;
  };
  approval_status?: string;
  featured?: boolean;
  is_admin_added?: boolean;
  pricing?: string;
  tagline?: string;
  tags?: string[];
  url?: string;
  youtube_url?: string;
}

const QuickToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tool, setTool] = useState<QuickTool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMobile = useIsMobile();
  const [showInfo, setShowInfo] = useState(!isMobile);
  const [commentsCount, setCommentsCount] = useState(0);
  const [promptDialogOpen, setPromptDialogOpen] = useState(false);
  const [commentsDialogOpen, setCommentsDialogOpen] = useState(false);
  const [relatedTools, setRelatedTools] = useState<QuickTool[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchQuickToolDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from('ai_tools_random')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!data) {
          throw new Error('Quick tool not found');
        }

        // Transform the image_url by prepending the storage URL if image_url exists
        if (data.image_url) {
          data.image_url = `${import.meta.env.VITE_STORAGE_URL}/${
            data.image_url
          }`;
        }

        setTool(data as QuickTool);

        // Fetch comments count
        const { count, error: countError } = await supabase
          .from('tool_reviews')
          .select('id', { count: 'exact' })
          .eq('tool_id', id);

        if (!countError && count !== null) {
          setCommentsCount(count);
        }
      } catch (err) {
        console.error('Error fetching quick tool details:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchQuickToolDetails();
  }, [id]);

  // Set showInfo based on screen size when it changes
  useEffect(() => {
    setShowInfo(!isMobile);
  }, [isMobile]);

  const handleBackClick = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/?type=quick');
    }
  };

  const [activeTab, setActiveTab] = useState('chat');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };

  // Handle comment count update
  const handleCommentCountUpdate = (count: number) => {
    setCommentsCount(count);
  };

  // Handle click on a related tool
  const handleRelatedToolClick = (toolId: string) => {
    // Open in a new tab
    window.open(`/quick-tools/${toolId}`, '_blank');
  };

  // Fetch related tools when the current tool is loaded
  useEffect(() => {
    const fetchRelatedTools = async () => {
      if (!tool) return;

      try {
        setLoadingRelated(true);

        // Fetch tools that share categories with the current tool
        const { data, error } = await supabase
          .from('ai_tools_random')
          .select('*')
          .eq('tool_type', 'quick')
          .neq('id', tool.id) // Exclude current tool
          // .filter('category', 'cs', `{${tool.category.join(',')}}`) // Filter by categories that overlap
          .limit(3); // Limit to 6 related tools

        if (error) throw error;

        if (data) {
          // Transform image_url for each related tool
          const transformedData = data.map((item) => {
            if (item.image_url) {
              return {
                ...item,
                image_url: `${import.meta.env.VITE_STORAGE_URL}/${
                  item.image_url
                }`,
              };
            }
            return item;
          });
          setRelatedTools(transformedData as QuickTool[]);
        }
      } catch (err) {
        console.error('Error fetching related tools:', err);
      } finally {
        setLoadingRelated(false);
      }
    };

    fetchRelatedTools();
  }, [tool]);

  return (
    <>
      <Helmet>
        <title>
          {tool ? `${tool.name} | Quick Tool Details` : 'Quick Tool Details'}
        </title>
        <meta
          name="description"
          content={
            tool ? tool.description : 'Detailed information about quick tools'
          }
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20 bg-gradient-to-b from-background via-background/95 to-muted/5">
          <div className="container px-4 md:px-8 mx-auto py-8">
            <Button
              variant="ghost"
              size="sm"
              className="mb-6 group transition-all duration-300 hover:translate-x-[-5px] text-muted-foreground hover:text-foreground flex items-center"
              onClick={handleBackClick}
            >
              <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
              Back to tools
            </Button>

            {loading ? (
              <div className="space-y-6">
                <div className="animate-pulse space-y-3">
                  <Skeleton className="h-12 w-2/3 max-w-md rounded-lg" />
                  <Skeleton className="h-6 w-full max-w-2xl rounded-lg" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div>
                    <Skeleton className="h-96 w-full rounded-xl" />
                  </div>
                  <div className="lg:col-span-3">
                    <Skeleton className="h-[550px] w-full rounded-xl" />
                  </div>
                </div>
              </div>
            ) : error ? (
              <Card className="p-6 text-center border-0 bg-red-50/50 dark:bg-red-900/10 rounded-xl shadow-sm">
                <h2 className="text-xl font-medium mb-2 text-red-500">
                  Error loading quick tool details
                </h2>
                <p className="text-muted-foreground mb-4">{error.message}</p>
                <Button onClick={handleBackClick}>Return to Tools</Button>
              </Card>
            ) : tool ? (
              <div>
                {/* Mobile Tool Header */}
                {isMobile && (
                  <div className="fixed top-[60px] left-0 right-0 z-50 px-3 py-1 bg-background border border-border/20 shadow-sm">
                    <Button
                      variant="ghost"
                      className="w-full p-0 h-auto hover:bg-transparent active:bg-muted/20"
                      onClick={toggleInfo}
                    >
                      <div className="flex items-start justify-between gap-3 w-full">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 pt-1">
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200/30 text-xs px-2 py-0.5 rounded-md flex items-center shrink-0"
                            >
                              <Zap className="h-2.5 w-2.5 mr-1" />
                              Quick Tool: {tool.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="h-7 w-7 rounded-md p-0 shrink-0 flex items-center justify-center">
                          {showInfo ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>
                    </Button>
                    {showInfo && (
                      <div className="px-3">
                        <h1 className="text-lg font-semibold tracking-tight leading-tight truncate mt-3">
                          {tool.name}
                        </h1>
                        <p className="text-sm text-muted-foreground mb-3">
                          {tool.description}
                        </p>

                        {/* Mobile Tool Info - Only shown when expanded */}
                        <div className="space-y-2.5 mt-3 pt-3 border-t border-border/20">
                          {/* Creator Info - Mobile */}
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 rounded bg-primary/10 shrink-0">
                              <User className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-medium text-foreground/80">
                                  Creator
                                </span>
                                <TooltipProvider delayDuration={300}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <HelpCircle className="h-2.5 w-2.5 text-muted-foreground hover:text-foreground transition-colors" />
                                    </TooltipTrigger>
                                    <TooltipContent
                                      side="top"
                                      className="max-w-xs bg-popover/95 backdrop-blur-sm"
                                    >
                                      <p>
                                        Tool creators only provide the prompt
                                        and do not have access to your
                                        conversations.
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {tool.user_profile?.full_name ||
                                  'Anonymous User'}
                              </p>
                            </div>
                          </div>

                          {/* Date Info - Mobile */}
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 rounded bg-primary/10 shrink-0">
                              <Calendar className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-medium text-foreground/80">
                                Created
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(tool.created_at)}
                              </p>
                            </div>
                          </div>

                          {/* Usage Count - Mobile */}
                          <div className="flex items-center gap-2.5">
                            <div className="p-1 rounded bg-primary/10 shrink-0">
                              <Zap className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1">
                              <span className="text-xs font-medium text-foreground/80">
                                Usage Count
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {tool.usage_count?.toLocaleString() || '0'} uses
                              </p>
                            </div>
                          </div>

                          {/* Actions Row - Mobile */}
                          <div className="flex items-center gap-3 pt-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => setPromptDialogOpen(true)}
                            >
                              <Code className="h-3 w-3 mr-1.5" />
                              View Prompt
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                              onClick={() => setCommentsDialogOpen(true)}
                            >
                              <MessageSquare className="h-3 w-3 mr-1.5" />
                              {commentsCount} Comments
                            </Button>
                          </div>

                          {/* Categories - Mobile */}
                          {tool.category.length > 0 && (
                            <div className="pt-1">
                              <div className="flex flex-wrap gap-1">
                                {tool.category.map((cat, idx) => (
                                  <Link
                                    key={idx}
                                    to={`/tools?category=${encodeURIComponent(
                                      cat
                                    )}&type=quick`}
                                    className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-secondary text-secondary-foreground transition-colors"
                                  >
                                    {cat}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Side Panel - Tool Information */}
                  {(showInfo || !isMobile) && (
                    <div className={cn('space-y-6', isMobile && 'order-2')}>
                      {/* Tool Info Card - Only show on desktop or when expanded on mobile */}
                      {!isMobile && (
                        <div className="p-6 rounded-xl bg-background border border-border/10 shadow-sm backdrop-blur-sm">
                          <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
                            <Badge
                              variant="outline"
                              className="bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200/50 font-medium flex items-center px-3 py-1.5 rounded-full"
                            >
                              <Zap className="h-3 w-3 mr-1.5" />
                              Quick Tool
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 hover:bg-muted/50 rounded-full"
                                >
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem
                                  onClick={() => {
                                    const url = window.location.href;
                                    navigator.clipboard.writeText(url);
                                    toast.success(
                                      'Tool link copied to clipboard!'
                                    );
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Share2 className="h-3.5 w-3.5 mr-2" />
                                  Share Tool
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center justify-between mb-2">
                            <h1 className="text-xl font-bold tracking-tight">
                              {tool.name}
                            </h1>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {tool.description}
                          </p>

                          <div className="space-y-4">
                            {/* Creator Info - Always visible */}
                            <div className="flex items-start gap-3 pt-3 border-t border-border/10">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="text-xs font-semibold">
                                    Creator
                                  </h3>
                                  <TooltipProvider delayDuration={300}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="inline-flex items-center justify-center">
                                          <HelpCircle className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="top"
                                        className="max-w-xs bg-popover/95 backdrop-blur-sm"
                                      >
                                        <p>
                                          Tool creators only provide the prompt
                                          and do not have access to your
                                          conversations.
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                <p className="text-sm text-muted-foreground">
                                  {tool.user_profile?.full_name ||
                                    'Anonymous User'}
                                </p>
                              </div>
                            </div>

                            {/* Comments Button - Always visible */}
                            <div className="flex items-start gap-3 pt-3 border-t border-border/10">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <MessageSquare className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <h3 className="text-xs font-semibold">
                                  Comments
                                </h3>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                                  onClick={() => setCommentsDialogOpen(true)}
                                >
                                  {commentsCount}{' '}
                                  {commentsCount === 1 ? 'comment' : 'comments'}{' '}
                                  - View all
                                </Button>
                              </div>
                            </div>

                            {/* Collapsible sections */}
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full border-t border-border/10 pt-3"
                            >
                              <AccordionItem
                                value="more-details"
                                className="border-none"
                              >
                                <AccordionTrigger className="py-0 text-xs font-semibold text-muted-foreground hover:text-foreground hover:no-underline">
                                  More details
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-4 pt-2">
                                    {/* Date Info */}
                                    <div className="flex items-start gap-3 pt-3 border-t border-border/10">
                                      <div className="p-2 rounded-lg bg-primary/10">
                                        <Calendar className="h-4 w-4 text-primary" />
                                      </div>
                                      <div>
                                        <h3 className="text-xs font-semibold">
                                          Created
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {formatDate(tool.created_at)}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Usage Count */}
                                    <div className="flex items-start gap-3 pt-3 border-t border-border/10">
                                      <div className="p-2 rounded-lg bg-primary/10">
                                        <Zap className="h-4 w-4 text-primary" />
                                      </div>
                                      <div>
                                        <h3 className="text-xs font-semibold">
                                          Usage Count
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                          {tool.usage_count?.toLocaleString() ||
                                            '0'}{' '}
                                          uses
                                        </p>
                                      </div>
                                    </div>

                                    {/* Prompt Button */}
                                    <div className="flex items-start gap-3 pt-3 border-t border-border/10">
                                      <div className="p-2 rounded-lg bg-primary/10">
                                        <Code className="h-4 w-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-xs font-semibold">
                                          Prompt
                                        </h3>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto"
                                          onClick={() =>
                                            setPromptDialogOpen(true)
                                          }
                                        >
                                          View prompt details
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Categories */}
                                    <div className="flex items-start gap-3 pt-3 border-t border-border/10">
                                      <div className="p-2 rounded-lg bg-primary/10">
                                        <Tag className="h-4 w-4 text-primary" />
                                      </div>
                                      <div className="flex-1">
                                        <h3 className="text-xs font-semibold">
                                          Categories
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-1.5">
                                          {tool.category.map((cat, idx) => (
                                            <Link
                                              key={idx}
                                              to={`/tools?category=${encodeURIComponent(
                                                cat
                                              )}&type=quick`}
                                              className="inline-flex items-center text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors hover:scale-105 duration-300"
                                            >
                                              {cat}
                                            </Link>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        </div>
                      )}

                      {/* Related Tools - Compact View */}
                      {!isMobile && relatedTools.length > 0 && (
                        <div className="p-5 rounded-xl bg-background border border-border/10 shadow-sm backdrop-blur-sm mb-6">
                          <h3 className="text-sm font-semibold flex items-center mb-3">
                            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            Related Tools
                          </h3>
                          <div className="space-y-3">
                            {relatedTools.slice(0, 3).map((relatedTool) => (
                              <div
                                key={relatedTool.id}
                                className="group flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() =>
                                  handleRelatedToolClick(relatedTool.id)
                                }
                              >
                                {relatedTool.image_url ? (
                                  <img
                                    src={relatedTool.image_url}
                                    alt={relatedTool.name}
                                    className="w-8 h-8 object-cover rounded-md flex-shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.parentElement.innerHTML =
                                        '<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                                    }}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary flex-shrink-0">
                                    <Bot className="h-4 w-4" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                    {relatedTool.name}
                                  </h4>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {relatedTool.description}
                                  </p>
                                </div>
                                <SquareArrowOutUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="space-y-3">
                        {/* <div className="py-3 px-4 rounded-xl border border-border/40 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
                          <VoteButtons toolId={tool.id} />
                        </div> */}

                        <Button
                          variant="outline"
                          className="w-full justify-center gap-2 rounded-xl border-border/50 hover:bg-secondary/10 transition-all duration-300"
                          onClick={handleBackClick}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Tools
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Main Chat Area - Takes 3/4 of the screen on large displays */}
                  <div className={cn('lg:col-span-3', isMobile && 'order-1')}>
                    <QuickToolChat
                      toolId={tool.id}
                      toolName={tool.name}
                      toolPrompt={tool.prompt}
                      imageUrl={tool.image_url}
                    />
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* Prompt Dialog */}
      <Dialog open={promptDialogOpen} onOpenChange={setPromptDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="bg-muted/50 p-4 rounded-lg border backdrop-blur-sm max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {tool?.prompt}
              </pre>
            </div>
            <div className="mt-3 p-3 bg-blue-50/80 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 This is the AI prompt that powers the chat experience.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog open={commentsDialogOpen} onOpenChange={setCommentsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            {tool && (
              <CommentsList
                toolId={tool.id}
                limit={20}
                onCommentSubmitted={() => {
                  // Refresh comments count when a new comment is submitted
                  const fetchCommentsCount = async () => {
                    try {
                      const { count, error } = await supabase
                        .from('tool_reviews')
                        .select('id', { count: 'exact' })
                        .eq('tool_id', tool.id);

                      if (!error && count !== null) {
                        setCommentsCount(count);
                      }
                    } catch (err) {
                      console.error('Error fetching comments count:', err);
                    }
                  };

                  fetchCommentsCount();
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuickToolDetails;

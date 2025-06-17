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
  Download,
  Plus,
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
  initial_message?: string;
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
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

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
      // navigate('/?type=quick');
      navigate('/');
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

  // Handle PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show install prompt on mobile after tool loads
      if (isMobile && tool) {
        setShowInstallPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success('Tool added to home screen!');
    };

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isMobile, tool]);

  // Handle manual install prompt
  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS Safari
      if (
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')
      ) {
        toast.info('Tap the Share button and select "Add to Home Screen"');
        return;
      }
      toast.info('Installation not available on this device');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('Tool will be added to your home screen!');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Enhanced manifest update for better mobile support
  useEffect(() => {
    const updateManifest = () => {
      console.log('Setting PWA manifest for Quick Tool:', tool);
      const manifestElement = document.getElementById('manifest');

      if (!manifestElement) {
        console.warn('Manifest element not found');
        return;
      }

      const baseUrl = window.location.origin;
      const iconUrl = tool?.image_url || `${baseUrl}/images/web-logo.png`;

      const manifestData = {
        id: tool ? `/quick-tools/${tool.id}` : '/quick-tools',
        name: tool ? `${tool.name}` : 'DeepList AI',
        short_name: tool ? tool.name.substring(0, 12) : 'Quick Tools',
        description: tool ? tool.description : 'Explore AI tools and resources',
        start_url: tool
          ? `${baseUrl}/quick-tools/${tool.id}`
          : `${baseUrl}/quick-tools`,
        scope: tool
          ? `${baseUrl}/quick-tools/${tool.id}`
          : `${baseUrl}/quick-tools`,
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        categories: ['productivity', 'utilities', 'tools'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          {
            src: iconUrl,
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: iconUrl,
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: iconUrl,
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: iconUrl,
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: iconUrl,
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: iconUrl,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: iconUrl,
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: iconUrl,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      };

      const manifestString = JSON.stringify(manifestData);
      const manifestUrl =
        'data:application/json;charset=utf-8,' +
        encodeURIComponent(manifestString);

      manifestElement.setAttribute('href', manifestUrl);

      // // Enhanced mobile meta tags
      const updateOrCreateMeta = (
        name: string,
        content: string,
        property?: string
      ) => {
        const selector = property
          ? `meta[property="${property}"]`
          : `meta[name="${name}"]`;
        let meta = document.querySelector(selector) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          if (property) {
            meta.setAttribute('property', property);
          } else {
            meta.setAttribute('name', name);
          }
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // // Mobile-specific meta tags
      updateOrCreateMeta('mobile-web-app-capable', 'yes');
      updateOrCreateMeta('apple-mobile-web-app-capable', 'yes');
      updateOrCreateMeta('apple-mobile-web-app-status-bar-style', 'default');
      updateOrCreateMeta(
        'apple-mobile-web-app-title',
        tool?.name || 'DeepList AI'
      );
      updateOrCreateMeta('application-name', tool?.name || 'DeepList AI');
      updateOrCreateMeta('msapplication-TileColor', '#4f46e5');
      updateOrCreateMeta('theme-color', '#4f46e5');

      // Apple touch icons
      const updateOrCreateLink = (
        rel: string,
        href: string,
        sizes?: string
      ) => {
        let link = document.querySelector(
          `link[rel="${rel}"]`
        ) as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.setAttribute('rel', rel);
          document.head.appendChild(link);
        }
        link.setAttribute('href', href);
        if (sizes) {
          link.setAttribute('sizes', sizes);
        }
      };

      updateOrCreateLink('apple-touch-icon', iconUrl);
      updateOrCreateLink('apple-touch-icon', iconUrl, '180x180');
      updateOrCreateLink('icon', iconUrl, '32x32');
      updateOrCreateLink('icon', iconUrl, '16x16');

      console.log('Enhanced manifest updated successfully');
    };

    updateManifest();
  }, [tool]);

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
          .limit(3); // Limit to 3 related tools

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

        {/* Install Prompt Banner - Mobile Only */}
        {isMobile && showInstallPrompt && !isInstalled && tool && (
          <div className="fixed top-[60px] left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground px-4 py-2 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Plus className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium truncate">
                  Add {tool.name} to home screen
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-7 px-3 text-xs bg-white/20 hover:bg-white/30 text-white border-white/20"
                  onClick={handleInstallClick}
                >
                  Install
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-white hover:bg-white/20"
                  onClick={() => setShowInstallPrompt(false)}
                >
                  ×
                </Button>
              </div>
            </div>
          </div>
        )}

        <main
          className={cn(
            'flex-grow pt-20 bg-gradient-to-b from-background via-background/95 to-muted/5',
            isMobile && showInstallPrompt && !isInstalled && 'pt-28'
          )}
        >
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
                        <div className="flex items-center gap-1">
                          {/* Add to Home Screen Button */}
                          {!isInstalled &&
                            (deferredPrompt ||
                              navigator.userAgent.includes('Safari')) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInstallClick();
                                }}
                              >
                                <Download className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          <div className="h-7 w-7 rounded-md p-0 shrink-0 flex items-center justify-center">
                            {showInfo ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    </Button>
                    {showInfo && (
                      <div className="px-3">
                        <div className="flex items-center gap-3 mt-3">
                          {tool.image_url && (
                            <div className="w-10 h-10 rounded-md overflow-hidden border border-border/20 shrink-0">
                              <img
                                src={tool.image_url}
                                alt={tool.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h1 className="text-lg font-semibold tracking-tight leading-tight truncate">
                            {tool.name}
                          </h1>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 mt-2">
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
                              <DropdownMenuContent align="end" className="w-48">
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
                                {!isInstalled &&
                                  (deferredPrompt ||
                                    navigator.userAgent.includes('Safari')) && (
                                    <DropdownMenuItem
                                      onClick={handleInstallClick}
                                      className="cursor-pointer"
                                    >
                                      <Download className="h-3.5 w-3.5 mr-2" />
                                      Add to Home Screen
                                    </DropdownMenuItem>
                                  )}
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
                                                Tool creators only provide the
                                                prompt and do not have access to
                                                your conversations.
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
                                        onClick={() =>
                                          setCommentsDialogOpen(true)
                                        }
                                      >
                                        {commentsCount}{' '}
                                        {commentsCount === 1
                                          ? 'comment'
                                          : 'comments'}{' '}
                                        - View all
                                      </Button>
                                    </div>
                                  </div>

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
                      initialMessage={tool.initial_message}
                      suggested_replies={tool.suggested_replies || false}
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

import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft,
  ExternalLink,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Info,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSupabaseToolsByIds } from '@/hooks/useSupabaseToolsByIds';
import { AITool } from '@/types/tools';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSharedChat } from '@/contexts/SharedChatContext';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';

const CompareTools = () => {
  const { ids } = useParams<{ ids: string }>();
  const [tools, setTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isImageLoadedMap, setIsImageLoadedMap] = useState<
    Record<string, boolean>
  >({});
  const [activeToolIndex, setActiveToolIndex] = useState(0);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const featureRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { openChat } = useSharedChat();
  const { trackEvent } = useToolAnalytics();

  const toolIds = ids?.split(',') || [];

  const {
    tools: fetchedTools,
    loading,
    error: fetchError,
  } = useSupabaseToolsByIds({ ids: toolIds });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !fetchError) {
      setTools(fetchedTools);
      setIsLoading(false);
    }

    if (fetchError) {
      setError(fetchError);
      setIsLoading(false);
    }
  }, [loading, fetchError, fetchedTools]);

  const handleImageLoaded = (id: string) => {
    setIsImageLoadedMap((prev) => ({ ...prev, [id]: true }));
  };

  // Get all unique categories from all tools
  const allCategories = Array.from(
    new Set(tools.flatMap((tool) => tool.category))
  );

  // Get all unique tags from all tools
  const allTags = Array.from(new Set(tools.flatMap((tool) => tool.tags)));

  // Function to open chat with all tools in comparison
  const handleOpenComparisonChat = () => {
    if (tools.length > 0) {
      // Open chat with the first tool and pass all tools for comparison context
      openChat(tools[0], tools);

      // Track the event
      tools.forEach((tool) => {
        trackEvent(tool.id, 'comparison_chat_open');
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Compare AI Tools | DeepListAI</title>
        <meta
          name="description"
          content="Compare different AI tools side by side to find the best one for your needs."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20">
          <div className="container px-4 md:px-8 mx-auto py-8">
            <Button
              variant="outline"
              size="sm"
              className="mb-6 group transition-all duration-300 hover:translate-x-[-5px]"
              asChild
            >
              <Link to="/tools">
                <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                Back to tools
              </Link>
            </Button>

            <h1 className="text-3xl md:text-4xl font-semibold mb-2">
              Compare AI Tools
            </h1>
            <p className="text-muted-foreground mb-8">
              Side-by-side comparison of selected AI tools
            </p>

            {!isLoading && !error && tools.length >= 2 && (
              <Button
                onClick={handleOpenComparisonChat}
                className="mb-6 bg-primary/10 hover:bg-primary/20 text-primary gap-2"
                size="sm"
              >
                <MessageSquare className="h-4 w-4" />
                Compare with AI
              </Button>
            )}

            {isLoading ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array(toolIds.length)
                    .fill(0)
                    .map((_, idx) => (
                      <Skeleton key={idx} className="h-64" />
                    ))}
                </div>
                <Skeleton className="h-96" />
              </div>
            ) : error ? (
              <div className="rounded-lg border border-red-200 p-6 text-center bg-red-50">
                <h2 className="text-xl font-medium mb-2 text-red-600">
                  Error loading tools
                </h2>
                <p className="text-muted-foreground mb-4">{error.message}</p>
                <Button asChild>
                  <Link to="/tools">Return to Tools</Link>
                </Button>
              </div>
            ) : tools.length < 2 ? (
              <div className="rounded-lg border p-6 text-center">
                <h2 className="text-xl font-medium mb-2">
                  Not enough tools to compare
                </h2>
                <p className="text-muted-foreground mb-4">
                  Please select at least 2 tools to compare.
                </p>
                <Button asChild>
                  <Link to="/tools">Browse Tools</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Tool headers for comparison */}
                <div className="hidden md:grid md:grid-cols-4 gap-6">
                  <div className="hidden md:block"></div>{' '}
                  {/* Empty first column on desktop */}
                  {tools.map((tool) => (
                    <div
                      key={tool.id}
                      className="bg-card rounded-lg border border-border/60 shadow-sm p-4 flex flex-col items-center"
                    >
                      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-secondary/20 mb-3">
                        {!isImageLoadedMap[tool.id] && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                          </div>
                        )}
                        <img
                          src={tool.imageUrl}
                          alt={tool.name}
                          className={cn(
                            'h-full w-full object-cover transition-opacity',
                            isImageLoadedMap[tool.id]
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                          onLoad={() => handleImageLoaded(tool.id)}
                        />
                      </div>

                      <h2 className="text-lg font-medium text-center mb-1">
                        {tool.name}
                      </h2>

                      <div className="mb-3">
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded-full',
                            {
                              'bg-green-100 text-green-800':
                                tool.pricing === 'Free',
                              'bg-blue-100 text-blue-800':
                                tool.pricing === 'Freemium',
                              'bg-purple-100 text-purple-800':
                                tool.pricing === 'Paid',
                              'bg-amber-100 text-amber-800':
                                tool.pricing === 'Free Trial',
                              'bg-gray-100 text-gray-800': ![
                                'Free',
                                'Freemium',
                                'Paid',
                                'Free Trial',
                              ].includes(tool.pricing),
                            }
                          )}
                        >
                          {tool.pricing}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground text-center mb-4 flex-grow">
                        {tool.description}
                      </p>

                      <div className="flex gap-2 mt-auto">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/tools/${tool.id}`}>Details</Link>
                        </Button>

                        <Button
                          size="sm"
                          className="gap-1.5"
                          onClick={() => window.open(tool.url, '_blank')}
                        >
                          Visit
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile Carousel View */}
                <div className="md:hidden">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Tool {activeToolIndex + 1} of {tools.length}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      Swipe to compare
                    </Badge>
                  </div>

                  <Carousel
                    className="w-full"
                    onSelect={(api) => {
                      const index = api?.selectedScrollSnap() || 0;
                      setActiveToolIndex(index);
                    }}
                  >
                    <CarouselContent>
                      {tools.map((tool, index) => (
                        <CarouselItem key={tool.id}>
                          <div className="bg-card rounded-lg border border-border/60 shadow-sm p-5 flex flex-col items-center">
                            <div className="relative h-20 w-20 rounded-md overflow-hidden bg-secondary/20 mb-3">
                              {!isImageLoadedMap[tool.id] && (
                                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                </div>
                              )}
                              <img
                                src={tool.imageUrl}
                                alt={tool.name}
                                className={cn(
                                  'h-full w-full object-cover transition-opacity',
                                  isImageLoadedMap[tool.id]
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                                onLoad={() => handleImageLoaded(tool.id)}
                              />
                            </div>

                            <h2 className="text-xl font-medium text-center mb-2">
                              {tool.name}
                            </h2>

                            <div className="mb-3">
                              <span
                                className={cn(
                                  'text-sm font-medium px-2.5 py-1 rounded-full',
                                  {
                                    'bg-green-100 text-green-800':
                                      tool.pricing === 'Free',
                                    'bg-blue-100 text-blue-800':
                                      tool.pricing === 'Freemium',
                                    'bg-purple-100 text-purple-800':
                                      tool.pricing === 'Paid',
                                    'bg-amber-100 text-amber-800':
                                      tool.pricing === 'Free Trial',
                                    'bg-gray-100 text-gray-800': ![
                                      'Free',
                                      'Freemium',
                                      'Paid',
                                      'Free Trial',
                                    ].includes(tool.pricing),
                                  }
                                )}
                              >
                                {tool.pricing}
                              </span>
                            </div>

                            <p className="text-sm text-muted-foreground text-center mb-5">
                              {tool.description}
                            </p>

                            <div className="flex gap-3 mt-auto w-full justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1 max-w-32"
                              >
                                <Link to={`/tools/${tool.id}`}>Details</Link>
                              </Button>

                              <Button
                                size="sm"
                                className="gap-1.5 flex-1 max-w-32"
                                onClick={() => window.open(tool.url, '_blank')}
                              >
                                Visit
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <div className="flex justify-center mt-4">
                      <CarouselPrevious className="static transform-none mx-1" />
                      <CarouselNext className="static transform-none mx-1" />
                    </div>
                  </Carousel>
                </div>

                <Separator />

                {/* Desktop Comparison table */}
                <div className="hidden md:block rounded-lg border overflow-hidden">
                  <div className="bg-secondary/40 p-4">
                    <h2 className="text-xl font-medium">Detailed Comparison</h2>
                  </div>

                  <div className="divide-y">
                    {/* Categories */}
                    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                      <div className="p-4 bg-muted/30 font-medium">
                        Categories
                      </div>

                      {tools.map((tool) => (
                        <div key={`cat-${tool.id}`} className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {tool.category.map((cat, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing */}
                    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                      <div className="p-4 bg-muted/30 font-medium">Pricing</div>

                      {tools.map((tool) => (
                        <div key={`price-${tool.id}`} className="p-4">
                          <span
                            className={cn(
                              'text-xs font-medium px-2 py-1 rounded-full',
                              {
                                'bg-green-100 text-green-800':
                                  tool.pricing === 'Free',
                                'bg-blue-100 text-blue-800':
                                  tool.pricing === 'Freemium',
                                'bg-purple-100 text-purple-800':
                                  tool.pricing === 'Paid',
                                'bg-amber-100 text-amber-800':
                                  tool.pricing === 'Free Trial',
                                'bg-gray-100 text-gray-800': ![
                                  'Free',
                                  'Freemium',
                                  'Paid',
                                  'Free Trial',
                                ].includes(tool.pricing),
                              }
                            )}
                          >
                            {tool.pricing}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Features list based on all tags */}
                    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                      <div className="p-4 bg-muted/30 font-medium">
                        Features
                      </div>

                      {tools.map((tool) => (
                        <div key={`feat-${tool.id}`} className="p-4">
                          <div className="space-y-2">
                            {allTags.map((tag) => (
                              <div
                                key={tag}
                                className="flex items-center gap-2"
                              >
                                {tool.tags.includes(tag) ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-sm">{tag}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* URL */}
                    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                      <div className="p-4 bg-muted/30 font-medium">Website</div>

                      {tools.map((tool) => (
                        <div key={`url-${tool.id}`} className="p-4">
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            Visit website
                            <ExternalLink className="ml-1 h-3.5 w-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Comparison View */}
                <div className="md:hidden rounded-lg border overflow-hidden">
                  <div className="bg-secondary/40 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-medium">Detailed Comparison</h2>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5 mr-1" />
                      <span>Tap feature to compare</span>
                    </div>
                  </div>

                  <Tabs defaultValue="categories" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="categories">Categories</TabsTrigger>
                      <TabsTrigger value="pricing">Pricing</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="website">Website</TabsTrigger>
                    </TabsList>

                    <TabsContent value="categories" className="p-4">
                      <div className="space-y-4">
                        {tools.map((tool) => (
                          <div
                            key={`mcat-${tool.id}`}
                            className="p-3 border rounded-lg"
                          >
                            <h3 className="font-medium mb-2">{tool.name}</h3>
                            <div className="flex flex-wrap gap-1">
                              {tool.category.map((cat, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="pricing" className="p-4">
                      <div className="space-y-4">
                        {tools.map((tool) => (
                          <div
                            key={`mprice-${tool.id}`}
                            className="p-3 border rounded-lg"
                          >
                            <h3 className="font-medium mb-2">{tool.name}</h3>
                            <span
                              className={cn(
                                'text-xs font-medium px-2 py-1 rounded-full',
                                {
                                  'bg-green-100 text-green-800':
                                    tool.pricing === 'Free',
                                  'bg-blue-100 text-blue-800':
                                    tool.pricing === 'Freemium',
                                  'bg-purple-100 text-purple-800':
                                    tool.pricing === 'Paid',
                                  'bg-amber-100 text-amber-800':
                                    tool.pricing === 'Free Trial',
                                  'bg-gray-100 text-gray-800': ![
                                    'Free',
                                    'Freemium',
                                    'Paid',
                                    'Free Trial',
                                  ].includes(tool.pricing),
                                }
                              )}
                            >
                              {tool.pricing}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="features" className="p-4">
                      <div className="space-y-6">
                        {allTags.map((tag) => (
                          <div
                            key={`mtag-${tag}`}
                            className={cn(
                              'p-3 border rounded-lg transition-colors',
                              activeFeature === tag
                                ? 'border-primary bg-primary/5'
                                : ''
                            )}
                            onClick={() =>
                              setActiveFeature(
                                activeFeature === tag ? null : tag
                              )
                            }
                            ref={(el) => (featureRefs.current[tag] = el)}
                          >
                            <h3 className="font-medium mb-2">{tag}</h3>
                            <div className="space-y-2">
                              {tools.map((tool) => (
                                <div
                                  key={`${tag}-${tool.id}`}
                                  className="flex items-center gap-2"
                                >
                                  {tool.tags.includes(tag) ? (
                                    <Check className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                  <span className="text-sm">{tool.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="website" className="p-4">
                      <div className="space-y-4">
                        {tools.map((tool) => (
                          <div
                            key={`murl-${tool.id}`}
                            className="p-3 border rounded-lg"
                          >
                            <h3 className="font-medium mb-2">{tool.name}</h3>
                            <a
                              href={tool.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                              Visit website
                              <ExternalLink className="ml-1 h-3.5 w-3.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CompareTools;

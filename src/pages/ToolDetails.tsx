import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft,
  ExternalLink,
  Tag,
  CheckCircle,
  DollarSign,
  Clock,
  Star,
  ImageOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import { AITool } from '@/types/tools';
import { cn } from '@/lib/utils';
import { VoteButtons } from '@/components/tools/VoteButtons';
import { ReviewsList } from '@/components/tools/ReviewsList';
import ShareButton from '@/components/tools/ShareButton';

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { tools: relatedTools, loading: relatedLoading } = useSupabaseTools({
    category: tool?.category?.[0],
    limit: 3,
  });

  const filteredRelatedTools = relatedTools.filter(
    (relatedTool) => relatedTool.id !== id
  );

  useEffect(() => {
    const fetchToolDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        const { data, error: supabaseError } = await supabase
          .from('ai_tools')
          .select('*')
          .eq('id', id)
          .single();

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        if (!data) {
          throw new Error('Tool not found');
        }

        const transformedData: AITool = {
          id: data.id,
          name: data.name,
          description: data.description,
          imageUrl: data.image_url
            ? `${import.meta.env.VITE_STORAGE_URL}/${data.image_url}`
            : '',
          category: data.category,
          url: data.url,
          featured: data.featured,
          pricing: data.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
          tags: data.tags,
        };

        setTool(transformedData);
      } catch (err) {
        console.error('Error fetching tool details:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [id]);

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case 'Free':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Freemium':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Paid':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Free Trial':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
    }
  };

  const handleBackClick = () => {
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/tools');
    }
  };

  const { trackEvent } = useToolAnalytics();

  const handleVisitWebsite = (url: string) => {
    window.open(url, '_blank');
    toast.success('Opening website in a new tab');
    if (id) {
      trackEvent(id, 'click_url');
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {tool ? `${tool.name} | AI Tool Details` : 'AI Tool Details'}
        </title>
        <meta
          name="description"
          content={
            tool ? tool.description : 'Detailed information about AI tools'
          }
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20 pb-16 bg-gradient-to-b from-background to-muted/10">
          <div className="container px-4 md:px-8 mx-auto py-8">
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                className="mb-6 group transition-all duration-300 hover:translate-x-[-5px] text-muted-foreground hover:text-foreground"
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
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <Skeleton className="h-64 w-full rounded-xl" />
                      <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                    <div>
                      <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                  </div>
                </div>
              ) : error ? (
                <Card className="p-6 text-center border-0 bg-red-50/50 dark:bg-red-900/10 rounded-xl soft-shadow">
                  <h2 className="text-xl font-medium mb-2 text-red-500">
                    Error loading tool details
                  </h2>
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  <Button onClick={handleBackClick}>Return to Tools</Button>
                </Card>
              ) : tool ? (
                <div className="animate-fade-in">
                  <div className="mb-8 p-8 md:p-10">
                    <div className="flex flex-wrap gap-3 items-center mb-6">
                      {tool.featured && (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 font-medium flex items-center px-2 py-1 rounded-full"
                        >
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {tool.category.map((cat, idx) => (
                          <Link
                            key={idx}
                            to={`/tools?category=${encodeURIComponent(cat)}`}
                            className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/70 hover:bg-secondary text-secondary-foreground transition-colors flex items-center"
                          >
                            {cat}
                          </Link>
                        ))}
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getPricingColor(
                            tool.pricing
                          )} flex items-center`}
                        >
                          <DollarSign className="h-3 w-3 mr-1" />
                          {tool.pricing}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                      <div className="lg:col-span-8">
                        <div className="space-y-4">
                          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-gradient">
                            {tool.name}
                          </h1>
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {tool.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 pt-4">
                            <Button
                              size="lg"
                              className="transition-all hover:translate-y-[-2px] shadow-sm hover:shadow-md rounded-xl bg-primary text-white flex items-center gap-2"
                              onClick={() => handleVisitWebsite(tool.url)}
                            >
                              Visit Website
                              <ExternalLink className="h-4 w-4" />
                            </Button>

                            <ShareButton
                              toolId={tool.id}
                              toolName={tool.name}
                              toolUrl={tool.url}
                              className="ml-2"
                            />

                            <div
                              className="py-2 px-3 rounded-xl border border-border/40 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <VoteButtons toolId={tool.id} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="order-first lg:order-last lg:col-span-4">
                        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary/20 to-secondary/5 aspect-video transition-transform duration-300 hover:scale-[1.02] soft-shadow">
                          {!isImageLoaded && !isImageError && (
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-muted/30">
                              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                            </div>
                          )}

                          {isImageError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30 text-muted-foreground">
                              <ImageOff className="h-10 w-10 mb-2 opacity-70" />
                              <p className="text-sm">Image not available</p>
                            </div>
                          ) : (
                            <div
                              className="cursor-pointer"
                              onClick={() => setIsImageModalOpen(true)}
                            >
                              <img
                                src={tool.imageUrl}
                                alt={tool.name}
                                className={cn(
                                  'w-full h-full object-cover transition-opacity duration-500',
                                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                                )}
                                onLoad={() => setIsImageLoaded(true)}
                                onError={() => {
                                  setIsImageError(true);
                                  setIsImageLoaded(true);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                      <div className="space-y-8">
                        <div className="p-6 md:p-8">
                          <ReviewsList toolId={tool.id} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4 p-4 rounded-xl bg-secondary/5 border border-border/10 hover:border-border/20">
                        <h2 className="text-lg font-semibold px-2">
                          Quick Actions
                        </h2>
                        <div className="space-y-3">
                          <Button
                            variant="default"
                            className="action-button"
                            onClick={() => handleVisitWebsite(tool.url)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit Website
                          </Button>

                          <ShareButton
                            toolId={tool.id}
                            toolName={tool.name}
                            toolUrl={tool.url}
                            className="action-button"
                            showText={true}
                          />

                          <Button
                            variant="outline"
                            className="action-button"
                            onClick={handleBackClick}
                          >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to all tools
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4 p-4 rounded-xl bg-secondary/5 border border-border/10 hover:border-border/20 mb-6">
                        <div className="flex items-center gap-2 px-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <h2 className="text-lg font-semibold">Tags</h2>
                        </div>
                        <div className="flex flex-wrap gap-2 px-2">
                          {tool.tags.map((tag, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="flex items-center text-xs px-3 py-1.5 rounded-xl hover:bg-secondary/80 transition-colors cursor-default"
                            >
                              <Tag className="h-3 w-3 mr-1.5" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4 p-4 rounded-xl bg-secondary/5 border border-border/10 hover:border-border/20">
                        <div className="flex items-center gap-2 px-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <h2 className="text-lg font-semibold">
                            Related Tools
                          </h2>
                        </div>
                        <div className="space-y-2">
                          {relatedLoading ? (
                            <div className="space-y-4">
                              <Skeleton className="h-20 w-full rounded-lg" />
                              <Skeleton className="h-20 w-full rounded-lg" />
                              <Skeleton className="h-20 w-full rounded-lg" />
                            </div>
                          ) : filteredRelatedTools.length > 0 ? (
                            <div className="space-y-2">
                              {filteredRelatedTools.map((relatedTool) => (
                                <div key={relatedTool.id} className="group">
                                  <Link
                                    to={`/tools/${relatedTool.id}`}
                                    className="flex items-start space-x-3 p-3 rounded-xl hover:bg-secondary/30 transition-colors border border-transparent hover:border-border/40 hover-scale-animation"
                                  >
                                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-secondary/20 flex-shrink-0">
                                      <img
                                        src={relatedTool.imageUrl}
                                        alt={relatedTool.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          (
                                            e.target as HTMLImageElement
                                          ).style.display = 'none';
                                          const parent = (
                                            e.target as HTMLImageElement
                                          ).parentElement;
                                          if (parent) {
                                            const fallback =
                                              document.createElement('div');
                                            fallback.className =
                                              'h-full w-full flex items-center justify-center bg-secondary/40';
                                            fallback.innerHTML =
                                              '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
                                            parent.appendChild(fallback);
                                          }
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <h3 className="font-medium group-hover:text-primary transition-colors">
                                        {relatedTool.name}
                                      </h3>
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {relatedTool.description}
                                      </p>
                                      <div className="mt-1 flex flex-wrap gap-1">
                                        {relatedTool.category
                                          .slice(0, 2)
                                          .map((cat, idx) => (
                                            <span
                                              key={idx}
                                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/50 text-secondary-foreground"
                                            >
                                              {cat}
                                            </span>
                                          ))}
                                      </div>
                                    </div>
                                  </Link>
                                  {filteredRelatedTools.indexOf(relatedTool) <
                                    filteredRelatedTools.length - 1 && (
                                    <Separator className="my-2 opacity-30" />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center bg-secondary/10 rounded-lg">
                              <p className="text-sm text-muted-foreground">
                                No related tools found
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Card className="p-6 text-center rounded-xl soft-shadow">
                  <h2 className="text-xl font-medium mb-2">Tool not found</h2>
                  <p className="text-muted-foreground mb-4">
                    The requested AI tool could not be found.
                  </p>
                  <Button onClick={handleBackClick}>Browse All Tools</Button>
                </Card>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
      {isImageModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div className="max-w-[90vw] overflow-y-auto">
            <img
              src={tool.imageUrl}
              alt={tool.name}
              className="rounded-lg object-contain max-h-[80vh] max-w-full w-full"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ToolDetails;

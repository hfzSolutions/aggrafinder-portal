import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, ExternalLink, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSupabaseToolsByIds } from '@/hooks/useSupabaseToolsByIds';
import { AITool } from '@/types/tools';
import { cn } from '@/lib/utils';

const CompareTools = () => {
  const { ids } = useParams<{ ids: string }>();
  const [tools, setTools] = useState<AITool[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isImageLoadedMap, setIsImageLoadedMap] = useState<
    Record<string, boolean>
  >({});

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

                <Separator />

                {/* Comparison table */}
                <div className="rounded-lg border overflow-hidden">
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

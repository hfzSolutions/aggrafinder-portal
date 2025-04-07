import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolCard } from '@/components/tools/ToolCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/ui/SearchBar';
import FilterButton from '@/components/ui/FilterButton';
import { ArrowLeft, Sliders, Plus, Grid, List } from 'lucide-react';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { pricingOptions } from '@/data/toolsData';
import { CompareToolsBar } from '@/components/tools/CompareToolsBar';
import { useIsMobile } from '@/hooks/use-mobile';

const Tools = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('list');

  const { categories, loading: categoriesLoading } = useSupabaseCategories();
  const {
    tools: filteredTools,
    loading: toolsLoading,
    error,
    hasMore,
    loadNextPage,
  } = useSupabaseTools({
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: searchTerm,
    pricing: selectedPricing !== 'All' ? selectedPricing : undefined,
    loadMore: true,
  });

  const observer = useRef<IntersectionObserver | null>(null);

  const lastToolElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (toolsLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadNextPage();
          }
        },
        {
          rootMargin: '100px',
        }
      );

      if (node) observer.current.observe(node);
    },
    [toolsLoading, hasMore, loadNextPage]
  );

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (activeCategory !== 'All') params.set('category', activeCategory);

    const newUrl = `${location.pathname}${
      params.toString() ? '?' + params.toString() : ''
    }`;
    navigate(newUrl, { replace: true });
  }, [
    searchTerm,
    activeCategory,
    selectedPricing,
    navigate,
    location.pathname,
  ]);

  useEffect(() => {
    if (isMobile) {
      setView('list');
    }
  }, [isMobile]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePricingChange = (pricing: string) => {
    setSelectedPricing(pricing);
  };

  const isLoading =
    categoriesLoading || (toolsLoading && filteredTools.length === 0);

  return (
    <>
      <Helmet>
        <title>AI Tools Collection | AI Aggregator</title>
        <meta
          name="description"
          content="Browse our comprehensive collection of AI tools across various categories. Find the perfect tool for your specific needs."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20 pb-20">
          <div className="bg-secondary/30 border-b border-border/20">
            <div className="container px-4 md:px-8 mx-auto py-12 md:py-16">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-medium mb-4 animate-fade-in">
                  AI Tools Collection
                </h1>
                <p className="text-muted-foreground mb-8 animate-fade-in">
                  Browse our comprehensive collection of AI tools across various
                  categories. Find the perfect tool for your specific needs.
                </p>
              </div>
            </div>
          </div>

          <div className="container px-4 md:px-8 mx-auto py-8">
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full justify-between"
              >
                <span className="flex items-center">
                  <Sliders className="h-4 w-4 mr-2" />
                  Filters
                </span>
                <span className="bg-secondary rounded-full px-2 py-0.5 text-xs">
                  {filteredTools.length}
                </span>
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div
                className={`lg:w-1/4 ${
                  isFilterOpen || window.innerWidth >= 1024 ? 'block' : 'hidden'
                }`}
              >
                <div className="sticky top-24 space-y-6">
                  <div className="animate-slide-up">
                    <SearchBar
                      initialValue={searchTerm}
                      onSearch={handleSearch}
                      placeholder="Search AI tools..."
                      className="w-full"
                    />
                  </div>

                  <div className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-4">
                    <h3 className="font-medium">Filters</h3>
                    
                    <div className="space-y-3">
                      <FilterButton
                        label="Category"
                        options={categoriesLoading ? ['Loading...'] : categories}
                        selectedOption={activeCategory}
                        onChange={handleCategoryChange}
                        disabled={categoriesLoading}
                        className="w-full"
                      />

                      <FilterButton
                        label="Pricing"
                        options={pricingOptions}
                        selectedOption={selectedPricing}
                        onChange={handlePricingChange}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="text-sm text-muted-foreground pt-2">
                      {isLoading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        <>
                          {filteredTools.length}{' '}
                          {filteredTools.length === 1 ? 'tool' : 'tools'} found
                        </>
                      )}
                    </div>
                  </div>

                  {!isMobile && (
                    <div className="flex p-4 rounded-lg border border-border/50 bg-background/50">
                      <div className="flex space-x-2 w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 flex-1 ${
                            view === 'list' ? 'bg-secondary/70' : ''
                          }`}
                          onClick={() => setView('list')}
                        >
                          <List className="h-4 w-4 mr-2" />
                          List
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`px-3 flex-1 ${
                            view === 'grid' ? 'bg-secondary/70' : ''
                          }`}
                          onClick={() => setView('grid')}
                        >
                          <Grid className="h-4 w-4 mr-2" />
                          Grid
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-3/4">
                {searchTerm && (
                  <div className="mb-4 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setSearchTerm('');
                        navigate('/tools');
                      }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Clear search
                    </Button>
                    <span className="ml-2 text-sm">
                      Results for "
                      <span className="font-medium">{searchTerm}</span>"
                    </span>
                  </div>
                )}

                {error && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2 text-red-500">
                      Error loading tools
                    </h3>
                    <p className="text-muted-foreground">{error.message}</p>
                    <Button
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try again
                    </Button>
                  </div>
                )}

                {isLoading && (
                  <div
                    className={
                      view === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'grid grid-cols-1 gap-4'
                    }
                  >
                    {Array(8)
                      .fill(0)
                      .map((_, index) => (
                        <div key={`skeleton-${index}`} className="space-y-3">
                          {view === 'grid' ? (
                            <>
                              <Skeleton className="h-48 w-full rounded-lg" />
                              <Skeleton className="h-6 w-3/4" />
                              <Skeleton className="h-16 w-full" />
                              <div className="flex gap-2">
                                <Skeleton className="h-6 w-16 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                              </div>
                            </>
                          ) : (
                            <div className="flex items-start gap-4 p-4 border rounded-lg">
                              <Skeleton className="h-24 w-24 flex-shrink-0 rounded-lg" />
                              <div className="flex-grow space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="flex gap-2 pt-2">
                                  <Skeleton className="h-6 w-16 rounded-full" />
                                  <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {!isLoading && filteredTools.length === 0 && !error && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No tools found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your filters or search term to find what
                      you're looking for.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => {
                          setSearchTerm('');
                          setActiveCategory('All');
                          setSelectedPricing('All');
                        }}
                      >
                        Reset filters
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/request-tool')}
                      >
                        Request a new tool
                      </Button>
                    </div>
                  </div>
                )}

                {!isLoading && filteredTools.length > 0 && !error && (
                  <div
                    className={
                      view === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'grid grid-cols-1 gap-4'
                    }
                  >
                    {filteredTools.map((tool, index) => (
                      <div
                        key={tool.id}
                        ref={
                          index === filteredTools.length - 1
                            ? lastToolElementRef
                            : null
                        }
                        className="animate-fade-in"
                      >
                        <ToolCard tool={tool} viewType={isMobile ? 'list' : view} />
                      </div>
                    ))}

                    {toolsLoading && filteredTools.length > 0 && (
                      <div
                        className={`col-span-full flex justify-center py-4 ${
                          view === 'grid' ? 'mt-4' : 'mt-2'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                          <span className="text-sm text-muted-foreground">
                            Loading more tools...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <CompareToolsBar />
        <Footer />
      </div>
    </>
  );
};

export default Tools;

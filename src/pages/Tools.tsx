import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolCard } from '@/components/tools/ToolCard';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/ui/SearchBar';
import FilterButton from '@/components/ui/FilterButton';
import InlineSubscription from '@/components/tools/InlineSubscription';
import {
  ArrowLeft,
  Sliders,
  Trash2,
  Grid,
  List,
  Heart,
  Clock,
  ArrowUpDown,
  Star,
  Loader2,
  ImageOff,
  ExternalLink,
  Zap,
  Plus,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { useSupabaseCategories } from '@/hooks/useSupabaseCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { pricingOptions } from '@/data/toolsData';
import { CompareToolsBar } from '@/components/tools/CompareToolsBar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavoriteTools } from '@/hooks/useFavoriteTools';
import { useRecentlyViewedTools } from '@/hooks/useRecentlyViewedTools';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import { toast } from 'sonner';
import { SponsorAdCard } from '@/components/tools/SponsorAdCard';
import QuickToolsSection from '@/components/tools/QuickToolsSection';
import HeroCard from '@/components/tools/HeroCard';
import CategoryCarousel from '@/components/tools/CategoryCarousel';

const Tools = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialToolType =
    (searchParams.get('type') as 'all' | 'quick' | 'external') || 'all';
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>(() => {
    const storedView = localStorage.getItem('preferred_view') as
      | 'grid'
      | 'list';
    return storedView || 'grid'; // Default to grid if no preference is stored
  });

  const [sortOption, setSortOption] = useState<'newest' | 'popular' | 'random'>(
    'random'
  );
  const [showFavorites, setShowFavorites] = useState(false);
  const [selectedFeaturedTool, setSelectedFeaturedTool] = useState<any | null>(
    null
  );
  const [toolType, setToolType] = useState<'all' | 'quick' | 'external'>(
    initialToolType
  );
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track scroll position for tab styling
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // QuickToolsSection will use the same view state as the main tools

  const { favoriteTools, addFavorite, removeFavorite, isFavorite } =
    useFavoriteTools();

  const {
    recentlyViewedTools,
    addRecentlyViewed,
    clearRecentlyViewed,
    isLoading: recentToolsLoading,
  } = useRecentlyViewedTools();

  const { trackEvent } = useToolAnalytics();

  const { categories, loading: categoriesLoading } = useSupabaseCategories();

  // Separate calls for quick tools and external tools
  const {
    tools: quickToolsData,
    loading: quickToolsLoading,
    error: quickToolsError,
    hasMore: hasMoreQuickTools,
    loadNextQuickToolsPage,
    quickTools,
  } = useSupabaseTools({
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: searchTerm,
    pricing: selectedPricing !== 'All' ? selectedPricing : undefined,
    loadMore: true,
    toolType: 'quick', // Specifically fetch quick tools
    ...(showFavorites &&
      favoriteTools.length > 0 && {
        customQuery: (query) => query.in('id', favoriteTools),
      }),
    sortBy:
      sortOption === 'popular'
        ? 'popularity'
        : sortOption === 'newest'
        ? 'created_at'
        : sortOption === 'random'
        ? 'random'
        : 'random', // Default to random sorting
  });

  const {
    tools: externalToolsData,
    loading: externalToolsLoading,
    error: externalToolsError,
    hasMore: hasMoreExternalTools,
    loadNextExternalToolsPage,
    externalTools,
  } = useSupabaseTools({
    category: activeCategory !== 'All' ? activeCategory : undefined,
    search: searchTerm,
    pricing: selectedPricing !== 'All' ? selectedPricing : undefined,
    loadMore: true,
    toolType: 'external', // Specifically fetch external tools
    ...(showFavorites &&
      favoriteTools.length > 0 && {
        customQuery: (query) => query.in('id', favoriteTools),
      }),
    sortBy:
      sortOption === 'popular'
        ? 'popularity'
        : sortOption === 'newest'
        ? 'created_at'
        : sortOption === 'random'
        ? 'random'
        : 'random', // Default to random sorting
  });

  // Combined values for backward compatibility
  const filteredTools =
    toolType === 'quick'
      ? quickToolsData
      : toolType === 'external'
      ? externalToolsData
      : [...quickToolsData, ...externalToolsData];
  const toolsLoading =
    toolType === 'quick' || toolType === 'all'
      ? quickToolsLoading
      : externalToolsLoading;
  const error = quickToolsError || externalToolsError;
  const hasMore =
    toolType === 'quick'
      ? hasMoreQuickTools
      : toolType === 'external'
      ? hasMoreExternalTools
      : hasMoreQuickTools || hasMoreExternalTools;
  // Removed loadNextPage variable as it's not being used

  // Removed infinite scroll observer in favor of a 'See More' button approach
  // This gives users more control over when to load additional content

  // Effect to update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (selectedPricing !== 'All') params.set('pricing', selectedPricing);
    if (toolType !== 'all') params.set('tool_type', toolType);

    const newUrl = `${location.pathname}${
      params.toString() ? '?' + params.toString() : ''
    }`;
    navigate(newUrl, { replace: true });
  }, [
    searchTerm,
    activeCategory,
    selectedPricing,
    toolType,
    navigate,
    location.pathname,
  ]);

  // Effect to sync URL params with state when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const searchParam = params.get('search');
    const pricingParam = params.get('pricing');
    const typeParam = params.get('type') as 'all' | 'quick' | 'external';

    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }

    if (searchParam && searchParam !== searchTerm) {
      setSearchTerm(searchParam);
    }

    if (pricingParam && pricingParam !== selectedPricing) {
      setSelectedPricing(pricingParam);
    }

    if (typeParam && typeParam !== toolType) {
      setToolType(typeParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (isMobile) {
      setView('list');
    }
  }, [isMobile]);

  // Save view preference to localStorage when it changes
  useEffect(() => {
    if (!isMobile) {
      // Only save preference when not on mobile
      localStorage.setItem('preferred_view', view);
    }
  }, [view, isMobile]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handlePricingChange = (pricing: string) => {
    setSelectedPricing(pricing);
  };

  const handleFavoriteToggle = (toolId: string, isFavorite: boolean) => {
    if (isFavorite) {
      addFavorite(toolId);
    } else {
      removeFavorite(toolId);
    }

    trackEvent(toolId, 'favorite_toggle', { isFavorite });
  };

  const getSubscriptionIndex = () => {
    if (toolType === 'quick') {
      if (quickTools.length <= 3) return null;
      return Math.min(8, Math.floor(quickTools.length / 2));
    } else if (toolType === 'external') {
      if (externalTools.length <= 3) return null;
      return Math.min(8, Math.floor(externalTools.length / 2));
    } else {
      // For 'all' type
      const totalTools = quickTools.length + externalTools.length;
      if (totalTools <= 3) return null;
      return Math.min(8, Math.floor(totalTools / 2));
    }
  };

  const subscriptionIndex = getSubscriptionIndex();

  const isLoading =
    categoriesLoading || (toolsLoading && filteredTools.length === 0);

  return (
    <>
      <Helmet>
        <title>DeepListAI | Find the Best AI Tools for Your Needs</title>
        <meta
          name="description"
          content="Discover the most powerful and innovative AI tools to enhance your productivity, creativity, and workflow. Find the perfect AI solution for your specific needs."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20 pb-20">
          {/* <div className="bg-secondary/30 border-b border-border/20">
            <div className="container px-3 md:px-8 mx-auto py-5 md:py-10">
              <div className="max-w-3xl">
                <h1 className="text-2xl md:text-4xl font-medium mb-2 md:mb-3 animate-fade-in">
                  AI Tools Collection
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mb-0 animate-fade-in max-w-2xl">
                  Browse our comprehensive collection of AI tools across various
                  categories. Find the perfect tool for your specific needs.
                </p>
              </div>
            </div>
          </div> */}

          <div className="container px-3 md:px-8 mx-auto py-4 md:py-8">
            {recentlyViewedTools.length > 0 && (
              <div className="mb-4 md:mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm md:text-base font-medium flex items-center text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1 text-muted-foreground/70" />
                    Recently viewed
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearRecentlyViewed();
                      toast.success('Recently viewed tools cleared');
                    }}
                    className="text-xs px-2 py-0.5 h-auto text-muted-foreground hover:text-foreground"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>

                <div className="flex overflow-x-auto pb-1 gap-2 md:gap-3 hide-scrollbar">
                  {recentToolsLoading
                    ? Array(4)
                        .fill(0)
                        .map((_, index) => (
                          <div
                            key={`recent-skeleton-${index}`}
                            className="flex-shrink-0 w-36 md:w-44 animate-pulse"
                          >
                            <div className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-background">
                              <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
                              <div className="flex-1">
                                <Skeleton className="h-3.5 w-full mb-1" />
                                <Skeleton className="h-2.5 w-2/3" />
                              </div>
                            </div>
                          </div>
                        ))
                    : recentlyViewedTools.map((tool) => (
                        <div
                          key={`recent-${tool.id}`}
                          className="flex-shrink-0 w-36 md:w-44 animate-fade-in"
                          onClick={() => {
                            if (tool.tool_type === 'quick') {
                              navigate(`/quick-tools/${tool.id}`);
                            } else {
                              navigate(`/tools/${tool.id}`);
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 p-2 rounded-lg border border-border/40 bg-background hover:border-primary/20 hover:shadow-sm transition-all duration-200 cursor-pointer">
                            {tool.imageUrl ? (
                              <img
                                src={tool.imageUrl}
                                alt={tool.name}
                                className="h-8 w-8 rounded-md object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                  (
                                    e.target as HTMLImageElement
                                  ).nextElementSibling!.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className={`h-8 w-8 rounded-md flex-shrink-0 items-center justify-center bg-secondary/50 ${
                                tool.imageUrl ? 'hidden' : 'flex'
                              }`}
                            >
                              <ImageOff className="h-4 w-4 text-muted-foreground/70" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h3 className="text-xs font-medium truncate">
                                {tool.name}
                              </h3>
                              <span className="text-[10px] text-muted-foreground truncate block">
                                {tool.pricing}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            )}

            <div className="lg:hidden mb-3">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full justify-between py-2 h-auto"
              >
                <span className="flex items-center">
                  <Sliders className="h-3.5 w-3.5 mr-1.5" />
                  Filters
                </span>
                <span className="bg-secondary rounded-full px-1.5 py-0.5 text-xs">
                  {filteredTools.length}
                </span>
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:gap-6">
              <div
                className={`lg:w-1/4 ${
                  isFilterOpen || window.innerWidth >= 1024 ? 'block' : 'hidden'
                }`}
              >
                <div className="sticky top-20 space-y-3 lg:space-y-6">
                  <div className="animate-slide-up">
                    <SearchBar
                      initialValue={searchTerm}
                      onSearch={handleSearch}
                      placeholder="Search AI tools..."
                      className="w-full"
                    />
                  </div>

                  <div className="p-3 md:p-4 rounded-lg border border-border/50 bg-background/50 space-y-3 md:space-y-4">
                    <h3 className="text-sm md:text-base font-medium">
                      Filters
                    </h3>

                    {categoriesLoading ? (
                      <div className="space-y-3 animate-pulse">
                        <div>
                          <Skeleton className="h-3 md:h-4 w-16 mb-1 md:mb-2" />
                          <Skeleton className="h-8 md:h-10 w-full" />
                        </div>
                        <div>
                          <Skeleton className="h-3 md:h-4 w-16 mb-1 md:mb-2" />
                          <Skeleton className="h-8 md:h-10 w-full" />
                        </div>
                        <div>
                          <Skeleton className="h-3 md:h-4 w-16 mb-1 md:mb-2" />
                          <Skeleton className="h-8 md:h-10 w-full" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 md:space-y-3 animate-fade-in">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5">
                            Tool Type
                          </p>
                          <div className="flex flex-wrap gap-2 w-full mb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`px-3 flex-1 ${
                                toolType === 'all'
                                  ? 'bg-secondary/70 border-primary/30'
                                  : ''
                              }`}
                              onClick={() => setToolType('all')}
                            >
                              All Tools
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`px-3 flex-1 ${
                                toolType === 'quick'
                                  ? 'bg-secondary/70 border-primary/30'
                                  : ''
                              }`}
                              onClick={() => setToolType('quick')}
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Quick
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`px-3 flex-1 ${
                                toolType === 'external'
                                  ? 'bg-secondary/70 border-primary/30'
                                  : ''
                              }`}
                              onClick={() => setToolType('external')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              External
                            </Button>
                          </div>
                        </div>

                        <FilterButton
                          label="Category"
                          options={categories}
                          selectedOption={activeCategory}
                          onChange={handleCategoryChange}
                          className="w-full"
                        />

                        <FilterButton
                          label="Pricing"
                          options={pricingOptions}
                          selectedOption={selectedPricing}
                          onChange={handlePricingChange}
                          className="w-full"
                        />

                        {/* Favorites filter removed as per requirement */}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start mt-2 md:mt-4 text-xs md:text-sm py-1 md:py-2 h-auto"
                          onClick={() => {
                            setActiveCategory('All');
                            setSelectedPricing('All');
                            setSearchTerm('');
                            setShowFavorites(false);
                            setSortOption('random');
                            setToolType('all');
                            setView('grid'); // Changed from 'list' to 'grid' to maintain grid as default
                            // Reset URL to clean state
                            navigate('/', { replace: true });
                            toast.success('All filters cleared');
                          }}
                        >
                          <Trash2 className="h-3 md:h-4 w-3 md:w-4 mr-1 md:mr-2" />
                          Clear all filters
                        </Button>
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground pt-2">
                      {isLoading ? (
                        <Skeleton className="h-4 w-20" />
                      ) : (
                        <>
                          {toolType === 'quick'
                            ? quickTools.length
                            : toolType === 'external'
                            ? externalTools.length
                            : quickTools.length + externalTools.length}{' '}
                          {(toolType === 'quick'
                            ? quickTools.length
                            : toolType === 'external'
                            ? externalTools.length
                            : quickTools.length + externalTools.length) === 1
                            ? 'tool'
                            : 'tools'}{' '}
                          found
                        </>
                      )}
                    </div>
                  </div>

                  {!isMobile && (
                    <div className="space-y-3">
                      <div className="flex p-4 rounded-lg border border-border/50 bg-background/50">
                        <div className="flex space-x-2 w-full">
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
                        </div>
                      </div>

                      <div className="p-4 rounded-lg border border-border/50 bg-background/50 space-y-2">
                        <h3 className="text-sm font-medium flex items-center">
                          <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                          Sort by
                        </h3>
                        <div className="flex flex-wrap gap-2 w-full">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 flex-1 ${
                              sortOption === 'random' ? 'bg-secondary/70' : ''
                            }`}
                            onClick={() => setSortOption('random')}
                          >
                            Random
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 flex-1 ${
                              sortOption === 'newest' ? 'bg-secondary/70' : ''
                            }`}
                            onClick={() => setSortOption('newest')}
                          >
                            Newest
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`px-3 flex-1 ${
                              sortOption === 'popular' ? 'bg-secondary/70' : ''
                            }`}
                            onClick={() => setSortOption('popular')}
                          >
                            Popular
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:w-3/4">
                {/* Tab component removed - now using filter buttons for tool type selection */}
                {searchTerm && (
                  <div className="mb-4 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground"
                      onClick={() => {
                        setSearchTerm('');
                        navigate('/');
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

                {<HeroCard isMobile={isMobile} />}

                {isLoading && (
                  <div
                    className={
                      view === 'grid'
                        ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'
                        : 'grid grid-cols-1 gap-3 md:gap-4'
                    }
                  >
                    {Array(isMobile ? 6 : 8)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={`skeleton-${index}`}
                          className="space-y-2 md:space-y-3"
                        >
                          {view === 'grid' || isMobile ? (
                            <>
                              <Skeleton className="h-32 md:h-48 w-full rounded-lg" />
                              <Skeleton className="h-5 md:h-6 w-3/4" />
                              <Skeleton className="h-10 md:h-16 w-full" />
                              <div className="flex gap-1 md:gap-2">
                                <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full" />
                                <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full" />
                              </div>
                            </>
                          ) : (
                            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-4 border rounded-lg">
                              <Skeleton className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-lg" />
                              <div className="flex-grow space-y-1 md:space-y-2">
                                <Skeleton className="h-5 md:h-6 w-3/4" />
                                <Skeleton className="h-3 md:h-4 w-full" />
                                <Skeleton className="h-3 md:h-4 w-2/3" />
                                <div className="flex gap-1 md:gap-2 pt-1 md:pt-2">
                                  <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full" />
                                  <Skeleton className="h-5 md:h-6 w-12 md:w-16 rounded-full" />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {!isLoading &&
                  ((toolType === 'all' &&
                    quickTools.length === 0 &&
                    externalTools.length === 0) ||
                    (toolType === 'quick' && quickTools.length === 0) ||
                    (toolType === 'external' && externalTools.length === 0)) &&
                  !error && (
                    <div className="text-center py-6 md:py-12">
                      <h3 className="text-base md:text-lg font-medium mb-1 md:mb-2">
                        No{' '}
                        {toolType === 'quick'
                          ? 'quick'
                          : toolType === 'external'
                          ? 'external'
                          : ''}{' '}
                        tools found
                      </h3>
                      <p className="text-sm md:text-base text-muted-foreground">
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
                      </div>
                    </div>
                  )}

                {/* Category quick selection carousel */}
                {!isLoading && (
                  <div className="mt-4 mb-6 px-1">
                    <CategoryCarousel
                      categories={categories}
                      activeCategory={activeCategory}
                      onCategoryChange={handleCategoryChange}
                      className="w-full"
                    />
                  </div>
                )}

                {/* Show Quick Tools section if viewing all tools or specifically quick tools */}
                {(toolType === 'all' || toolType === 'quick') && !isLoading && (
                  <div className="mt-8">
                    <QuickToolsSection
                      category={
                        activeCategory !== 'All' ? activeCategory : undefined
                      }
                      searchTerm={searchTerm}
                      showHeader={true}
                      isHomePage={true}
                      showAllTools={toolType === 'quick'}
                      tools={quickTools}
                      view={view}
                      isMobile={isMobile}
                      setToolType={setToolType}
                    />
                  </div>
                )}
                {/* Only show external tools section if viewing all tools or specifically external tools */}
                {(toolType === 'all' || toolType === 'external') &&
                  !isLoading &&
                  externalTools.length > 0 && (
                    <>
                      {(toolType === 'all' || toolType === 'external') && (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 mt-8">
                          <div>
                            <h2 className="text-lg md:text-xl font-semibold mb-1 flex items-center">
                              <ExternalLink className="h-4 w-4 mr-2 text-primary" />
                              External Tools
                              <Badge
                                variant="outline"
                                className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0 h-5"
                              >
                                Third-party
                              </Badge>
                            </h2>
                            <p className="text-xs text-muted-foreground max-w-2xl">
                              Curated collection of external AI tools from
                              around the web
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-3 md:mt-0">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="h-8 text-xs px-3 border-primary/30 text-primary hover:bg-primary/10"
                            >
                              <Link to="/dashboard">
                                <Plus className="mr-1.5 h-3.5 w-3.5" />
                                Add External Tool
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                      <div
                        className={
                          view === 'grid'
                            ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6'
                            : 'grid grid-cols-1 gap-2 md:gap-4'
                        }
                      >
                        {externalTools.map((tool, index) => {
                          // Insert sponsor ad after the 4th tool
                          if (index === 4) {
                            return (
                              <>
                                <div key={`tool-${tool.id}`}>
                                  <ToolCard
                                    tool={tool}
                                    viewType={isMobile ? 'list' : view}
                                    onFavoriteToggle={handleFavoriteToggle}
                                    isFavorite={isFavorite(tool.id)}
                                    compact={isMobile}
                                  />
                                </div>
                                <div key="sponsor-ad">
                                  <SponsorAdCard viewType={view} />
                                </div>
                              </>
                            );
                          }

                          if (index === 12) {
                            return (
                              <>
                                <div key={`tool-${tool.id}`}>
                                  <ToolCard
                                    tool={tool}
                                    viewType={isMobile ? 'list' : view}
                                    onFavoriteToggle={handleFavoriteToggle}
                                    isFavorite={isFavorite(tool.id)}
                                    compact={isMobile}
                                  />
                                </div>
                                <div key="subscription">
                                  <InlineSubscription
                                    viewType={view}
                                    compact={isMobile}
                                  />
                                </div>
                              </>
                            );
                          }

                          return (
                            <div key={`tool-${tool.id}`}>
                              <ToolCard
                                tool={tool}
                                viewType={isMobile ? 'list' : view}
                                onFavoriteToggle={handleFavoriteToggle}
                                isFavorite={isFavorite(tool.id)}
                                compact={isMobile}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                {/* Load More Button for External Tools - Only shown when viewing external tools or all tools and there are more external tools */}
                {!isLoading &&
                  externalTools.length > 0 &&
                  hasMoreExternalTools &&
                  (toolType === 'external' || toolType === 'all') && (
                    <div className="flex justify-center mt-4 md:mt-8">
                      <Button
                        variant="outline"
                        size={isMobile ? 'sm' : 'lg'}
                        onClick={() => {
                          if (!externalToolsLoading && hasMoreExternalTools) {
                            loadNextExternalToolsPage();
                          }
                        }}
                        disabled={externalToolsLoading}
                        className="w-full max-w-md py-1.5 md:py-2"
                      >
                        {externalToolsLoading ? (
                          <>
                            <Loader2 className="mr-1.5 md:mr-2 h-3.5 md:h-4 w-3.5 md:w-4 animate-spin" />
                            Loading more external tools...
                          </>
                        ) : (
                          'Load more external tools'
                        )}
                      </Button>
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

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
  ArrowDown,
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
  Globe,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
  // Country filtering is now automatic when tools are submitted - no URL param needed
  const initialToolType =
    (searchParams.get('type') as 'quick' | 'external') || 'quick'; // Default to 'quick' tab
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedPricing, setSelectedPricing] = useState('All');
  // Country filter is now automatic - removed UI state
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
  const [toolType, setToolType] = useState<'quick' | 'external'>(
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
    // Country filtering removed from UI - handled automatically when tools are submitted
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
    // Country filtering removed from UI - handled automatically when tools are submitted
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
    toolType === 'quick' ? quickToolsData : externalToolsData;
  const toolsLoading =
    toolType === 'quick' ? quickToolsLoading : externalToolsLoading;
  const error = quickToolsError || externalToolsError;
  const hasMore =
    toolType === 'quick' ? hasMoreQuickTools : hasMoreExternalTools;
  // Removed loadNextPage variable as it's not being used

  // Removed infinite scroll observer in favor of a 'See More' button approach
  // This gives users more control over when to load additional content

  // Effect to update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (activeCategory !== 'All') params.set('category', activeCategory);
    if (selectedPricing !== 'All') params.set('pricing', selectedPricing);
    // Country filtering removed from URL - handled automatically
    if (toolType !== 'quick') params.set('type', toolType); // Default to 'quick' tab

    const newUrl = `${location.pathname}${
      params.toString() ? '?' + params.toString() : ''
    }`;
    navigate(newUrl, { replace: true });
  }, [
    searchTerm,
    activeCategory,
    selectedPricing,
    // Country dependency removed
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
    // Country param handling removed - no longer used in UI
    const typeParam = params.get('type') as 'quick' | 'external';

    if (categoryParam && categoryParam !== activeCategory) {
      setActiveCategory(categoryParam);
    }

    if (searchParam && searchParam !== searchTerm) {
      setSearchTerm(searchParam);
    }

    if (pricingParam && pricingParam !== selectedPricing) {
      setSelectedPricing(pricingParam);
    }

    // Country param handling removed

    if (typeParam && typeParam !== toolType) {
      setToolType(typeParam);
    }
  }, [location.search]);

  useEffect(() => {
    if (isMobile) {
      setView('list');
    } else {
      // When transitioning from mobile to desktop, restore the saved preference
      const storedView = localStorage.getItem('preferred_view') as
        | 'grid'
        | 'list';
      setView(storedView || 'grid');
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

  // Country change handler removed - country is now automatic

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
    } else {
      // For 'external' type
      if (externalTools.length <= 3) return null;
      return Math.min(8, Math.floor(externalTools.length / 2));
    }
  };

  const subscriptionIndex = getSubscriptionIndex();

  const isLoading =
    categoriesLoading || (toolsLoading && filteredTools.length === 0);

  return (
    <>
      <Helmet>
        <title>DeepList AI | Find the Best AI Tools for Your Needs</title>
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
                                    (e.target as HTMLImageElement)
                                      .nextElementSibling as HTMLElement
                                  ).style.display = 'flex';
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
                  {toolType === 'quick'
                    ? quickTools.length
                    : externalTools.length}
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

                        {/* Country filter removed - it's now automatically detected when tools are submitted */}
                        {/* Favorites filter removed as per requirement */}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start mt-2 md:mt-4 text-xs md:text-sm py-1 md:py-2 h-auto"
                          onClick={() => {
                            setActiveCategory('All');
                            setSelectedPricing('All');
                            // Country reset removed - handled automatically
                            setSearchTerm('');
                            setShowFavorites(false);
                            setSortOption('random');
                            setToolType('quick'); // Default to quick tab
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
                            : externalTools.length}{' '}
                          {(toolType === 'quick'
                            ? quickTools.length
                            : externalTools.length) === 1
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

                {/* Enhanced Tab-based interface for Quick Tools and External Tools */}
                <div className="w-full space-y-6">
                  {/* Compact Tab Header */}
                  <div className="relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                          AI Tools Collection
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/40"></div>
                          <span>{filteredTools.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compact Tab Navigation */}
                    <div className="relative bg-muted/20 p-1 rounded-lg border border-border/30">
                      <div className="grid grid-cols-2 gap-0.5">
                        <button
                          onClick={() => setToolType('quick')}
                          className={cn(
                            'relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200',
                            toolType === 'quick'
                              ? 'bg-background text-foreground shadow-sm border border-border/40'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                          )}
                        >
                          <Zap
                            className={cn(
                              'h-3 w-3 sm:h-3.5 sm:w-3.5 transition-colors',
                              toolType === 'quick'
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span className="font-medium">Quick Tools</span>
                          <span
                            className={cn(
                              'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                              toolType === 'quick'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-muted/60 text-muted-foreground'
                            )}
                          >
                            {quickTools.length}
                          </span>
                        </button>

                        <button
                          onClick={() => setToolType('external')}
                          className={cn(
                            'relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-200',
                            toolType === 'external'
                              ? 'bg-background text-foreground shadow-sm border border-border/40'
                              : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                          )}
                        >
                          <ExternalLink
                            className={cn(
                              'h-3 w-3 sm:h-3.5 sm:w-3.5 transition-colors',
                              toolType === 'external'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-muted-foreground'
                            )}
                          />
                          <span className="font-medium">External Tools</span>
                          <span
                            className={cn(
                              'ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium transition-colors',
                              toolType === 'external'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-muted/60 text-muted-foreground'
                            )}
                          >
                            {externalTools.length}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Compact Tab Description */}
                    <div className="mt-2 sm:mt-3">
                      {toolType === 'quick' ? (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-blue-500 flex-shrink-0"></div>
                          <span className="leading-relaxed">
                            Interactive tools you can use instantly
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <div className="w-1 h-1 rounded-full bg-green-500 flex-shrink-0"></div>
                          <span className="leading-relaxed">
                            Curated external AI tools and platforms
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Tabs
                    value={toolType}
                    onValueChange={(value) =>
                      setToolType(value as 'quick' | 'external')
                    }
                    className="w-full"
                  >
                    {/* Enhanced Quick Tools Tab Content */}
                    <TabsContent value="quick" className="space-y-6 mt-6">
                      {/* Loading State with improved skeletons */}
                      {isLoading && quickToolsLoading && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-48" />
                          </div>
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
                                  key={`quick-skeleton-${index}`}
                                  className="group animate-pulse"
                                >
                                  {view === 'grid' || isMobile ? (
                                    <div className="space-y-3 p-4 border border-border/40 rounded-xl bg-muted/20">
                                      <Skeleton className="h-32 md:h-40 w-full rounded-lg" />
                                      <Skeleton className="h-5 w-3/4" />
                                      <Skeleton className="h-12 w-full" />
                                      <div className="flex gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-4 p-4 border border-border/40 rounded-xl bg-muted/20">
                                      <Skeleton className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-lg" />
                                      <div className="flex-grow space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
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
                        </div>
                      )}

                      {/* Enhanced Empty State for Quick Tools */}
                      {!isLoading &&
                        quickTools.length === 0 &&
                        !quickToolsError && (
                          <div className="text-center py-12 md:py-16">
                            <div className="max-w-md mx-auto">
                              <div className="relative mb-6">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl flex items-center justify-center shadow-lg">
                                  <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                  <Sparkles className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <h3 className="text-xl font-semibold mb-3 text-foreground">
                                No Quick Tools Found
                              </h3>
                              <p className="text-muted-foreground mb-8 leading-relaxed">
                                {searchTerm ||
                                activeCategory !== 'All' ||
                                selectedPricing !== 'All'
                                  ? 'Try adjusting your filters to discover more tools, or explore our collection of interactive AI utilities.'
                                  : 'Discover powerful interactive AI tools that work directly in your browser. No downloads required!'}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                  onClick={() => {
                                    setSearchTerm('');
                                    setActiveCategory('All');
                                    setSelectedPricing('All');
                                    // Country reset removed - handled automatically
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <ArrowLeft className="h-4 w-4 mr-2" />
                                  Reset Filters
                                </Button>
                                <Button
                                  variant="outline"
                                  asChild
                                  className="border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                                >
                                  <Link to="/dashboard">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Quick Tool
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Quick Tools List */}
                      {!isLoading && quickTools.length > 0 && (
                        <div className="space-y-4">
                          <QuickToolsSection
                            category={
                              activeCategory !== 'All'
                                ? activeCategory
                                : undefined
                            }
                            searchTerm={searchTerm}
                            showHeader={false}
                            showAllTools={true}
                            tools={quickTools}
                            view={view}
                            isMobile={isMobile}
                            setToolType={setToolType}
                          />
                        </div>
                      )}
                    </TabsContent>

                    {/* Enhanced External Tools Tab Content */}
                    <TabsContent value="external" className="space-y-6 mt-6">
                      {/* Loading State with improved skeletons */}
                      {isLoading && externalToolsLoading && (
                        <div className="space-y-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <Skeleton className="h-4 w-48" />
                          </div>
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
                                  key={`external-skeleton-${index}`}
                                  className="group animate-pulse"
                                >
                                  {view === 'grid' || isMobile ? (
                                    <div className="space-y-3 p-4 border border-border/40 rounded-xl bg-muted/20">
                                      <Skeleton className="h-32 md:h-40 w-full rounded-lg" />
                                      <Skeleton className="h-5 w-3/4" />
                                      <Skeleton className="h-12 w-full" />
                                      <div className="flex gap-2">
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                        <Skeleton className="h-6 w-16 rounded-full" />
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start gap-4 p-4 border border-border/40 rounded-xl bg-muted/20">
                                      <Skeleton className="h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-lg" />
                                      <div className="flex-grow space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
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
                        </div>
                      )}

                      {/* Enhanced Empty State for External Tools */}
                      {!isLoading &&
                        externalTools.length === 0 &&
                        !externalToolsError && (
                          <div className="text-center py-12 md:py-16">
                            <div className="max-w-md mx-auto">
                              <div className="relative mb-6">
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center shadow-lg">
                                  <ExternalLink className="h-10 w-10 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <Globe className="h-3 w-3 text-white" />
                                </div>
                              </div>
                              <h3 className="text-xl font-semibold mb-3 text-foreground">
                                No External Tools Found
                              </h3>
                              <p className="text-muted-foreground mb-8 leading-relaxed">
                                {searchTerm ||
                                activeCategory !== 'All' ||
                                selectedPricing !== 'All'
                                  ? 'Try adjusting your filters to discover more tools, or explore our curated collection of AI platforms from around the web.'
                                  : 'Discover powerful AI tools and platforms from around the web. Expand your toolkit with the best external resources!'}
                              </p>
                              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                  onClick={() => {
                                    setSearchTerm('');
                                    setActiveCategory('All');
                                    setSelectedPricing('All');
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <ArrowLeft className="h-4 w-4 mr-2" />
                                  Reset Filters
                                </Button>
                                <Button
                                  variant="outline"
                                  asChild
                                  className="border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                                >
                                  <Link to="/dashboard">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add External Tool
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      {/* External Tools List */}
                      {!isLoading && externalTools.length > 0 && (
                        <div className="space-y-4">
                          <div
                            className={
                              view === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 md:gap-6'
                                : 'grid grid-cols-1 gap-3 md:gap-4'
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

                          {/* Load More Button for External Tools */}
                          {hasMoreExternalTools && (
                            <div className="flex justify-center mt-8 md:mt-12">
                              <Button
                                variant="default"
                                onClick={() => {
                                  if (
                                    !externalToolsLoading &&
                                    hasMoreExternalTools
                                  ) {
                                    loadNextExternalToolsPage();
                                  }
                                }}
                                disabled={externalToolsLoading}
                                className="group w-full max-w-sm py-3 md:py-4 font-semibold flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 text-white"
                              >
                                {externalToolsLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                                    <span>Loading more tools...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Load More Tools</span>
                                    <ArrowDown className="h-4 w-4 md:h-5 md:w-5 group-hover:animate-bounce transition-all duration-300" />
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 bg-white/20 text-white border-0 text-xs px-2 py-0 h-5"
                                    >
                                      More available
                                    </Badge>
                                  </>
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </div>
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

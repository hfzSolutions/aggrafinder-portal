
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolCard } from "@/components/tools/ToolCard";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/ui/SearchBar";
import FilterButton from "@/components/ui/FilterButton";
import { ArrowLeft, Sliders } from "lucide-react";
import { useSupabaseTools } from "@/hooks/useSupabaseTools";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { pricingOptions } from "@/data/toolsData";

const Tools = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get("category") || "All";
  const initialSearch = searchParams.get("search") || "";
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [selectedPricing, setSelectedPricing] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  
  // Fetch categories from Supabase
  const { categories, loading: categoriesLoading } = useSupabaseCategories();
  
  // Fetch tools from Supabase with filters
  const { tools: filteredTools, loading: toolsLoading, error } = useSupabaseTools({
    category: activeCategory !== "All" ? activeCategory : undefined,
    search: searchTerm,
    pricing: selectedPricing !== "All" ? selectedPricing : undefined
  });
  
  useEffect(() => {
    // Update URL with filters
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (activeCategory !== "All") params.set("category", activeCategory);
    
    const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    navigate(newUrl, { replace: true });
  }, [searchTerm, activeCategory, selectedPricing, navigate, location.pathname]);
  
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };
  
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };
  
  const handlePricingChange = (pricing: string) => {
    setSelectedPricing(pricing);
  };
  
  const isLoading = categoriesLoading || toolsLoading;
  
  return (
    <>
      <Helmet>
        <title>AI Tools Collection | AI Aggregator</title>
        <meta name="description" content="Browse our comprehensive collection of AI tools across various categories. Find the perfect tool for your specific needs." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow pt-20">
          {/* Hero section */}
          <div className="bg-secondary/30 border-b border-border/20">
            <div className="container px-4 md:px-8 mx-auto py-12 md:py-16">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-medium mb-4 animate-fade-in">AI Tools Collection</h1>
                <p className="text-muted-foreground mb-8 animate-fade-in">
                  Browse our comprehensive collection of AI tools across various categories. 
                  Find the perfect tool for your specific needs.
                </p>
                
                <div className="animate-slide-up">
                  <SearchBar 
                    initialValue={searchTerm}
                    onSearch={handleSearch}
                    placeholder="Search AI tools..."
                    className="max-w-xl mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters and tools */}
          <div className="container px-4 md:px-8 mx-auto py-8">
            {/* Mobile filter toggle */}
            <div className="md:hidden mb-4">
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
            
            {/* Filters */}
            <div 
              className={`mb-6 p-4 rounded-lg border border-border/50 bg-background/50 md:flex space-y-4 md:space-y-0 md:space-x-4 items-center justify-between ${
                isFilterOpen ? "block" : "hidden md:flex"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <FilterButton 
                  label="Category"
                  options={categoriesLoading ? ["Loading..."] : categories}
                  selectedOption={activeCategory}
                  onChange={handleCategoryChange}
                  disabled={categoriesLoading}
                />
                
                <FilterButton 
                  label="Pricing"
                  options={pricingOptions}
                  selectedOption={selectedPricing}
                  onChange={handlePricingChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                  ) : (
                    <>
                      {filteredTools.length} {filteredTools.length === 1 ? "tool" : "tools"} found
                    </>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 ${view === "grid" ? "bg-secondary/70" : ""}`}
                    onClick={() => setView("grid")}
                  >
                    Grid
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`px-3 ${view === "list" ? "bg-secondary/70" : ""}`}
                    onClick={() => setView("list")}
                  >
                    List
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Results */}
            <div className="mb-8">
              {searchTerm && (
                <div className="mb-4 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground"
                    onClick={() => {
                      setSearchTerm("");
                      navigate("/tools");
                    }}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Clear search
                  </Button>
                  <span className="ml-2 text-sm">
                    Results for "<span className="font-medium">{searchTerm}</span>"
                  </span>
                </div>
              )}
              
              {/* Error state */}
              {error && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2 text-red-500">Error loading tools</h3>
                  <p className="text-muted-foreground">
                    {error.message}
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => window.location.reload()}
                  >
                    Try again
                  </Button>
                </div>
              )}
              
              {/* Loading state */}
              {isLoading && (
                <div 
                  className={
                    view === "grid" 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "grid grid-cols-1 gap-4"
                  }
                >
                  {Array(8).fill(0).map((_, index) => (
                    <div key={`skeleton-${index}`} className="space-y-3">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-16 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Empty state */}
              {!isLoading && filteredTools.length === 0 && !error && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No tools found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your filters or search term to find what you're looking for.
                  </p>
                  <Button 
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setActiveCategory("All");
                      setSelectedPricing("All");
                    }}
                  >
                    Reset filters
                  </Button>
                </div>
              )}
              
              {/* Tools grid/list */}
              {!isLoading && filteredTools.length > 0 && !error && (
                <div 
                  className={
                    view === "grid" 
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "grid grid-cols-1 gap-4"
                  }
                >
                  {filteredTools.map((tool) => (
                    <div key={tool.id} className="animate-fade-in">
                      <ToolCard tool={tool} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default Tools;

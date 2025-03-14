
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PlusCircle, ImageIcon, Loader2, Search, ArrowLeft, Sliders } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { AIOucome } from "@/types/outcomes";
import OutcomeSubmissionForm from "@/components/outcomes/OutcomeSubmissionForm";
import { Skeleton } from "@/components/ui/skeleton";
import SearchBar from "@/components/ui/SearchBar";
import FilterButton from "@/components/ui/FilterButton";

const Outcomes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get("search") || "";
  const initialToolFilter = searchParams.get("tool") || "All";

  const [outcomes, setOutcomes] = useState<AIOucome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedTool, setSelectedTool] = useState(initialToolFilter);
  const [tools, setTools] = useState<{id: string, name: string}[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 12;

  // Observer for infinite scrolling
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Last element ref callback function
  const lastOutcomeElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading) return;
    
    // Disconnect the previous observer if it exists
    if (observer.current) observer.current.disconnect();
    
    // Create a new observer
    observer.current = new IntersectionObserver(entries => {
      // If the last element is visible and we have more items to load
      if (entries[0].isIntersecting && hasMore) {
        setCurrentPage(prev => prev + 1);
      }
    }, { 
      rootMargin: '100px' // Load more when we're 100px away from the bottom
    });
    
    // Observe the last element
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        setToolsLoading(true);
        const { data, error: toolError } = await supabase
          .from('ai_tools')
          .select('id, name')
          .order('name');
          
        if (toolError) {
          throw new Error(toolError.message);
        }
        
        setTools([{id: 'All', name: 'All Tools'}, ...data]);
      } catch (err) {
        console.error("Error fetching tools:", err);
        toast.error("Failed to load AI tools");
      } finally {
        setToolsLoading(false);
      }
    };

    fetchTools();
  }, []);

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        setLoading(true);
        let query = supabase
          .from('ai_outcomes')
          .select('*, ai_tools(name)')
          .order('created_at', { ascending: false });

        if (selectedTool !== "All") {
          query = query.eq('tool_id', selectedTool);
        }

        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          query = query.or(`title.ilike.%${searchLower}%,description.ilike.%${searchLower}%`);
        }

        // Pagination
        query = query.range(currentPage * limit, (currentPage * limit) + limit - 1);
          
        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        const transformedData: AIOucome[] = data.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          toolId: item.tool_id,
          toolName: item.ai_tools?.name || "Unknown Tool",
          createdAt: item.created_at,
          submitterName: item.submitter_name,
          submitterEmail: item.submitter_email,
        }));

        setHasMore(transformedData.length === limit);
        
        if (currentPage === 0) {
          setOutcomes(transformedData);
        } else {
          setOutcomes(prev => [...prev, ...transformedData]);
        }
      } catch (err) {
        console.error("Error fetching outcomes:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Failed to load AI outcomes");
      } finally {
        setLoading(false);
      }
    };

    fetchOutcomes();
  }, [selectedTool, searchTerm, currentPage]);

  useEffect(() => {
    // Reset to page 0 when filters change
    setCurrentPage(0);
    setOutcomes([]);
    setHasMore(true);
  }, [selectedTool, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedTool !== "All") params.set("tool", selectedTool);
    
    const newUrl = `${location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    navigate(newUrl, { replace: true });
  }, [searchTerm, selectedTool, navigate, location.pathname]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleToolChange = (tool: string) => {
    setSelectedTool(tool);
  };

  const handleSubmitSuccess = () => {
    setIsDialogOpen(false);
    toast.success("Your AI outcome has been submitted successfully!");
    // Refresh the outcomes list
    setCurrentPage(0);
    setOutcomes([]);
    setHasMore(true);
  };

  const isInitialLoading = loading && currentPage === 0;

  return (
    <>
      <Helmet>
        <title>AI Showcase | Community AI Outcomes</title>
        <meta name="description" content="Explore stunning AI-generated outcomes created using various AI tools" />
      </Helmet>

      <div className="min-h-screen flex flex-col pb-20">
        <main className="flex-grow pt-20">
          <div className="bg-secondary/30 border-b border-border/20">
            <div className="container px-4 md:px-8 mx-auto py-12 md:py-16">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-medium mb-4 animate-fade-in">AI Showcase</h1>
                <p className="text-muted-foreground mb-8 animate-fade-in">
                  Explore amazing outcomes created with AI tools by our community
                </p>
                
                <div className="animate-slide-up">
                  <SearchBar 
                    initialValue={searchTerm}
                    onSearch={handleSearch}
                    placeholder="Search AI creations..."
                    className="max-w-xl mx-auto"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="container px-4 md:px-8 mx-auto py-8">
            <div className="flex justify-between items-center mb-6">
              <div className="md:hidden mb-4 w-full">
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
                    {outcomes.length}
                  </span>
                </Button>
              </div>
              
              <div 
                className={`mb-6 p-4 rounded-lg border border-border/50 bg-background/50 w-full md:flex space-y-4 md:space-y-0 md:space-x-4 items-center justify-between ${
                  isFilterOpen ? "block" : "hidden md:flex"
                }`}
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <FilterButton 
                    label="Tools"
                    options={toolsLoading ? ["Loading..."] : tools.map(tool => tool.name)}
                    selectedOption={
                      selectedTool === "All" ? "All Tools" : 
                      tools.find(t => t.id === selectedTool)?.name || "All Tools"
                    }
                    onChange={(toolName) => {
                      const tool = tools.find(t => t.name === toolName);
                      handleToolChange(tool ? tool.id : "All");
                    }}
                    disabled={toolsLoading}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {isInitialLoading ? (
                      <Skeleton className="h-4 w-20" />
                    ) : (
                      <>
                        {outcomes.length} {outcomes.length === 1 ? "creation" : "creations"} found
                      </>
                    )}
                  </div>
                </div>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="ml-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Share Your Creation
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Share Your AI Creation</DialogTitle>
                    <DialogDescription>
                      Showcase your amazing AI-generated content with the community.
                    </DialogDescription>
                  </DialogHeader>
                  <OutcomeSubmissionForm onSuccess={handleSubmitSuccess} />
                </DialogContent>
              </Dialog>
            </div>

            {searchTerm && (
              <div className="mb-4 flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground"
                  onClick={() => {
                    setSearchTerm("");
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

            {isInitialLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <Card key={`skeleton-${index}`} className="overflow-hidden">
                    <div className="aspect-video">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="flex justify-between border-t pt-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-28" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : error ? (
              <div className="text-center p-8 border rounded-lg">
                <p className="text-destructive">Error loading outcomes. Please try again later.</p>
              </div>
            ) : outcomes.length === 0 ? (
              <div className="text-center p-12 border border-dashed rounded-lg">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No AI outcomes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to share your amazing AI-generated content!
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Share Your Creation
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {outcomes.map((outcome, index) => (
                    <div 
                      key={outcome.id} 
                      ref={index === outcomes.length - 1 ? lastOutcomeElementRef : null}
                    >
                      <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/40 hover:border-primary/20">
                        <div className="aspect-video overflow-hidden bg-muted relative group">
                          {outcome.imageUrl ? (
                            <img
                              src={outcome.imageUrl}
                              alt={outcome.title}
                              className="w-full h-full object-cover transition-all duration-500 transform group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <CardHeader>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{outcome.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-muted-foreground line-clamp-3">{outcome.description}</p>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t pt-4 text-sm">
                          <div className="text-muted-foreground">
                            By {outcome.submitterName}
                          </div>
                          <Link 
                            to={`/tools/${outcome.toolId}`} 
                            className="text-primary hover:underline flex items-center"
                          >
                            Made with {outcome.toolName}
                          </Link>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
                
                {/* Loading indicator at the bottom */}
                {loading && outcomes.length > 0 && (
                  <div className="flex justify-center py-8">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Loading more creations...</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Outcomes;

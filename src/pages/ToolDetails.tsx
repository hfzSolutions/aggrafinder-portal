
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, ExternalLink, Tag, CheckCircle, DollarSign, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseTools } from "@/hooks/useSupabaseTools";
import { AITool } from "@/types/tools";
import { cn } from "@/lib/utils";

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Fetch related tools based on the current tool's category
  const { tools: relatedTools, loading: relatedLoading } = useSupabaseTools({
    category: tool?.category?.[0],
    limit: 3
  });

  // Filter out the current tool from related tools
  const filteredRelatedTools = relatedTools.filter(relatedTool => relatedTool.id !== id);

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
          throw new Error("Tool not found");
        }
        
        // Transform the data to match our AITool type
        const transformedData: AITool = {
          id: data.id,
          name: data.name,
          description: data.description,
          imageUrl: data.image_url,
          category: data.category,
          url: data.url,
          featured: data.featured,
          pricing: data.pricing as "Free" | "Freemium" | "Paid" | "Free Trial",
          tags: data.tags
        };
        
        setTool(transformedData);
      } catch (err) {
        console.error("Error fetching tool details:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchToolDetails();
  }, [id]);

  const getPricingColor = (pricing: string) => {
    switch (pricing) {
      case "Free": return "bg-green-100 text-green-800";
      case "Freemium": return "bg-blue-100 text-blue-800";
      case "Paid": return "bg-purple-100 text-purple-800";
      case "Free Trial": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPricingDetails = (pricing: string) => {
    switch (pricing) {
      case "Free": 
        return {
          icon: <DollarSign className="h-5 w-5 text-green-600" />,
          title: "Free Forever",
          description: "This tool is completely free to use with no hidden costs or limitations."
        };
      case "Freemium": 
        return {
          icon: <Star className="h-5 w-5 text-blue-600" />,
          title: "Free Basic Plan",
          description: "Start with a free plan and upgrade for advanced features and higher usage limits."
        };
      case "Paid": 
        return {
          icon: <DollarSign className="h-5 w-5 text-purple-600" />,
          title: "Paid Subscription",
          description: "This tool requires a paid subscription to access its features."
        };
      case "Free Trial": 
        return {
          icon: <Clock className="h-5 w-5 text-amber-600" />,
          title: "Free Trial Available",
          description: "Try before you buy with a limited-time free trial period."
        };
      default: 
        return {
          icon: <DollarSign className="h-5 w-5 text-gray-600" />,
          title: "Pricing",
          description: "Check the website for detailed pricing information."
        };
    }
  };

  const getFeatureHighlights = (tags: string[]) => {
    return tags.slice(0, 4).map(tag => ({
      title: tag,
      description: `This tool offers ${tag.toLowerCase()} capabilities to enhance your AI workflow.`
    }));
  };

  return (
    <>
      <Helmet>
        <title>{tool ? `${tool.name} | AI Tool Details` : "AI Tool Details"}</title>
        <meta 
          name="description" 
          content={tool ? tool.description : "Detailed information about AI tools"} 
        />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow pt-20">
          <div className="container px-4 md:px-8 mx-auto py-8">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground mb-4"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to tools
              </Button>
              
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-96 w-full rounded-lg" />
                </div>
              ) : error ? (
                <Card className="p-6 text-center">
                  <h2 className="text-xl font-medium mb-2 text-red-500">Error loading tool details</h2>
                  <p className="text-muted-foreground mb-4">{error.message}</p>
                  <Button onClick={() => navigate("/tools")}>Return to Tools</Button>
                </Card>
              ) : tool ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main content - Tool details */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h1 className="text-3xl font-medium mb-2">{tool.name}</h1>
                      <p className="text-lg text-muted-foreground">{tool.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {tool.category.map((cat, idx) => (
                        <Link 
                          key={idx} 
                          to={`/tools?category=${encodeURIComponent(cat)}`}
                          className="text-sm px-3 py-1 rounded-full bg-secondary/70 hover:bg-secondary text-secondary-foreground"
                        >
                          {cat}
                        </Link>
                      ))}
                      <span className={`text-sm px-3 py-1 rounded-full ${getPricingColor(tool.pricing)}`}>
                        {tool.pricing}
                      </span>
                    </div>
                    
                    {/* Feature breakdown section */}
                    <Card className="border border-border/40">
                      <CardHeader>
                        <CardTitle className="text-xl">Feature Highlights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {getFeatureHighlights(tool.tags).map((feature, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                              <div>
                                <h3 className="font-medium">{feature.title}</h3>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Pricing details */}
                    <Card className="border border-border/40">
                      <CardHeader>
                        <CardTitle className="text-xl">Pricing Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-start space-x-3">
                          {getPricingDetails(tool.pricing).icon}
                          <div>
                            <h3 className="font-medium">{getPricingDetails(tool.pricing).title}</h3>
                            <p className="text-muted-foreground">{getPricingDetails(tool.pricing).description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* All tags */}
                    <div>
                      <h3 className="text-lg font-medium mb-3">All Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {tool.tags.map((tag, idx) => (
                          <div 
                            key={idx} 
                            className="flex items-center text-sm px-3 py-1 rounded-full bg-secondary/50 text-secondary-foreground"
                          >
                            <Tag className="h-3.5 w-3.5 mr-1" />
                            {tag}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Button 
                        className="w-full sm:w-auto"
                        onClick={() => window.open(tool.url, "_blank")}
                      >
                        Visit Website
                        <ExternalLink className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Image container */}
                    <div className="rounded-xl overflow-hidden border border-border/40 bg-secondary/10">
                      {!isImageLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
                          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className={cn(
                          "w-full h-auto object-cover rounded-xl",
                          isImageLoaded ? "opacity-100" : "opacity-0"
                        )}
                        onLoad={() => setIsImageLoaded(true)}
                      />
                    </div>
                    
                    {/* Related tools section */}
                    <Card className="border border-border/40">
                      <CardHeader>
                        <CardTitle className="text-lg">Related Tools</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {relatedLoading ? (
                          <div className="space-y-3">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                          </div>
                        ) : filteredRelatedTools.length > 0 ? (
                          filteredRelatedTools.map((relatedTool) => (
                            <div key={relatedTool.id} className="group">
                              <Link to={`/tools/${relatedTool.id}`} className="flex items-start space-x-3 p-2 rounded-md hover:bg-secondary/30 transition-colors">
                                <div className="h-12 w-12 rounded overflow-hidden bg-secondary/20 flex-shrink-0">
                                  <img 
                                    src={relatedTool.imageUrl} 
                                    alt={relatedTool.name}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <h3 className="font-medium group-hover:text-primary transition-colors">{relatedTool.name}</h3>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{relatedTool.description}</p>
                                </div>
                              </Link>
                              {filteredRelatedTools.indexOf(relatedTool) < filteredRelatedTools.length - 1 && (
                                <Separator className="my-2" />
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No related tools found</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <h2 className="text-xl font-medium mb-2">Tool not found</h2>
                  <p className="text-muted-foreground mb-4">The requested AI tool could not be found.</p>
                  <Button onClick={() => navigate("/tools")}>Browse All Tools</Button>
                </Card>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ToolDetails;

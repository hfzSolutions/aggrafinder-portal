
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { ArrowLeft, ExternalLink, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { AITool } from "@/types/tools";
import { cn } from "@/lib/utils";

const ToolDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tool, setTool] = useState<AITool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

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
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Tool details */}
                  <div className="lg:col-span-3 space-y-6">
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
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3">Tags</h3>
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
                  
                  {/* Image container */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-24 rounded-xl overflow-hidden border border-border/40 bg-secondary/10">
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

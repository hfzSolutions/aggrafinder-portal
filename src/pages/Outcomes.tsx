
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { PlusCircle, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { AIOucome } from "@/types/outcomes";
import OutcomeSubmissionForm from "@/components/outcomes/OutcomeSubmissionForm";

const Outcomes = () => {
  const [outcomes, setOutcomes] = useState<AIOucome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('ai_outcomes')
          .select('*, ai_tools(name)')
          .order('created_at', { ascending: false });

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

        setOutcomes(transformedData);
      } catch (err) {
        console.error("Error fetching outcomes:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        toast.error("Failed to load AI outcomes");
      } finally {
        setLoading(false);
      }
    };

    fetchOutcomes();
  }, []);

  const handleSubmitSuccess = () => {
    setIsDialogOpen(false);
    toast.success("Your AI outcome has been submitted successfully!");
    // Refresh the outcomes list
    window.location.reload();
  };

  return (
    <>
      <Helmet>
        <title>AI Showcase | Community AI Outcomes</title>
        <meta name="description" content="Explore stunning AI-generated outcomes created using various AI tools" />
      </Helmet>

      <div className="container px-4 py-8 mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">AI Showcase</h1>
            <p className="text-lg text-muted-foreground">
              Explore amazing outcomes created with AI tools
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0" size="lg">
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

        {loading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map((outcome) => (
              <Card key={outcome.id} className="overflow-hidden flex flex-col h-full">
                <div className="aspect-video overflow-hidden bg-muted">
                  {outcome.imageUrl ? (
                    <img
                      src={outcome.imageUrl}
                      alt={outcome.title}
                      className="w-full h-full object-cover transition-all hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{outcome.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-3">{outcome.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    By {outcome.submitterName}
                  </div>
                  <Link 
                    to={`/tools/${outcome.toolId}`} 
                    className="text-sm text-primary hover:underline"
                  >
                    Made with {outcome.toolName}
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Outcomes;

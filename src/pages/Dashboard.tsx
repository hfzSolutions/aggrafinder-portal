
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, LogOut, Settings } from "lucide-react";
import Header from "@/components/layout/Header";
import { AIOucome } from "@/types/outcomes";
import OutcomeSubmissionForm from "@/components/outcomes/OutcomeSubmissionForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userOutcomes, setUserOutcomes] = useState<AIOucome[]>([]);
  const [isOutcomesLoading, setIsOutcomesLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<AIOucome | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [outcomeToDelete, setOutcomeToDelete] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          navigate("/auth");
          return;
        }
        setUser(data.user);
        
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();
          
        if (!profileError) {
          setProfile(profileData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking authentication", error);
        navigate("/auth");
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchUserOutcomes = async () => {
      if (!user) return;
      
      setIsOutcomesLoading(true);
      try {
        const { data, error } = await supabase
          .from("ai_outcomes")
          .select("*, ai_tools(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        
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
          userId: item.user_id
        }));
        
        setUserOutcomes(transformedData);
      } catch (err) {
        console.error("Error fetching user outcomes:", err);
        toast.error("Failed to load your creations");
      } finally {
        setIsOutcomesLoading(false);
      }
    };

    fetchUserOutcomes();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEditOutcome = (outcome: AIOucome) => {
    setEditingOutcome(outcome);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (outcomeId: string) => {
    setOutcomeToDelete(outcomeId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOutcome = async () => {
    if (!outcomeToDelete) return;
    
    try {
      const { error } = await supabase
        .from("ai_outcomes")
        .delete()
        .eq("id", outcomeToDelete);
        
      if (error) throw error;
      
      setUserOutcomes(userOutcomes.filter(outcome => outcome.id !== outcomeToDelete));
      toast.success("Creation deleted successfully");
    } catch (err) {
      console.error("Error deleting outcome:", err);
      toast.error("Failed to delete creation");
    } finally {
      setIsDeleteDialogOpen(false);
      setOutcomeToDelete(null);
    }
  };

  const handleSubmitSuccess = () => {
    setIsDialogOpen(false);
    setEditingOutcome(null);
    
    // Refresh the user outcomes list
    if (user) {
      setIsOutcomesLoading(true);
      supabase
        .from("ai_outcomes")
        .select("*, ai_tools(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
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
              userId: item.user_id
            }));
            
            setUserOutcomes(transformedData);
          }
          setIsOutcomesLoading(false);
        });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20">
          <div className="container px-4 md:px-8 mx-auto py-8">
            <div className="max-w-4xl mx-auto">
              <Skeleton className="h-12 w-60 mb-8" />
              <Skeleton className="h-40 w-full mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | AI Showcase</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow pt-20">
          <div className="container px-4 md:px-8 mx-auto py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">{profile?.full_name || user?.email}</h1>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="creations">
                <TabsList className="mb-4">
                  <TabsTrigger value="creations">My Creations</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="creations">
                  <div className="bg-card border rounded-lg shadow-sm mb-6">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">Your AI Creations</h2>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Add New Creation
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>
                                {editingOutcome ? "Edit AI Creation" : "Share New AI Creation"}
                              </DialogTitle>
                              <DialogDescription>
                                {editingOutcome 
                                  ? "Update your AI-generated content"
                                  : "Showcase your amazing AI-generated content with the community"}
                              </DialogDescription>
                            </DialogHeader>
                            <OutcomeSubmissionForm 
                              onSuccess={handleSubmitSuccess} 
                              initialData={editingOutcome || undefined} 
                              userId={user?.id}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      {isOutcomesLoading ? (
                        <div className="space-y-4">
                          {[1, 2, 3].map((_, i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                          ))}
                        </div>
                      ) : userOutcomes.length === 0 ? (
                        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50">
                          <h3 className="text-lg font-medium mb-2">No creations yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Share your AI-generated creations with the community
                          </p>
                          <Button 
                            onClick={() => setIsDialogOpen(true)} 
                            variant="default"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Creation
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {userOutcomes.map((outcome) => (
                            <div 
                              key={outcome.id} 
                              className="border rounded-lg p-4 flex gap-4 bg-background hover:bg-secondary/10 transition-colors"
                            >
                              <div className="h-20 w-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                {outcome.imageUrl ? (
                                  <img
                                    src={outcome.imageUrl}
                                    alt={outcome.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                                    <span className="text-xs text-white font-medium">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-grow overflow-hidden">
                                <h3 className="font-medium text-base truncate">{outcome.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {outcome.description}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                  <span>Made with {outcome.toolName}</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditOutcome(outcome)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(outcome.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Delete Creation</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this creation? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteOutcome}>
                          Delete
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
                
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Update your profile information here
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Profile settings coming soon.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;

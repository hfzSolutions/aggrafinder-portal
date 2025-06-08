import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Settings,
  ShieldAlert,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPreferences } from '@/components/user/UserPreferences';
import { ProfileManager } from '@/components/user/ProfileManager';
import { MyToolsManager } from '@/components/user/MyToolsManager';
import { QuickToolForm } from '@/components/quick-tools/QuickToolForm';
import { ToolSubmissionForm } from '@/components/admin/ToolSubmissionForm';
import { QuickToolFormSimplified } from '@/components/quick-tools/QuickToolFormSimplified';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isQuickToolDialogOpen, setIsQuickToolDialogOpen] = useState(false);
  const [isToolSubmitDialogOpen, setIsToolSubmitDialogOpen] = useState(false);
  // Add a state to trigger MyToolsManager refresh
  const [toolsRefreshTrigger, setToolsRefreshTrigger] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          navigate('/auth');
          return;
        }
        setUser(data.user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!profileError) {
          setProfile(profileData);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication', error);
        navigate('/auth');
      }
    };

    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/auth');
        } else if (session?.user) {
          setUser(session.user);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | DeepList AI</title>
        <meta
          name="description"
          content="Manage your AI tools and profile settings"
        />
      </Helmet>
      <Header />
      <main className="flex-grow pt-20">
        <div className="container py-8 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="md:w-1/3 space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24 mb-4 relative group">
                      <AvatarImage
                        src={
                          profile?.avatar_url
                            ? `${import.meta.env.VITE_STORAGE_URL}/${
                                profile?.avatar_url
                              }`
                            : undefined
                        }
                        alt={user?.email || 'User'}
                      />
                      <AvatarFallback className="text-2xl">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h2 className="text-xl font-semibold">
                      {profile?.full_name || 'User'}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {user?.email}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="md:w-2/3">
              <Tabs defaultValue="quick" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="quick">Quick Tools</TabsTrigger>
                  <TabsTrigger value="external">External Tools</TabsTrigger>
                  <TabsTrigger value="profile">Profile Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="quick">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Your Quick Tools</CardTitle>
                          <CardDescription>
                            Manage your quick AI tool submissions
                          </CardDescription>
                        </div>
                        <Dialog
                          open={isQuickToolDialogOpen}
                          onOpenChange={setIsQuickToolDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Add Quick Tool
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Add a Quick AI Tool</DialogTitle>
                              <DialogDescription>
                                Add a quick AI tool that you can use in your
                                workflows
                              </DialogDescription>
                            </DialogHeader>
                            <QuickToolFormSimplified
                              onSuccess={() => {
                                setIsQuickToolDialogOpen(false);
                                toast.success('Quick tool added successfully!');
                                // Trigger refresh of the tools list
                                setToolsRefreshTrigger((prev) => prev + 1);
                              }}
                              userId={user?.id}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {user && (
                        <MyToolsManager
                          userId={user.id}
                          toolType="quick"
                          key={`quick-tools-${toolsRefreshTrigger}`}
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="external">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>Your External Tools</CardTitle>
                          <CardDescription>
                            Manage your external AI tool submissions
                          </CardDescription>
                        </div>
                        <Dialog
                          open={isToolSubmitDialogOpen}
                          onOpenChange={setIsToolSubmitDialogOpen}
                        >
                          <DialogTrigger asChild>
                            <Button>
                              <Plus className="w-4 h-4 mr-2" />
                              Submit Tool
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Submit a New AI Tool</DialogTitle>
                              <DialogDescription>
                                Share an AI tool with the community
                              </DialogDescription>
                            </DialogHeader>
                            <ToolSubmissionForm
                              onSuccess={() => {
                                setIsToolSubmitDialogOpen(false);
                                toast.success(
                                  'Tool submitted for review successfully!'
                                );
                                // Trigger refresh of the tools list
                                setToolsRefreshTrigger((prev) => prev + 1);
                              }}
                              userId={user?.id}
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {user && (
                        <MyToolsManager
                          userId={user.id}
                          toolType="external"
                          key={`external-tools-${toolsRefreshTrigger}`}
                        />
                      )}
                    </CardContent>
                  </Card>
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
                      <ProfileManager
                        userId={user?.id}
                        initialProfile={profile}
                        onProfileUpdate={() => {
                          // Refresh profile data
                          if (user) {
                            supabase
                              .from('profiles')
                              .select('*')
                              .eq('id', user.id)
                              .single()
                              .then(({ data, error }) => {
                                if (!error && data) {
                                  setProfile(data);
                                }
                              });
                          }
                        }}
                      />
                    </CardContent>
                    <CardHeader>
                      <CardTitle>Your Preferences</CardTitle>
                      <CardDescription>
                        Customize your experience to get personalized AI tool
                        recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user && <UserPreferences userId={user.id} />}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;

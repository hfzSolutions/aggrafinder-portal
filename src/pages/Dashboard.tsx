
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Gift,
} from 'lucide-react';
import { AdminLink } from '@/components/user/AdminLink';
import Header from '@/components/layout/Header';
import { AIOucome } from '@/types/outcomes';
import OutcomeSubmissionForm from '@/components/outcomes/OutcomeSubmissionForm';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPreferences } from '@/components/user/UserPreferences';
import { ProfileManager } from '@/components/user/ProfileManager';
import { MyToolsManager } from '@/components/user/MyToolsManager';
import { AffiliateManager } from '@/components/user/AffiliateManager';
import { trackEvent } from '@/utils/analytics';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userOutcomes, setUserOutcomes] = useState<AIOucome[]>([]);
  const [isOutcomesLoading, setIsOutcomesLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOutcome, setEditingOutcome] = useState<AIOucome | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [outcomeToDelete, setOutcomeToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('tools');

  useEffect(() => {
    const initialTab = searchParams.get('tab');
    if (initialTab && ['tools', 'profile', 'affiliate'].includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [searchParams]);

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

  useEffect(() => {
    const fetchUserOutcomes = async () => {
      if (!user) return;

      setIsOutcomesLoading(true);
      try {
        const { data, error } = await supabase
          .from('ai_outcomes')
          .select('*, ai_tools(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedData: AIOucome[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          toolId: item.tool_id,
          toolName: item.ai_tools?.name || 'Unknown Tool',
          createdAt: item.created_at,
          submitterName: item.submitter_name,
          submitterEmail: item.submitter_email,
          userId: item.user_id,
        }));

        setUserOutcomes(transformedData);
      } catch (err) {
        console.error('Error fetching user outcomes:', err);
        toast.error('Failed to load your creations');
      } finally {
        setIsOutcomesLoading(false);
      }
    };

    fetchUserOutcomes();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
        .from('ai_outcomes')
        .delete()
        .eq('id', outcomeToDelete);

      if (error) throw error;

      setUserOutcomes(
        userOutcomes.filter((outcome) => outcome.id !== outcomeToDelete)
      );
      toast.success('Creation deleted successfully');
    } catch (err) {
      console.error('Error deleting outcome:', err);
      toast.error('Failed to delete creation');
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
        .from('ai_outcomes')
        .select('*, ai_tools(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            const transformedData: AIOucome[] = data.map((item) => ({
              id: item.id,
              title: item.title,
              description: item.description,
              imageUrl: item.image_url,
              toolId: item.tool_id,
              toolName: item.ai_tools?.name || 'Unknown Tool',
              createdAt: item.created_at,
              submitterName: item.submitter_name,
              submitterEmail: item.submitter_email,
              userId: item.user_id,
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
            <div className="max-w-[90vw] mx-auto overflow-y-auto">
              <Tabs defaultValue="creations" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="creations">My Creations</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>
                        Manage your profile information
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
                  </Card>
                </TabsContent>

                <TabsContent value="creations"></TabsContent>
              </Tabs>
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
            <div className="max-w-[90vw] mx-auto overflow-y-auto">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={
                        profile?.avatar_url
                          ? `${import.meta.env.VITE_STORAGE_URL}/${
                              profile.avatar_url
                            }`
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      {user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold">
                      {profile?.full_name || user?.email}
                    </h1>
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

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="tools">My Tools</TabsTrigger>
                  <TabsTrigger value="affiliate" onClick={() => trackEvent('affiliate', 'tab_view')}>
                    <Gift className="h-4 w-4 mr-2" />
                    Affiliate Program
                  </TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="tools">
                  <div className="bg-card border rounded-lg shadow-sm mb-6">
                    <div className="p-6">
                      {user && <MyToolsManager userId={user.id} />}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="affiliate">
                  <div className="bg-card border rounded-lg shadow-sm mb-6">
                    <div className="p-6">
                      <AffiliateManager />
                    </div>
                  </div>
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
                      {user && (
                        <UserPreferences
                          userId={user.id}
                          onPreferencesSaved={() =>
                            toast.success('Preferences saved successfully')
                          }
                        />
                      )}
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

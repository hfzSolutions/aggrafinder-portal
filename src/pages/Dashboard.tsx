import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProfileManager } from '@/components/user/ProfileManager';
import { MyToolsManager } from '@/components/user/MyToolsManager';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Wrench,
  Heart,
  Bell,
  Bookmark,
} from 'lucide-react';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setProfile(data);
        } else {
          // Create a new profile if one doesn't exist
          const newProfile = {
            id: user.id,
            username: user.email?.split('@')[0] || '',
            full_name: '',
            avatar_url: '',
            updated_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('profiles')
            .insert(newProfile);

          if (insertError) throw insertError;
          setProfile(newProfile);
        }
      } catch (error: any) {
        toast.error(`Error loading profile: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast.error(`Error signing out: ${error.message}`);
    }
  };

  const handleProfileUpdate = () => {
    // Refresh profile data after update
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
  };

  if (loading) {
    return (
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-[240px_1fr]">
          <div>
            <Skeleton className="h-8 w-32 mb-4" />
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        <div>
          <h2 className="text-xl font-semibold mb-4">Dashboard</h2>
          <div className="space-y-1">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'profile' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('profile')}
            >
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button
              variant={activeTab === 'my-tools' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('my-tools')}
            >
              <Wrench className="mr-2 h-4 w-4" />
              My Tools
            </Button>
            <Button
              variant={activeTab === 'favorites' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('favorites')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Favorites
            </Button>
            <Button
              variant={activeTab === 'notifications' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('notifications')}
            >
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
        <div>
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back, {profile?.full_name || profile?.username || 'User'}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      My Tools
                    </CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Tools you've submitted
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Favorites
                    </CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Tools you've favorited
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Saved
                    </CardTitle>
                    <Bookmark className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Tools you've saved for later
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileManager />
          )}

          {activeTab === 'my-tools' && user && (
            <MyToolsManager userId={user.id} />
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Favorites</h2>
              <p className="text-muted-foreground">
                Tools you've favorited will appear here.
              </p>
              <div className="bg-muted p-8 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  You haven't favorited any tools yet.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">
                Notifications
              </h2>
              <p className="text-muted-foreground">
                Your notifications will appear here.
              </p>
              <div className="bg-muted p-8 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">
                  You don't have any notifications.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
              <Tabs defaultValue="account">
                <TabsList>
                  <TabsTrigger value="account">Account</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>
                <TabsContent value="account">
                  <ProfileManager />
                </TabsContent>
                <TabsContent value="preferences">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Preference settings coming soon.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Notification settings coming soon.
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

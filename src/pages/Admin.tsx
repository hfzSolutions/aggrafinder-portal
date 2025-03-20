import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          navigate('/auth');
          return;
        }
        setUser(data.user);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | AggraFinder</title>
        <meta
          name="description"
          content="Manage your AI tools, outcomes, categories, and tool requests."
        />
      </Helmet>

      <Header />

      <main className="flex-grow pt-20">
        <div className="container px-4 md:px-8 mx-auto py-8">
          <div className="max-w-4xl mx-auto">
            {user && <AdminDashboard userId={user.id} />}
          </div>
        </div>
      </main>
    </>
  );
};

export default Admin;

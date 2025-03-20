import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

interface AdminLinkProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function AdminLink({
  variant = 'ghost',
  size = 'sm',
  className = '',
}: AdminLinkProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          // Check if user is in admin_users table
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading || !isAdmin) return null;

  return (
    <Button variant={variant} size={size} className={className} asChild>
      <Link to="/admin">
        <ShieldAlert className="h-4 w-4 mr-2" />
        Admin
      </Link>
    </Button>
  );
}

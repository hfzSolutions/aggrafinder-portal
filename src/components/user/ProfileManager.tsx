import { useState, useEffect } from 'react';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { adminFunctions } from '@/integrations/supabase/admin-client';
import { supabase } from '@/integrations/supabase/client';

export function ProfileManager() {
  const [loading, setLoading] = useState(false);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  const user = useUser();
  const router = useRouter();
  const supabaseClient = useSupabaseClient();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        if (!user) throw new Error('No user found');

        let { data, error, status } = await supabaseClient
          .from('profiles')
          .select(`full_name, username, avatar_url`)
          .eq('id', user.id)
          .single();

        if (error && status !== 406) {
          throw error;
        }

        if (data) {
          setFullName(data.full_name || '');
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [user, supabaseClient]);

  async function updateProfile({
    username,
    fullName,
    avatarUrl,
  }: {
    username: string;
    fullName: string;
    avatarUrl: string;
  }) {
    try {
      setLoading(true);
      if (!user) throw new Error('No user found');

      const updates = {
        id: user.id,
        username,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      let { error } = await supabaseClient.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      toast.success('Profile updated successfully!');
      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRequestAccountDeletion = async () => {
    try {
      setDeletionLoading(true);
      
      if (!user?.id) {
        throw new Error('User ID not found');
      }
      
      // Use our new type-safe admin function
      const { data, error } = await adminFunctions.markAccountForDeletion(
        user.id,
        deletionReason
      );
      
      if (error) throw error;
      
      toast.success('Account scheduled for deletion in 30 days');
      setDeletionDialogOpen(false);
      
      // Force sign out after successful deletion request
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      toast.error(error.message || 'Failed to request account deletion');
    } finally {
      setDeletionLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="grid gap-10 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-muted-foreground">
            Manage your profile information.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{username?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <Button
              isLoading={loading}
              onClick={() => updateProfile({ username, fullName, avatarUrl })}
            >
              {success ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Updated
                </>
              ) : (
                'Update profile'
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-10 mt-16 md:grid-cols-3">
        <div className="md:col-span-1">
          <h2 className="text-2xl font-bold">Account Deletion</h2>
          <p className="text-muted-foreground">
            Request permanent deletion of your account and associated data.
          </p>
        </div>
        <div className="md:col-span-2">
          <Button
            variant="destructive"
            onClick={() => setDeletionDialogOpen(true)}
          >
            Request Account Deletion
          </Button>
        </div>
      </div>

      {/* Account Deletion Dialog */}
      <Dialog open={deletionDialogOpen} onOpenChange={setDeletionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Request Account Deletion
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for your account deletion request. This
              will help us improve our services.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deletion_reason">Reason for Deletion</Label>
              <Textarea
                id="deletion_reason"
                placeholder="Why do you want to delete your account?"
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setDeletionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              isLoading={deletionLoading}
              onClick={handleRequestAccountDeletion}
            >
              Request Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

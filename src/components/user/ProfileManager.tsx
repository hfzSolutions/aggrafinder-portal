import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ProfileManagerProps {
  userId: string;
  initialProfile?: {
    full_name?: string;
    username?: string;
  };
  onProfileUpdate?: () => void;
}

export function ProfileManager({
  userId,
  initialProfile,
  onProfileUpdate,
}: ProfileManagerProps) {
  const [fullName, setFullName] = useState(initialProfile?.full_name || '');
  const [username, setUsername] = useState(initialProfile?.username || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
        })
        .eq('id', userId);

      if (error) {
        if (error.code === '23505') {
          toast.error('Username is already taken');
        } else {
          throw error;
        }
      } else {
        toast.success('Profile updated successfully');
        onProfileUpdate?.();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
}

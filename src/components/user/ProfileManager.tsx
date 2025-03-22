import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileUpload } from '@/components/ui/file-upload';
import { compressImage } from '@/utils/imageCompression';
import { sanitizeFilename } from '@/utils/fileUtils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2, Upload } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileManagerProps {
  userId: string;
  initialProfile?: {
    full_name?: string;
    username?: string;
    avatar_url?: string | null;
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
  const [avatarUrl, setAvatarUrl] = useState(
    initialProfile?.avatar_url || null
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleDeleteAvatar = async () => {
    if (!avatarUrl) return;

    setIsLoading(true);

    try {
      // Delete the existing avatar from storage
      const { error: deleteError } = await supabase.storage
        .from('assets')
        .remove([avatarUrl]);

      if (deleteError) throw deleteError;

      // Update profile to remove avatar_url
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setAvatarUrl(null);
      setAvatarFile(null);
      setAvatarPreview(null);
      toast.success('Profile picture deleted successfully');
      onProfileUpdate?.();
    } catch (error) {
      console.error('Error deleting profile picture:', error);
      toast.error('Failed to delete profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let newAvatarUrl = avatarUrl;

      // Upload avatar if a new file was selected
      if (avatarFile) {
        // Compress the image before uploading
        const compressedFile = await compressImage(avatarFile, {
          maxSizeMB: 1,
          maxWidthOrHeight: 500,
        });

        // Always create a new path with the current timestamp and filename
        // If user already has an avatar, keep the same directory structure
        let filePath;
        // Sanitize the filename to prevent 'InvalidKey' errors
        const sanitizedFilename = sanitizeFilename(avatarFile.name);

        if (avatarUrl) {
          // Extract the directory path from the existing avatar URL
          const dirPath = avatarUrl.split('/').slice(0, -1).join('/');
          filePath = `${dirPath}/${Date.now()}-${sanitizedFilename}`;
        } else {
          filePath = `avatars/${userId}/${Date.now()}-${sanitizedFilename}`;
        }

        // Delete existing avatar if there is one and we're using a new path
        if (avatarUrl && avatarUrl !== filePath) {
          const { error: deleteError } = await supabase.storage
            .from('assets')
            .remove([avatarUrl]);

          if (deleteError) {
            console.error('Error deleting old avatar:', deleteError);
            // Continue with upload even if delete fails
          }
        }

        // Upload the compressed file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, compressedFile, { upsert: true });

        if (uploadError) throw uploadError;

        // Store the file path
        newAvatarUrl = filePath;
      }

      // Update profile with new data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          username: username,
          avatar_url: newAvatarUrl,
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
        setAvatarUrl(newAvatarUrl);
        setAvatarPreview(null); // Reset preview after successful upload
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative group">
          <Avatar
            className={`h-32 w-32 border-4 border-background shadow-md transition-all duration-200 ${
              !isMobile ? 'group-hover:border-primary/20' : ''
            }`}
          >
            <AvatarImage
              src={
                avatarPreview
                  ? avatarPreview
                  : avatarUrl
                  ? `${import.meta.env.VITE_STORAGE_URL}/${avatarUrl}`
                  : undefined
              }
              alt="Profile picture"
              className="object-cover avatar-image"
            />
            <AvatarFallback className="text-2xl font-semibold bg-secondary/50">
              {fullName?.charAt(0) || username?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>

          {isMobile ? (
            <div className="flex flex-col items-center justify-center mt-2 space-y-2 w-full">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center justify-center w-full max-w-[120px]"
                onClick={() =>
                  document.getElementById('avatar-upload')?.click()
                }
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center justify-center text-destructive hover:bg-destructive/10 w-full max-w-[120px]"
                  onClick={handleDeleteAvatar}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/60 rounded-full h-32 w-32 flex items-center justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-black/40 p-2"
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                  disabled={isLoading}
                >
                  <Upload className="h-6 w-6" />
                </Button>
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-black/40 p-2 ml-2"
                    onClick={handleDeleteAvatar}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-6 w-6" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-sm">
          {/* <div className="flex justify-end items-center mb-2">
            <span className="text-xs text-muted-foreground">Max size: 2MB</span>
          </div> */}
          <div className="hidden">
            <FileUpload
              id="avatar-upload"
              onFileChange={(file) => {
                setAvatarFile(file);
                // If a file is selected, create a preview URL
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    setAvatarPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                } else {
                  setAvatarPreview(null);
                }
              }}
              value={avatarUrl || undefined}
              previewUrl={
                avatarUrl
                  ? `${import.meta.env.VITE_STORAGE_URL}/${avatarUrl}`
                  : undefined
              }
              accept="image/*"
              maxSize={2} // 2MB limit
              className="hidden"
            />
          </div>
        </div>
      </div>

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
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Updating...' : 'Update Profile'}
      </Button>
    </form>
  );
}

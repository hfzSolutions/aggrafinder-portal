import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Upload, ImageOff } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (data: { url: string; toolId: string }) => void;
  currentImageUrl?: string;
  triggerUpload?: boolean;
  toolId: string;
}

export function FileUpload({
  onUploadComplete,
  currentImageUrl,
  triggerUpload = false,
  toolId,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImageUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImageError, setIsImageError] = useState(false);

  const prevTriggerUploadRef = useRef(triggerUpload);

  useEffect(() => {
    if (triggerUpload && !prevTriggerUploadRef.current && selectedFile) {
      uploadImage();
    }
    prevTriggerUploadRef.current = triggerUpload;
  }, [triggerUpload, selectedFile]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const localPreviewUrl = URL.createObjectURL(file);
      setPreview(localPreviewUrl);
      setSelectedFile(file);
    } catch (error: any) {
      toast.error(error.message || 'Error selecting image');
    }
  };

  const deleteOldImage = async (imageUrl: string) => {
    try {
      // Extract the path from the URL
      const urlPath = new URL(imageUrl).pathname;
      // Keep all three segments (toolId/userId/filename) from the path
      const filePath = urlPath.split('/').slice(-3).join('/');

      const { error } = await supabase.storage
        .from('tool-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting old image:', error);
      }
    } catch (error) {
      console.error('Error processing old image deletion:', error);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) {
      // If no file is selected, pass the current URL or empty string
      onUploadComplete({ url: currentImageUrl || '', toolId });
      return;
    }

    // Delete old image if it exists

    if (currentImageUrl) {
      await deleteOldImage(currentImageUrl);
    }

    try {
      setUploading(true);

      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('You must be logged in to upload images');
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      // Validate file type
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
      if (!fileExt || !allowedTypes.includes(fileExt)) {
        throw new Error(
          'File type not supported. Please upload an image file (jpg, jpeg, png, gif)'
        );
      }

      const filePath = `${toolId}/${
        session.user.id
      }/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      console.log('Uploading file:', {
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        path: filePath,
        userId: session.user.id,
      });

      const { error: uploadError, data } = await supabase.storage
        .from('tool-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes('storage/unauthorized')) {
          throw new Error(
            'Unauthorized to upload. Please check if you are logged in.'
          );
        }
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      if (!data) {
        throw new Error('Upload failed - no data returned');
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('tool-images').getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL');
      }

      setPreview(publicUrl);
      setSelectedFile(null);

      // Update the image URL in the ai_tools table
      const { error: dbError } = await supabase
        .from('ai_tools')
        .update({ image_url: 'publicUrl55' })
        .eq('id', toolId);

      if (dbError) {
        console.error('Database update error:', dbError);
        toast.error('Failed to update image URL in database');
        return;
      }

      onUploadComplete({ url: publicUrl, toolId });
      toast.success('Image uploaded and database updated successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading image');
      if (error.message.includes('logged in')) {
        // Optionally redirect to login page or trigger login modal
        console.log('User needs to log in');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
          {isImageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
              <ImageOff className="h-10 w-10 mb-2 text-primary/40" />
              <span className="text-xs text-primary/60 font-medium">
                Preview not available
              </span>
            </div>
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="object-cover w-full h-full"
              onError={() => setIsImageError(true)}
            />
          )}
        </div>
      )}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="w-full"
          onClick={() => document.getElementById('image-upload')?.click()}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Image
            </>
          )}
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Loader2, Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
  value?: File | string | null;
  previewUrl?: string | null;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export function FileUpload({
  onFileChange,
  value,
  previewUrl,
  accept = 'image/*',
  maxSize = 5, // Default 5MB
  className = '',
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    typeof value === 'string' ? value : previewUrl || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);

    if (!file) {
      onFileChange(null);
      setPreview(null);
      return;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onFileChange(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileChange(null);
    setPreview(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? (
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
        {preview && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {preview && (
        <div className="relative mt-2 rounded-md overflow-hidden border border-input">
          <img
            src={preview}
            alt="Preview"
            className="max-h-[200px] w-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}

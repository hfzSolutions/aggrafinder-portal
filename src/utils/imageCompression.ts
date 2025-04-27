import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
}

/**
 * Compresses an image file to reduce its size before uploading
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns A promise that resolves to the compressed file
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  // Default compression options
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 0.5, // Reduced max size to 500KB
    maxWidthOrHeight: 1200, // Reduced max dimensions
    useWebWorker: true, // Use web worker for better performance
    quality: 0.7, // Reduced quality for smaller file size
  };

  // Merge default options with provided options
  const compressionOptions = { ...defaultOptions, ...options };

  try {
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      console.log('File is not an image, skipping compression');
      return file;
    }

    // Skip compression for small files (less than 200KB)
    if (file.size < 200 * 1024) {
      console.log('Image is already small, skipping compression');
      return file;
    }

    // console.log('Compressing image...', {
    //   originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    //   originalType: file.type,
    // });

    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    console.log('Compression complete', {
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      compressedSize: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
      compressionRatio: `${(
        (1 - compressedFile.size / file.size) *
        100
      ).toFixed(2)}%`,
    });

    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    // Return the original file if compression fails
    return file;
  }
};

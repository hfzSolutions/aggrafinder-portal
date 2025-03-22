/**
 * Utility functions for file handling
 */

/**
 * Sanitizes a filename by removing spaces and special characters
 * @param filename - The original filename to sanitize
 * @returns A sanitized filename safe for storage
 */
export const sanitizeFilename = (filename: string): string => {
  if (!filename) return filename;

  // Get file extension
  const lastDotIndex = filename.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? filename.slice(lastDotIndex) : '';
  const nameWithoutExtension =
    lastDotIndex !== -1 ? filename.slice(0, lastDotIndex) : filename;

  // Replace spaces and special characters with underscores
  // Keep alphanumeric characters, underscores, and hyphens
  const sanitizedName = nameWithoutExtension
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/_+/g, '_'); // Replace multiple consecutive underscores with a single one

  return sanitizedName + extension;
};

/**
 * Utility function to get the site URL from environment variables
 * with a fallback to window.location.origin
 */
export const getSiteUrl = (): string => {
  return import.meta.env.VITE_SITE_URL || window.location.origin;
};

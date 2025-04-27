import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Define UTM parameter types
export interface UTMParams {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  [key: string]: string | undefined; // Allow for custom UTM parameters
}

// Storage key for UTM parameters in localStorage
const UTM_STORAGE_KEY = 'utm_parameters';
const UTM_TIMESTAMP_KEY = 'utm_timestamp';

// Default expiration time for UTM parameters (7 days in milliseconds)
const DEFAULT_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Extract UTM parameters from URL search params
 * @param searchParams - URLSearchParams object
 * @returns Object containing UTM parameters
 */
export const extractUTMParams = (searchParams: URLSearchParams): UTMParams => {
  const utmParams: UTMParams = {};

  // Extract standard UTM parameters
  const utmSource = searchParams.get('utm_source');
  const utmMedium = searchParams.get('utm_medium');
  const utmCampaign = searchParams.get('utm_campaign');
  const utmTerm = searchParams.get('utm_term');
  const utmContent = searchParams.get('utm_content');

  // Add parameters to the object if they exist
  if (utmSource) utmParams.source = utmSource;
  if (utmMedium) utmParams.medium = utmMedium;
  if (utmCampaign) utmParams.campaign = utmCampaign;
  if (utmTerm) utmParams.term = utmTerm;
  if (utmContent) utmParams.content = utmContent;

  // Look for any custom UTM parameters
  searchParams.forEach((value, key) => {
    if (
      key.startsWith('utm_') &&
      ![
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
      ].includes(key)
    ) {
      // Extract the parameter name without the 'utm_' prefix
      const paramName = key.substring(4);
      utmParams[paramName] = value;
    }
  });

  return utmParams;
};

/**
 * Save UTM parameters to localStorage
 * @param utmParams - UTM parameters object
 */
export const saveUTMParams = (utmParams: UTMParams): void => {
  if (Object.keys(utmParams).length === 0) return;

  try {
    localStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmParams));
    localStorage.setItem(UTM_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving UTM parameters to localStorage:', error);
  }
};

/**
 * Get stored UTM parameters from localStorage
 * @returns UTM parameters object or null if not found or expired
 */
export const getStoredUTMParams = (): UTMParams | null => {
  try {
    const storedParams = localStorage.getItem(UTM_STORAGE_KEY);
    const timestamp = localStorage.getItem(UTM_TIMESTAMP_KEY);

    if (!storedParams || !timestamp) return null;

    // Check if UTM parameters have expired
    const storedTime = parseInt(timestamp, 10);
    const currentTime = Date.now();

    if (currentTime - storedTime > DEFAULT_EXPIRATION_MS) {
      // Clear expired UTM parameters
      localStorage.removeItem(UTM_STORAGE_KEY);
      localStorage.removeItem(UTM_TIMESTAMP_KEY);
      return null;
    }

    return JSON.parse(storedParams) as UTMParams;
  } catch (error) {
    console.error('Error retrieving UTM parameters from localStorage:', error);
    return null;
  }
};

/**
 * React hook to track UTM parameters
 * @returns Current UTM parameters
 */
export const useUTMTracker = (): UTMParams | null => {
  const location = useLocation();

  useEffect(() => {
    // Extract UTM parameters from URL
    const searchParams = new URLSearchParams(location.search);
    const utmParams = extractUTMParams(searchParams);

    // Save UTM parameters if they exist
    if (Object.keys(utmParams).length > 0) {
      saveUTMParams(utmParams);
    }
  }, [location.search]);

  // Return the current UTM parameters
  return getStoredUTMParams();
};

/**
 * Add UTM parameters to analytics tracking
 * @param category - Event category
 * @param action - Event action
 * @param label - Event label
 * @returns Enhanced event data with UTM parameters
 */
export const enhanceAnalyticsWithUTM = (
  category: string,
  action: string,
  label?: string
): {
  category: string;
  action: string;
  label?: string;
  utmParams?: UTMParams;
} => {
  const utmParams = getStoredUTMParams();

  return {
    category,
    action,
    label,
    ...(utmParams && { utmParams }),
  };
};

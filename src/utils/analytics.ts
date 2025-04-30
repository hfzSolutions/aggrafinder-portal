import ReactGA from 'react-ga4';
import { getStoredUTMParams, UTMParams } from './utmTracker';

// Initialize Google Analytics with your tracking ID
// Using the same ID as in index.html (G-G09RG52H8E)
// For Google Analytics 4, the ID format is 'G-XXXXXXXXXX'
const TRACKING_ID = import.meta.env.REACT_APP_GA_TRACKING_ID || 'G-G09RG52H8E';

/**
 * Initialize Google Analytics
 */
export const initGA = () => {
  if (typeof window !== 'undefined') {
    ReactGA.initialize(TRACKING_ID);
  }
};

/**
 * Track page views
 * @param path - The current page path
 */
export const pageView = (path: string) => {
  const utmParams = getStoredUTMParams();
  const customDimensions = utmParamsToCustomDimensions(utmParams);

  ReactGA.send({
    hitType: 'pageview',
    page: path,
    ...customDimensions,
  });
};

/**
 * Convert UTM parameters to GA4 custom dimensions
 * @param utmParams - UTM parameters object
 * @returns Object with custom dimensions
 */
const utmParamsToCustomDimensions = (utmParams: UTMParams | null) => {
  if (!utmParams) return {};

  const dimensions: Record<string, string> = {};

  // Map UTM parameters to custom dimensions
  if (utmParams.source) dimensions.utm_source = utmParams.source;
  if (utmParams.medium) dimensions.utm_medium = utmParams.medium;
  if (utmParams.campaign) dimensions.utm_campaign = utmParams.campaign;
  if (utmParams.term) dimensions.utm_term = utmParams.term;
  if (utmParams.content) dimensions.utm_content = utmParams.content;

  return dimensions;
};

/**
 * Track events
 * @param category - Event category
 * @param action - Event action
 * @param label - Event label (optional)
 * @param value - Event value (optional)
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  const utmParams = getStoredUTMParams();
  const customDimensions = utmParamsToCustomDimensions(utmParams);

  ReactGA.event({
    category,
    action,
    label,
    value,
    ...customDimensions,
  });
};

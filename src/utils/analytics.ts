
import ReactGA from 'react-ga4';

// Initialize Google Analytics with your tracking ID
// TODO: Replace with your actual Google Analytics tracking ID
// For Google Analytics 4, the ID format is 'G-XXXXXXXXXX'
const TRACKING_ID = import.meta.env.REACT_APP_GA_TRACKING_ID || 'G-XXXXXXXXXX';

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
  ReactGA.send({ hitType: 'pageview', page: path });
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
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
};

/**
 * Track affiliate link clicks
 * @param affiliateCode - The affiliate code
 * @param toolId - The tool ID
 * @param toolName - The tool name
 */
export const trackAffiliateClick = (
  affiliateCode: string,
  toolId: string,
  toolName: string
) => {
  trackEvent('affiliate', 'click', `${toolName} (${affiliateCode})`);
};

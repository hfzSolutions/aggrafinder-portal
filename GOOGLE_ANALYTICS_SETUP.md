# Google Analytics Setup Guide

## Overview

This document provides instructions on how to set up Google Analytics 4 (GA4) for the AggraFinder Portal application.

## Prerequisites

- A Google account
- Access to Google Analytics

## Steps to Set Up Google Analytics

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click on "Admin" in the bottom left corner
4. In the Account column, select "Create Account" if you don't have one
5. Fill in the account details and click "Next"
6. In the Property column, click "Create Property"
7. Select "Web" as the platform
8. Enter your website name, URL, industry category, and time zone
9. Click "Create"

### 2. Get Your Measurement ID (Tracking ID)

1. After creating your property, you'll be taken to the Property setup page
2. Look for "Measurement ID" or "Tracking ID" (it should start with "G-")
3. Copy this ID as you'll need it for the next step

### 3. Configure the Application

#### Option 1: Using Environment Variables (Recommended)

1. Create a `.env` file in the root of the project if it doesn't exist
2. Add the following line to the `.env` file:
   ```
   REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
   ```
   Replace `G-XXXXXXXXXX` with your actual Measurement ID

#### Option 2: Direct Code Update

1. Open the file `src/utils/analytics.ts`
2. Replace the placeholder tracking ID with your actual Measurement ID:
   ```typescript
   const TRACKING_ID = 'G-XXXXXXXXXX'; // Replace with your actual ID
   ```

## Verifying Installation

1. Start your application in development mode
2. Open the browser console and check for any errors related to Google Analytics
3. Visit the Google Analytics Real-Time reports to see if your visits are being tracked
4. Navigate through different pages of your application to ensure page views are being tracked

## Additional Configuration

### Custom Events

The application is already set up to track the following events:

- Page views (automatic when navigating between pages)
- Navigation clicks (when users click on navigation links)
- Theme toggles (when users switch between light and dark mode)

To add more custom events, use the `trackEvent` function from `src/utils/analytics.ts`:

```typescript
import { trackEvent } from '@/utils/analytics';

// Example usage
trackEvent('category', 'action', 'label', value);
```

### Privacy Considerations

Ensure your privacy policy is updated to include information about Google Analytics tracking. The application's cookie policy should also mention the use of Google Analytics cookies.

## Troubleshooting

- If events aren't being tracked, check that the Measurement ID is correct
- Ensure that ad blockers aren't preventing Google Analytics from loading
- Verify that the Google Analytics script is being loaded properly in the browser

## Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [React GA4 Package Documentation](https://www.npmjs.com/package/react-ga4)

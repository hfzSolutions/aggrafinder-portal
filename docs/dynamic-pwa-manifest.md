# Dynamic PWA Manifest Implementation

This document explains how the dynamic PWA manifest system works in the DeepListAI application.

## Overview

The application now supports dynamic PWA manifests that update the `start_url` based on the currently viewed quick tool. When a user opens a specific AI tool, the PWA manifest is updated to point to that tool's URL, making it the entry point when the app is launched from the home screen.

## Key Components

### 1. API Endpoint (`/api/manifest/[toolId]`)

**Location**: `api/manifest/[toolId].js`

This Vercel serverless function generates a dynamic manifest.json based on the `toolId` parameter:

```javascript
// Example response for toolId "abc123"
{
  "name": "DeepListAI",
  "short_name": "DeepListAI",
  "description": "Find the Best AI Tools for Your Needs",
  "start_url": "/quick-tools/abc123",  // Dynamic based on toolId
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4f46e5",
  "icons": [...] // Static icons
}
```

### 2. Dynamic Manifest Hook (`useDynamicManifest`)

**Location**: `src/hooks/useDynamicManifest.ts`

A React hook that manages manifest updates automatically:

```typescript
const { updateManifest, resetToDefaultManifest } = useDynamicManifest(
  toolId,
  toolName
);
```

**Features**:

- Automatically updates manifest when `toolId` changes
- Handles browser navigation events (back/forward)
- Manages tab visibility changes
- Resets to default manifest on cleanup
- Updates Apple mobile web app title

### 3. Enhanced Service Worker

**Location**: `public/service-worker.js`

The service worker caches dynamic manifests for offline access:

- Uses separate cache (`deeplistai-manifests-v1`) for manifest files
- Provides network-first strategy with cache fallback
- Cleans up old caches automatically

### 4. PWA Install Prompt Component

**Location**: `src/components/ui/PWAInstallPrompt.tsx`

Updated to work with dynamic manifests:

- Updates manifest link before showing install prompt
- Sets appropriate meta tags for better PWA experience
- Handles platform-specific install instructions

## How It Works

### 1. Tool Page Load

When a user navigates to `/quick-tools/[toolId]`:

1. `QuickToolChat` component mounts
2. `useDynamicManifest` hook automatically:
   - Removes existing manifest link from `<head>`
   - Adds new manifest link: `/api/manifest/[toolId]`
   - Updates Apple mobile web app title

### 2. Browser Events

The hook listens for:

- **`beforeunload`**: Resets manifest when navigating away
- **`visibilitychange`**: Updates/resets manifest based on tab visibility
- **`popstate`**: Handles browser back/forward navigation

### 3. API Response

When browser requests `/api/manifest/[toolId]`:

- Vercel function validates `toolId` parameter
- Generates manifest with dynamic `start_url`
- Returns JSON with appropriate headers
- Service worker caches response

### 4. PWA Installation

When user installs PWA:

- Current manifest (with specific tool URL) is used
- App will launch directly to that tool
- Icon and app name remain consistent

## Testing

### Manual Testing

1. Navigate to any quick tool page
2. Check developer tools > Application > Manifest
3. Verify `start_url` matches current tool ID
4. Test PWA install and launch behavior

### API Testing

Visit `/api/test/[toolId]` to see manifest data and test API functionality.

### Browser Events Testing

1. Open quick tool in one tab
2. Switch tabs or minimize browser
3. Return to tab - manifest should re-update
4. Use browser back/forward buttons
5. Close tab/browser - manifest should reset

## Configuration

### Vercel Configuration

`vercel.json` includes:

```json
{
  "functions": {
    "api/manifest/[toolId].js": {
      "runtime": "nodejs18.x"
    }
  },
  "rewrites": [
    {
      "source": "/api/manifest/(.*)",
      "destination": "/api/manifest/[toolId].js"
    }
  ]
}
```

### Cache Settings

- Manifest API responses cached for 1 hour
- Service worker caches manifests indefinitely with network-first strategy
- Cache name: `deeplistai-manifests-v1`

## Benefits

1. **Better UX**: Users can install specific tools as PWAs
2. **Direct Access**: Installed PWAs launch directly to the intended tool
3. **Offline Support**: Cached manifests work offline
4. **SEO Friendly**: Each tool can have its own PWA identity
5. **Analytics**: Can track which tools are installed as PWAs

## Implementation Notes

- Hook automatically handles all manifest management
- No manual intervention needed in components
- Graceful fallback to default manifest
- TypeScript support with proper types
- Error handling for API failures
- Cleanup on component unmount

## Future Enhancements

1. **Tool-Specific Icons**: Dynamic icons based on tool category
2. **Custom Names**: Tool-specific app names in manifest
3. **Analytics**: Track PWA installs per tool
4. **Background Sync**: Sync tool data in background
5. **Shortcuts**: Add shortcuts to related tools in manifest

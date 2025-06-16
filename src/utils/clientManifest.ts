/**
 * Client-side manifest generator for dynamic PWA manifests
 * This works around Vite's lack of built-in API routes
 */

export const generateDynamicManifest = (toolId: string): object => {
  return {
    name: 'DeepListAI',
    short_name: 'DeepListAI',
    description: 'Find the Best AI Tools for Your Needs',
    start_url: `/quick-tools/${toolId}`,
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/images/web-logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/web-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
};

export const createManifestBlob = (toolId: string): string => {
  const manifest = generateDynamicManifest(toolId);
  const manifestJson = JSON.stringify(manifest, null, 2);
  const blob = new Blob([manifestJson], { type: 'application/manifest+json' });
  return URL.createObjectURL(blob);
};

export const updateManifestLink = (toolId: string): void => {
  // Remove existing manifest link
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
  }

  // Create new manifest link with blob URL
  const manifestBlob = createManifestBlob(toolId);
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = manifestBlob;
  
  // Add to document head
  document.head.appendChild(manifestLink);
  
  console.log(`Updated manifest for tool: ${toolId}`);
};

export const resetToDefaultManifest = (): void => {
  // Remove existing manifest link
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
  }

  // Create default manifest link
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = '/manifest.json';
  
  // Add to document head
  document.head.appendChild(manifestLink);
  
  console.log('Reset to default manifest');
};

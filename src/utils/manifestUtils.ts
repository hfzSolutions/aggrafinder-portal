/**
 * Utility functions for dynamically managing PWA manifest
 */

export const updateManifestForTool = (toolId: string) => {
  // Remove existing manifest link
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
  }

  // Create new manifest link with dynamic toolId
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = `/api/manifest/${toolId}`;
  
  // Add to document head
  document.head.appendChild(manifestLink);
};

export const resetToDefaultManifest = () => {
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
};

/**
 * Generate dynamic manifest JSON for a specific tool
 */
export const generateManifestForTool = (toolId: string) => {
  return {
    name: "DeepListAI",
    short_name: "DeepListAI",
    description: "Find the Best AI Tools for Your Needs", 
    start_url: `/quick-tools/${toolId}`,
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/images/web-logo.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/images/web-logo.png",
        sizes: "512x512", 
        type: "image/png"
      }
    ]
  };
};

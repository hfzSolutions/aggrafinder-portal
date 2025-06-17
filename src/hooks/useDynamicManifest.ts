import { useEffect, useCallback } from 'react';
import {
  updateManifestLink,
  resetToDefaultManifest as resetManifest,
} from '@/utils/clientManifest';

/**
 * Hook to manage dynamic PWA manifest updates
 */
export const useDynamicManifest = (toolId: string, toolName?: string) => {
  const updateManifest = useCallback(
    async (currentToolId: string, currentToolName?: string) => {
      try {
        // First try the API endpoint (for production)
        const response = await fetch(`/api/manifest/${currentToolId}`);
        if (response.ok) {
          // Remove existing manifest link
          const existingManifest = document.querySelector(
            'link[rel="manifest"]'
          );
          if (existingManifest) {
            existingManifest.remove();
          }

          // Create new manifest link with API URL
          const manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          manifestLink.href = `/api/manifest/${currentToolId}`;

          // Add to document head
          document.head.appendChild(manifestLink);
          console.log(`Updated manifest via API for tool: ${currentToolId}`);
        } else {
          // Fallback to client-side generation
          updateManifestLink(currentToolId);
        }
      } catch (error) {
        // Fallback to client-side generation
        console.log('API not available, using client-side manifest generation');
        updateManifestLink(currentToolId);
      }

      // Update apple mobile web app title if tool name is provided
      if (currentToolName) {
        const titleMeta = document.querySelector(
          'meta[name="apple-mobile-web-app-title"]'
        );
        if (titleMeta) {
          titleMeta.setAttribute('content', currentToolName);
        } else {
          // Create the meta tag if it doesn't exist
          const newTitleMeta = document.createElement('meta');
          newTitleMeta.name = 'apple-mobile-web-app-title';
          newTitleMeta.content = currentToolName;
          document.head.appendChild(newTitleMeta);
        }
      }
    },
    []
  );

  const resetToDefaultManifest = useCallback(() => {
    resetManifest();

    // Reset apple mobile web app title
    const titleMeta = document.querySelector(
      'meta[name="apple-mobile-web-app-title"]'
    );
    if (titleMeta) {
      titleMeta.setAttribute('content', 'DeepListAI');
    }
  }, []);

  // Update manifest when toolId changes
  useEffect(() => {
    if (toolId) {
      updateManifest(toolId, toolName);
    }

    // Cleanup function to reset manifest
    return () => {
      resetToDefaultManifest();
    };
  }, [toolId, toolName, updateManifest, resetToDefaultManifest]);

  // Handle browser navigation events
  useEffect(() => {
    const handleBeforeUnload = () => {
      resetToDefaultManifest();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Reset to default when tab becomes hidden
        resetToDefaultManifest();
      } else if (toolId) {
        // Re-apply tool-specific manifest when tab becomes visible
        updateManifest(toolId, toolName);
      }
    };

    // Handle browser back/forward navigation
    const handlePopState = () => {
      // Small delay to allow URL to update
      setTimeout(() => {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/quick-tools/') && toolId) {
          updateManifest(toolId, toolName);
        } else {
          resetToDefaultManifest();
        }
      }, 100);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [toolId, toolName, updateManifest, resetToDefaultManifest]);

  return {
    updateManifest,
    resetToDefaultManifest,
  };
};

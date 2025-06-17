import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, X } from 'lucide-react';

interface PWAInstallPromptProps {
  toolId: string;
  toolName: string;
  toolImageUrl?: string;
  onClose?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  toolId,
  toolName,
  toolImageUrl,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Small delay to ensure manifest is loaded
    const manifestDelay = setTimeout(() => {
      // Update manifest dynamically first
      updateManifest(toolId, toolName, toolImageUrl);
      
      // Then set up event listeners
      const handleBeforeInstallPrompt = (e: Event) => {
        console.log('Before install prompt event fired');
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallPrompt(true);
      };

      // Listen for successful installation
      const handleAppInstalled = () => {
        console.log('App installed successfully');
        setIsInstalled(true);
        setShowInstallPrompt(false);
        setDeferredPrompt(null);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      // Force show prompt after delay if no event fires (for testing)
      const forcePromptDelay = setTimeout(() => {
        if (!deferredPrompt && !isInstalled) {
          console.log('No install prompt detected, showing manual prompt');
          setShowInstallPrompt(true);
        }
      }, 3000);

      return () => {
        clearTimeout(forcePromptDelay);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
    }, 1000);

    return () => {
      clearTimeout(manifestDelay);
    };
  }, [toolId, toolName, toolImageUrl, deferredPrompt, isInstalled]);

  const updateManifest = async (
    toolId: string,
    toolName: string,
    toolImageUrl?: string
  ) => {
    try {
      // Remove existing manifest link
      const existingManifest = document.querySelector('link[rel="manifest"]');
      if (existingManifest) {
        existingManifest.remove();
      }

      // Test if API endpoint is working
      const testResponse = await fetch(`/api/manifest/${toolId}`);
      
      if (testResponse.ok) {
        // Add new dynamic manifest link
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = `/api/manifest/${toolId}`;
        document.head.appendChild(link);
        console.log(`Dynamic manifest loaded for tool: ${toolId}`);
      } else {
        console.warn('API endpoint not working, using fallback');
        // Fallback to client-side generation
        const manifest = {
          name: 'DeepListAI',
          short_name: 'DeepListAI',
          description: 'Find the Best AI Tools for Your Needs',
          start_url: `https://deeplistai.com/quick-tools/${toolId}`,
          scope: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#4f46e5',
          icons: [
            {
              src: 'https://deeplistai.com/images/web-logo.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'https://deeplistai.com/images/web-logo.png',
              sizes: '512x512',
              type: 'image/png',
            },
          ],
        };
        
        const manifestJson = JSON.stringify(manifest);
        const blob = new Blob([manifestJson], { type: 'application/manifest+json' });
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('link');
        link.rel = 'manifest';
        link.href = blobUrl;
        document.head.appendChild(link);
        console.log(`Client-side manifest generated for tool: ${toolId}`);
      }

      // Update other meta tags for better PWA experience
      const titleMeta = document.querySelector(
        'meta[name="apple-mobile-web-app-title"]'
      );
      if (titleMeta) {
        titleMeta.setAttribute('content', toolName);
      }

      // Update theme color for this specific tool if needed
      const themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', '#4f46e5');
      }
    } catch (error) {
      console.error('Error updating manifest:', error);
      // Reset to default manifest on error
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no install prompt available, show manual instructions
      showManualInstallInstructions();
      return;
    }

    try {
      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }

      // Clear the deferredPrompt
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error showing install prompt:', error);
      showManualInstallInstructions();
    }
  };

  const showManualInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    let instructions = '';
    if (isIOS) {
      instructions = 'Tap the Share button and select "Add to Home Screen"';
    } else if (isAndroid) {
      instructions =
        'Tap the menu button and select "Add to Home screen" or "Install app"';
    } else {
      instructions =
        'Use your browser\'s menu to "Add to Home screen" or "Install app"';
    }

    alert(`To install this tool:\n\n${instructions}`);
  };

  const handleClose = () => {
    setShowInstallPrompt(false);
    onClose?.();
  };

  if (isInstalled) {
    return null; // Don't show anything if already installed
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-sm">Install {toolName}</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
        Get quick access to this AI tool right from your home screen!
      </p>

      <div className="flex gap-2">
        <Button onClick={handleInstallClick} size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
        <Button variant="outline" size="sm" onClick={handleClose}>
          Later
        </Button>
      </div>
    </div>
  );
};

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

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Update manifest dynamically
    updateManifest(toolId, toolName, toolImageUrl);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [toolId, toolName, toolImageUrl]);

  const updateManifest = (toolId: string, toolName: string, toolImageUrl?: string) => {
    // Remove existing manifest link
    const existingManifest = document.querySelector('link[rel="manifest"]');
    if (existingManifest) {
      existingManifest.remove();
    }

    // Add new dynamic manifest link
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = `/api/manifest/${toolId}`;
    document.head.appendChild(link);

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

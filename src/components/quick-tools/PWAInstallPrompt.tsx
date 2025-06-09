import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Download, Share, Plus, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PWAInstallPromptProps {
  toolName: string;
  toolImage?: string;
  onDismiss?: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = ({
  toolName,
  toolImage,
  onDismiss,
}: PWAInstallPromptProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

  // Device detection
  useEffect(() => {
    const userAgent =
      navigator.userAgent || navigator.vendor || (window as any).opera;
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
    const isAndroidDevice = /android/i.test(userAgent);
    const isInStandaloneMode =
      (window.navigator as any).standalone ||
      window.matchMedia('(display-mode: standalone)').matches;

    // Debug mode for testing on desktop
    const urlParams = new URLSearchParams(window.location.search);
    const debugMode =
      urlParams.get('pwa-debug') === 'true' || import.meta.env.DEV;
    const forceDevice = urlParams.get('pwa-device'); // 'ios' or 'android'

    setIsIOS(isIOSDevice || (debugMode && forceDevice === 'ios'));
    setIsAndroid(isAndroidDevice || (debugMode && forceDevice === 'android'));
    setIsStandalone(isInStandaloneMode);

    // Check if user has already dismissed for this tool
    const dismissedKey = `pwa-dismissed-${toolName}-${window.location.pathname}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    setHasBeenDismissed(!!wasDismissed);

    // Show prompt if on mobile, not in standalone mode, and not dismissed
    // OR if in debug mode
    if (
      (isIOSDevice || isAndroidDevice || debugMode) &&
      !isInStandaloneMode &&
      !wasDismissed
    ) {
      // Delay showing the prompt to avoid overwhelming the user
      const timer = setTimeout(
        () => {
          setIsVisible(true);
        },
        debugMode ? 1000 : 3000
      ); // Shorter delay in debug mode
      return () => clearTimeout(timer);
    }
  }, [toolName]);

  // Handle Android PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstall = async () => {
    if (isAndroid && deferredPrompt) {
      // Android PWA install
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        handleDismiss(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = (installed = false) => {
    setIsVisible(false);

    // Remember dismissal for this specific tool and current page
    const dismissedKey = `pwa-dismissed-${toolName}-${window.location.pathname}`;
    localStorage.setItem(dismissedKey, Date.now().toString());

    onDismiss?.();
  };

  // Don't show if already dismissed, in standalone mode, or not on mobile
  if (
    hasBeenDismissed ||
    isStandalone ||
    (!isIOS && !isAndroid) ||
    !isVisible
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed bottom-2 left-2 right-2 z-50 mx-auto max-w-sm sm:max-w-md sm:bottom-4 sm:left-4 sm:right-4"
      >
        <div className="bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl sm:rounded-2xl"></div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 sm:top-3 sm:right-3 h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground hover:text-foreground"
            onClick={() => handleDismiss()}
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>

          <div className="relative z-10">
            {/* App icon and name */}
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 flex-shrink-0">
                {toolImage ? (
                  <img
                    src={toolImage}
                    alt={toolName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const nextSibling =
                        target.nextElementSibling as HTMLElement;
                      if (nextSibling) {
                        nextSibling.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <Smartphone
                  className={cn(
                    'h-6 w-6 sm:h-7 sm:w-7 text-primary',
                    toolImage ? 'hidden' : ''
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">
                  Add {toolName}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Quick access from home screen
                </p>
              </div>
            </div>

            {/* Instructions based on device */}
            {isIOS ? (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Tap <Share className="inline h-4 w-4 mx-1" /> below, then
                  scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-sm h-9 sm:h-10 px-3"
                    onClick={() => handleDismiss()}
                  >
                    Maybe later
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-sm h-9 sm:h-10 px-3"
                    onClick={() => handleDismiss()} // Just dismiss instead of showing duplicate alert
                  >
                    Got it
                  </Button>
                </div>
              </div>
            ) : isAndroid && deferredPrompt ? (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Install this AI tool as an app for quick access
                </p>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-sm h-9 sm:h-10 px-3"
                    onClick={() => handleDismiss()}
                  >
                    Not now
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-sm h-9 sm:h-10 px-3"
                    onClick={handleInstall}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Install
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Bookmark this page for quick access to {toolName}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm h-9 sm:h-10"
                  onClick={() => handleDismiss()}
                >
                  Got it
                </Button>
              </div>
            )}

            {/* Benefits - Show simplified version on small screens */}
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500"></div>
                  <span>Quick access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-blue-500"></div>
                  <span className="hidden sm:inline">No browser</span>
                  <span className="sm:hidden">Direct</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-purple-500"></div>
                  <span className="hidden sm:inline">App-like</span>
                  <span className="sm:hidden">App</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

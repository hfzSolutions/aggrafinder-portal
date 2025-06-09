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

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsStandalone(isInStandaloneMode);

    // Check if user has already dismissed for this tool
    const dismissedKey = `pwa-dismissed-${window.location.pathname}`;
    const wasDismissed = localStorage.getItem(dismissedKey);
    setHasBeenDismissed(!!wasDismissed);

    // Show prompt if on mobile, not in standalone mode, and not dismissed
    if (
      (isIOSDevice || isAndroidDevice) &&
      !isInStandaloneMode &&
      !wasDismissed
    ) {
      // Delay showing the prompt to avoid overwhelming the user
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

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

    // Remember dismissal for this specific tool
    const dismissedKey = `pwa-dismissed-${window.location.pathname}`;
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
        className="fixed bottom-2 left-2 right-2 z-50 mx-auto max-w-xs sm:max-w-sm sm:bottom-4 sm:left-4 sm:right-4"
      >
        <div className="bg-background/95 backdrop-blur-md border border-primary/20 rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl sm:rounded-2xl"></div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 sm:top-2 sm:right-2 h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground hover:text-foreground"
            onClick={() => handleDismiss()}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>

          <div className="relative z-10">
            {/* App icon and name */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 flex-shrink-0">
                {toolImage ? (
                  <img
                    src={toolImage}
                    alt={toolName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove(
                        'hidden'
                      );
                    }}
                  />
                ) : null}
                <Smartphone
                  className={cn(
                    'h-5 w-5 sm:h-6 sm:w-6 text-primary',
                    toolImage && 'hidden'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-xs sm:text-sm text-foreground truncate">
                  Add {toolName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Quick access from home screen
                </p>
              </div>
            </div>

            {/* Instructions based on device */}
            {isIOS ? (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs text-muted-foreground leading-tight">
                  Tap <Share className="inline h-3 w-3 mx-0.5" /> below, then
                  scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-7 sm:h-8 px-2"
                    onClick={() => handleDismiss()}
                  >
                    Maybe later
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-7 sm:h-8 px-2"
                    onClick={() => {
                      // iOS doesn't have programmatic install, just show instructions
                      alert(
                        'Tap the Share button (square with arrow) at the bottom of your screen, then scroll down and tap "Add to Home Screen"'
                      );
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    <span className="hidden xs:inline">Show me how</span>
                    <span className="xs:hidden">How</span>
                  </Button>
                </div>
              </div>
            ) : isAndroid && deferredPrompt ? (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs text-muted-foreground leading-tight">
                  Install this AI tool as an app for quick access
                </p>
                <div className="flex gap-1.5 sm:gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs h-7 sm:h-8 px-2"
                    onClick={() => handleDismiss()}
                  >
                    Not now
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-xs h-7 sm:h-8 px-2"
                    onClick={handleInstall}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Install
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                <p className="text-xs text-muted-foreground leading-tight">
                  Bookmark this page for quick access to {toolName}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7 sm:h-8"
                  onClick={() => handleDismiss()}
                >
                  Got it
                </Button>
              </div>
            )}

            {/* Benefits - Show simplified version on small screens */}
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-border/50">
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-green-500"></div>
                  <span className="hidden sm:inline">Works offline</span>
                  <span className="sm:hidden">Offline</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-blue-500"></div>
                  <span className="hidden sm:inline">Faster loading</span>
                  <span className="sm:hidden">Fast</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-purple-500"></div>
                  <span className="hidden sm:inline">Native feel</span>
                  <span className="sm:hidden">Native</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

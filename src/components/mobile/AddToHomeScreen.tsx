import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type BrowserType = 'ios' | 'android' | 'other';

const AddToHomeScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [browser, setBrowser] = useState<BrowserType>('other');
  const isMobile = useIsMobile();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    // Only show on mobile devices
    if (!isMobile) return;

    // Check if user has already dismissed or installed
    const hasInteracted = localStorage.getItem('add_to_home_prompt_interacted');
    if (hasInteracted) return;

    // Detect browser type
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua) && !window.navigator.standalone) {
      setBrowser('ios');
    } else if (/android/.test(ua)) {
      setBrowser('android');
    } else {
      setBrowser('other');
      return; // Don't show for unsupported browsers
    }

    // Show the prompt after a delay to not interrupt initial experience
    const timer = setTimeout(() => {
      setIsVisible(true);
      trackEvent('user_engagement', 'add_to_home_prompt_shown', {
        browser_type: browser,
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [isMobile, trackEvent, browser]);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('add_to_home_prompt_interacted', 'dismissed');
    trackEvent('user_engagement', 'add_to_home_prompt_dismissed', {
      browser_type: browser,
    });
  };

  const handleInstallClick = () => {
    localStorage.setItem('add_to_home_prompt_interacted', 'installed');
    trackEvent('user_engagement', 'add_to_home_prompt_accepted', {
      browser_type: browser,
    });
    // We can't actually install it for them, but we can mark it as "installed" for our tracking
  };

  if (!isVisible || !isMobile) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
      <Card className="border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">Add to Home Screen</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Add DeepList AI to your home screen for quick access to AI tools!
          </p>

          {browser === 'ios' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  1
                </div>
                <p>
                  Tap the share button{' '}
                  <span className="inline-block w-5 h-5 bg-gray-300 rounded text-center leading-5">
                    ↑
                  </span>{' '}
                  at the bottom of your browser
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  2
                </div>
                <p>Scroll and tap "Add to Home Screen"</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  3
                </div>
                <p>Tap "Add" in the top right corner</p>
              </div>
            </div>
          )}

          {browser === 'android' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  1
                </div>
                <p>
                  Tap the menu button{' '}
                  <span className="inline-block w-5 h-5 bg-gray-300 rounded text-center leading-5">
                    ⋮
                  </span>{' '}
                  in your browser
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  2
                </div>
                <p>Tap "Add to Home screen"</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  3
                </div>
                <p>Tap "Add" when prompted</p>
              </div>
            </div>
          )}

          <Button
            className="w-full mt-4"
            onClick={handleInstallClick}
            variant="default"
          >
            Got it!
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddToHomeScreen;

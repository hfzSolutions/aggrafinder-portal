import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';
import { useAnalytics } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';
import { Mail } from 'lucide-react';

interface InlineSubscriptionProps {
  viewType?: 'grid' | 'list';
  compact?: boolean;
}

const InlineSubscription = ({
  viewType = 'grid',
  compact = false,
}: InlineSubscriptionProps) => {
  const [email, setEmail] = useState('');
  const { subscribe, isLoading } = useNewsletterSubscription();

  const { trackEvent } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('newsletter', 'subscription_attempt', {
      source: 'tools_page',
      view_type: viewType,
    });

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    const { success, error } = await subscribe(email);

    if (success) {
      setEmail('');
      toast.success("You've been subscribed to our newsletter.");
    } else {
      toast.error(error || 'Failed to subscribe. Please try again.');
    }
  };

  if (viewType === 'list') {
    // Compact version for list view
    if (compact) {
      return (
        <div className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in">
          <div className="flex">
            <div className="relative w-1/4 min-w-[80px] overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
            </div>

            <div className="flex-1 p-3 flex flex-col">
              <h3 className="text-sm font-medium mb-1 line-clamp-1">
                Stay updated on AI tools
              </h3>

              <form onSubmit={handleSubmit} className="flex gap-2 mt-1">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs bg-background/70 flex-grow"
                  disabled={isLoading}
                  required
                />
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3 transition-all duration-300 bg-gradient-to-r from-primary whitespace-nowrap text-xs"
                  disabled={isLoading}
                >
                  {isLoading ? 'Subscribing...' : 'Subscribe'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      );
    }

    // Regular list view
    return (
      <div className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 animate-fade-in">
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-br-xl"></div>
        </div>

        <div className="flex flex-col sm:flex-row">
          <div className="relative sm:w-1/4 min-w-[120px] h-48 sm:h-auto overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
              <Mail className="h-8 w-8" />
            </div>
          </div>

          <div className="flex-1 p-5 flex flex-col">
            <div className="mb-3">
              <h3 className="text-lg font-medium mb-2">
                Stay updated on AI tools
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get the latest AI tools and resources delivered directly to your
                inbox.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 mt-auto"
            >
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-background/70 flex-grow"
                disabled={isLoading}
                required
              />
              <Button
                type="submit"
                className="h-10 transition-all duration-300 bg-gradient-to-r from-primary hover:shadow-lg hover:shadow-primary/20 whitespace-nowrap"
                disabled={isLoading}
              >
                {isLoading ? 'Subscribing...' : 'Subscribe Now'}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/10 rounded-xl pointer-events-none transition-all duration-300"></div>
      </div>
    );
  }

  // Compact version for grid view
  if (compact) {
    return (
      <div className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col animate-fade-in">
        <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-3 flex items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
        </div>

        <div className="p-3 flex-1 flex flex-col">
          <div className="text-center mb-2">
            <h3 className="text-sm font-medium mb-1">
              Stay updated on AI tools
            </h3>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 mt-1 flex-1"
          >
            <Input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-9 text-xs bg-background/70"
              disabled={isLoading}
              required
            />
            <Button
              type="submit"
              size="sm"
              className="h-9 w-full transition-all duration-300 bg-gradient-to-r from-primary text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Regular grid view
  return (
    <div className="group relative rounded-xl overflow-hidden bg-background border border-border/40 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 h-full flex flex-col animate-fade-in">
      {/* Card decoration elements similar to ToolCard */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-primary/20 to-transparent rounded-tl-xl"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/20 to-transparent rounded-br-xl"></div>
      </div>

      {/* Card header with gradient background */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 p-4 flex items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
          <Mail className="h-8 w-8" />
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium mb-2">Stay updated on AI tools</h3>
          <p className="text-sm text-muted-foreground">
            Get the latest AI tools and resources delivered directly to your
            inbox.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 mt-2 flex-1"
        >
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-10 bg-background/70"
            disabled={isLoading}
            required
          />
          <Button
            type="submit"
            className="h-10 w-full transition-all duration-300 bg-gradient-to-r from-primary hover:shadow-lg hover:shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? 'Subscribing...' : 'Subscribe Now'}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default InlineSubscription;

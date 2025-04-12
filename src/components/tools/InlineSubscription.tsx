
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail } from 'lucide-react';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';
import { trackEvent } from '@/utils/analytics';

const InlineSubscription = () => {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { subscribe, isLoading } = useNewsletterSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('user_engagement', 'newsletter_signup_tools_page');

    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    const { success, error } = await subscribe(email);

    if (success) {
      setEmail('');
      toast({
        title: 'Success!',
        description: "You've been subscribed to our newsletter.",
      });
    } else {
      toast({
        title: 'Error',
        description: error || 'Failed to subscribe. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="w-full bg-secondary/20 border border-border/50 rounded-xl p-6 my-8 animate-fade-in">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-0 flex-shrink-0">
          <Mail className="h-6 w-6" />
        </div>
        
        <div className="flex-1 space-y-2 text-center md:text-left">
          <h3 className="text-lg font-medium">Stay updated on AI tools</h3>
          <p className="text-sm text-muted-foreground">
            Get the latest AI tools and resources delivered directly to your inbox.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mt-2">
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
              className="h-10" 
              disabled={isLoading}
              size="sm"
            >
              {isLoading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-2">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InlineSubscription;

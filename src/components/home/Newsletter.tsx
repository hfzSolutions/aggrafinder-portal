import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useScrollAnimation } from '@/utils/animations';
import { useNewsletterSubscription } from '@/hooks/useNewsletterSubscription';
import { trackEvent } from '@/utils/analytics';
import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Bot,
  Cpu,
  Mail,
} from 'lucide-react';

const Newsletter = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const [email, setEmail] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const { toast } = useToast();
  const { subscribe, isLoading } = useNewsletterSubscription();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    trackEvent('user_engagement', 'newsletter_subscribe');
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
    <section
      // @ts-ignore
      ref={ref}
      className="w-full py-12 md:py-16 bg-gradient-to-br from-secondary/20 to-background relative overflow-hidden border-t border-b"
    >
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
        <div className="relative">
          <Cpu
            className="h-24 w-24 md:h-32 md:w-32 text-primary absolute -top-16 right-16 animate-pulse"
            style={{ animationDuration: '4s' }}
          />
          <BrainCircuit
            className="h-32 w-32 md:h-48 md:w-48 text-primary absolute top-8 right-8 animate-pulse"
            style={{ animationDuration: '6s' }}
          />
          <Bot
            className="h-20 w-20 md:h-28 md:w-28 text-primary absolute top-32 right-24 animate-pulse"
            style={{ animationDuration: '5s' }}
          />
        </div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
          <div className="flex-1 space-y-5">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary shadow-sm border border-primary/10 backdrop-blur-sm transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Stay Informed</span>
            </div>
            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary transition-all duration-700 delay-100 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              Get the Latest AI Updates
            </h2>
            <p
              className={`text-muted-foreground max-w-[600px] text-lg transition-all duration-700 delay-200 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              Join our community and receive curated AI tools, exclusive
              insights, and early access to new features.
            </p>
          </div>

          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Newsletter form with floating animation */}
            <div className="relative w-full max-w-md mb-8 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl blur-xl opacity-70"></div>
              <div className="relative z-10 bg-background/80 backdrop-blur-sm rounded-xl p-6 border border-border/50 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-medium">Newsletter Signup</h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 rounded-lg border-border/50 focus:border-primary transition-all duration-300 focus:ring-2 focus:ring-primary/20 bg-background/80 backdrop-blur-sm"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 transition-all duration-300 group bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20"
                    disabled={isLoading}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    <span className="flex items-center justify-center w-full relative overflow-hidden py-1">
                      <span
                        className={`flex items-center transition-all duration-500 transform ${
                          isHovered
                            ? 'translate-y-[-100%] opacity-0'
                            : 'translate-y-0 opacity-100'
                        }`}
                      >
                        {isLoading ? 'Subscribing...' : 'Subscribe Now'}
                      </span>
                      <span
                        className={`absolute flex items-center transition-all duration-500 transform ${
                          isHovered
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-[100%] opacity-0'
                        }`}
                      >
                        Stay Updated
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </span>
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                  We respect your privacy. Unsubscribe at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

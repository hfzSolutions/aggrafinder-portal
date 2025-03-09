
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useScrollAnimation } from "@/utils/animations";

const Newsletter = () => {
  const [ref, isVisible] = useScrollAnimation(0.2);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setEmail("");
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
    }, 1000);
  };

  return (
    <section 
      // @ts-ignore
      ref={ref}
      className="py-20 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute left-0 top-0 w-96 h-96 bg-blue-400/5 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
      
      <div className="container px-4 md:px-8 mx-auto max-w-5xl">
        <div 
          className={`relative glass-card rounded-2xl overflow-hidden transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-95"
          }`}
        >
          <div className="p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
            <div className="md:flex-1 text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-medium mb-4">
                Stay Updated on AI Innovations
              </h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto md:mx-0">
                Subscribe to our newsletter to receive the latest updates on AI tools, trends, and exclusive resources directly to your inbox.
              </p>
              
              <form 
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0"
              >
                <Input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-lg border-border/50 focus:border-primary bg-background/70"
                  disabled={isLoading}
                  required
                />
                <Button 
                  type="submit" 
                  className="h-12 rounded-lg px-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
              
              <p className="text-xs text-muted-foreground mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
            
            <div className="hidden md:block md:flex-shrink-0">
              <div className="relative w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-transparent via-background to-transparent animate-spin" style={{ animationDuration: '15s' }}></div>
                <div className="relative z-10 text-center">
                  <div className="text-3xl font-bold text-primary mb-1">AI</div>
                  <div className="text-sm font-medium">Insights</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;

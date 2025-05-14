import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  ArrowRight,
  CheckCircle,
  Rocket,
  Zap,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/utils/analytics';
import { useScrollAnimation } from '@/utils/animations';

const PostToolCTA = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [ref, isVisible] = useScrollAnimation(0.1);
  const [activeFeature, setActiveFeature] = useState(0);

  // Cycle through features for animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePostTool = () => {
    trackEvent('user_engagement', 'click_post_tool_cta');
    navigate('/auth');
  };

  return (
    <section
      // @ts-ignore
      ref={ref}
      className="w-full py-12 md:py-16 bg-gradient-to-r from-primary/5 via-background to-secondary/5 border-t border-b relative overflow-hidden"
    >
      {/* Background decoration elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container px-4 md:px-6 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 max-w-6xl mx-auto">
          <div className="flex-1 space-y-5">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary shadow-sm border border-primary/10 backdrop-blur-sm transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <Gift className="h-4 w-4" />
              <span className="text-sm font-medium">Free Posting</span>
            </div>

            <h2
              className={`text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary transition-all duration-700 delay-100 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              Post Your AI Tool For Free
            </h2>

            <p
              className={`text-muted-foreground max-w-[600px] text-lg transition-all duration-700 delay-200 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              Built something with AI? You can add it to the directory for free.
              This platform is designed to make it easier for people to explore
              and learn about AI tools
            </p>

            <ul
              className={`space-y-3 mt-6 transition-all duration-700 delay-300 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <li
                className={`flex items-start transition-all duration-300 ${
                  activeFeature === 0 ? 'scale-105 text-primary' : ''
                }`}
              >
                <div
                  className={`mr-3 mt-0.5 h-5 w-5 text-primary flex-shrink-0 transition-all duration-300 ${
                    activeFeature === 0
                      ? 'text-primary scale-110'
                      : 'text-primary/70'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span>Let others see what you’ve created</span>
              </li>
              <li
                className={`flex items-start transition-all duration-300 ${
                  activeFeature === 1 ? 'scale-105 text-primary' : ''
                }`}
              >
                <div
                  className={`mr-3 mt-0.5 h-5 w-5 text-primary flex-shrink-0 transition-all duration-300 ${
                    activeFeature === 1
                      ? 'text-primary scale-110'
                      : 'text-primary/70'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span>Help people discover tools more easily</span>
              </li>
              <li
                className={`flex items-start transition-all duration-300 ${
                  activeFeature === 2 ? 'scale-105 text-primary' : ''
                }`}
              >
                <div
                  className={`mr-3 mt-0.5 h-5 w-5 text-primary flex-shrink-0 transition-all duration-300 ${
                    activeFeature === 2
                      ? 'text-primary scale-110'
                      : 'text-primary/70'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span>Be part of a growing list of AI projects</span>
              </li>
            </ul>
          </div>

          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-12'
            }`}
          >
            {/* Interactive feature cards */}
            <div className="relative space-y-4 mb-6 max-w-md">
              {/* Feature cards with hover effects */}
              <div className="bg-white/5 backdrop-blur-sm border border-primary/10 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:translate-y-[-2px] hover:bg-primary/5">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <Rocket className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Launch Your AI Tool</h3>
                    <p className="text-sm text-muted-foreground">
                      Share your project with people exploring new and practical
                      uses of AI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-primary/10 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:translate-y-[-2px] hover:bg-primary/5">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Join Our Community</h3>
                    <p className="text-sm text-muted-foreground">
                      Become part of the emerging AI ecosystem
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePostTool}
              className="w-full h-12 transition-all duration-300 group bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/20"
              size="lg"
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
                  Sign In to Post
                </span>
                <span
                  className={`absolute flex items-center transition-all duration-500 transform ${
                    isHovered
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-[100%] opacity-0'
                  }`}
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostToolCTA;

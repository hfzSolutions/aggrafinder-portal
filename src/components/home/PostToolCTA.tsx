import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Upload, ArrowRight, CheckCircle } from 'lucide-react';
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
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
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
              Be among the first to showcase your AI tool to our growing
              community. Connect with early adopters looking for innovative AI
              solutions.
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Get valuable feedback from early adopters</span>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>Increase visibility in a curated collection</span>
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </div>
                <span>
                  Establish your presence in the emerging AI community
                </span>
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
            {/* Card container with cloud image and floating animation */}
            <div className="relative w-48 h-48 mb-8 transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-xl opacity-70"></div>
              <img
                src="/images/cloud-upload.png"
                alt="Cloud upload"
                className="w-full h-full object-contain relative z-10"
              />
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-2 bg-black/10 dark:bg-white/10 rounded-full blur-md"></div>
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

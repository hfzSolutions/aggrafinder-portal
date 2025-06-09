import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Users, Star, ArrowUpRight, CirclePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HeroCardProps {
  isMobile?: boolean;
}

const HeroCard = ({ isMobile = false }: HeroCardProps) => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="bg-gradient-to-br from-blue-200/5 via-blue-600/10 to-background border border-border/30 rounded-xl p-6 md:p-8 shadow-sm">
        <div
          className={`flex ${
            isMobile ? 'flex-col' : 'flex-col md:flex-row'
          } items-center gap-6 md:gap-8`}
        >
          <div className={isMobile ? 'w-full' : 'md:w-3/5'}>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              Welcome to DeepList AI
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-4">
              Discover the best AI tools for your needs. Our collection helps
              boost your productivity and creativity.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white border-0"
              >
                <Link to="/auth">
                  <CirclePlus className="mr-1.5 h-3.5 w-3.5" />
                  Add Tool
                </Link>
              </Button>
              {/* <Button
                variant="outline"
                asChild
                className="border-primary/30 text-primary hover:bg-primary/10"
              >
                <Link to="/dashboard">Explore Dashboard</Link>
              </Button> */}
            </div>
          </div>
          {!isMobile && (
            <div className="md:w-2/5 flex justify-center">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full blur-xl opacity-30"></div>
                <div className="relative bg-background/80 backdrop-blur-sm border border-border/50 rounded-xl p-5 shadow-lg w-[280px]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-700/20 flex items-center justify-center">
                      <img
                        src="/images/web-logo.png"
                        alt="DeepList Logo"
                        className="h-6 w-6"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">DeepList AI</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        AI Tool Discovery Platform
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500/5 to-blue-700/5 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Zap className="h-3 w-3 text-blue-500" />
                        <span>AI Tools</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Star className="h-3 w-3 text-blue-700" />
                        <span>Reviews</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span>Community</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <ArrowUpRight className="h-3 w-3 text-blue-700" />
                        <span>Discover</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* {isMobile && (
            <div className="w-full mt-2">
              <div className="bg-gradient-to-r from-blue-500/10 to-blue-700/10 rounded-lg p-3 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white">
                    <Zap className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium text-sm">Mobile Quick Access</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background/80 backdrop-blur-sm rounded-md p-2 border border-blue-500/10 flex flex-col items-center justify-center text-center">
                    <Zap className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-xs font-medium">AI Tools</span>
                    <span className="text-[10px] text-muted-foreground">
                      Discover tools
                    </span>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm rounded-md p-2 border border-blue-500/10 flex flex-col items-center justify-center text-center">
                    <Star className="h-5 w-5 text-blue-700 mb-1" />
                    <span className="text-xs font-medium">Reviews</span>
                    <span className="text-[10px] text-muted-foreground">
                      Read reviews
                    </span>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm rounded-md p-2 border border-blue-500/10 flex flex-col items-center justify-center text-center">
                    <Users className="h-5 w-5 text-blue-500 mb-1" />
                    <span className="text-xs font-medium">Community</span>
                    <span className="text-[10px] text-muted-foreground">
                      Join us
                    </span>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm rounded-md p-2 border border-blue-500/10 flex flex-col items-center justify-center text-center">
                    <ArrowUpRight className="h-5 w-5 text-blue-700 mb-1" />
                    <span className="text-xs font-medium">Discover</span>
                    <span className="text-[10px] text-muted-foreground">
                      Explore more
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default HeroCard;

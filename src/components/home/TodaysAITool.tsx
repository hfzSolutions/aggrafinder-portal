import { Link } from 'react-router-dom';
import { Calendar, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AITool } from '@/types/tools';
import { useScrollAnimation } from '@/utils/animations';
import { useTodaysAITool } from '@/hooks/useTodaysAITool';
import { ToolCard } from '@/components/tools/ToolCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { SectionHeader } from '@/components/ui/section-header';

const TodaysAITool = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const { todaysTools, loading, trackTodaysToolEvent } = useTodaysAITool();
  const isMobile = useIsMobile();

  const handleToolClick = () => {
    trackTodaysToolEvent('view');
  };

  const handleExternalLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackTodaysToolEvent('click_url');
  };

  return (
    <section
      // @ts-ignore
      ref={ref}
      className="py-12 bg-gradient-to-r from-primary/5 to-secondary/5"
    >
      <div className="container px-4 md:px-8 mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="flex-1">
            <SectionHeader
              title="Daily AI Tool Spotlight"
              description="Every day we highlight a different AI tool to help you stay updated with the latest innovations."
              badge={{
                text: "Today's Pick",
                icon: <Calendar className="h-4 w-4" />,
              }}
              isVisible={isVisible}
            />
          </div>
        </div>

        <div
          className={`w-full transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {loading || !todaysTools || todaysTools.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={`skeleton-${index}`} className="space-y-3">
                    <Skeleton className="h-48 w-full rounded-lg" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {todaysTools.map((tool, index) => (
                <div
                  key={tool.id}
                  className={`transition-all duration-700`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                  onClick={() => trackTodaysToolEvent('view', tool.id)}
                >
                  <ToolCard
                    tool={tool}
                    viewType={isMobile ? 'list' : 'grid'}
                    compact={isMobile}
                    todaysPick={true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Helper function to get pricing badge class
const getPricingClass = (pricing: string) => {
  switch (pricing) {
    case 'Free':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'Freemium':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'Paid':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
    case 'Free Trial':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

export default TodaysAITool;

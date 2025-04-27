import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useScrollAnimation } from '@/utils/animations';
import { ToolCard } from '@/components/tools/ToolCard';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { Skeleton } from '@/components/ui/skeleton';

const FeaturedTools = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  const {
    tools: featuredTools,
    loading,
    error,
  } = useSupabaseTools({ featured: true });

  return (
    <section
      // @ts-ignore
      ref={ref}
      className="py-20"
    >
      <div className="container px-4 md:px-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <div>
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 transition-all duration-700 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
            >
              Featured AI Tools
            </h2>
            <p
              className={`text-muted-foreground max-w-2xl transition-all duration-700 delay-100 ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-12'
              }`}
            >
              Discover our handpicked selection of the most innovative and
              powerful AI tools available today.
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className={`mt-4 md:mt-0 self-start md:self-auto group transition-all duration-700 delay-200 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-12'
            }`}
          >
            <Link to="/tools">
              View all tools
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {error && (
          <div className="text-center py-10">
            <p className="text-red-500">Error loading tools: {error.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {loading
            ? // Loading skeletons
              Array(4)
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
                ))
            : featuredTools.slice(0, 4).map((tool, index) => (
                <div
                  key={tool.id}
                  className={`transition-all duration-700 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${300 + index * 100}ms` }}
                >
                  <ToolCard tool={tool} />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTools;

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import QuickToolsSection from '@/components/tools/QuickToolsSection';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { useScrollAnimation } from '@/utils/animations';
import { SectionHeader } from '@/components/ui/section-header';

const QuickTools = () => {
  const [ref, isVisible] = useScrollAnimation(0.1);
  // Fetch quick tools with a limit of 4 for the homepage
  const {
    tools: allTools,
    isLoading: loading,
    error,
  } = useSupabaseTools({
    limit: 3,
    toolType: 'quick',
  });

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Loading quick tools...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-b from-background to-secondary/10">
        <div className="container px-4 md:px-8 mx-auto">
          <div className="flex justify-center items-center h-40">
            <p className="text-muted-foreground">Error loading quick tools.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      // @ts-ignore
      ref={ref}
      className="py-12 bg-gradient-to-b from-background to-secondary/10"
    >
      <div className="container px-4 md:px-8 mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
          <SectionHeader
            title="Quick Tools"
            description="User-created AI tools that are quick to use and share. Create your own or try these popular ones."
            isVisible={isVisible}
            badge={{
              text: 'Community',
              icon: <Sparkles className="h-4 w-4 text-primary" />,
            }}
          />
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button
              asChild
              variant="ghost"
              className={`group transition-all duration-700 delay-200 ${
                isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-12'
              }`}
            >
              <Link to="/tools?type=quick">
                Browse All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Use the QuickToolsSection component with home page specific settings */}
        <QuickToolsSection
          showHeader={false}
          isHomePage={true}
          tools={allTools}
        />
      </div>
    </section>
  );
};

export default QuickTools;

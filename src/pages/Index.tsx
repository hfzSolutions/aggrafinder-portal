import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import CategoryShortcuts from '@/components/home/CategoryShortcuts';
import FeaturedTools from '@/components/home/FeaturedTools';
import TodaysAITool from '@/components/home/TodaysAITool';
import PopularTools from '@/components/home/PopularTools';
import Newsletter from '@/components/home/Newsletter';
import PostToolCTA from '@/components/home/PostToolCTA';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const isMobile = useIsMobile();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>DeepListAI | Find the Best AI Tools for Your Needs</title>
        <meta
          name="description"
          content="Discover the most powerful and innovative AI tools to enhance your productivity, creativity, and workflow. Find the perfect AI solution for your specific needs."
        />
      </Helmet>

      <Header />

      <main>
        <Hero />
        <CategoryShortcuts />
        <FeaturedTools />
        <TodaysAITool />
        <PostToolCTA />
        <PopularTools />
        {/* Mobile-only Explore All Tools button */}
        {isMobile && (
          <div className="py-8 px-4 flex justify-center bg-secondary/10">
            <Button asChild className="w-full max-w-xs group">
              <Link
                to="/tools"
                onClick={() => {
                  window.scrollTo(0, 0);
                }}
              >
                Explore All Tools
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
        {/* <Newsletter /> */}
      </main>

      <Footer />
    </>
  );
};

export default Index;

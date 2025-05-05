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
import { MessageCircle } from 'lucide-react';
import { useEffect } from 'react';

const Index = () => {
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
        {/* <Newsletter /> */}
      </main>

      <Footer />
    </>
  );
};

export default Index;

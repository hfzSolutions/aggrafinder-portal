
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

const Index = () => {
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
        <section className="py-12 bg-accent/20">
          <div className="container px-4 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Need Help Finding the Right AI Tool?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Chat with our AI assistant to get personalized recommendations and answers to all your AI tool questions.
            </p>
            <Button asChild size="lg">
              <Link to="/chat" className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" /> 
                Chat with AI Assistant
              </Link>
            </Button>
          </div>
        </section>
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

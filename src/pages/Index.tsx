
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedTools from "@/components/home/FeaturedTools";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AI Aggregator | Find the Best AI Tools</title>
        <meta name="description" content="Discover and compare the best AI tools for your needs. Our curated collection helps you navigate the AI landscape with ease." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Hero />
          <FeaturedTools />
          <Newsletter />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;

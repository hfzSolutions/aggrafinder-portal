
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeaturedTools from "@/components/home/FeaturedTools";
import PopularTools from "@/components/home/PopularTools";
import Newsletter from "@/components/home/Newsletter";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AI Tools Aggregator | Find the Best AI Tools for Your Needs</title>
        <meta name="description" content="Discover the most powerful and innovative AI tools to enhance your productivity, creativity, and workflow. Find the perfect AI solution for your specific needs." />
      </Helmet>
      
      <Header />
      
      <main>
        <Hero />
        <FeaturedTools />
        <PopularTools />
        <Newsletter />
      </main>
      
      <Footer />
    </>
  );
};

export default Index;

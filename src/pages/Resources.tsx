
import { useState } from "react";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ArrowRight, BookOpen, FileText, Newspaper, Video } from "lucide-react";
import Newsletter from "@/components/home/Newsletter";
import { useScrollAnimation } from "@/utils/animations";

// Resource data
const resources = [
  {
    id: "1",
    title: "Getting Started with AI Tools",
    description: "A comprehensive guide to understanding and using AI tools effectively for your projects.",
    type: "guide",
    imageUrl: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8YWklMjBtYWNoaW5lfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "May 15, 2023"
  },
  {
    id: "2",
    title: "AI for Content Creation: Best Practices",
    description: "Learn how to leverage AI tools to enhance your content creation process and workflow.",
    type: "article",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8YWklMjBtYWNoaW5lfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "June 2, 2023"
  },
  {
    id: "3",
    title: "The Evolution of AI Image Generation",
    description: "An in-depth look at how AI image generation has evolved and where it's headed.",
    type: "article",
    imageUrl: "https://images.unsplash.com/photo-1677442135146-2523799d225d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTZ8fGFpJTIwbWFjaGluZXxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "April 18, 2023"
  },
  {
    id: "4",
    title: "AI Tools for Developers: A Technical Deep Dive",
    description: "A technical exploration of the most useful AI tools for software developers.",
    type: "guide",
    imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZGV2ZWxvcGVyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "July 10, 2023"
  },
  {
    id: "5",
    title: "The Future of AI in Business",
    description: "Exploring how AI is transforming businesses and what to expect in the coming years.",
    type: "video",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8YnVzaW5lc3MlMjBtZWV0aW5nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "August 5, 2023"
  },
  {
    id: "6",
    title: "AI Ethics and Responsible Use",
    description: "A critical examination of ethical considerations when using AI tools and technologies.",
    type: "article",
    imageUrl: "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTF8fGV0aGljc3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "May 28, 2023"
  },
  {
    id: "7",
    title: "Making the Most of AI Assistants",
    description: "Tips and tricks to maximize productivity when working with AI assistants.",
    type: "video",
    imageUrl: "https://images.unsplash.com/photo-1596262288549-05a1f9ed05a3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8YXNzaXN0YW50fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "July 22, 2023"
  },
  {
    id: "8",
    title: "Complete Guide to AI-Powered Marketing",
    description: "How to integrate AI tools into your marketing strategy for better results.",
    type: "guide",
    imageUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG1hcmtldGluZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=600&q=60",
    link: "#",
    date: "June 15, 2023"
  },
];

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [ref, isVisible] = useScrollAnimation(0.1);
  
  // Filter resources based on active tab
  const getFilteredResources = () => {
    if (activeTab === "all") return resources;
    return resources.filter(resource => resource.type === activeTab);
  };
  
  const filteredResources = getFilteredResources();
  
  // Function to get icon for resource type
  const getResourceIcon = (type: string) => {
    switch(type) {
      case "article": return <Newspaper className="h-4 w-4" />;
      case "guide": return <BookOpen className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  return (
    <>
      <Helmet>
        <title>AI Resources | AI Aggregator</title>
        <meta name="description" content="Access our comprehensive collection of AI learning resources, including guides, articles, and videos to master AI tools and technologies." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow pt-20">
          {/* Hero section */}
          <div className="bg-secondary/30 border-b border-border/20">
            <div className="container px-4 md:px-8 mx-auto py-12 md:py-16">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-3xl md:text-4xl font-medium mb-4 animate-fade-in">AI Resources</h1>
                <p className="text-muted-foreground mb-8 animate-fade-in">
                  Expand your knowledge with our curated collection of AI learning resources, 
                  from beginners guides to advanced tutorials.
                </p>
              </div>
            </div>
          </div>
          
          {/* Resources section */}
          <div 
            // @ts-ignore
            ref={ref} 
            className="container px-4 md:px-8 mx-auto py-12"
          >
            <Tabs 
              defaultValue="all" 
              onValueChange={setActiveTab}
              className={`transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <div className="flex justify-center mb-8">
                <TabsList className="bg-secondary/30">
                  <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                  <TabsTrigger value="guide" className="rounded-lg">Guides</TabsTrigger>
                  <TabsTrigger value="article" className="rounded-lg">Articles</TabsTrigger>
                  <TabsTrigger value="video" className="rounded-lg">Videos</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource, index) => (
                    <div 
                      key={resource.id}
                      className={`transition-all duration-700 ${
                        isVisible 
                          ? "opacity-100 translate-y-0" 
                          : "opacity-0 translate-y-12"
                      }`}
                      style={{ transitionDelay: `${150 + index * 75}ms` }}
                    >
                      <Card className="h-full hover:shadow-md transition-shadow duration-300 overflow-hidden group">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={resource.imageUrl} 
                            alt={resource.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm">
                              {getResourceIcon(resource.type)}
                              <span className="capitalize">{resource.type}</span>
                            </span>
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="text-sm text-muted-foreground mb-1">{resource.date}</div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <CardDescription className="text-muted-foreground">
                            {resource.description}
                          </CardDescription>
                        </CardContent>
                        <CardFooter>
                          <Button asChild variant="ghost" className="px-0 group/btn">
                            <a href={resource.link} className="inline-flex items-center text-primary">
                              Read more
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </a>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
                
                {filteredResources.length === 0 && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No resources found</h3>
                    <p className="text-muted-foreground">
                      We don't have any resources in this category yet. Check back soon!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <Newsletter />
        </main>
        
        <Footer />
      </div>
    </>
  );
};

export default ResourcesPage;

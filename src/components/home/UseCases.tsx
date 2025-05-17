import React, { useState, useEffect, useCallback } from 'react';
import { useScrollAnimation } from '@/utils/animations';
import {
  ArrowRight,
  Search,
  Sparkles,
  Zap,
  Users,
  Briefcase,
  PenTool,
  Code,
  Palette,
  BookOpen,
  BarChart,
  FileText,
  Microscope,
  Film,
  LineChart,
  Music,
  Lightbulb,
  HeadphonesIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { SectionHeader } from '@/components/ui/section-header';
import { useIsMobile } from '@/hooks/use-mobile';

// Color mapping for different theme colors to Tailwind CSS classes
const colorMap: Record<string, Record<string, string>> = {
  indigo: {
    bg: 'bg-indigo-50/30',
    bgHover: 'bg-indigo-100/50',
    text: 'text-indigo-600',
    border: 'border-indigo-200',
    icon: 'bg-indigo-100/50 text-indigo-600',
    glow: 'from-indigo-400/20 to-indigo-600/20',
  },
  violet: {
    bg: 'bg-violet-50/30',
    bgHover: 'bg-violet-100/50',
    text: 'text-violet-600',
    border: 'border-violet-200',
    icon: 'bg-violet-100/50 text-violet-600',
    glow: 'from-violet-400/20 to-violet-600/20',
  },
  emerald: {
    bg: 'bg-emerald-50/30',
    bgHover: 'bg-emerald-100/50',
    text: 'text-emerald-600',
    border: 'border-emerald-200',
    icon: 'bg-emerald-100/50 text-emerald-600',
    glow: 'from-emerald-400/20 to-emerald-600/20',
  },
  slate: {
    bg: 'bg-slate-50/30',
    bgHover: 'bg-slate-100/50',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: 'bg-slate-100/50 text-slate-600',
    glow: 'from-slate-400/20 to-slate-600/20',
  },
  orange: {
    bg: 'bg-orange-50/30',
    bgHover: 'bg-orange-100/50',
    text: 'text-orange-600',
    border: 'border-orange-200',
    icon: 'bg-orange-100/50 text-orange-600',
    glow: 'from-orange-400/20 to-orange-600/20',
  },
  amber: {
    bg: 'bg-amber-50/30',
    bgHover: 'bg-amber-100/50',
    text: 'text-amber-600',
    border: 'border-amber-200',
    icon: 'bg-amber-100/50 text-amber-600',
    glow: 'from-amber-400/20 to-amber-600/20',
  },
  cyan: {
    bg: 'bg-cyan-50/30',
    bgHover: 'bg-cyan-100/50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
    icon: 'bg-cyan-100/50 text-cyan-600',
    glow: 'from-cyan-400/20 to-cyan-600/20',
  },
  rose: {
    bg: 'bg-rose-50/30',
    bgHover: 'bg-rose-100/50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    icon: 'bg-rose-100/50 text-rose-600',
    glow: 'from-rose-400/20 to-rose-600/20',
  },
  blue: {
    bg: 'bg-blue-50/30',
    bgHover: 'bg-blue-100/50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    icon: 'bg-blue-100/50 text-blue-600',
    glow: 'from-blue-400/20 to-blue-600/20',
  },
  purple: {
    bg: 'bg-purple-50/30',
    bgHover: 'bg-purple-100/50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    icon: 'bg-purple-100/50 text-purple-600',
    glow: 'from-purple-400/20 to-purple-600/20',
  },
  yellow: {
    bg: 'bg-yellow-50/30',
    bgHover: 'bg-yellow-100/50',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
    icon: 'bg-yellow-100/50 text-yellow-600',
    glow: 'from-yellow-400/20 to-yellow-600/20',
  },
  teal: {
    bg: 'bg-teal-50/30',
    bgHover: 'bg-teal-100/50',
    text: 'text-teal-600',
    border: 'border-teal-200',
    icon: 'bg-teal-100/50 text-teal-600',
    glow: 'from-teal-400/20 to-teal-600/20',
  },
};

// Define the use cases with their icons, descriptions, and routes
// Each use case has a unique persona, icon component, tools list, route, and theme color
const useCases = [
  {
    persona: 'Developers',
    icon: Code,
    tools: ['Code Generator', 'Bug Fixer', 'Doc Writer', 'Code Reviewer'],
    route: '/tools?category=Code+Generation',
    color: 'indigo',
  },
  {
    persona: 'Designers',
    icon: Palette,
    tools: [
      'Image Generator',
      'UI/UX Helper',
      'Design Assistant',
      'Mockup Creator',
    ],
    route: '/tools?category=Image+Generation',
    color: 'violet',
  },
  {
    persona: 'Students',
    icon: BookOpen,
    tools: ['Study Assistant', 'Essay Writer', 'Math Solver', 'Note Generator'],
    route: '/tools?search=education',
    color: 'emerald',
  },
  {
    persona: 'Executives',
    icon: Briefcase,
    tools: [
      'Strategy Planner',
      'Report Generator',
      'Decision Assistant',
      'Meeting Summarizer',
    ],
    route: '/tools?search=productivity',
    color: 'slate',
  },
  {
    persona: 'Marketers',
    icon: BarChart,
    tools: [
      'Social Media Creator',
      'Ad Copy Writer',
      'Analytics Helper',
      'SEO Optimizer',
    ],
    route: '/tools?category=Marketing',
    color: 'orange',
  },
  {
    persona: 'Writers',
    icon: FileText,
    tools: [
      'Story Generator',
      'Editor Assistant',
      'Character Creator',
      'Plot Developer',
    ],
    route: '/tools?search=writing',
    color: 'amber',
  },
  {
    persona: 'Researchers',
    icon: Microscope,
    tools: [
      'Data Miner',
      'Paper Assistant',
      'Citation Generator',
      'Insight Finder',
    ],
    route: '/tools?search=research',
    color: 'cyan',
  },
  {
    persona: 'Video Creators',
    icon: Film,
    tools: [
      'Script Writer',
      'Video Editor',
      'Thumbnail Creator',
      'Caption Generator',
    ],
    route: '/tools?search=video',
    color: 'rose',
  },
  {
    persona: 'Data Scientists',
    icon: LineChart,
    tools: [
      'Data Visualizer',
      'Model Builder',
      'Insight Generator',
      'Pattern Detector',
    ],
    route: '/tools?search=analytics',
    color: 'blue',
  },
  {
    persona: 'Musicians',
    icon: Music,
    tools: ['Music Generator', 'Lyric Writer', 'Melody Creator', 'Beat Maker'],
    route: '/tools?search=music',
    color: 'purple',
  },
  {
    persona: 'Entrepreneurs',
    icon: Lightbulb,
    tools: [
      'Business Planner',
      'Pitch Creator',
      'Market Analyzer',
      'Product Developer',
    ],
    route: '/tools?search=freelance',
    color: 'yellow',
  },
  {
    persona: 'Customer Support',
    icon: HeadphonesIcon,
    tools: [
      'Response Generator',
      'FAQ Creator',
      'Ticket Resolver',
      'Knowledge Base Builder',
    ],
    route: '/tools?search=customer+support',
    color: 'teal',
  },
];

const UseCases = () => {
  const navigate = useNavigate();
  const [ref, isVisible] = useScrollAnimation(0.1);
  const [api, setApi] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [highlightedFeature, setHighlightedFeature] = useState(0);
  const isMobile = useIsMobile();

  // Cycle through highlighted features for animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightedFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter use cases based on active category
  const filteredUseCases = useCallback(() => {
    if (activeCategory === 'all') return useCases;

    const categoryMap: Record<string, string[]> = {
      creative: ['designers', 'writers', 'video creators', 'musicians'],
      professional: [
        'executives',
        'data scientists',
        'marketers',
        'researchers',
        'entrepreneurs',
        'customer support',
      ],
      technical: ['developers', 'students'],
    };

    return useCases.filter((useCase) => {
      const personaLower = useCase.persona.toLowerCase();
      return categoryMap[activeCategory]?.some((category) =>
        personaLower.includes(category)
      );
    });
  }, [activeCategory]);

  // Handle scroll to next set of cards
  const scrollToNextSet = useCallback(() => {
    if (!api) return;
    api.scrollNext();
    setCurrentIndex((prev) =>
      Math.min(prev + 1, filteredUseCases().length - (isMobile ? 1 : 4))
    );
  }, [api, filteredUseCases, isMobile]);

  // Handle scroll to previous set of cards
  const scrollToPrevSet = useCallback(() => {
    if (!api) return;
    api.scrollPrev();
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, [api]);

  const categories = [
    { id: 'all', label: 'All', icon: <Sparkles className="h-3.5 w-3.5" /> },
    {
      id: 'creative',
      label: 'Creative',
      icon: <PenTool className="h-3.5 w-3.5" />,
    },
    {
      id: 'professional',
      label: 'Professional',
      icon: <Briefcase className="h-3.5 w-3.5" />,
    },
    {
      id: 'technical',
      label: 'Technical',
      icon: <Zap className="h-3.5 w-3.5" />,
    },
  ];

  return (
    <section className="w-full py-12 bg-gradient-to-b from-background via-secondary/5 to-background border-y border-border/30 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-40 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div
        // @ts-ignore
        ref={ref}
        className={`container px-4 md:px-8 mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 md:mb-8">
          <SectionHeader
            title="AI Tools for Every Need"
            description="Discover powerful AI solutions tailored to your specific use case"
            badge={{
              text: 'Specialized Tools',
              icon: <Search className="h-4 w-4" />,
            }}
            isVisible={isVisible}
          />

          {/* Category filter tabs */}
          <div
            className={`flex flex-wrap items-center gap-2 mt-6 md:mt-0 transition-all duration-700 delay-200 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-12'
            }`}
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                size="sm"
                variant={activeCategory === category.id ? 'default' : 'outline'}
                className={`rounded-full text-xs gap-1.5 ${
                  activeCategory === category.id ? 'shadow-md' : ''
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Feature highlights - Informational stats */}
        <div
          className={`flex flex-wrap gap-4 mb-8 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          aria-label="Platform statistics"
        >
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border-dashed border border-muted-foreground/30 transition-all duration-300 ${
              highlightedFeature === 0
                ? 'scale-105 border-primary/30 bg-primary/5'
                : ''
            }`}
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
              <span className="text-xs font-semibold text-primary">12+</span>
            </div>
            <span className="text-sm text-muted-foreground">Categories</span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border-dashed border border-muted-foreground/30 transition-all duration-300 ${
              highlightedFeature === 1
                ? 'scale-105 border-primary/30 bg-primary/5'
                : ''
            }`}
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
              <span className="text-xs font-semibold text-primary">48+</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Specialized Tools
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 border-dashed border border-muted-foreground/30 transition-all duration-300 ${
              highlightedFeature === 2
                ? 'scale-105 border-primary/30 bg-primary/5'
                : ''
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">
              Personalized Recommendations
            </span>
          </div>
        </div>

        <div className="relative px-2 md:px-6">
          <Carousel
            opts={{
              align: 'start',
              loop: false,
              dragFree: true,
              containScroll: 'trimSnaps',
            }}
            className="w-full"
            setApi={setApi}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {filteredUseCases().map((useCase, index) => (
                <CarouselItem
                  key={useCase.persona}
                  className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                >
                  <div
                    className={`${
                      colorMap[useCase.color].bg
                    } backdrop-blur-sm border border-border/60 rounded-xl p-3 md:p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:${
                      colorMap[useCase.color].border
                    } hover:${
                      colorMap[useCase.color].bgHover
                    } flex flex-col h-full relative group cursor-pointer`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onMouseEnter={() => setHoveredCard(useCase.persona)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => {
                      window.scrollTo(0, 0);
                      navigate(useCase.route);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        window.scrollTo(0, 0);
                        navigate(useCase.route);
                      }
                    }}
                    aria-label={`View ${useCase.persona} tools`}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className={`absolute inset-0 -z-10 bg-gradient-to-r ${
                        colorMap[useCase.color].glow
                      } opacity-0 group-hover:opacity-100 blur-xl rounded-xl transition-opacity duration-500`}
                    ></div>

                    <div className="flex items-center mb-2 md:mb-3">
                      <div
                        className={`p-1.5 md:p-2 rounded-lg mr-2 flex items-center justify-center ${
                          colorMap[useCase.color].icon
                        }`}
                      >
                        {React.createElement(useCase.icon, {
                          className: 'h-5 w-5 md:h-6 md:w-6',
                          'aria-hidden': true,
                        })}
                      </div>
                      <h3 className="text-sm md:text-base font-semibold text-foreground">
                        {useCase.persona}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-1 md:gap-1.5 mb-3 md:mb-4 flex-grow">
                      {useCase.tools.map((tool, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className={`text-xs font-normal py-0.5 px-2 inline-flex items-center justify-center text-foreground/90 border-dashed border-border/70 bg-transparent cursor-default transition-all duration-300 ${
                            hoveredCard === useCase.persona
                              ? `border-${useCase.color}/20`
                              : ''
                          }`}
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between w-full mt-auto">
                      <span
                        className={`text-xs font-medium ${
                          colorMap[useCase.color].text
                        }`}
                      >
                        View Tools
                      </span>
                      <ArrowRight
                        className={`h-3 w-3 md:h-3.5 md:w-3.5 ${
                          colorMap[useCase.color].text
                        } transition-transform group-hover:translate-x-1`}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-6 gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={scrollToPrevSet}
                disabled={currentIndex === 0}
              >
                <CarouselPrevious className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={scrollToNextSet}
                disabled={
                  currentIndex >= filteredUseCases().length - (isMobile ? 1 : 4)
                }
              >
                <CarouselNext className="h-4 w-4" />
              </Button>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default UseCases;

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
    bg: 'bg-indigo-50/30 dark:bg-indigo-900/20',
    bgHover: 'bg-indigo-100/50 dark:bg-indigo-800/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-700/40',
    icon: 'bg-indigo-100/50 dark:bg-indigo-800/40 text-indigo-600 dark:text-indigo-400',
    glow: 'from-indigo-400/20 to-indigo-600/20 dark:from-indigo-500/30 dark:to-indigo-700/30',
  },
  violet: {
    bg: 'bg-violet-50/30 dark:bg-violet-900/20',
    bgHover: 'bg-violet-100/50 dark:bg-violet-800/30',
    text: 'text-violet-600 dark:text-violet-400',
    border: 'border-violet-200 dark:border-violet-700/40',
    icon: 'bg-violet-100/50 dark:bg-violet-800/40 text-violet-600 dark:text-violet-400',
    glow: 'from-violet-400/20 to-violet-600/20 dark:from-violet-500/30 dark:to-violet-700/30',
  },
  emerald: {
    bg: 'bg-emerald-50/30 dark:bg-emerald-900/20',
    bgHover: 'bg-emerald-100/50 dark:bg-emerald-800/30',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-700/40',
    icon: 'bg-emerald-100/50 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400',
    glow: 'from-emerald-400/20 to-emerald-600/20 dark:from-emerald-500/30 dark:to-emerald-700/30',
  },
  slate: {
    bg: 'bg-slate-50/30 dark:bg-slate-800/20',
    bgHover: 'bg-slate-100/50 dark:bg-slate-700/30',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-600/40',
    icon: 'bg-slate-100/50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300',
    glow: 'from-slate-400/20 to-slate-600/20 dark:from-slate-500/30 dark:to-slate-700/30',
  },
  orange: {
    bg: 'bg-orange-50/30 dark:bg-orange-900/20',
    bgHover: 'bg-orange-100/50 dark:bg-orange-800/30',
    text: 'text-orange-600 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-700/40',
    icon: 'bg-orange-100/50 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400',
    glow: 'from-orange-400/20 to-orange-600/20 dark:from-orange-500/30 dark:to-orange-700/30',
  },
  amber: {
    bg: 'bg-amber-50/30 dark:bg-amber-900/20',
    bgHover: 'bg-amber-100/50 dark:bg-amber-800/30',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-700/40',
    icon: 'bg-amber-100/50 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400',
    glow: 'from-amber-400/20 to-amber-600/20 dark:from-amber-500/30 dark:to-amber-700/30',
  },
  cyan: {
    bg: 'bg-cyan-50/30 dark:bg-cyan-900/20',
    bgHover: 'bg-cyan-100/50 dark:bg-cyan-800/30',
    text: 'text-cyan-600 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-700/40',
    icon: 'bg-cyan-100/50 dark:bg-cyan-800/40 text-cyan-600 dark:text-cyan-400',
    glow: 'from-cyan-400/20 to-cyan-600/20 dark:from-cyan-500/30 dark:to-cyan-700/30',
  },
  rose: {
    bg: 'bg-rose-50/30 dark:bg-rose-900/20',
    bgHover: 'bg-rose-100/50 dark:bg-rose-800/30',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-200 dark:border-rose-700/40',
    icon: 'bg-rose-100/50 dark:bg-rose-800/40 text-rose-600 dark:text-rose-400',
    glow: 'from-rose-400/20 to-rose-600/20 dark:from-rose-500/30 dark:to-rose-700/30',
  },
  blue: {
    bg: 'bg-blue-50/30 dark:bg-blue-900/20',
    bgHover: 'bg-blue-100/50 dark:bg-blue-800/30',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-700/40',
    icon: 'bg-blue-100/50 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400',
    glow: 'from-blue-400/20 to-blue-600/20 dark:from-blue-500/30 dark:to-blue-700/30',
  },
  purple: {
    bg: 'bg-purple-50/30 dark:bg-purple-900/20',
    bgHover: 'bg-purple-100/50 dark:bg-purple-800/30',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-700/40',
    icon: 'bg-purple-100/50 dark:bg-purple-800/40 text-purple-600 dark:text-purple-400',
    glow: 'from-purple-400/20 to-purple-600/20 dark:from-purple-500/30 dark:to-purple-700/30',
  },
  yellow: {
    bg: 'bg-yellow-50/30 dark:bg-yellow-900/20',
    bgHover: 'bg-yellow-100/50 dark:bg-yellow-800/30',
    text: 'text-yellow-600 dark:text-yellow-400',
    border: 'border-yellow-200 dark:border-yellow-700/40',
    icon: 'bg-yellow-100/50 dark:bg-yellow-800/40 text-yellow-600 dark:text-yellow-400',
    glow: 'from-yellow-400/20 to-yellow-600/20 dark:from-yellow-500/30 dark:to-yellow-700/30',
  },
  teal: {
    bg: 'bg-teal-50/30 dark:bg-teal-900/20',
    bgHover: 'bg-teal-100/50 dark:bg-teal-800/30',
    text: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-700/40',
    icon: 'bg-teal-100/50 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400',
    glow: 'from-teal-400/20 to-teal-600/20 dark:from-teal-500/30 dark:to-teal-700/30',
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
      Math.min(prev + 1, filteredUseCases().length - (isMobile ? 1 : 3))
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
    <section className="w-full py-12 md:py-16 bg-gradient-to-b from-background via-secondary/5 to-background border-y border-border/30 relative overflow-hidden">
      {/* Background decoration elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-40 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/5 rounded-full blur-3xl opacity-70"></div>
      </div>

      <div
        // @ts-ignore
        ref={ref}
        className={`container px-4 md:px-6 mx-auto transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Header with improved spacing and alignment */}
        <div className="mb-10">
          <SectionHeader
            title="AI Tools for Every Professional"
            description="Discover specialized AI solutions designed to enhance your workflow and boost productivity"
            badge={{
              text: 'Tailored Solutions',
              icon: <Search className="h-4 w-4" />,
            }}
            isVisible={isVisible}
          />
        </div>

        {/* Feature highlights with improved visual design */}
        {/* <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 max-w-3xl mx-auto mb-10 transition-all duration-700 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          aria-label="Platform statistics"
        >
          <div
            className={`flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 transition-all duration-300 ${
              highlightedFeature === 0
                ? 'scale-105 border-primary/40 bg-primary/5 shadow-sm'
                : ''
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">12+</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground">Categories</h4>
              <p className="text-xs text-muted-foreground">
                Organized solutions
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 transition-all duration-300 ${
              highlightedFeature === 1
                ? 'scale-105 border-primary/40 bg-primary/5 shadow-sm'
                : ''
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <span className="text-sm font-semibold text-primary">48+</span>
            </div>
            <div>
              <h4 className="font-medium text-foreground">AI Tools</h4>
              <p className="text-xs text-muted-foreground">
                Specialized assistants
              </p>
            </div>
          </div>
          <div
            className={`flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 transition-all duration-300 ${
              highlightedFeature === 2
                ? 'scale-105 border-primary/40 bg-primary/5 shadow-sm'
                : ''
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground">Personalized</h4>
              <p className="text-xs text-muted-foreground">
                Tailored to your needs
              </p>
            </div>
          </div>
        </div> */}

        {/* Category filter tabs with improved visibility */}
        <div className="flex mb-8">
          <div
            className={`inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-muted/30 rounded-full border border-border/50 transition-all duration-700 delay-200 ${
              isVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                size="sm"
                variant={activeCategory === category.id ? 'default' : 'ghost'}
                className={`rounded-full text-xs gap-1.5 px-4 py-2 ${
                  activeCategory === category.id ? 'shadow-sm' : ''
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Card carousel with improved layout */}
        <div className="relative px-1 md:px-4">
          <Carousel
            opts={{
              align: 'center',
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
                  className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <div
                    className={`${
                      colorMap[useCase.color].bg
                    } backdrop-blur-sm border border-border/40 dark:border-border/30 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:${
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

                    {/* Card header with icon and title */}
                    <div className="flex items-center mb-3 md:mb-4">
                      <div
                        className={`p-2 md:p-2.5 rounded-lg mr-3 flex items-center justify-center ${
                          colorMap[useCase.color].icon
                        }`}
                      >
                        {React.createElement(useCase.icon, {
                          className: 'h-5 w-5 md:h-6 md:w-6',
                          'aria-hidden': true,
                        })}
                      </div>
                      <h3 className="text-base md:text-lg font-semibold text-foreground">
                        {useCase.persona}
                      </h3>
                    </div>

                    {/* Tool badges with improved spacing */}
                    <div className="flex flex-col gap-2 mb-4 md:mb-5 flex-grow">
                      {useCase.tools.map((tool, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className={`text-xs font-normal py-1 px-2.5 inline-flex items-center justify-center text-foreground/90 dark:text-foreground/80 border-dashed border-border/70 dark:border-border/50 bg-transparent dark:bg-background/20 cursor-default transition-all duration-300 ${
                            hoveredCard === useCase.persona
                              ? `border-${useCase.color}/30 dark:border-${useCase.color}/40 bg-${useCase.color}/5 dark:bg-${useCase.color}/10`
                              : ''
                          }`}
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>

                    {/* Card footer with call-to-action */}
                    <div className="flex items-center justify-between w-full mt-auto pt-2 border-t border-border/30">
                      <span
                        className={`text-sm font-medium ${
                          colorMap[useCase.color].text
                        }`}
                      >
                        Explore Tools
                      </span>
                      <ArrowRight
                        className={`h-4 w-4 ${
                          colorMap[useCase.color].text
                        } transition-transform group-hover:translate-x-1`}
                      />
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Navigation controls with improved visibility */}
            <div className="flex justify-center items-center mt-8 gap-4">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-border/50 bg-background/80 backdrop-blur-sm"
                onClick={scrollToPrevSet}
                disabled={currentIndex === 0}
              >
                <CarouselPrevious className="h-5 w-5" />
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="text-xs text-muted-foreground">
                {currentIndex + 1} /{' '}
                {Math.ceil(filteredUseCases().length / (isMobile ? 1 : 3))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-full border-border/50 bg-background/80 backdrop-blur-sm"
                onClick={scrollToNextSet}
                disabled={
                  currentIndex >= filteredUseCases().length - (isMobile ? 1 : 3)
                }
              >
                <CarouselNext className="h-5 w-5" />
                <span className="sr-only">Next page</span>
              </Button>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default UseCases;

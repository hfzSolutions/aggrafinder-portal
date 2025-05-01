import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Search } from 'lucide-react';
import { staggeredDelay } from '@/utils/animations';

const Hero = () => {
  const navigate = useNavigate();
  const highlightRef = useRef<HTMLSpanElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/tools?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // List of words to cycle through
  const words = ['Discover', 'Explore', 'Find', 'Uncover'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden pt-24 md:pt-32 pb-16">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full bg-primary/10 blur-3xl opacity-70"></div>
      </div>

      <div className="container px-4 md:px-8 mx-auto max-w-6xl">
        <div className="text-center space-y-6">
          <div
            className={`relative inline-block transition-opacity duration-1000 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="inline-block px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full mb-4 animate-fade-in">
              The Ultimate AI Tools Collection
            </span>
          </div>

          <h1 className="relative">
            <span
              className={`transition-all duration-700 inline-block ${
                isLoaded
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={staggeredDelay(0)}
            >
              <span className="relative">
                <span className="transition-opacity duration-500 ease-in-out">
                  {words[currentWordIndex]}
                </span>
                <span
                  ref={highlightRef}
                  className="absolute bottom-0 left-0 h-[8px] w-full bg-primary/20 -z-10 translate-y-2"
                ></span>
              </span>
              {' & '}
            </span>
            <span
              className={`transition-all duration-700 inline-block ${
                isLoaded
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ ...staggeredDelay(1), marginLeft: '0.5rem' }}
            >
              Compare the Best
            </span>
            <br />
            <div style={{ marginTop: '0.5rem' }}>
              <span
                className={`transition-all duration-700 inline-block ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ ...staggeredDelay(2), marginRight: '0.5rem' }}
              >
                <span className="text-gradient">AI Tools</span>
              </span>
              <span
                className={`transition-all duration-700 inline-block ${
                  isLoaded
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-8'
                }`}
                style={staggeredDelay(3)}
              >
                {' in One Place'}
              </span>
            </div>
          </h1>

          <p
            className={`mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={staggeredDelay(4)}
          >
            Find the perfect AI solutions for your needs.
          </p>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={staggeredDelay(5)}
          >
            <form onSubmit={handleSearch} className="relative w-full max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full h-12 pl-10 pr-4 rounded-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                  placeholder="Search AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>
            <Button
              size="lg"
              className="rounded-full min-w-32 h-12"
              onClick={() => navigate('/tools')}
            >
              Explore Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div
            className={`flex flex-wrap items-center justify-center gap-3 mt-10 text-sm text-muted-foreground transition-all duration-700 ${
              isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={staggeredDelay(6)}
          >
            <span>Popular searches:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/tools?category=Text+Generation')}
                className="px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
              >
                Text Generation
              </button>
              <button
                onClick={() => navigate('/tools?category=Image+Generation')}
                className="px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
              >
                Image Generation
              </button>
              <button
                onClick={() => navigate('/tools?category=Code+Generation')}
                className="px-2 py-1 rounded-md bg-secondary/50 hover:bg-secondary transition-colors"
              >
                Code Assistants
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;

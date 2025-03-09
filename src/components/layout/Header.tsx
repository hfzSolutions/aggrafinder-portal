
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const isActive = location.pathname === to;
    
    return (
      <Link
        to={to}
        className={`relative px-3 py-2 transition-all duration-300 hover:text-primary ${
          isActive 
            ? "text-primary" 
            : "text-foreground/80 hover:text-foreground"
        }`}
      >
        <span className="relative z-10">{children}</span>
        {isActive && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-fade-in" />
        )}
      </Link>
    );
  };

  return (
    <header 
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-lg shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 px-4 md:px-8">
        <Link 
          to="/" 
          className="flex items-center space-x-2 text-xl font-medium transition-opacity duration-300 hover:opacity-80"
        >
          <div className="relative w-8 h-8 overflow-hidden">
            <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-primary to-blue-400 animate-pulse-subtle" />
            <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-sm flex items-center justify-center">
              <span className="text-primary font-bold text-sm">AI</span>
            </div>
          </div>
          <span className="hidden sm:inline-block animate-fade-in">AI Aggregator</span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tools">AI Tools</NavLink>
          <NavLink to="/resources">Resources</NavLink>
          <div className="ml-4">
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
          </div>
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center p-2 rounded-md"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? "max-h-60 opacity-100" 
            : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col px-4 pb-6 pt-2 bg-background/95 backdrop-blur-md border-t border-border/10">
          <Link to="/" className="px-4 py-3 hover:bg-secondary/50 rounded-md">Home</Link>
          <Link to="/tools" className="px-4 py-3 hover:bg-secondary/50 rounded-md">AI Tools</Link>
          <Link to="/resources" className="px-4 py-3 hover:bg-secondary/50 rounded-md">Resources</Link>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;

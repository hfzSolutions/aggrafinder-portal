import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Plus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const NavLink = ({
    to,
    children,
  }: {
    to: string;
    children: React.ReactNode;
  }) => {
    const isActive = location.pathname === to;

    return (
      <Link
        to={to}
        className={`relative px-3 py-2 transition-all duration-300 hover:text-primary ${
          isActive ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
        }`}
      >
        <span className="relative z-10">{children}</span>
        {isActive && (
          <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary animate-fade-in" />
        )}
      </Link>
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all ${
        scrolled ? 'bg-background/90 backdrop-blur-sm border-b' : ''
      }`}
    >
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <Image className="h-6 w-6" />
          <span>AI Showcase</span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tools">AI Tools</NavLink>
          <NavLink to="/outcomes">AI Showcase</NavLink>
          {!isLoading && user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <div className="ml-4 flex items-center gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Link to="/request-tool">
                <Plus className="h-3.5 w-3.5" />
                <span>Request Tool</span>
              </Link>
            </Button>

            {/* {!isLoading && user && (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button> */}
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
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col px-4 pb-6 pt-2 bg-background/95 backdrop-blur-md border-t border-border/10">
          <Link to="/" className="px-4 py-3 hover:bg-secondary/50 rounded-md">
            Home
          </Link>
          <Link
            to="/tools"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
          >
            AI Tools
          </Link>
          <Link
            to="/outcomes"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
          >
            AI Showcase
          </Link>
          {!isLoading && user && (
            <Link
              to="/dashboard"
              className="px-4 py-3 hover:bg-secondary/50 rounded-md"
            >
              Dashboard
            </Link>
          )}
          <Link
            to="/request-tool"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Request Tool</span>
          </Link>

          {/* {!isLoading && user && (
            <button
              onClick={handleLogout}
              className="px-4 py-3 hover:bg-secondary/50 rounded-md flex items-center gap-2 w-full text-left"
            >
              <span>Logout</span>
            </button>
          )} */}
          {/* <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
          >
            GitHub
          </a> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;

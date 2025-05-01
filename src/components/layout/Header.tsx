import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Plus, Image, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/hooks/use-theme';
import { pageView, trackEvent } from '@/utils/analytics';
import SponsorBanner from './SponsorBanner';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
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

    // Track page view when location changes
    pageView(location.pathname);
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
        onClick={() => trackEvent('navigation', 'click', to)}
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
      className={`fixed w-full top-0 z-50 transition-all ${
        scrolled ? 'bg-background/90 backdrop-blur-sm border-b' : ''
      }`}
    >
      <SponsorBanner />
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img
            src="/images/web-logo.png"
            alt="Website Logo"
            className="h-6 w-auto"
          />
          <span>DeepList AI</span>
        </Link>

        {/* Desktop menu */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/tools">AI Tools</NavLink>
          {/* <NavLink to="/outcomes">AI Showcase</NavLink> */}
          {!isLoading && user && <NavLink to="/dashboard">Dashboard</NavLink>}
          <div className="ml-4 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                toggleTheme();
                trackEvent(
                  'theme',
                  'toggle',
                  theme === 'light' ? 'dark' : 'light'
                );
              }}
              className="w-9 h-9"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            {/* Only display login button if user is not logged in */}
            {!isLoading && !user && (
              <Button asChild variant="default" size="sm">
                <Link
                  to="/auth"
                  onClick={() => trackEvent('navigation', 'click', '/auth')}
                >
                  Login
                </Link>
              </Button>
            )}
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
          <Link
            to="/"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
            onClick={() => trackEvent('navigation', 'click_mobile', '/')}
          >
            Home
          </Link>
          <Link
            to="/tools"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
            onClick={() => trackEvent('navigation', 'click_mobile', '/tools')}
          >
            AI Tools
          </Link>
          {/* <Link
            to="/outcomes"
            className="px-4 py-3 hover:bg-secondary/50 rounded-md"
          >
            AI Showcase
          </Link> */}
          {!isLoading && user && (
            <Link
              to="/dashboard"
              className="px-4 py-3 hover:bg-secondary/50 rounded-md"
              onClick={() =>
                trackEvent('navigation', 'click_mobile', '/dashboard')
              }
            >
              Dashboard
            </Link>
          )}

          <button
            onClick={() => {
              toggleTheme();
              trackEvent(
                'theme',
                'toggle_mobile',
                theme === 'light' ? 'dark' : 'light'
              );
            }}
            className="px-4 py-3 hover:bg-secondary/50 rounded-md flex items-center gap-2 w-full text-left"
          >
            {theme === 'light' ? (
              <>
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </>
            ) : (
              <>
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </>
            )}
          </button>

          {/* Only display login link in mobile menu if user is not logged in */}
          {!isLoading && !user && (
            <Link
              to="/auth"
              className="px-4 py-3 hover:bg-secondary/50 rounded-md flex items-center gap-2 w-full text-left"
              onClick={() => trackEvent('navigation', 'click_mobile', '/auth')}
            >
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;

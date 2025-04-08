
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Info, HelpCircle, Mail } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/30 backdrop-blur-sm border-t border-border/30 mt-16">
      <div className="container px-4 md:px-8 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Logo and description */}
          <div className="md:col-span-4">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="relative w-8 h-8 overflow-hidden">
                <div className="absolute inset-0 rounded-md bg-gradient-to-tr from-primary to-blue-400" />
                <div className="absolute inset-1 bg-white dark:bg-gray-900 rounded-sm flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">AI</span>
                </div>
              </div>
              <span className="text-xl font-medium">AI Aggregator</span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Discover the best AI tools and resources in one place. Our curated
              collection helps you find the perfect AI solutions for your needs.
            </p>
            <div className="flex mt-6 space-x-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/tools"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  AI Tools
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guides
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Newsletter
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Privacy Policy
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Terms of Service
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    Cookie Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    Support & Feedback
                  </span>
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center">
                    <HelpCircle className="h-4 w-4 mr-1" />
                    FAQs
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@example.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    hello@example.com
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border/30">
          <p className="text-sm text-muted-foreground">
            © {currentYear} AI Aggregator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

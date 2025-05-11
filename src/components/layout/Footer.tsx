import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary/30 backdrop-blur-sm border-t border-border/30 mt-16">
      <div className="container px-4 md:px-8 py-12 mx-auto">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Logo and description */}
          <div className="md:col-span-6">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img
                src="/images/web-logo.png"
                alt="Website Logo"
                className="h-8 w-auto"
              />
              <span className="text-xl font-medium">DeepList AI</span>
            </Link>
            <p className="text-muted-foreground max-w-md">
              Discover the best AI tools and resources in one place. Our curated
              collection helps you find the perfect AI solutions for your needs.
            </p>
            <div className="flex mt-6 space-x-4">
              <a
                href="https://x.com/deeplistai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              {/* <a
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
              </a> */}
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
              {/* <li>
                <Link
                  to="/outcomes"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  AI Showcase
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Resources
                </Link>
              </li> */}
            </ul>
          </div>

          {/* <div className="md:col-span-2">
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
          </div> */}

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
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cookie Policy
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
                  Support
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Feedback
                </Link>
              </li>
              {/* <li>
                <a
                  href="mailto:support@deeplistai.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  support@deeplistai.com
                </a>
              </li> */}
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} DeepList AI. All rights reserved.
            </p>
            <a
              href="https://www.producthunt.com/posts/deeplist-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-deeplist&#0045;ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=963846&theme=light&t=1746945244932"
                alt="DeepList&#0032;AI - A&#0032;simple&#0032;way&#0032;to&#0032;discover&#0032;how&#0032;AI&#0032;can&#0032;help&#0032;you | Product Hunt"
                style={{ width: '250px', height: '54px' }}
                width="250"
                height="54"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

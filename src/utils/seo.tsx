import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  article?: boolean;
  canonicalUrl?: string;
  structuredData?: object;
  noindex?: boolean;
  children?: React.ReactNode;
}

/**
 * SEO component for improving search engine optimization across the site
 * This component should be included in all pages to ensure proper meta tags
 */
export const SEO = ({
  title = 'DeepListAI | Find the Best AI Tools for Your Needs',
  description = 'Discover the most powerful and innovative AI tools to enhance your productivity, creativity, and workflow. Find the perfect AI solution for your specific needs.',
  keywords = 'AI tools, artificial intelligence, machine learning, productivity tools, AI software, AI solutions',
  image = '/og-image.png',
  article = false,
  canonicalUrl,
  structuredData,
  noindex = false,
  children,
}: SEOProps) => {
  const { pathname } = useLocation();
  const siteUrl = window.location.origin;
  const fullUrl = `${siteUrl}${pathname}`;
  const ogImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl || fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Structured Data / JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {children}
    </Helmet>
  );
};

/**
 * Generate structured data for a tool page
 */
export const generateToolStructuredData = (tool: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    image: tool.imageUrl,
    url: tool.url,
    applicationCategory: 'AIApplication',
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'Free' ? '0' : undefined,
      priceCurrency: 'USD',
      availability: 'https://schema.org/OnlineOnly',
    },
    aggregateRating: tool.rating
      ? {
          '@type': 'AggregateRating',
          ratingValue: tool.rating,
          ratingCount: tool.ratingCount || 1,
        }
      : undefined,
  };
};

/**
 * Generate structured data for the homepage
 */
export const generateHomeStructuredData = (featuredTools: any[] = []) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DeepListAI',
    url: window.location.origin,
    description:
      'Discover the most powerful and innovative AI tools to enhance your productivity, creativity, and workflow.',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${window.location.origin}/tools?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
};

/**
 * Generate structured data for a collection of tools (tools page)
 */
export const generateToolsCollectionStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'AI Tools Collection',
    description:
      'Browse our comprehensive collection of AI tools for various use cases and industries.',
    url: `${window.location.origin}/tools`,
  };
};


import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CookiesPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cookies Policy | AI Aggregator</title>
        <meta name="description" content="Cookies Policy for AI Aggregator" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-16">
        <Container className="py-12">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Cookies Policy</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">Last updated: April 8, 2025</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              This Cookies Policy explains how AI Aggregator ("we," "us," or "our") uses cookies and similar technologies when you visit our website, services, and applications (collectively, the "Services").
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. What Are Cookies?</h2>
            <p>
              Cookies are small text files that are placed on your device when you visit a website. Cookies are widely used to make websites work more efficiently and provide information to the website owners.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul className="list-disc pl-5 my-4 space-y-2">
              <li><strong>Essential Cookies:</strong> These cookies are necessary for the Services to function properly and cannot be switched off in our systems.</li>
              <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Services.</li>
              <li><strong>Functionality Cookies:</strong> These cookies enable the Services to provide enhanced functionality and personalization.</li>
              <li><strong>Targeting Cookies:</strong> These cookies may be set through our Services by our advertising partners to build a profile of your interests and show you relevant advertisements on other sites.</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Types of Cookies We Use</h2>
            <h3 className="text-xl font-semibold mt-6 mb-3">First-Party Cookies</h3>
            <p>
              First-party cookies are cookies that are set by our website directly. We use first-party cookies to adapt our Services to your preferences and to improve your user experience.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Third-Party Cookies</h3>
            <p>
              Third-party cookies are cookies that are set by domains other than our website. We may allow third parties, such as analytics services and advertising networks, to set cookies on our Services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Managing Cookies</h2>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may impact your overall user experience.
            </p>
            <p>
              To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" className="text-primary hover:underline">www.allaboutcookies.org</a>.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Contact Us</h2>
            <p>
              If you have any questions about our Cookies Policy, please contact us at: cookies@example.com
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default CookiesPolicy;

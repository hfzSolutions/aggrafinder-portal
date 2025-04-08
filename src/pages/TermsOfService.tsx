
import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | AI Aggregator</title>
        <meta name="description" content="Terms of Service for AI Aggregator" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-16">
        <Container className="py-12">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Terms of Service</h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">Last updated: April 8, 2025</p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using AI Aggregator's website, services, or applications (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not access or use the Services.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Services</h2>
            <p>
              AI Aggregator provides a platform for discovering, comparing, and reviewing AI tools and services. Our Services allow users to browse AI tools, read and submit reviews, and request new tools to be added to our database.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              To access certain features of the Services, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
            <p>
              You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
            <p>
              The Services may allow you to submit, upload, publish, or otherwise make available content, including but not limited to text, reviews, ratings, and images. You retain ownership of any intellectual property rights that you hold in that content.
            </p>
            <p>
              By submitting content to the Services, you grant AI Aggregator a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content in any media.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 my-4 space-y-2">
              <li>Use the Services for any illegal purpose or in violation of any applicable laws</li>
              <li>Impersonate any person or entity or falsely state or otherwise misrepresent your affiliation with a person or entity</li>
              <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
              <li>Attempt to gain unauthorized access to any part of the Services</li>
              <li>Use any robot, spider, crawler, scraper, or other automated means to access the Services</li>
              <li>Collect or harvest any information about other users</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Services at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the Services, us, or third parties, or for any other reason.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at: terms@example.com
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default TermsOfService;

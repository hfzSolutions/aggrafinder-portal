import { Helmet } from 'react-helmet';
import { Container } from '@/components/ui/container';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | DeepList AI</title>
        <meta name="description" content="Privacy Policy for DeepList AI" />
      </Helmet>
      <Header />
      <main className="flex-1 pt-16">
        <Container className="py-12">
          <h1 className="text-3xl font-bold tracking-tight mb-6">
            Privacy Policy
          </h1>
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-4">
              Last updated: April 8, 2025
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              1. Introduction
            </h2>
            <p>
              This Privacy Policy describes how DeepList AI ("we," "us," or
              "our") collects, uses, and shares information about you when you
              use our website, services, and applications (collectively, the
              "Services").
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              2. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us, information we
              collect automatically when you use the Services, and information
              from third-party sources.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">
              Information You Provide to Us
            </h3>
            <p>
              This includes information you provide when you create an account,
              update your profile, submit or rate AI tools, post reviews,
              contact us, respond to surveys, or otherwise communicate with us.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">
              Information We Collect Automatically
            </h3>
            <p>
              When you use our Services, we automatically collect certain
              information, including your IP address, device information,
              browser type, pages viewed, and other usage information.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-5 my-4 space-y-2">
              <li>Provide, maintain, and improve our Services</li>
              <li>Process transactions and send related information</li>
              <li>
                Send you technical notices, updates, security alerts, and
                support messages
              </li>
              <li>Respond to your comments, questions, and requests</li>
              <li>Personalize your experience on our Services</li>
              <li>
                Monitor and analyze trends, usage, and activities in connection
                with our Services
              </li>
              <li>
                Detect, investigate, and prevent fraudulent transactions and
                other illegal activities
              </li>
              <li>Comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              4. Sharing of Information
            </h2>
            <p>
              We may share information about you as follows or as otherwise
              described in this Privacy Policy:
            </p>
            <ul className="list-disc pl-5 my-4 space-y-2">
              <li>
                With vendors, consultants, and other service providers who need
                access to such information to carry out work on our behalf
              </li>
              <li>
                In response to a request for information if we believe
                disclosure is in accordance with any applicable law, regulation,
                or legal process
              </li>
              <li>
                To protect the rights, property, and safety of DeepList AI, our
                users, and the public
              </li>
              <li>
                In connection with, or during negotiations of, any merger, sale
                of company assets, financing, or acquisition of all or a portion
                of our business to another company
              </li>
              <li>With your consent or at your direction</li>
            </ul>

            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact us at: privacy@example.com
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;

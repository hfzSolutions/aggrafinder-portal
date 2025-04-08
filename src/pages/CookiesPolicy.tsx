
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CookiesPolicy = () => {
  return (
    <>
      <Helmet>
        <title>Cookies Policy | AI Aggregator</title>
        <meta
          name="description"
          content="Cookies Policy for AI Aggregator - Information about how we use cookies on our site."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container px-4 md:px-8 mx-auto py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-medium mb-6">Cookies Policy</h1>
            
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p className="text-muted-foreground">Last updated: April 8, 2025</p>
              
              <h2>What are cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide information to the owners of the site.
              </p>

              <h2>How we use cookies</h2>
              <p>
                We use cookies for a variety of reasons detailed below:
              </p>
              
              <h3>Essential cookies</h3>
              <p>
                These cookies are necessary for the website to function properly. They enable core functionality such as security,
                network management, and account authentication. You may disable these by changing your browser settings, but this
                may affect how the website functions.
              </p>
              
              <h3>Analytics cookies</h3>
              <p>
                We use analytics cookies to help us understand how visitors interact with our website. This helps us to improve
                the way our website works, for example, by ensuring that users are finding what they are looking for easily.
              </p>
              
              <h3>Functionality cookies</h3>
              <p>
                These cookies allow our website to remember choices you make (such as your user name, language or the region you
                are in) and provide enhanced, more personal features.
              </p>
              
              <h3>Targeting cookies</h3>
              <p>
                These cookies are used to deliver advertisements more relevant to you and your interests. They are also used to
                limit the number of times you see an advertisement as well as help measure the effectiveness of the advertising campaign.
              </p>

              <h2>Managing cookies</h2>
              <p>
                Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies,
                including how to see what cookies have been set, visit www.aboutcookies.org or www.allaboutcookies.org.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about our Cookies Policy, please contact us at cookies@example.com.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default CookiesPolicy;

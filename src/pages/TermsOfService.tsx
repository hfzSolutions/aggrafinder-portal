
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TermsOfService = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | AI Aggregator</title>
        <meta
          name="description"
          content="Terms of Service for AI Aggregator - Read our terms and conditions of use."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container px-4 md:px-8 mx-auto py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-medium mb-6">Terms of Service</h1>
            
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p className="text-muted-foreground">Last updated: April 8, 2025</p>
              
              <h2>Introduction</h2>
              <p>
                These terms and conditions outline the rules and regulations for the use of AI Aggregator's website.
                By accessing this website we assume you accept these terms and conditions. Do not continue to use AI Aggregator
                if you do not agree to take all of the terms and conditions stated on this page.
              </p>

              <h2>License</h2>
              <p>
                Unless otherwise stated, AI Aggregator and/or its licensors own the intellectual property rights for
                all material on AI Aggregator. All intellectual property rights are reserved. You may access this from
                AI Aggregator for your own personal use subjected to restrictions set in these terms and conditions.
              </p>

              <h3>You must not:</h3>
              <ul>
                <li>Republish material from AI Aggregator</li>
                <li>Sell, rent or sub-license material from AI Aggregator</li>
                <li>Reproduce, duplicate or copy material from AI Aggregator</li>
                <li>Redistribute content from AI Aggregator</li>
              </ul>

              <h2>User Content</h2>
              <p>
                In these terms and conditions, "User Content" shall mean any audio, video, text, images or other
                material you choose to display on this website. By displaying your User Content, you grant AI Aggregator
                a non-exclusive, worldwide, irrevocable, royalty-free, sublicensable license to use, reproduce, adapt,
                publish, translate and distribute it in any and all media.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                In no event shall AI Aggregator, nor any of its officers, directors and employees, be liable to you for
                anything arising out of or in any way connected with your use of this website, whether such liability is
                under contract, tort or otherwise, and AI Aggregator shall not be liable for any indirect, consequential
                or special liability arising out of or in any way related to your use of this website.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at terms@example.com.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default TermsOfService;

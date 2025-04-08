
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Mail, MessageSquare } from 'lucide-react';

const Support = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a backend
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <>
      <Helmet>
        <title>Support & Feedback | AI Aggregator</title>
        <meta
          name="description"
          content="Get support and provide feedback for AI Aggregator. We're here to help!"
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow container px-4 md:px-8 mx-auto py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-medium mb-6">Support & Feedback</h1>
            
            <p className="text-muted-foreground mb-8">
              We're here to help! If you have any questions, concerns, or feedback about our services, 
              please don't hesitate to reach out using the form below or through one of our support channels.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <Mail className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">
                  Send us an email and we'll respond within 24 hours.
                </p>
                <a href="mailto:support@example.com" className="text-primary hover:underline">
                  support@example.com
                </a>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <HelpCircle className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Help Center</h3>
                <p className="text-muted-foreground mb-4">
                  Browse our knowledge base for answers to common questions.
                </p>
                <a href="#" className="text-primary hover:underline">
                  Visit Help Center
                </a>
              </Card>
              
              <Card className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  <MessageSquare className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Live Chat</h3>
                <p className="text-muted-foreground mb-4">
                  Chat with our support team during business hours.
                </p>
                <Button variant="outline" className="w-full">
                  Start Chat
                </Button>
              </Card>
            </div>
            
            <div className="bg-card border rounded-lg p-6 md:p-8">
              <h2 className="text-2xl font-medium mb-4">Contact Form</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" required />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Your email address" 
                      required 
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="block text-sm font-medium">
                    Subject
                  </label>
                  <Input id="subject" placeholder="What is this regarding?" required />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="block text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Please describe your issue or feedback in detail"
                    rows={5}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full md:w-auto">
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Support;

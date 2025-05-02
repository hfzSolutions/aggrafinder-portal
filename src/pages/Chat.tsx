
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatInterface from '@/components/chat/ChatInterface';

const Chat = () => {
  return (
    <>
      <Helmet>
        <title>AI Chat Assistant | DeepListAI</title>
        <meta
          name="description"
          content="Chat with our AI assistant to get help finding the right AI tools for your needs."
        />
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto py-16 px-4 md:px-6 mt-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Chat with AI Assistant</h1>
          <p className="text-muted-foreground text-center mb-8">
            Ask questions about AI tools or get personalized recommendations based on your needs.
          </p>
          
          <ChatInterface />
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Chat;

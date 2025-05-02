
import { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatInterface from '@/components/chat/ChatInterface';
import ChatHistory from '@/components/chat/ChatHistory';
import { Sidebar, SidebarContent, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { MenuIcon } from 'lucide-react';

const Chat = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  return (
    <>
      <Helmet>
        <title>AI Chat Assistant | DeepListAI</title>
        <meta
          name="description"
          content="Chat with our AI assistant to get help finding the right AI tools for your needs."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex pt-16">
          <div className="flex h-[calc(100vh-64px)] w-full relative">
            <SidebarProvider defaultOpen={sidebarOpen} open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <Sidebar className="z-20 border-r border-border bg-muted/30 w-72" collapsible="offcanvas">
                <SidebarContent className="pt-4">
                  <ChatHistory activeChatId={activeChatId} setActiveChatId={setActiveChatId} />
                </SidebarContent>
              </Sidebar>
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-background p-2 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden"
                  >
                    <MenuIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle sidebar</span>
                  </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ChatInterface selectedChatId={activeChatId} onNewChat={() => setActiveChatId(null)} />
                </div>
              </div>
            </SidebarProvider>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Chat;

import { Helmet } from 'react-helmet';
import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChatInterface from '@/components/chat/ChatInterface';
import ChatSidebar from '@/components/chat/ChatSidebar';
import {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useToast } from '@/components/ui/use-toast';

// Wrapper component to use sidebar context
const ChatContent = () => {
  const { toggleSidebar, collapsed, setCollapsed } = useSidebar();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    undefined
  );
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Check if we're on mobile for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // On mobile, collapse the sidebar after selecting a chat
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
    // In a real implementation, you would load the selected chat's messages here
  };

  const handleNewChat = () => {
    setSelectedChatId(undefined);
    toast({
      title: 'New conversation started',
      description: 'Your previous conversation has been saved.',
      duration: 3000,
    });
    // On mobile, collapse the sidebar after creating a new chat
    if (isMobile && !collapsed) {
      setCollapsed(true);
    }
    // In a real implementation, you would clear the current chat and start a new one
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <Sidebar className="h-full border-r pt-16 shadow-sm transition-all duration-300">
        <SidebarContent>
          <ChatSidebar
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            selectedChatId={selectedChatId}
            className="animate-in slide-in-from-left-5 duration-300"
          />
        </SidebarContent>
        <SidebarTrigger className="absolute top-20 -right-3 h-6 w-6 rounded-full border bg-background shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors" />
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatInterface selectedChatId={selectedChatId} />
      </div>
    </div>
  );
};

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

      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <main className="flex-grow pt-20">
          <SidebarProvider
            defaultCollapsed={window.innerWidth < 768}
            collapsible="icon"
            className="transition-all duration-300"
          >
            <ChatContent />
          </SidebarProvider>
        </main>

        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Chat;

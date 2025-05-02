import { Helmet } from 'react-helmet';
import { useState } from 'react';
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

// Wrapper component to use sidebar context
const ChatContent = () => {
  const { toggleSidebar } = useSidebar();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(
    undefined
  );

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
    // In a real implementation, you would load the selected chat's messages here
  };

  const handleNewChat = () => {
    setSelectedChatId(undefined);
    // In a real implementation, you would clear the current chat and start a new one
  };

  return (
    <div className="flex h-[calc(100vh-80px)]">
      <Sidebar className="h-full border-r pt-16">
        <SidebarContent>
          <ChatSidebar
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            selectedChatId={selectedChatId}
          />
        </SidebarContent>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ChatInterface selectedChatId={selectedChatId} />
        </div>
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

      <div className="min-h-screen flex flex-col">
        <Header />

        <main className="flex-grow pt-20 pb-20">
          <SidebarProvider defaultCollapsed={false} collapsible="icon">
            <ChatContent />
          </SidebarProvider>
        </main>

        {/* <Footer /> */}
      </div>
    </>
  );
};

export default Chat;

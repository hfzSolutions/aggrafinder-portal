
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageCircle, Trash2 } from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

export type ChatSession = {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

type ChatHistoryProps = {
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
}

const ChatHistory = ({ activeChatId, setActiveChatId }: ChatHistoryProps) => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  
  useEffect(() => {
    // Load saved chats from local storage
    const savedChats = localStorage.getItem('chat_sessions');
    if (savedChats) {
      setChatSessions(JSON.parse(savedChats));
    }
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = chatSessions.filter(session => session.id !== id);
    setChatSessions(updatedSessions);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
    
    // Also delete the chat messages
    localStorage.removeItem(`chat_${id}`);
    
    if (activeChatId === id) {
      setActiveChatId(null);
    }
  };

  return (
    <>
      <div className="p-3">
        <Button 
          variant="default" 
          className="w-full mb-2 bg-primary/90 hover:bg-primary"
          onClick={handleNewChat}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>

      <SidebarGroup>
        <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {chatSessions.length > 0 ? (
              chatSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    isActive={activeChatId === session.id}
                    onClick={() => setActiveChatId(session.id)}
                    className="w-full text-left flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="flex-1 truncate">{session.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDeleteChat(session.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No conversations yet
              </div>
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default ChatHistory;

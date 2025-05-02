import { useState, useEffect } from 'react';
import { Search, Clock, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ChatHistory = {
  id: string;
  title: string;
  date: string;
  preview: string;
};

interface ChatSidebarProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  selectedChatId?: string;
  className?: string;
}

const ChatSidebar = ({
  onSelectChat,
  onNewChat,
  selectedChatId,
  className,
}: ChatSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ChatHistory[]>([]);

  // Simulated chat history - in a real app, this would come from a database
  useEffect(() => {
    // This is just example data - in a real implementation, you would fetch this from your backend
    const exampleHistory: ChatHistory[] = [
      {
        id: '1',
        title: 'AI Tool Recommendations',
        date: '2 hours ago',
        preview: 'Can you recommend some AI tools for content creation?',
      },
      {
        id: '2',
        title: 'Machine Learning Models',
        date: 'Yesterday',
        preview:
          'What are the best machine learning models for image recognition?',
      },
      {
        id: '3',
        title: 'GPT-4 vs Claude',
        date: '3 days ago',
        preview: 'How does GPT-4 compare to Claude for text generation?',
      },
    ];

    setChatHistory(exampleHistory);
    setFilteredHistory(exampleHistory);
  }, []);

  // Filter chat history based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHistory(chatHistory);
      return;
    }

    const filtered = chatHistory.filter(
      (chat) =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.preview.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredHistory(filtered);
  }, [searchTerm, chatHistory]);

  return (
    <div className={cn('flex flex-col h-full bg-sidebar border-r', className)}>
      <div className="p-4 border-b">
        <Button
          onClick={onNewChat}
          className="w-full mb-4 flex items-center justify-center gap-2"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {filteredHistory.length === 0 ? (
          <div className="px-4 py-8 text-center text-muted-foreground">
            {searchTerm ? 'No conversations found' : 'No conversations yet'}
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {filteredHistory.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md hover:bg-sidebar-accent transition-colors',
                  'flex flex-col gap-1',
                  selectedChatId === chat.id &&
                    'bg-sidebar-accent text-sidebar-accent-foreground'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate">{chat.title}</span>
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {chat.date}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {chat.preview}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;

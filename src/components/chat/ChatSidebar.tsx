import { useState, useEffect, useRef } from 'react';
import { Search, Clock, Plus, Trash2, MoreHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

type ChatHistory = {
  id: string;
  title: string;
  date: string;
  preview: string;
  timestamp: number; // For sorting by most recent
  category?: string; // Optional category for filtering
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Simulated chat history - in a real app, this would come from a database
  useEffect(() => {
    // This is just example data - in a real implementation, you would fetch this from your backend
    const exampleHistory: ChatHistory[] = [
      {
        id: '1',
        title: 'AI Tool Recommendations',
        date: '2 hours ago',
        preview: 'Can you recommend some AI tools for content creation?',
        timestamp: Date.now() - 2 * 60 * 60 * 1000,
        category: 'tools',
      },
      {
        id: '2',
        title: 'Machine Learning Models',
        date: 'Yesterday',
        preview:
          'What are the best machine learning models for image recognition?',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        category: 'ml',
      },
      {
        id: '3',
        title: 'GPT-4 vs Claude',
        date: '3 days ago',
        preview: 'How does GPT-4 compare to Claude for text generation?',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        category: 'llm',
      },
      {
        id: '4',
        title: 'AI for Image Generation',
        date: '5 days ago',
        preview: 'What are the best AI tools for generating realistic images?',
        timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
        category: 'tools',
      },
      {
        id: '5',
        title: 'Prompt Engineering Tips',
        date: '1 week ago',
        preview: 'Can you share some advanced prompt engineering techniques?',
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        category: 'tips',
      },
    ];

    setChatHistory(exampleHistory);
    setFilteredHistory(sortChats(exampleHistory, sortOrder));
  }, [sortOrder]);

  // Sort chats by timestamp
  const sortChats = (chats: ChatHistory[], order: 'newest' | 'oldest') => {
    return [...chats].sort((a, b) => {
      return order === 'newest'
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });
  };

  // Filter chat history based on search term
  useEffect(() => {
    let filtered = chatHistory;

    if (searchTerm.trim()) {
      filtered = chatHistory.filter(
        (chat) =>
          chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.preview.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (chat.category &&
            chat.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredHistory(sortChats(filtered, sortOrder));
  }, [searchTerm, chatHistory, sortOrder]);

  // Handle chat deletion
  const handleDeleteChat = (chatId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete) {
      // In a real implementation, you would call an API to delete the chat
      setChatHistory(chatHistory.filter((chat) => chat.id !== chatToDelete));

      // If the deleted chat was selected, clear the selection
      if (selectedChatId === chatToDelete) {
        onNewChat();
      }

      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  // Focus search input when pressing Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={cn('flex flex-col h-full bg-sidebar border-r', className)}>
      <div className="p-4 border-b">
        <Button
          onClick={onNewChat}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all duration-200 hover:shadow"
          variant="default"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        <div className="relative group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search conversations... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-8 bg-background border-muted focus-visible:ring-1 focus-visible:ring-primary/30 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors duration-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex justify-between items-center mt-3 px-1">
          <span className="text-xs text-muted-foreground">
            {filteredHistory.length} conversation
            {filteredHistory.length !== 1 ? 's' : ''}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                <span className="sr-only">Sort order</span>
                <span className="text-xs text-muted-foreground">
                  Sort: {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                Oldest first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-2">
          {filteredHistory.length === 0 ? (
            <div className="px-4 py-8 text-center text-muted-foreground">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            <div className="space-y-1 px-2">
              {filteredHistory.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    'group relative rounded-md overflow-hidden transition-all duration-200',
                    selectedChatId === chat.id
                      ? 'ring-1 ring-primary/50'
                      : 'hover:bg-sidebar-accent/50'
                  )}
                >
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 rounded-md transition-colors',
                      'flex flex-col gap-1',
                      selectedChatId === chat.id &&
                        'bg-sidebar-accent text-sidebar-accent-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate text-sm">
                        {chat.title}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {chat.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.preview}
                    </p>
                    {chat.category && (
                      <Badge
                        variant="outline"
                        className="self-start mt-1 text-[10px] px-1.5 py-0 h-4 bg-primary/5"
                      >
                        {chat.category}
                      </Badge>
                    )}
                  </button>

                  <Tooltip>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </Tooltip>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete conversation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteChat}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatSidebar;

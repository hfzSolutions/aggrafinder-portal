
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChatMessageProps = {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      "py-6 px-4 md:px-8 flex gap-4",
      isUser ? "bg-muted/30" : "bg-background"
    )}>
      <Avatar className={cn(
        "h-8 w-8 rounded-md flex-shrink-0 mt-1",
        isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
      )}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </Avatar>
      
      <div className="flex-1 overflow-hidden">
        <p className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
          {message.content}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;

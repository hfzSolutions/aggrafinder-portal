
import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';

type ChatMessageProps = {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary/10 text-primary">
          <Bot className="h-5 w-5" />
        </Avatar>
      )}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-foreground'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-muted">
          <User className="h-5 w-5" />
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;

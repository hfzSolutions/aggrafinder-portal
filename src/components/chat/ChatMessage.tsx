import { Avatar } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import { useEffect, useState } from 'react';

type ChatMessageProps = {
  message: {
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isTyping?: boolean;
  onTypingComplete?: () => void;
};

const ChatMessage = ({
  message,
  isTyping = false,
  onTypingComplete,
}: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(isUser);

  useEffect(() => {
    // Reset state when message changes
    setDisplayText('');
    setIsComplete(isUser);

    if (isUser) return;

    // For assistant messages, implement typing effect
    let index = 0;
    const content = message.content;

    // If not typing animation, show full content immediately
    if (!isTyping) {
      setDisplayText(content);
      setIsComplete(true);
      return;
    }

    // Typing animation with variable speed for more natural effect
    let typingTimer: ReturnType<typeof setTimeout>;

    const typeNextChunk = () => {
      if (index >= content.length) {
        setIsComplete(true);
        onTypingComplete?.();
        return;
      }

      // Add characters in chunks for more natural typing
      const chunkSize = Math.floor(Math.random() * 3) + 1; // 1-3 characters at a time
      const nextChunk = content.substring(
        index,
        Math.min(index + chunkSize, content.length)
      );
      setDisplayText((prev) => prev + nextChunk);
      index += nextChunk.length;

      // Determine the delay before the next chunk
      let delay = 15 + Math.random() * 30; // Base typing speed

      // Add random pauses at punctuation for more natural rhythm
      if (['.', '!', '?'].includes(nextChunk.charAt(nextChunk.length - 1))) {
        delay = 300 + Math.random() * 400; // Longer pause at end of sentences
      } else if (
        [',', ':', ';'].includes(nextChunk.charAt(nextChunk.length - 1))
      ) {
        delay = 150 + Math.random() * 200; // Medium pause at commas and other punctuation
      }

      // Schedule the next chunk
      typingTimer = setTimeout(typeNextChunk, delay);
    };

    // Start the typing animation
    typeNextChunk();

    // Clean up function
    return () => {
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [message, isTyping, isUser]);

  return (
    <div
      className={`flex items-center gap-3 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {!isUser && (
        <div className="flex-shrink-0 self-start mt-1">
          <Avatar className="h-8 w-8 bg-primary/10 text-primary flex items-center justify-center">
            <Bot className="h-5 w-5" />
          </Avatar>
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-xl px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/50 text-foreground'
        }`}
      >
        <p className="whitespace-pre-wrap">
          {isUser ? message.content : displayText}
          {!isComplete && <span className="animate-pulse">▋</span>}
        </p>
      </div>
      {isUser && (
        <div className="flex-shrink-0 self-start mt-1">
          <Avatar className="h-8 w-8 bg-muted flex items-center justify-center">
            <User className="h-5 w-5" />
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

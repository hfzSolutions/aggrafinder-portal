import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { containsMarkdown, processText } from '@/lib/markdown';
import { CustomMarkdownRenderer } from '@/components/ui/custom-markdown-renderer';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'ad';
  content: string;
  isTyping?: boolean;
  displayContent?: string;
  isAdComplete?: boolean;
};

interface MessageItemProps {
  message: Message;
  imageUrl?: string;
  isLatestBotMessage?: boolean;
  botMessageRef?: React.RefObject<HTMLDivElement>;
}

export const MessageItem = ({
  message,
  imageUrl,
  isLatestBotMessage,
  botMessageRef,
}: MessageItemProps) => {
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  // Auto-scroll to bottom when this is the latest bot message
  useEffect(() => {
    if (isLatestBotMessage && botMessageRef?.current && !hasUserScrolled) {
      // Add small delay to ensure content is rendered
      setTimeout(() => {
        botMessageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }
  }, [
    isLatestBotMessage,
    botMessageRef,
    message.displayContent,
    message.content,
    hasUserScrolled,
  ]);

  // Reset user scroll flag when new message arrives
  useEffect(() => {
    if (message.role === 'user') {
      setHasUserScrolled(false);
    }
  }, [message.role, message.id]);

  // Listen for user scroll events
  useEffect(() => {
    const handleScroll = () => {
      setHasUserScrolled(true);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Reset after 3 seconds of no scrolling
      scrollTimeoutRef.current = setTimeout(() => {
        setHasUserScrolled(false);
      }, 3000);
    };

    const container =
      botMessageRef?.current?.closest('[data-scroll-container]') || window;
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [botMessageRef]);

  return (
    <motion.div
      key={message.id}
      id={`message-${message.id}`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'flex items-start gap-3 px-4 sm:px-2 mb-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
      ref={isLatestBotMessage ? botMessageRef : undefined}
    >
      {message.role !== 'user' && (
        <div className="flex flex-shrink-0 relative">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Bot"
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('flex');
                  e.currentTarget.parentElement?.classList.remove('block');
                }}
              />
            ) : (
              <Bot className="h-4 w-4 text-primary" />
            )}
          </div>
          {/* Green online status indicator */}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-[1.5px] border-white dark:border-gray-900 rounded-full shadow-sm">
            <div className="absolute inset-0 w-full h-full bg-green-400 rounded-full animate-ping opacity-40"></div>
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          'max-w-[90%] sm:max-w-[75%] md:max-w-[70%] relative group',
          message.role === 'user'
            ? 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-[18px] rounded-br-[4px] px-4 py-3'
            : 'bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-750 text-gray-900 dark:text-gray-100 rounded-[18px] rounded-tl-[4px] px-4 py-3 border border-gray-200/50 dark:border-gray-700/50'
        )}
      >
        <div
          className={cn(
            'text-[15px] leading-[1.4] whitespace-pre-wrap break-words font-normal',
            message.role === 'user'
              ? 'text-white'
              : 'text-gray-900 dark:text-gray-100'
          )}
        >
          {message.role === 'user' ? (
            message.content
          ) : !message.displayContent && message.isTyping ? (
            // Enhanced typing indicator
            <div className="flex space-x-1.5 items-center h-6 py-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                style={{ animationDelay: '0.15s' }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                style={{ animationDelay: '0.3s' }}
              ></div>
            </div>
          ) : (
            // Enhanced content rendering
            <>
              {containsMarkdown(message.displayContent || message.content) ? (
                <CustomMarkdownRenderer
                  content={message.displayContent || message.content}
                  className="inline-block"
                />
              ) : (
                processText(message.displayContent || message.content)
              )}
              {message.isTyping &&
                (message.displayContent || message.content) && (
                  <span className="animate-pulse ml-1 text-gray-400 dark:text-gray-500 font-mono">
                    |
                  </span>
                )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

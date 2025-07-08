import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  RotateCcw,
  ArrowUp,
  ChevronUp,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isBotTyping: boolean;
  isShowingAd: boolean;
  isMessageTooLong: boolean;
  maxMessageLength: number;
  messagesLength: number;
  onSendMessage: () => void;
  onResetChat: () => void;
  onStopTyping: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export const ChatInput = ({
  input,
  setInput,
  isLoading,
  isBotTyping,
  isShowingAd,
  isMessageTooLong,
  maxMessageLength,
  messagesLength,
  onSendMessage,
  onResetChat,
  onStopTyping,
  onKeyDown,
}: ChatInputProps) => {
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Function to handle textarea input and auto-resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);

    const textarea = e.target;

    // Check if content exceeds default max height to show expand button
    textarea.style.height = 'auto'; // Reset height to recalculate
    const scrollHeight = textarea.scrollHeight;
    setShouldShowExpandButton(scrollHeight > 120);

    // Only auto-resize if not in expanded mode
    if (!isInputExpanded) {
      // Set the height based on content with a maximum of 120px
      textarea.style.height = `${Math.min(scrollHeight, 120)}px`;
    } else {
      // In expanded mode, maintain the 70vh height
      textarea.style.height = '70vh';
    }
  };

  // Function to toggle expanded state
  const toggleInputExpand = () => {
    const newExpandedState = !isInputExpanded;
    setIsInputExpanded(newExpandedState);

    // After toggling, resize the textarea and adjust the card
    setTimeout(() => {
      if (inputRef.current) {
        const textarea = inputRef.current;

        // When expanded, set to 70% of viewport height
        if (newExpandedState) {
          // Force the height to 70vh when expanded
          textarea.style.height = '70vh';
        } else {
          // When collapsed, auto-resize with max height of 120px
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
        }
      }
    }, 0);
  };

  // Reset input state when message is sent
  useEffect(() => {
    if (!input.trim() && inputRef.current) {
      inputRef.current.style.height = '40px';
      if (isInputExpanded) {
        setIsInputExpanded(false);
      }
    }
  }, [input, isInputExpanded]);

  return (
    <div
      data-input-area
      className="p-3 sm:p-4 border border-gray-200/60 dark:border-gray-700/60 rounded-2xl bg-white/95 dark:bg-gray-900/95 shadow-lg mx-0 sm:mx-4 backdrop-blur-md fixed bottom-7 left-2 right-2 sm:sticky sm:bottom-10 z-[45] hover:border-gray-300/80 dark:hover:border-gray-600/80 transition-all duration-300 hover:shadow-xl"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="flex flex-col gap-2">
          {isBotTyping ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onStopTyping}
              className="h-8 w-8 rounded-full flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
              title="Stop response"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="16" height="16" x="4" y="4" rx="2" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={onResetChat}
              disabled={messagesLength <= 1}
              className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
              title="Reset conversation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        <motion.div
          className="flex flex-row items-center w-full gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`flex-grow relative w-full transition-all duration-300 ease-in-out ${
              isInputExpanded ? 'h-[70vh]' : 'h-auto'
            }`}
            style={{
              maxHeight: isInputExpanded ? '70vh' : 'auto',
            }}
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={handleTextareaInput}
              style={{
                minHeight: '40px',
                height: isInputExpanded ? '70vh' : 'auto',
                maxHeight: isInputExpanded ? '70vh' : '120px',
                transition: 'all 0.3s ease-in-out',
                overflow: 'auto',
              }}
              onKeyDown={onKeyDown}
              placeholder="Ask your question here..."
              disabled={isLoading || isBotTyping || isShowingAd}
              className={cn(
                'w-full transition-all duration-300 focus-visible:ring-0 focus-visible:outline-none focus:border-transparent border-transparent rounded-xl pl-4 pr-4 py-3 min-h-[42px] resize-none bg-gray-50/80 dark:bg-gray-800/80 text-foreground placeholder:text-gray-500 dark:placeholder:text-gray-400 text-[15px] placeholder:text-[15px] font-normal leading-[1.4]',
                (isLoading || isBotTyping || isShowingAd) && 'opacity-60',
                isMessageTooLong &&
                  'border-red-500 focus:border-red-500 bg-red-50/80 dark:bg-red-900/20'
              )}
              rows={1}
            />
          </div>

          {/* Show expand button only when content exceeds max height or when there's content and it's expanded */}
          {((shouldShowExpandButton && input.trim().length > 0) ||
            (isInputExpanded && input.trim().length > 0)) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleInputExpand}
              className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full bg-background/80 hover:bg-background/90 text-muted-foreground z-10"
              title={isInputExpanded ? 'Collapse' : 'Expand'}
            >
              {isInputExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Send button - always visible */}
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0"
            initial={{ opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              size="icon"
              onClick={onSendMessage}
              disabled={!input.trim() || isLoading || isMessageTooLong}
              className={cn(
                'h-10 w-10 rounded-full transition-all duration-300 shadow-md hover:shadow-lg text-white flex items-center justify-center transform hover:scale-105 active:scale-95',
                isMessageTooLong
                  ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
                  : !input.trim()
                  ? 'bg-gray-400 hover:bg-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
              )}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
      <div className="flex items-center justify-center mt-2">
        {isMessageTooLong ? (
          <p className="text-xs text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 inline-flex items-center">
            Message too long ({input.length}/{maxMessageLength} characters)
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/30 px-2 py-0.5 rounded-full bg-muted/20 inline-flex items-center">
            AI may make mistakes. Please verify results.
          </p>
        )}
      </div>
    </div>
  );
};

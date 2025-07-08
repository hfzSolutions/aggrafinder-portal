import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useQuickToolUsage } from '@/hooks/useQuickToolUsage';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChatSponsorAd, checkForSponsorAds } from './ChatSponsorAd';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'ad';
  content: string;
  isTyping?: boolean;
  displayContent?: string;
  adData?: SponsorAd;
  isAdComplete?: boolean;
};

interface SponsorAd {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  link_text: string;
  is_active: boolean;
}

interface QuickToolChatProps {
  toolId: string;
  toolName: string;
  toolPrompt: string;
  className?: string;
  imageUrl?: string;
  initialMessage?: string;
  suggested_replies?: boolean;
}

export const QuickToolChat = ({
  toolId,
  toolName,
  toolPrompt,
  className,
  imageUrl,
  initialMessage,
  suggested_replies,
}: QuickToolChatProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trackEvent } = useAnalytics();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        initialMessage ||
        `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
    },
  ]);
  const [persistentUserMessageCount, setPersistentUserMessageCount] =
    useState(0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isMessageTooLong, setIsMessageTooLong] = useState(false);
  const MAX_MESSAGE_LENGTH = 1000;
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);

  const { trackChatEvent } = useAIChatAnalytics();
  const { incrementUsageCount } = useQuickToolUsage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const botMessageRef = useRef<HTMLDivElement>(null);
  const suggestedRepliesRef = useRef<HTMLDivElement>(null);

  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [pendingUserInput, setPendingUserInput] = useState<string>('');
  const [isAdAvailable, setIsAdAvailable] = useState<boolean>(false);
  const [latestBotMessageId, setLatestBotMessageId] = useState<string | null>(
    null
  );

  // Update message too long state when input changes
  useEffect(() => {
    setIsMessageTooLong(input.length > MAX_MESSAGE_LENGTH);
  }, [input]);

  // Function to generate suggested replies based on the latest bot message
  const generateSuggestedReplies = async (botMessage: string) => {
    if (!suggested_replies) return;

    try {
      const { aiService } = await import('@/lib/ai-service');

      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-3)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const suggestions = await aiService.generateSuggestions({
        toolName,
        lastAssistantMessage: botMessage,
        conversationHistory,
        count: 3,
      });

      setSuggestedReplies(suggestions.length > 0 ? suggestions : []);
    } catch (error) {
      console.warn('Failed to generate suggested replies:', error);
      setSuggestedReplies(['Tell me more', 'How do I start?', 'What else?']);
    }
  };

  // Function to handle suggested reply click - auto send message
  const handleSuggestedReplyClick = async (reply: string) => {
    setSuggestedReplies([]);

    try {
      setIsLoading(true);

      const userMessage: Message = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content: reply,
      };

      setMessages((prev) => [...prev, userMessage]);
      setPersistentUserMessageCount((prev) => prev + 1);

      const { available } = await checkForSponsorAds();
      setIsAdAvailable(available);

      const shouldShowAd =
        messages.length >= 1 && Math.random() < 0.7 && available;

      if (shouldShowAd && !isShowingAd) {
        setPendingUserInput(reply);
        setIsShowingAd(true);

        const adMessage: Message = {
          id: Date.now().toString() + '-ad',
          role: 'ad',
          content: '',
          isAdComplete: false,
        };

        setMessages((prev) => [...prev, adMessage]);
        return;
      }

      await processUserMessage(reply);
    } catch (error) {
      console.error('Error in handleSuggestedReplyClick:', error);
      toast.error(
        'An error occurred while sending the message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to animate typing effect for a message with realistic timing
  const animateTyping = (messageId: string, content: string) => {
    let index = 0;
    setIsBotTyping(true);
    setLatestBotMessageId(messageId);
    setSuggestedReplies([]);

    const typeNextChunk = () => {
      if (index >= content.length) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
        setIsBotTyping(false);
        return;
      }

      const chunkSize = Math.floor(Math.random() * 3) + 1;
      const nextChunk = content.substring(
        index,
        Math.min(index + chunkSize, content.length)
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, displayContent: (msg.displayContent || '') + nextChunk }
            : msg
        )
      );

      index += nextChunk.length;
      let delay = 15 + Math.random() * 30;

      if (['.', '!', '?'].includes(nextChunk.charAt(nextChunk.length - 1))) {
        delay = 300 + Math.random() * 400;
      } else if (
        [',', ':', ';'].includes(nextChunk.charAt(nextChunk.length - 1))
      ) {
        delay = 150 + Math.random() * 200;
      }

      typingTimeoutRef.current = setTimeout(typeNextChunk, delay);
    };

    typeNextChunk();
  };

  // Enhanced scroll handler to detect user scrolling
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      setHasNewMessage(false);
    }

    const lastMessage = messages[messages.length - 1];
    if (!isNearBottom && lastMessage && lastMessage.role === 'user') {
      setHasNewMessage(true);
    }
  };

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const inputArea = document.querySelector(
      '[data-input-area]'
    ) as HTMLElement;
    const inputHeight = inputArea ? inputArea.offsetHeight : 120;

    const targetScrollTop =
      container.scrollHeight - container.scrollHeight + inputHeight + 40;

    setTimeout(() => {
      container.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: 'smooth',
      });
      setHasNewMessage(false);
    }, 50);
  };

  // Function to stop the typing animation
  const stopTypingAnimation = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.isTyping) {
          return { ...msg, isTyping: false, displayContent: msg.content };
        }
        return msg;
      })
    );

    setIsBotTyping(false);
    setIsLoading(false);
  };

  // Authentication state management
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsAuthLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Track when chat is opened
  useEffect(() => {
    trackChatEvent(toolId, 'open');
    incrementUsageCount(toolId);

    return () => {
      trackChatEvent(toolId, 'close', messages.length);
    };
  }, [toolId, trackChatEvent, incrementUsageCount, messages.length]);

  // Generate suggested replies for the initial message
  useEffect(() => {
    const generateInitialSuggestions = async () => {
      if (!suggested_replies || messages.length !== 1) return;

      const initialMessage = messages[0];
      if (initialMessage.role === 'assistant') {
        await generateSuggestedReplies(initialMessage.content);
      }
    };

    const timer = setTimeout(generateInitialSuggestions, 500);
    return () => clearTimeout(timer);
  }, [suggested_replies, toolName]);

  // Add useEffect to check for ad availability on component mount
  useEffect(() => {
    const checkAdAvailability = async () => {
      const { available } = await checkForSponsorAds();
      setIsAdAvailable(available);
    };

    checkAdAvailability();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading || isMessageTooLong) return;

    const userInputText = input.trim();
    setInput('');

    try {
      setIsLoading(true);

      if (isFirstVisit) {
        setIsFirstVisit(false);
      }

      if (!toolPrompt.trim()) {
        toast.error('This tool does not have a valid prompt configured.');
        return;
      }

      const userMessage: Message = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content: userInputText,
      };

      setMessages((prev) => [...prev, userMessage]);
      setPersistentUserMessageCount((prev) => prev + 1);

      const { available } = await checkForSponsorAds();
      setIsAdAvailable(available);

      const shouldShowAd =
        messages.length >= 1 && Math.random() < 0.7 && available;

      if (shouldShowAd && !isShowingAd) {
        setPendingUserInput(userInputText);
        setIsShowingAd(true);

        const adMessage: Message = {
          id: Date.now().toString() + '-ad',
          role: 'ad',
          content: '',
          isAdComplete: false,
        };

        setMessages((prev) => [...prev, adMessage]);
        return;
      }

      await processUserMessage(userInputText);
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      toast.error(
        'An error occurred while sending the message. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const processUserMessage = async (
    userInput: string,
    existingTypingId?: string
  ) => {
    setIsLoading(true);
    setIsBotTyping(true);
    setSuggestedReplies([]);

    trackChatEvent(toolId, 'message_sent');

    const assistantMessage: Message = {
      id: existingTypingId || Date.now().toString() + '-assistant',
      role: 'assistant',
      content: '',
      isTyping: true,
      displayContent: '',
    };

    if (!existingTypingId) {
      setMessages((prev) => [...prev, assistantMessage]);
      setLatestBotMessageId(assistantMessage.id);
    }

    try {
      const { aiService, AIServiceError } = await import('@/lib/ai-service');

      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-10)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      const response = await aiService.chat(userInput, {
        toolName,
        toolPrompt,
        conversationHistory,
        maxRetries: 2,
        timeout: 25000,
      });

      const responseContent = response.content;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: responseContent }
            : msg
        )
      );

      if (suggested_replies) {
        generateSuggestedReplies(responseContent);
      } else {
        setSuggestedReplies([]);
      }

      if (!existingTypingId) {
        animateTyping(assistantMessage.id, responseContent);
      } else {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, isTyping: false, displayContent: responseContent }
              : msg
          )
        );
        setIsBotTyping(false);
        if (suggested_replies) {
          setTimeout(() => {
            generateSuggestedReplies(responseContent);
          }, 500);
        }
      }
    } catch (error) {
      let userMessage =
        "Sorry, I'm having trouble responding right now. Please try again in a moment.";
      let duration = 4000;

      if (error instanceof (await import('@/lib/ai-service')).AIServiceError) {
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            userMessage =
              "I'm receiving too many requests right now. Please wait a moment and try again.";
            duration = 6000;
            break;
          case 'INPUT_TOO_LONG':
            userMessage =
              'Your message is too long. Please try with a shorter message.';
            break;
          case 'TIMEOUT':
            userMessage =
              'The request took too long. Please try again with a simpler question.';
            break;
          case 'MISSING_API_KEY':
            userMessage =
              'Service configuration error. Please contact support.';
            break;
          default:
            break;
        }
      }

      console.error('Error in chat process:', error);
      toast.error(userMessage, { duration });

      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessage.id)
      );

      setIsBotTyping(false);
      setIsShowingAd(false);
      setPendingMessage(null);
      setPendingUserInput('');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (e.key === 'Enter' && !e.shiftKey && !isMobileDevice) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const initialMessages: Message[] = [
      {
        id: '1',
        role: 'assistant' as const,
        content:
          initialMessage ||
          `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
      },
    ];
    setMessages(initialMessages);
    setHasNewMessage(false);
    setPendingMessage(null);
    setIsShowingAd(false);
    setPendingUserInput('');
    setIsFirstVisit(true);
    setIsResetDialogOpen(false);
    if (user) {
      setPersistentUserMessageCount(0);
    }
  };

  // Handle ad completion
  const handleAdComplete = async (adId: string) => {
    setIsShowingAd(false);

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === adId ? { ...msg, isAdComplete: true } : msg
      )
    );

    if (pendingUserInput) {
      setMessages((prev) => prev.filter((msg) => msg.id !== adId));
      await processUserMessage(pendingUserInput);
      setPendingUserInput('');
    }

    if (pendingMessage) {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== adId),
        pendingMessage,
      ]);
      setPendingMessage(null);
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset this conversation? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearChat}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-0 sm:p-4 relative bg-gradient-to-b from-gray-50/30 via-white/20 to-gray-50/30 dark:from-gray-900/30 dark:via-gray-950/20 dark:to-gray-900/30 pb-[240px] sm:pb-[160px]"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            if (message.role === 'ad') {
              return (
                <ChatSponsorAd
                  key={message.id}
                  messageCount={messages.length}
                  onAdComplete={() => handleAdComplete(message.id)}
                  isComplete={message.isAdComplete || false}
                />
              );
            }

            return (
              <MessageItem
                key={message.id}
                message={message}
                imageUrl={imageUrl}
                isLatestBotMessage={
                  message.role === 'assistant' &&
                  message.id === latestBotMessageId
                }
                botMessageRef={botMessageRef}
              />
            );
          })}

          {/* Render suggested replies as part of the messages flow */}
          {suggested_replies &&
            suggestedReplies.length > 0 &&
            !isBotTyping &&
            !isLoading &&
            !isShowingAd && (
              <motion.div
                ref={suggestedRepliesRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-start gap-3 justify-start px-4 sm:px-2 mb-4"
              >
                <div className="flex flex-shrink-0 w-8 h-8"></div>
                <div className="max-w-[90%] sm:max-w-[75%] md:max-w-[70%] space-y-3">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-1 font-medium">
                    Quick replies
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {suggestedReplies.slice(0, 3).map((reply, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                          duration: 0.25,
                          delay: index * 0.1,
                          ease: 'easeOut',
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-[18px] text-[14px] py-2.5 px-4 bg-white/80 dark:bg-gray-800/80 hover:bg-blue-50 dark:hover:bg-gray-700/80 transition-all duration-200 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-gray-500 whitespace-nowrap text-left justify-start h-auto min-h-[36px] w-full sm:w-auto shadow-sm hover:shadow-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-normal backdrop-blur-sm"
                          onClick={() => handleSuggestedReplyClick(reply)}
                          disabled={isLoading || isBotTyping}
                        >
                          {reply}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          {isShowingAd && pendingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 justify-start"
            >
              <div className="flex flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Bot"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to Bot icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('flex');
                      e.currentTarget.parentElement?.classList.remove('block');
                    }}
                  />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </div>
              <div className="max-w-[85%] relative">
                <div className="flex space-x-2 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-300"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 opacity-70">
                  Preparing your response...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {hasNewMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[160px] sm:bottom-[72px] flex justify-center">
          <div
            className="text-primary rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer animate-bounce inline-flex items-center backdrop-filter backdrop-blur-sm border border-primary/20"
            onClick={scrollToBottom}
          >
            New message ↓
          </div>
        </div>
      )}

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        isBotTyping={isBotTyping}
        isShowingAd={isShowingAd}
        isMessageTooLong={isMessageTooLong}
        maxMessageLength={MAX_MESSAGE_LENGTH}
        messagesLength={messages.length}
        onSendMessage={handleSendMessage}
        onResetChat={() => setIsResetDialogOpen(true)}
        onStopTyping={stopTypingAnimation}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default QuickToolChat;

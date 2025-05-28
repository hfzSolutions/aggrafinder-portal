import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Send,
  Loader2,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Bot,
  ExternalLink,
  LogIn,
  Lock,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useQuickToolUsage } from '@/hooks/useQuickToolUsage';
import Anthropic from '@anthropic-ai/sdk';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
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
  imageUrl?: string; // Add imageUrl prop
}

// New component for chat-specific sponsor ad display
const ChatSponsorAd = ({
  messageCount,
  onAdComplete,
  isComplete = false,
}: {
  messageCount: number;
  onAdComplete?: () => void;
  isComplete?: boolean;
}) => {
  const [sponsorAd, setSponsorAd] = useState<SponsorAd | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5); // 5 seconds timer
  const [isAdComplete, setIsAdComplete] = useState(isComplete);
  const { trackEvent } = useAnalytics();
  const adRef = useRef<HTMLDivElement>(null);

  // Timer effect
  useEffect(() => {
    if (isComplete) {
      setIsAdComplete(true);
      return;
    }

    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!isAdComplete) {
      setIsAdComplete(true);
      onAdComplete?.();
    }
  }, [timeLeft, isAdComplete, onAdComplete, isComplete]);

  // Scroll to ad when it appears
  useEffect(() => {
    if (adRef.current && sponsorAd) {
      adRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [sponsorAd]);

  useEffect(() => {
    // Only fetch ad when the component mounts
    const fetchActiveSponsorAd = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('sponsor_ads')
          .select('*')
          .lte('start_date', now)
          .gte('end_date', now)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching active sponsor ad:', error);
          }
          // Add dummy response for sponsor ad
          // const dummyAd = {
          //   id: '3dc4917c-3075-44c9-8cbf-2e40a2c1c14e',
          //   title: 'Premium AI Solution',
          //   description:
          //     'Boost your productivity with our cutting-edge Al tools.',
          //   image_url:
          //     'https://letsenhance.io/static/73136da51c245e80edc6ccfe44888a99/1015f/MainBefore.jpg',
          //   link: 'https://www.google.com',
          //   link_text: 'Learn More',
          //   start_date: '2025-04-28T05:55:18.986+00:00',
          //   end_date: '2025-05-27T16:00:00+00:00',
          //   is_active: true,
          //   created_at: '2025-04-28T05:57:57.976181+00:00',
          //   updated_at: '2025-05-25T21:18:18.643+00:00',
          // };

          // setSponsorAd(dummyAd);
          return;
        }

        if (data) {
          setSponsorAd(data);
        }
      } catch (error) {
        console.error('Error fetching sponsor ad:', error);
      }
    };

    fetchActiveSponsorAd();
  }, []);

  // If no sponsor ad is available, don't render anything
  if (!sponsorAd) {
    return null;
  }

  const handleAdClick = () => {
    window.open(sponsorAd.link, '_blank');
    trackEvent('sponsor_ad', 'click_url', {
      ad_id: sponsorAd.id,
      ad_title: sponsorAd.title,
      ad_link: sponsorAd.link,
      view_type: 'chat',
      click_type: 'card',
    });
  };

  return (
    <motion.div
      ref={adRef}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex items-start gap-2 justify-start my-6"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 bg-muted/50 shadow-sm border border-primary/10 hover:border-primary/20 transition-all duration-300 relative"
        onClick={handleAdClick}
        style={{ cursor: 'pointer' }}
      >
        {/* Timer overlay */}
        {!isAdComplete && (
          <div className="absolute top-2 right-2">
            <div className="relative h-8 w-8">
              <svg className="w-8 h-8" viewBox="0 0 36 36">
                <circle
                  className="stroke-secondary/50 fill-none"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeWidth="3"
                />
                <circle
                  className="stroke-primary fill-none transition-all duration-1000"
                  cx="18"
                  cy="18"
                  r="16"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 16}`}
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - timeLeft / 5)}`}
                  transform="rotate(-90 18 18)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                {timeLeft}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20">
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              </div>
            )}

            <img
              src={sponsorAd.image_url}
              alt="Sponsored"
              className={cn(
                'h-full w-full object-cover transition-opacity',
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              )}
              onLoad={() => setIsImageLoaded(true)}
            />

            <div className="absolute top-1 left-1">
              <Badge
                variant="secondary"
                className="flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs px-1.5 py-0.5"
              >
                <Sparkles className="h-2.5 w-2.5 text-primary" /> Ad
              </Badge>
            </div>
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-sm">{sponsorAd.title}</h3>
            </div>

            <p className="text-muted-foreground text-xs mb-2 line-clamp-2">
              {sponsorAd.description}
            </p>

            <div className="flex items-center justify-between mt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 px-2 text-xs rounded-full"
                disabled={!isAdComplete}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAdComplete) {
                    window.open(sponsorAd.link, '_blank');
                    trackEvent('sponsor_ad', 'click_url', {
                      ad_id: sponsorAd.id,
                      ad_title: sponsorAd.title,
                      ad_link: sponsorAd.link,
                      view_type: 'chat',
                      click_type: 'button',
                    });
                  }
                }}
              >
                {sponsorAd.link_text} <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {isAdComplete ? 'Sponsored' : `Ad ends in ${timeLeft}s`}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const QuickToolChat = ({
  toolId,
  toolName,
  toolPrompt,
  className,
  imageUrl, // Add imageUrl to destructuring
}: QuickToolChatProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load chat history from localStorage on component mount
  const loadChatHistory = () => {
    const savedHistory = localStorage.getItem(`chat-history-${toolId}`);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        return {
          messages: parsed.messages || [
            {
              id: '1',
              role: 'assistant',
              content: `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
            },
          ],
          userMessageCount: parsed.userMessageCount || 0,
        };
      } catch (error) {
        console.error('Error parsing chat history:', error);
      }
    }
    return {
      messages: [
        {
          id: '1',
          role: 'assistant',
          content: `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
        },
      ],
      userMessageCount: 0,
    };
  };

  const chatHistory = loadChatHistory();
  const [messages, setMessages] = useState<Message[]>(chatHistory.messages);
  const [persistentUserMessageCount, setPersistentUserMessageCount] = useState(
    chatHistory.userMessageCount
  );
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [isBotTyping, setIsBotTyping] = useState(false); // Track if bot is currently typing
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false); // State for reset confirmation dialog
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const { toast } = useToast();
  const { trackChatEvent } = useAIChatAnalytics();
  const { incrementUsageCount } = useQuickToolUsage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Reference to store typing timeout

  // Add state to control ad display
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [pendingUserInput, setPendingUserInput] = useState<string>('');

  // Function to animate typing effect for a message with realistic timing
  const animateTyping = (messageId: string, content: string) => {
    let index = 0;
    setIsBotTyping(true); // Set bot typing state to true

    // Always scroll to bottom immediately when bot starts responding
    scrollToBottom();

    const typeNextChunk = () => {
      if (index >= content.length) {
        // Typing complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
        setIsBotTyping(false); // Set bot typing state to false when complete
        return;
      }

      // Add characters in chunks for more natural typing
      const chunkSize = Math.floor(Math.random() * 3) + 1; // 1-3 characters at a time
      const nextChunk = content.substring(
        index,
        Math.min(index + chunkSize, content.length)
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? {
                ...msg,
                displayContent: (msg.displayContent || '') + nextChunk,
              }
            : msg
        )
      );

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
      typingTimeoutRef.current = setTimeout(typeNextChunk, delay);
    };

    // Start the typing animation immediately
    typeNextChunk();
  };

  // Function to stop the typing animation
  const stopTypingAnimation = () => {
    // Clear any pending typing timeouts
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    // Find the currently typing message and complete it immediately
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.isTyping) {
          return { ...msg, isTyping: false, displayContent: msg.content };
        }
        return msg;
      })
    );

    // Reset typing state
    setIsBotTyping(false);
    setIsLoading(false);
  };

  // Check scroll position and set new message indicator
  const checkScrollPosition = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    // If user is not near bottom, show new message indicator
    if (!isNearBottom) {
      setHasNewMessage(true);
    }
  };

  // Handle scroll event
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      100;

    if (isNearBottom) {
      setHasNewMessage(false);
    }
  };

  // Auto-scroll for bot responses and check for new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    // Auto-scroll for bot responses (assistant messages)
    if (lastMessage && lastMessage.role === 'assistant') {
      // Scroll immediately when bot message appears
      setTimeout(() => scrollToBottom(), 100);
    }

    // Check if we should show the new message indicator for user messages
    const shouldShowNewMessageIndicator = () => {
      if (!messagesEndRef.current || !messagesContainerRef.current) return;

      const container = messagesContainerRef.current;
      if (!container) return;

      // Check if user is not near the bottom
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      if (!isNearBottom && lastMessage && lastMessage.role === 'user') {
        setHasNewMessage(true);
      }
    };

    shouldShowNewMessageIndicator();
  }, [messages.length]); // Only trigger when message count changes, not content

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

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 1) {
      // Don't save if only initial message
      localStorage.setItem(
        `chat-history-${toolId}`,
        JSON.stringify({
          messages,
          userMessageCount: persistentUserMessageCount,
          timestamp: Date.now(),
        })
      );
    }
  }, [messages, persistentUserMessageCount, toolId]);

  // Track when chat is opened
  useEffect(() => {
    trackChatEvent(toolId, 'open');
    // Increment usage count when a conversation starts
    incrementUsageCount(toolId);
    // No auto-focus on input

    return () => {
      // Track when chat is closed with message count
      trackChatEvent(toolId, 'close', messages.length);
    };
  }, [toolId, trackChatEvent, incrementUsageCount, messages.length]);

  // Count user messages (excluding initial assistant message) - use persistent count to prevent reset cheating
  const getUserMessageCount = () => {
    return persistentUserMessageCount;
  };

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Save current page URL to return after login
    localStorage.setItem('returnUrl', location.pathname + location.search);
    navigate('/auth');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    // Check if user is authenticated and message limit
    const userMessageCount = getUserMessageCount();
    if (!user && userMessageCount >= 2) {
      // Direct redirect to auth page instead of showing dialog
      handleLoginRedirect();
      return;
    }

    // Set isFirstVisit to false when user sends their first message
    if (isFirstVisit) {
      setIsFirstVisit(false);
    }

    // Validate prompt first
    if (!toolPrompt.trim()) {
      toast({
        title: 'Error',
        description: 'This tool does not have a valid prompt configured.',
        variant: 'destructive',
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    // Increment persistent user message count
    setPersistentUserMessageCount((prev) => prev + 1);

    // Check if we should show an ad first (70% probability after first message)
    const shouldShowAd = messages.length >= 1 && Math.random() < 0.7;

    if (shouldShowAd && !isShowingAd) {
      // Store the user input to process after ad completes
      setPendingUserInput(input);
      setIsShowingAd(true);

      // Add ad message to the conversation
      const adMessage: Message = {
        id: Date.now().toString() + '-ad',
        role: 'ad',
        content: '',
        isAdComplete: false,
      };

      setMessages((prev) => [...prev, adMessage]);
      setInput('');
      return; // Don't process the API call yet
    }

    // Process the message normally if no ad should be shown
    await processUserMessage(input);
    setInput('');
  };

  const processUserMessage = async (userInput: string) => {
    setIsLoading(true);

    // Track when user sends a message for analytics
    trackChatEvent(toolId, 'message_sent');

    // Immediately add the assistant message with typing state
    const assistantMessage: Message = {
      id: Date.now().toString() + '-assistant',
      role: 'assistant',
      content: '',
      isTyping: true,
      displayContent: '',
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Immediately scroll to show the bot response appearing
    setTimeout(() => scrollToBottom(), 50);

    try {
      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Call Anthropic API directly
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 800,
        temperature: 0.7,
        system:
          toolPrompt +
          "\n\nIMPORTANT: Keep your responses helpful and engaging. Focus on providing valuable assistance based on the tool's purpose. You can ONLY generate text responses - do not attempt to generate images, audio, or video content. Always be direct and straight to the point. Avoid unnecessary explanations, introductions, or verbose language. Get to the answer immediately without wasting time.",
        messages: [
          ...messages
            .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
            .map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: [
                {
                  type: 'text',
                  text: msg.content,
                },
              ],
            })),
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userInput,
              },
            ],
          },
        ],
      });

      // Get the response content
      const responseContent = response.content[0].text;

      // Update the existing assistant message with the response content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: responseContent }
            : msg
        )
      );

      // Start the typing animation
      animateTyping(assistantMessage.id, responseContent);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
      // Remove the assistant message if there was an error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessage.id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    const initialMessages = [
      {
        id: '1',
        role: 'assistant',
        content: `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
      },
    ];
    setMessages(initialMessages);
    setHasNewMessage(false);
    setPendingMessage(null);
    setIsShowingAd(false);
    setPendingUserInput('');
    setIsFirstVisit(true); // Reset isFirstVisit when chat is cleared
    setIsResetDialogOpen(false); // Close the dialog after reset
    // Don't reset persistent user message count to prevent cheating
    // Only reset if user is authenticated
    if (user) {
      setPersistentUserMessageCount(0);
    }
    // Clear saved chat history
    localStorage.removeItem(`chat-history-${toolId}`);
  };

  // Handle ad completion
  const handleAdComplete = async (adId: string) => {
    setIsShowingAd(false);

    // Mark the ad as complete
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === adId ? { ...msg, isAdComplete: true } : msg
      )
    );

    // Process the pending user input after ad completes
    if (pendingUserInput) {
      // Remove the ad message immediately
      setMessages((prev) => prev.filter((msg) => msg.id !== adId));

      // Process the user input that was waiting immediately
      await processUserMessage(pendingUserInput);
      setPendingUserInput('');
    }

    // Handle legacy pending message (for backward compatibility)
    if (pendingMessage) {
      // Remove the ad message and add the pending message immediately
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== adId), // Remove the ad message
        pendingMessage,
      ]);
      setPendingMessage(null);
    }
  };

  const scrollToBottom = () => {
    // Use scrollIntoView with block: 'nearest' to prevent scrolling the entire page
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
    setHasNewMessage(false);
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

      {/* Removed Login Prompt Dialog - direct redirect to auth page instead */}

      {/* Messages Area - No card styling */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-transparent"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            // Render ad messages differently
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

            // Render regular messages
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  'flex items-start gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role !== 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="Bot"
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback to Bot icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('flex');
                          e.currentTarget.parentElement?.classList.remove(
                            'block'
                          );
                        }}
                      />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                )}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'max-w-[85%] rounded-2xl p-3.5 shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted/80 rounded-tl-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.role === 'user' ? (
                      message.content
                    ) : message.isTyping && !message.displayContent ? (
                      // Show typing dots for assistant messages that haven't started typing content yet
                      <div className="flex space-x-2 items-center h-5">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-300"></div>
                      </div>
                    ) : (
                      // Show content with typing cursor if still typing
                      <>
                        {message.displayContent || message.content}
                        {message.isTyping && message.displayContent && (
                          <span className="animate-pulse ml-0.5">▋</span>
                        )}
                      </>
                    )}
                  </p>
                </motion.div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground">
                    <span className="text-xs font-medium">You</span>
                  </div>
                )}
              </motion.div>
            );
          })}
          {isShowingAd && pendingMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2 justify-start"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
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
                  <Bot className="h-4 w-4 text-primary" />
                )}
              </div>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 bg-muted/80 shadow-sm">
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[72px] flex justify-center">
          <div
            className="text-primary rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer animate-bounce inline-flex items-center backdrop-filter backdrop-blur-sm border border-primary/20"
            onClick={scrollToBottom}
          >
            New message ↓
          </div>
        </div>
      )}

      {/* Input Area with Modern Card Styling */}
      <div className="p-4 border border-primary/60 rounded-2xl bg-background/95 shadow-md mx-4 mb-4 backdrop-blur-sm sticky bottom-10 z-10 hover:border-primary/40 transition-all duration-300 hover:shadow-lg">
        <div className="flex items-start gap-3 w-full">
          <div className="flex flex-col gap-2">
            {isBotTyping ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={stopTypingAnimation}
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
                onClick={() => setIsResetDialogOpen(true)} // Open confirmation dialog instead of direct reset
                disabled={messages.length <= 1}
                className="h-8 w-8 rounded-full flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all duration-300"
                title="Reset conversation"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <motion.div
            className="flex-1 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !user && getUserMessageCount() >= 2
                  ? 'Sign in to continue chatting...'
                  : `Ask ${toolName} anything...`
              }
              disabled={
                isLoading ||
                isBotTyping ||
                isShowingAd ||
                (!user && getUserMessageCount() >= 2)
              } // Disable input when bot is typing, ad is showing, or user reached limit
              className={cn(
                'w-full transition-all duration-300 focus-visible:ring-0 focus-visible:outline-none focus:border-transparent border-transparent rounded-xl pl-4 pr-14 py-2.5 min-h-[60px] resize-none bg-background/50 text-foreground placeholder:text-muted-foreground/70',
                (isLoading ||
                  isBotTyping ||
                  isShowingAd ||
                  (!user && getUserMessageCount() >= 2)) &&
                  'opacity-60' // Reduce opacity when disabled
              )}
            />
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="absolute right-3 bottom-2.5"
            >
              <Button
                size="icon"
                onClick={
                  !user && getUserMessageCount() >= 2
                    ? handleLoginRedirect
                    : handleSendMessage
                }
                disabled={!input.trim() || isLoading} // Always enabled when there's input, but changes behavior based on auth state
                className={cn(
                  'h-8 w-8 rounded-full transition-all duration-300 shadow-sm text-primary-foreground',
                  !user && getUserMessageCount() >= 2
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-primary hover:bg-primary/90'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : !user && getUserMessageCount() >= 2 ? (
                  <LogIn className="h-3.5 w-3.5" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <div className="flex items-center justify-center mt-2">
          {!user && getUserMessageCount() < 2 ? (
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground/80 px-2 py-0.5 rounded-full bg-muted/20 inline-flex items-center">
                AI may make mistakes. Please verify results.
              </p>
              {/* <div className="text-xs text-orange-600 dark:text-orange-400 px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/20 inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                <span>{2 - getUserMessageCount()} free messages left</span>
              </div> */}
            </div>
          ) : !user && getUserMessageCount() >= 2 ? (
            <button
              onClick={handleLoginRedirect}
              className="text-xs text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/20 inline-flex items-center gap-2 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors cursor-pointer"
            >
              <Lock className="h-3 w-3" />
              <span>Sign in to continue</span>
            </button>
          ) : (
            <p className="text-xs text-muted-foreground/80 px-2 py-0.5 rounded-full bg-muted/20 inline-flex items-center">
              AI may make mistakes. Please verify results.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickToolChat;

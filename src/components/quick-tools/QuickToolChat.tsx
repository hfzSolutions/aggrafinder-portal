import { useState, useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
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
  ArrowUp,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { containsMarkdown, processText } from '@/lib/markdown';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useQuickToolUsage } from '@/hooks/useQuickToolUsage';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
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
import { PWAInstallPrompt } from './PWAInstallPrompt';

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
  initialMessage?: string; // Add initialMessage prop
  suggested_replies?: boolean; // Add suggested_replies prop
}

export const QuickToolChat = ({
  toolId,
  toolName,
  toolPrompt,
  className,
  imageUrl, // Add imageUrl to destructuring
  initialMessage, // Add initialMessage to destructuring
  suggested_replies, // Add suggested_replies prop
}: QuickToolChatProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { trackEvent } = useAnalytics();

  // Move checkForSponsorAds function inside QuickToolChat
  const checkForSponsorAds = async () => {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('sponsor_ads')
        .select('*')
        .lte('start_date', now)
        .gte('end_date', now)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error checking sponsor ads:', error);
        }
        return { available: false, data: null };
      }

      return {
        available: data && data.length > 0,
        data: data && data.length > 0 ? data[0] : null,
      };
    } catch (error) {
      console.error('Error checking sponsor ads:', error);
      return { available: false, data: null };
    }
  };

  // Move ChatSponsorAd component inside QuickToolChat
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
    const [timeLeft, setTimeLeft] = useState(10); // 10 seconds timer
    const [isAdComplete, setIsAdComplete] = useState(isComplete);
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
          // Use the shared function to check for ads and get the data in one call
          const { available, data } = await checkForSponsorAds();

          if (!available || !data) {
            return;
          }

          // Set the sponsor ad directly from the returned data
          setSponsorAd(data);
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
        <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 items-center justify-center animate-pulse-glow">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="max-w-[95%] rounded-2xl rounded-tl-sm p-0.5 ml-1 shadow-md overflow-hidden relative animate-pulse-glow"
          onClick={handleAdClick}
          style={{ cursor: 'pointer' }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Moving gradient border */}
          <div className="absolute inset-0 animate-moving-gradient rounded-2xl rounded-tl-sm opacity-80"></div>

          {/* Shine effect overlay */}
          <div className="absolute inset-0 animate-shine rounded-2xl rounded-tl-sm z-10 opacity-40"></div>

          {/* Content container */}
          <div className="relative bg-background/95 dark:bg-background/95 rounded-2xl rounded-tl-sm px-5 py-3 z-20">
            <div className="flex items-center gap-3">
              <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 shadow-md">
                {!isImageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
                    <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                  </div>
                )}

                <img
                  src={sponsorAd.image_url}
                  alt="Sponsored"
                  className={cn(
                    'h-full w-full object-cover transition-all duration-500 transform group-hover:scale-105',
                    isImageLoaded ? 'opacity-100' : 'opacity-0'
                  )}
                  onLoad={() => setIsImageLoaded(true)}
                />

                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 bg-primary/20 text-primary border border-primary/30 text-xs px-2 py-0.5 font-medium shadow-sm"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-primary" /> Ad
                  </Badge>
                </div>
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-base text-foreground/90">
                    {sponsorAd.title}
                  </h3>
                </div>

                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {sponsorAd.description}
                </p>

                <div className="flex items-center justify-between mt-2">
                  <Button
                    size="sm"
                    variant={isAdComplete ? 'default' : 'outline'}
                    className={cn(
                      'h-8 px-3 text-xs rounded-full transition-all duration-300',
                      isAdComplete
                        ? 'bg-primary hover:bg-primary/90'
                        : 'opacity-70'
                    )}
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
                    {sponsorAd.link_text}{' '}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/50">
                    {isAdComplete ? 'Sponsored' : `Ad ends in ${timeLeft}s`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

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
              content:
                initialMessage ||
                `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
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
          content:
            initialMessage ||
            `👋 Hi! I'm ready to help you with ${toolName}. What would you like me to do?`,
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
  // Add state for message length limit
  const [isMessageTooLong, setIsMessageTooLong] = useState(false);
  const MAX_MESSAGE_LENGTH = 1000; // Set maximum character limit
  // Add state for expanded input
  const [isInputExpanded, setIsInputExpanded] = useState(false);
  const [shouldShowExpandButton, setShouldShowExpandButton] = useState(false);
  // Add state for suggested replies
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);

  const { trackChatEvent } = useAIChatAnalytics();
  const { incrementUsageCount } = useQuickToolUsage();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Reference to store typing timeout
  const botMessageRef = useRef<HTMLDivElement>(null); // New ref for bot messages
  const suggestedRepliesRef = useRef<HTMLDivElement>(null); // New ref for suggested replies

  // Add state to control ad display
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [pendingUserInput, setPendingUserInput] = useState<string>('');
  // Add state to track if ads are available
  const [isAdAvailable, setIsAdAvailable] = useState<boolean>(false);
  // Add state to track the latest bot message ID
  const [latestBotMessageId, setLatestBotMessageId] = useState<string | null>(
    null
  );

  // Function to generate suggested replies based on the latest bot message
  const generateSuggestedReplies = async (botMessage: string) => {
    if (!suggested_replies) return;

    try {
      // Prepare a simplified conversation history for context
      const recentMessages = messages.slice(-3).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call OpenRouter API to generate suggested replies
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL_NAME_2,
            messages: [
              {
                role: 'system',
                content: `You are generating exactly 3 short suggested replies for a user in a chat conversation about ${toolName}. The last message from the assistant was: "${botMessage}". 

Generate 3 short, natural follow-up questions or responses that the user might want to ask or say next. Each reply should be 2-8 words only, conversational, and directly relevant to the assistant's last message. 

You must respond with valid JSON in this exact format:
{
  "replies": ["Reply 1", "Reply 2", "Reply 3"]
}

Example:
{
  "replies": ["Tell me more", "What about alternatives?", "How do I start?"]
}`,
              },
              ...recentMessages,
            ],
            temperature: 0.3,
            max_tokens: 500,
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        console.error('Error generating suggested replies');
        return;
      }

      const data = await response.json();

      let replies: string[] = [];

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('No content in suggested replies response');
        return;
      }

      try {
        // Parse the JSON response directly
        const parsed = JSON.parse(content);

        if (parsed.replies && Array.isArray(parsed.replies)) {
          replies = parsed.replies
            .slice(0, 3)
            .filter(
              (reply) => typeof reply === 'string' && reply.trim().length > 0
            );
        } else {
          console.error(
            'Invalid response format, missing replies array:',
            parsed
          );
        }
      } catch (parseError) {
        console.error('JSON parsing failed:', parseError);
        // Since we're using response_format, this should rarely happen
        // But keep fallback for safety
        const quotedStrings = content.match(/"([^"]+)"/g);
        if (quotedStrings && quotedStrings.length > 0) {
          replies = quotedStrings
            .slice(0, 3)
            .map((str) => str.replace(/"/g, ''))
            .filter((reply) => reply.trim().length > 0);
        }
      }

      // Update state with the generated replies
      setSuggestedReplies(replies.length > 0 ? replies : []);

      // Scroll to show suggested replies after they are set
      if (replies.length > 0) {
        setTimeout(() => {
          if (suggestedRepliesRef.current) {
            suggestedRepliesRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });
          }
        }, 200);
      }
    } catch (error) {
      console.error('Error generating suggested replies:', error);
      setSuggestedReplies([]);
    }
  };

  // Function to handle textarea input and auto-resize
  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setIsMessageTooLong(newValue.length > MAX_MESSAGE_LENGTH);

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

  // Function to handle suggested reply click - auto send message
  const handleSuggestedReplyClick = async (reply: string) => {
    // Clear suggested replies immediately
    setSuggestedReplies([]);

    try {
      setIsLoading(true);

      // Auto-send the message without setting it in input
      const userMessage: Message = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content: reply,
      };

      setMessages((prev) => [...prev, userMessage]);
      setPersistentUserMessageCount((prev) => prev + 1);

      // Check for ads and process message
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
    setIsBotTyping(true); // Set bot typing state to true
    setLatestBotMessageId(messageId); // Set the latest bot message ID

    // Clear any existing suggested replies when bot starts typing
    setSuggestedReplies([]);

    // Scroll to bottom once at the beginning of typing
    scrollToBottom();

    // Track if we need to scroll on next meaningful content
    let lastScrollPosition = 0;
    let lastScrollTime = Date.now();
    let lastPunctuationIndex = -1;

    const typeNextChunk = () => {
      if (index >= content.length) {
        // Typing complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
        setIsBotTyping(false); // Set bot typing state to false when complete

        // Final scroll to ensure the complete message is visible
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const messageElement = document.getElementById(
              `message-${messageId}`
            );
            if (messageElement) {
              messageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              });
            }
          }
        }, 100);
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

      // Check if we've reached a meaningful point to scroll (end of sentence or paragraph)
      const isPunctuation = ['.', '!', '?', '\n'].some((p) =>
        nextChunk.includes(p)
      );

      // Only scroll at meaningful points (punctuation) and limit frequency
      const currentTime = Date.now();
      const timeSinceLastScroll = currentTime - lastScrollTime;

      if (
        isPunctuation &&
        timeSinceLastScroll > 500 &&
        lastPunctuationIndex !== index
      ) {
        lastPunctuationIndex = index;
        lastScrollTime = currentTime;

        // Use a timeout to allow the message to render before scrolling
        setTimeout(() => {
          if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const currentScrollPosition = container.scrollTop;

            // Only scroll if user hasn't manually scrolled away
            const userHasScrolled =
              Math.abs(currentScrollPosition - lastScrollPosition) > 50 &&
              lastScrollPosition !== 0;

            if (!userHasScrolled) {
              const messageElement = document.getElementById(
                `message-${messageId}`
              );
              if (messageElement) {
                messageElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });
              }
            }

            lastScrollPosition = container.scrollTop;
          }
        }, 50);
      }

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

  // Effect to scroll to the latest bot message when it appears or changes
  useEffect(() => {
    if (latestBotMessageId) {
      // Only scroll to message when typing is complete or at meaningful points
      const botMessageElement = document.getElementById(
        `message-${latestBotMessageId}`
      );
      if (botMessageElement && !isBotTyping) {
        // Use a small delay to ensure the DOM has updated
        setTimeout(() => {
          botMessageElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }, 100);
      }
    }
  }, [latestBotMessageId, messages, isBotTyping]);

  const scrollToBottom = () => {
    if (!messagesContainerRef.current) return;

    const container = messagesContainerRef.current;
    const inputArea = document.querySelector(
      '[data-input-area]'
    ) as HTMLElement;
    const inputHeight = inputArea ? inputArea.offsetHeight : 120; // Fallback height

    // Calculate the target scroll position to ensure content is visible above input
    const targetScrollTop =
      container.scrollHeight - container.clientHeight + inputHeight + 40;

    // Use smooth scrolling with a small delay to ensure DOM has updated
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

  // Effect to scroll to the latest bot message when it appears or changes
  useEffect(() => {
    if (latestBotMessageId) {
      const botMessageElement = document.getElementById(
        `message-${latestBotMessageId}`
      );
      if (botMessageElement) {
        botMessageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [latestBotMessageId, messages]);

  // Auto-scroll for all new messages and check for new messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

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

    // Store the input value and clear it immediately
    const userInputText = input.trim();
    setInput(''); // Clear input immediately

    // Reset textarea height to default
    if (inputRef.current) {
      inputRef.current.style.height = '40px';
    }

    // Auto-collapse the expanded text area after sending
    if (isInputExpanded) {
      setIsInputExpanded(false);
    }

    try {
      // Set loading state immediately to prevent multiple clicks
      setIsLoading(true);

      // Removed login check to allow unlimited messages without login

      // Set isFirstVisit to false when user sends their first message
      if (isFirstVisit) {
        setIsFirstVisit(false);
      }

      // Validate prompt first
      if (!toolPrompt.trim()) {
        toast.error('This tool does not have a valid prompt configured.');
        return;
      }

      // Add user message
      const userMessage: Message = {
        id: Date.now().toString() + '-user',
        role: 'user',
        content: userInputText,
      };

      setMessages((prev) => [...prev, userMessage]);

      // Increment persistent user message count
      setPersistentUserMessageCount((prev) => prev + 1);

      // Check for ads availability before deciding whether to show an ad
      const { available } = await checkForSponsorAds();
      setIsAdAvailable(available);

      // Check if we should show an ad first (70% probability after first message)
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

    // Clear suggested replies when processing new message
    setSuggestedReplies([]);

    // Track when user sends a message for analytics
    trackChatEvent(toolId, 'message_sent');

    // Use existing typing message or create new one
    const assistantMessage: Message = {
      id: existingTypingId || Date.now().toString() + '-assistant',
      role: 'assistant',
      content: '',
      isTyping: true,
      displayContent: '',
    };

    // Only add new message if we don't have existing typing message
    if (!existingTypingId) {
      setMessages((prev) => [...prev, assistantMessage]);
      setLatestBotMessageId(assistantMessage.id);
    }

    try {
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        // Log detailed error for developers
        console.error('OpenRouter API key is missing');
        throw new Error('Configuration error');
      }

      // Prepare optimized conversation history
      const optimizedMessages = prepareConversationHistory(messages, userInput);

      // Call OpenRouter API
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'DeepList AI',
          },
          body: JSON.stringify({
            model: import.meta.env.VITE_OPENROUTER_MODEL_NAME,
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant helping users with ${toolName}. Follow these guidelines to provide direct, specific answers:
            
                  1. Be concise – no introductions or unnecessary explanations
                  2. Focus only on what the user specifically asked for
                  3. If your answer includes a list or numbering (e.g. comparisons, pros/cons, features, steps), format it as a **table** instead of using bullets or numbers for better readability
                  4. Do **not** explain things in list format – use normal paragraphs or tables
                  5. Avoid unnecessary spacing or breaking lines
                  ⚠️ Exception: If the topic is **casual or conversational** in nature (e.g., fun ideas, informal tone, entertainment), you may skip the table and write in a simple paragraph format instead. Use your judgment to keep the tone aligned with the topic's formality.

                  ${toolPrompt}
            
                  IMPORTANT: 
                  - Answer directly what was asked, nothing more
                  - If unsure about a specific detail, say so rather than guessing
                  - Consider multiple approaches when relevant, then recommend the best one`,
              },
              ...optimizedMessages,
              {
                role: 'user',
                content: userInput,
              },
            ],
            temperature: 0.5,
            max_tokens: 2000,
            top_p: 0.9,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Log detailed error for developers
        console.error('OpenRouter API Error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });

        throw new Error('API request failed');
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        // Log detailed error for developers
        console.error('Empty or invalid response from OpenRouter:', data);
        throw new Error('Invalid response');
      }

      const responseContent = data.choices[0].message.content;

      // Update the existing assistant message with the response content
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: responseContent }
            : msg
        )
      );

      // Generate suggested replies if feature is enabled
      if (suggested_replies) {
        generateSuggestedReplies(responseContent);
      } else {
        setSuggestedReplies([]);
      }

      // Only start typing animation if we're not using an existing typing message
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
        // Generate suggested replies for existing message
        if (suggested_replies) {
          setTimeout(() => {
            generateSuggestedReplies(responseContent);
          }, 500);
        }
      }
    } catch (error) {
      // Log the detailed error for developers
      console.error('Error in chat process:', error);

      // Show a simple, user-friendly error message
      toast.error(
        "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        {
          duration: 4000,
        }
      );

      // Remove the assistant message if there was an error
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== assistantMessage.id)
      );

      // Reset all states
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
    // Check if the device is likely a mobile device
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    // On desktop: Enter sends message, Shift+Enter creates new line
    // On mobile: Enter creates new line, explicit send button click required
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

      // Auto-collapse the expanded text area after processing pending input
      if (isInputExpanded) {
        setIsInputExpanded(false);
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
        }
      }
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

  // Note: The scrollToBottom function has been moved and improved above

  // Constants for conversation management
  const MAX_CONTEXT_MESSAGES = 10; // Maximum number of messages to include in context
  const SUMMARY_REFRESH_COUNT = 5; // Number of new messages before refreshing summary

  // Add this function to prepare messages for the API request
  const prepareConversationHistory = (
    messages: Message[],
    newUserInput: string
  ) => {
    // Filter out ad messages and empty messages
    const validMessages = messages.filter(
      (msg) =>
        (msg.role === 'user' || msg.role === 'assistant') &&
        msg.content.trim() !== ''
    );

    // If we have fewer messages than our maximum, just return them all
    if (validMessages.length <= MAX_CONTEXT_MESSAGES) {
      return validMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));
    }

    // Otherwise, we need to create a summary and include only recent messages
    // Get the most recent messages up to our limit (minus 1 to leave room for the summary)
    const recentMessages = validMessages.slice(-(MAX_CONTEXT_MESSAGES - 1));

    // Create a summary message from older messages
    const olderMessages = validMessages.slice(
      0,
      validMessages.length - recentMessages.length
    );
    const summaryContent = `Previous conversation summary: ${olderMessages
      .map(
        (msg) =>
          `${
            msg.role === 'user' ? 'User' : 'Assistant'
          }: ${msg.content.substring(0, 100)}${
            msg.content.length > 100 ? '...' : ''
          }`
      )
      .join(' | ')}`;

    // Return the summary message followed by recent messages
    return [
      { role: 'system' as 'system', content: summaryContent },
      ...recentMessages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ];
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* PWA Install Prompt */}
      <PWAInstallPrompt
        toolName={toolName}
        toolImage={imageUrl}
        onDismiss={() => {
          // Optional: track dismissal for analytics
          trackEvent?.('pwa_install_prompt', 'dismissed', {
            tool_id: toolId,
            tool_name: toolName,
          });
        }}
      />

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

      {/* Messages Area - Add extra bottom padding when PWA prompt might be visible */}
      <div
        className="flex-1 overflow-y-auto p-0 sm:p-4 space-y-4 relative bg-transparent pb-[240px] sm:pb-[160px]"
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
                id={`message-${message.id}`} // Add ID for scrolling
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={cn(
                  'flex items-start gap-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
                ref={
                  message.role === 'assistant' &&
                  message.id === latestBotMessageId
                    ? botMessageRef
                    : undefined
                }
              >
                {message.role !== 'user' && (
                  <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
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
                    'max-w-[85%] rounded-2xl p-3.5 shadow-sm relative',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted/80 rounded-tl-sm'
                  )}
                >
                  <p className="text-base whitespace-pre-wrap leading-relaxed break-words">
                    {message.role === 'user' ? (
                      message.content
                    ) : !message.displayContent && message.isTyping ? (
                      // Only show typing dots if typing and no content has started showing
                      <div className="flex space-x-2 items-center h-5">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-300"></div>
                      </div>
                    ) : (
                      // Once content is showing, intelligently render it with markdown support if needed
                      <>
                        {containsMarkdown(
                          message.displayContent || message.content
                        ) ? (
                          <MarkdownRenderer
                            content={message.displayContent || message.content}
                            className="inline-block"
                          />
                        ) : (
                          processText(message.displayContent || message.content)
                        )}
                        {message.isTyping &&
                          (message.displayContent || message.content) && (
                            <span className="animate-pulse ml-0.5">▋</span>
                          )}
                      </>
                    )}
                  </p>
                </motion.div>
                {message.role === 'user' && (
                  <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-primary/80 items-center justify-center text-primary-foreground">
                    <span className="text-xs font-medium">You</span>
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Render suggested replies as part of the messages flow */}
          {suggested_replies &&
            suggestedReplies.length > 0 &&
            !isBotTyping &&
            !isLoading && (
              <motion.div
                ref={suggestedRepliesRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex items-start gap-2 justify-start"
              >
                {/* Empty space for avatar alignment - hidden on mobile, padding on desktop */}
                <div className="hidden sm:flex flex-shrink-0 w-8 h-8"></div>

                {/* Suggested replies container */}
                <div className="max-w-[85%] space-y-2">
                  <div className="text-xs text-muted-foreground mb-2 px-1">
                    Suggested replies:
                  </div>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                    {suggestedReplies.slice(0, 3).map((reply, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.2,
                          delay: index * 0.1,
                          ease: 'easeOut',
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full text-sm py-2 px-4 bg-muted/30 hover:bg-muted/60 transition-all duration-200 border-primary/20 hover:border-primary/40 whitespace-nowrap text-left justify-start h-auto min-h-[32px] w-full sm:w-auto"
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
              <div className="hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 items-center justify-center overflow-hidden">
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
        <div className="absolute left-1/2 -translate-x-1/2 bottom-[160px] sm:bottom-[72px] flex justify-center">
          <div
            className="text-primary rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer animate-bounce inline-flex items-center backdrop-filter backdrop-blur-sm border border-primary/20"
            onClick={scrollToBottom}
          >
            New message ↓
          </div>
        </div>
      )}

      {/* Input Area - Adjust z-index to be below PWA prompt */}
      <div
        data-input-area
        className="p-4 border border-primary/90 rounded-2xl bg-background/95 shadow-md mx-0 sm:mx-4 backdrop-blur-sm fixed bottom-7 left-2 right-2 sm:sticky sm:bottom-10 z-[45] hover:border-primary/40 transition-all duration-300 hover:shadow-lg"
      >
        <div className="flex items-center gap-3 w-full">
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
                onKeyDown={handleKeyDown}
                placeholder="Ask your question here..."
                disabled={isLoading || isBotTyping || isShowingAd} // Removed login check
                className={cn(
                  'w-full transition-all duration-300 focus-visible:ring-0 focus-visible:outline-none focus:border-transparent border-transparent rounded-xl pl-4 pr-4 py-2.5 min-h-[40px] resize-none bg-background/50 text-foreground placeholder:text-muted-foreground/70 text-base placeholder:text-base',
                  (isLoading || isBotTyping || isShowingAd) && 'opacity-60', // Removed login check
                  isMessageTooLong && 'border-red-500 focus:border-red-500'
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

            {/* Only show send button when user has started typing */}
            {input.trim().length > 0 && (
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  size="icon"
                  onClick={handleSendMessage} // Always use handleSendMessage
                  disabled={!input.trim() || isLoading || isMessageTooLong} // Disable when message is too long
                  className={cn(
                    'h-10 w-10 transition-all duration-300 shadow-sm text-primary-foreground flex items-center justify-center',
                    isMessageTooLong
                      ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90'
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
        <div className="flex items-center justify-center mt-2">
          {isMessageTooLong ? (
            <p className="text-xs text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/20 inline-flex items-center">
              Message too long ({input.length}/{MAX_MESSAGE_LENGTH} characters)
            </p>
          ) : (
            <p className="text-xs text-muted-foreground/30 px-2 py-0.5 rounded-full bg-muted/20 inline-flex items-center">
              AI may make mistakes. Please verify results.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickToolChat;

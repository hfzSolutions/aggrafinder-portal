import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Send,
  X,
  Bot,
  Loader2,
  Minimize2,
  Maximize2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AITool } from '@/types/tools';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Anthropic } from '@anthropic-ai/sdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isTyping?: boolean;
  displayContent?: string;
};

interface ToolChatModalProps {
  tool: AITool;
  isOpen: boolean;
  onClose: () => void;
}

const ToolChatModal = ({ tool, isOpen, onClose }: ToolChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([]);

  // Function to animate typing effect for a message
  const animateTyping = (messageId: string, content: string) => {
    let index = 0;

    const typeNextChunk = () => {
      if (index >= content.length) {
        // Typing complete
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, isTyping: false } : msg
          )
        );
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
            ? { ...msg, displayContent: (msg.displayContent || '') + nextChunk }
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
      setTimeout(typeNextChunk, delay);
    };

    // Start the typing animation
    typeNextChunk();
  };

  // Set up initial welcome message with typing animation when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `👋 Hi! I can tell you more about ${tool.name}. What would you like to know?`,
        isTyping: true,
        displayContent: '',
      };

      setMessages([welcomeMessage]);

      // Start typing animation for welcome message
      animateTyping(welcomeMessage.id, welcomeMessage.content);

      // Set default initial suggestions
      setSuggestions([
        `What can I do with ${tool.name}?`,
        `How much does ${tool.name} cost?`,
        `What are the main features of ${tool.name}?`,
        `How does ${tool.name} compare to alternatives?`,
      ]);
    }
  }, [isOpen, tool.name]);
  const [typingIndicator, setTypingIndicator] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Dynamic AI-generated suggestions based on conversation context
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Generate AI suggestions based on conversation context
  const generateSuggestions = useCallback(async () => {
    // Don't generate new suggestions if we're loading or have no messages yet
    if (isLoading || messages.length === 0) return;

    // Set loading state for suggestions
    setLoadingSuggestions(true);

    try {
      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Prepare the conversation history for context
      const conversationHistory = messages.map((msg) => msg.content).join('\n');

      // Call Anthropic API to generate contextual suggestions
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 150,
        temperature: 0.7,
        system: `You are an AI assistant helping users learn about ${tool.name}, an AI tool. Based on the conversation history, generate 3-4 follow-up questions the user might want to ask next. Make these questions diverse, natural, and relevant to the conversation context. Each question should be concise (under 10 words if possible). Return ONLY the questions as a JSON array of strings with no additional text.`,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Here's the conversation so far about ${tool.name}:\n${conversationHistory}\n\nGenerate 3-4 natural follow-up questions as JSON array.`,
              },
            ],
          },
        ],
      });

      // Parse the response to get the suggestions
      try {
        // Extract JSON array from the response
        const content = response.content[0].text.trim();
        const jsonMatch = content.match(/\[.*\]/s);

        if (jsonMatch) {
          const parsedSuggestions = JSON.parse(jsonMatch[0]);
          if (
            Array.isArray(parsedSuggestions) &&
            parsedSuggestions.length > 0
          ) {
            setSuggestions(parsedSuggestions.slice(0, 4)); // Limit to 4 suggestions
            return;
          }
        }

        // Fallback if parsing fails
        throw new Error('Failed to parse suggestions');
      } catch (parseError) {
        console.error('Error parsing suggestions:', parseError);
        // Fallback to default suggestions if parsing fails
        setSuggestions([
          `What can I do with ${tool.name}?`,
          `How much does ${tool.name} cost?`,
          `What are the main features of ${tool.name}?`,
          `How does ${tool.name} compare to alternatives?`,
        ]);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      // Fallback to default suggestions if API call fails
      setSuggestions([
        `What can I do with ${tool.name}?`,
        `How much does ${tool.name} cost?`,
        `What are the main features of ${tool.name}?`,
        `How does ${tool.name} compare to alternatives?`,
      ]);
    } finally {
      // Always reset loading state
      setLoadingSuggestions(false);
    }
  }, [messages, tool.name, isLoading]);

  // Generate initial suggestions when chat opens
  useEffect(() => {
    if (isOpen && messages.length > 0 && suggestions.length === 0) {
      generateSuggestions();
    }
  }, [isOpen, messages, suggestions.length, generateSuggestions]);

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { trackChatEvent } = useAIChatAnalytics();

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Focus the input field when the chat opens
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, isOpen]);

  // Track when chat is opened
  useEffect(() => {
    if (isOpen) {
      trackChatEvent(tool.id, 'open');
    }

    return () => {
      if (!isOpen) {
        // Track when chat is closed with message count
        trackChatEvent(tool.id, 'close', messages.length);
      }
    };
  }, [isOpen, tool.id, trackChatEvent, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    // Add user message with animation
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setTypingIndicator(true);

    // Track when user sends a message
    trackChatEvent(tool.id, 'message_sent');

    try {
      // Prepare context about the tool for the AI
      const toolContext = `Tool Name: ${tool.name}\nDescription: ${
        tool.description
      }\nCategories: ${tool.category.join(', ')}\nPricing: ${
        tool.pricing
      }\nWebsite URL: ${tool.url}`;

      // Create Anthropic client instance
      const anthropic = new Anthropic({
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        dangerouslyAllowBrowser: true,
      });

      // Call Anthropic API directly
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        temperature: 0.7,
        system: `You are an AI assistant helping users with information about AI tools. You are currently providing information about ${tool.name}. Here is information about the tool: ${toolContext}. Keep your responses concise and focused on this specific tool.`,
        messages: [
          ...messages.map((msg) => ({
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
                text: input,
              },
            ],
          },
        ],
      });

      // Create the assistant message with typing animation
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content[0].text,
        isTyping: true,
        displayContent: '',
      };

      // Hide typing indicator and add the message with empty content initially
      setTypingIndicator(false);
      setMessages((prev) => [...prev, assistantMessage]);

      // Start the typing animation using the reusable function
      animateTyping(assistantMessage.id, assistantMessage.content);

      // Generate new contextual suggestions after receiving response
      setTimeout(() => {
        generateSuggestions();
      }, 500); // Small delay to ensure typing animation has started
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setTypingIndicator(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle clicking on a suggestion chip
  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    setInput(suggestion);
    // Use setTimeout to ensure the input is updated before sending
    setTimeout(() => {
      handleSendMessage();
    }, 10);

    // Track suggestion usage
    trackChatEvent(tool.id, 'suggestion_used');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 transition-all duration-300 sm:max-h-[85vh] h-[85vh] rounded-xl shadow-lg border-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col h-full overflow-hidden"
        >
          <DialogHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur flex flex-row items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-base font-medium">
                  {tool.name}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">AI Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {tool.url && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-primary/10"
                        onClick={() => window.open(tool.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visit website</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-primary/10"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <ScrollArea
            className="flex-1 p-5 overflow-y-auto max-h-[calc(85vh-130px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`flex items-end gap-2 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role !== 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-primary" />
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
                        {message.role === 'user'
                          ? message.content
                          : message.displayContent || message.content}
                        {message.isTyping && (
                          <span className="animate-pulse ml-0.5">▋</span>
                        )}
                      </p>
                    </motion.div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {typingIndicator && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-end gap-2 justify-start"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm p-3.5 bg-muted/80 shadow-sm">
                      <div className="flex space-x-2 items-center h-5">
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {(suggestions.length > 0 || loadingSuggestions) && (
              <motion.div
                key={suggestions.join('-')} // Key changes when suggestions change, triggering animation
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mt-8 mb-2"
              >
                <AnimatePresence mode="wait">
                  {loadingSuggestions ? (
                    <motion.div
                      key="loading-suggestions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center w-full py-2"
                    >
                      <div className="flex space-x-2 items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse delay-150"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse delay-300"></div>
                        <span className="text-xs text-muted-foreground ml-2">
                          Thinking...
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    suggestions.map((suggestion, index) => (
                      <motion.div
                        key={`${suggestion}-${index}`}
                        initial={{ opacity: 0, scale: 0.9, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        transition={{
                          delay: 0.1 + index * 0.1,
                          duration: 0.3,
                        }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-3.5 py-1.5 rounded-full hover:bg-primary/10 transition-all duration-300 hover:shadow-sm border-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSuggestionClick(suggestion);
                          }}
                          disabled={isLoading}
                        >
                          {suggestion}
                        </Button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            <div className="pt-4 pb-2">
              <div className="flex items-center justify-center gap-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground/70" />
                <p className="text-center text-xs text-muted-foreground/70">
                  Responses are AI-generated and may not always be accurate
                </p>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-background/80 backdrop-blur-sm sticky bottom-0 z-10">
            <div className="flex items-center gap-2 w-full">
              <motion.div
                className="flex-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    e.stopPropagation();
                    setInput(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    handleKeyDown(e);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Ask about this tool..."
                  disabled={isLoading}
                  className="w-full transition-all duration-300 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-full pl-4 pr-3 py-5 border-primary/20"
                />
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendMessage();
                  }}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="h-10 w-10 rounded-full transition-all duration-300 shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolChatModal;

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AITool } from '@/types/tools';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Anthropic } from '@anthropic-ai/sdk';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ToolChatModalProps {
  tool: AITool;
  isOpen: boolean;
  onClose: () => void;
}

const ToolChatModal = ({ tool, isOpen, onClose }: ToolChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `👋 Hi! I can tell you more about ${tool.name}. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Add quick suggestion messages based on tool type
  const [suggestions] = useState<string[]>([
    `What can I do with ${tool.name}?`,
    `How much does ${tool.name} cost?`,
    `What are the main features of ${tool.name}?`,
    `How does ${tool.name} compare to alternatives?`,
  ]);
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

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

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

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content[0].text,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
      <DialogContent
        className={`sm:max-w-[500px] p-0 gap-0 transition-all duration-300 sm:max-h-[80vh]}`}
      >
        <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between">
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2 text-primary" />
            <DialogTitle className="text-base font-medium">
              Chat about {tool.name}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className={`transition-all duration-300 `}>
          <ScrollArea
            className="p-4 h-[350px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="pt-8">
              <p className="text-center text-xs text-muted-foreground italic">
                Responses are AI-generated and may not always be accurate.
                Please verify with the official source.
              </p>
            </div>

            {suggestions.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs px-3 py-1 rounded-full hover:bg-primary/10 transition"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    disabled={isLoading}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter className="p-4 border-t bg-background flex-col gap-3">
            {/* Input field and send button */}
            {/* Quick suggestion chips - now positioned above the input field */}

            <div className="flex items-center gap-2 w-full">
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
                className="flex-1"
              />
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSendMessage();
                }}
                disabled={!input.trim() || isLoading}
                size="sm"
                className="px-3"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ToolChatModal;

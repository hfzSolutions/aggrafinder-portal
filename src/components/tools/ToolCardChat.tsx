import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AITool } from '@/types/tools';
import { useAIChatAnalytics } from '@/hooks/useAIChatAnalytics';
import { getSiteUrl } from '@/utils/siteUrl';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

interface ToolCardChatProps {
  tool: AITool;
  onClose: () => void;
}

export const ToolCardChat = ({ tool, onClose }: ToolCardChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: `Hi! I'm ready to help you with ${tool.name}. What would you like me to do?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // API key is stored in environment variable
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
  const { trackChatEvent } = useAIChatAnalytics();

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    // Focus the input field when the chat opens
    inputRef.current?.focus();
  }, [messages]);

  // Track when chat is opened
  useEffect(() => {
    trackChatEvent(tool.id, 'open');

    return () => {
      // Track when chat is closed with message count
      trackChatEvent(tool.id, 'close', messages.length);
    };
  }, [tool.id, trackChatEvent, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    } as Message;
    const userInput = input.trim();
    setInput('');
    setMessages([...messages, userMessage]);

    setIsLoading(true);
    trackChatEvent(tool.id, 'message_sent');

    try {
      // Import AI service dynamically
      const { aiService, AIServiceError } = await import('@/lib/ai-service');

      // Prepare context about the tool for the AI
      const toolContext = `Tool Name: ${tool.name}\nDescription: ${
        tool.description
      }\nCategories: ${tool.category.join(', ')}\nPricing: ${tool.pricing}`;

      // Prepare conversation history
      const conversationHistory = messages
        .filter((msg) => msg.role === 'user' || msg.role === 'assistant')
        .filter((msg) => msg.content.trim() !== '')
        .slice(-5) // Keep last 5 messages for context (smaller for this simpler interface)
        .map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

      // Create tool-specific prompt
      const toolPrompt = `You are an AI assistant helping users with information about AI tools. You are currently providing information about ${tool.name}. Here is information about the tool: ${toolContext}. Keep your responses concise and focused on this specific tool.`;

      // Call the professional AI service
      const response = await aiService.chat(userInput, {
        toolName: tool.name,
        toolPrompt,
        conversationHistory,
        maxRetries: 2,
        timeout: 20000,
      });

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      // Handle specific AI service errors
      let userMessage =
        "Sorry, I'm having trouble responding right now. Please try again in a moment.";

      if (error instanceof (await import('@/lib/ai-service')).AIServiceError) {
        switch (error.code) {
          case 'RATE_LIMIT_EXCEEDED':
            userMessage =
              "I'm receiving too many requests right now. Please wait a moment and try again.";
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
            // Use default message
            break;
        }
      }

      console.error('Error sending message:', error);
      toast.error(userMessage);
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

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg shadow-lg overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center">
          <MessageSquare className="h-4 w-4 mr-2 text-primary" />
          <span className="text-sm font-medium">Chat about {tool.name}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-2 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this tool..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolCardChat;

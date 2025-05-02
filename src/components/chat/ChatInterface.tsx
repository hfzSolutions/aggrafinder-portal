import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import ChatMessage from './ChatMessage';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatModel = {
  id: string;
  name: string;
  description?: string;
};

// Using a single model since we're using the environment variable API key
const DEFAULT_MODEL: ChatModel = {
  id: 'qwen/qwen3-0.6b-04-28:free',
  name: 'Qwen: Qwen3 0.6B (free)',
  description: 'Fast and efficient AI assistant',
};

interface ChatInterfaceProps {
  selectedChatId?: string;
}

const ChatInterface = ({ selectedChatId }: ChatInterfaceProps = {}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "👋 Hi there! I'm your AI assistant for DeepListAI. I can help you find the right AI tools for your needs, answer questions about AI technology, or discuss how different AI tools compare. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingId, setCurrentTypingId] = useState<string | null>(null);
  // Using the default model since we're not allowing model selection
  const selectedModel = DEFAULT_MODEL;
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // API key is now stored in environment variable
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';

  useEffect(() => {
    // Scroll to bottom when messages change or typing status changes
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle chat selection or creation
  useEffect(() => {
    // In a real implementation, you would fetch the chat history for the selected chat
    if (selectedChatId) {
      // This would be replaced with actual chat history loading
      console.log(`Loading chat with ID: ${selectedChatId}`);
      // For demo purposes, we're not changing the messages
      // We would load chat history here instead of resetting
    } else {
      // Only initialize with welcome message if messages array is empty
      // This prevents the welcome message from appearing repeatedly
      if (messages.length === 0) {
        setMessages([
          {
            id: '1',
            role: 'assistant',
            content:
              "👋 Hi there! I'm your AI assistant for DeepListAI. I can help you find the right AI tools for your needs, answer questions about AI technology, or discuss how different AI tools compare. How can I assist you today?",
          },
        ]);
      }
      setInput('');
    }
  }, [selectedChatId, messages.length]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      toast({
        title: 'API Key Missing',
        description:
          'The OpenRouter API key is not configured in the environment variables',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'DeepListAI Chat',
          },
          body: JSON.stringify({
            model: DEFAULT_MODEL.id,
            messages: [
              {
                role: 'system',
                content:
                  "You are an AI assistant for DeepListAI, a platform that helps users find and compare AI tools. You're knowledgeable about various AI tools, their features, use cases, and limitations. Provide helpful, accurate information about AI tools and technologies. If asked about specific tools, you can suggest similar alternatives or compare different options. Always be polite, helpful, and provide concise answers.",
              },
              ...messages
                .filter((msg) => msg.role !== 'system')
                .map((msg) => ({
                  role: msg.role,
                  content: msg.content,
                })),
              // Don't add the user message again as we've already added it to the messages state
              // This prevents duplicate messages in the conversation history
            ],
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response');
      }

      const assistantMessageId = Date.now().toString() + '-assistant';
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      // Add the message and start typing animation
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(true);
      setCurrentTypingId(assistantMessageId);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to communicate with AI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      // The typing animation will end naturally when the text is fully displayed
      // We don't need to manually end it with a timeout
    }
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-4 sm:px-6 md:px-8">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isTyping={isTyping && message.id === currentTypingId}
            onTypingComplete={() => {
              if (message.id === currentTypingId) {
                setIsTyping(false);
                setCurrentTypingId(null);
              }
            }}
          />
        ))}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-4 left-1/2 sm:left-[calc(50%+80px)] md:left-[calc(50%+160px)] transform -translate-x-1/2 max-w-3xl w-[95%] sm:w-[90%] md:w-[85%] shadow-lg rounded-full border bg-background z-10 transition-all duration-200 hover:shadow-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2 px-4 py-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            className="rounded-full hover:bg-primary/10"
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Send className="h-5 w-5 text-primary" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

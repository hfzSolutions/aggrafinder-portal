
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import { trackEvent } from '@/utils/analytics';
import ModelSelector from './ModelSelector';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatModel = {
  id: string;
  name: string;
};

const AVAILABLE_MODELS: ChatModel[] = [
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-sonnet', name: 'Claude 3 Sonnet' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku (Faster)' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
  { id: 'openai/gpt-4o', name: 'GPT-4o' },
  { id: 'mistralai/mistral-large', name: 'Mistral Large' },
  { id: 'google/gemini-1.0-pro', name: 'Gemini Pro' },
];

const ChatInterface = () => {
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
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<ChatModel>(AVAILABLE_MODELS[2]); // Default to Claude 3 Haiku
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Check for saved API key
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your OpenRouter API key in the settings',
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

    trackEvent('chat', 'send_message', selectedModel.id);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.href,
          'X-Title': 'DeepListAI Chat',
        },
        body: JSON.stringify({
          model: selectedModel.id,
          messages: [
            {
              role: 'system',
              content: "You are an AI assistant for DeepListAI, a platform that helps users find and compare AI tools. You're knowledgeable about various AI tools, their features, use cases, and limitations. Provide helpful, accurate information about AI tools and technologies. If asked about specific tools, you can suggest similar alternatives or compare different options. Always be polite, helpful, and provide concise answers.",
            },
            ...messages
              .filter((msg) => msg.role !== 'system')
              .map((msg) => ({
                role: msg.role,
                content: msg.content,
              })),
            { role: 'user', content: input.trim() },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response');
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to communicate with AI',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (key: string) => {
    setApiKey(key);
    localStorage.setItem('openrouter_api_key', key);
    toast({
      title: 'API Key Saved',
      description: 'Your OpenRouter API key has been saved',
    });
  };

  return (
    <div className="flex flex-col h-[70vh] bg-background border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <h2 className="font-semibold">AI Chat Assistant</h2>
        <ModelSelector
          models={AVAILABLE_MODELS}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

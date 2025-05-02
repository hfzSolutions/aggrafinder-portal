
import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Loader2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ChatMessage from './ChatMessage';
import { trackEvent } from '@/utils/analytics';
import ModelSelector from './ModelSelector';
import { v4 as uuidv4 } from 'uuid';
import { ChatSession } from './ChatHistory';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type ChatModel = {
  id: string;
  name: string;
};

type ChatInterfaceProps = {
  selectedChatId: string | null;
  onNewChat: () => void;
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

const SYSTEM_PROMPT = "You are an AI assistant for DeepListAI, a platform that helps users find and compare AI tools. You're knowledgeable about various AI tools, their features, use cases, and limitations. Provide helpful, accurate information about AI tools and technologies. If asked about specific tools, you can suggest similar alternatives or compare different options. Always be polite, helpful, and provide concise answers.";

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: '1',
  role: 'assistant',
  content: "👋 Hi there! I'm your AI assistant for DeepListAI. I can help you find the right AI tools for your needs, answer questions about AI technology, or discuss how different AI tools compare. How can I assist you today?",
};

const ChatInterface = ({ selectedChatId, onNewChat }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState<ChatModel>(AVAILABLE_MODELS[2]); // Default to Claude 3 Haiku
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load API key and chat sessions on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    
    const savedSessions = localStorage.getItem('chat_sessions');
    if (savedSessions) {
      setChatSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Focus input field when page loads or chat changes
  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedChatId]);

  // Handle changes to selected chat
  useEffect(() => {
    if (selectedChatId === null) {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
      setCurrentChatId(null);
      return;
    }
    
    const savedChatData = localStorage.getItem(`chat_${selectedChatId}`);
    if (savedChatData) {
      setMessages(JSON.parse(savedChatData));
      setCurrentChatId(selectedChatId);
    }
  }, [selectedChatId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save current chat when messages change
  useEffect(() => {
    if (currentChatId && messages.length > 1) {
      localStorage.setItem(`chat_${currentChatId}`, JSON.stringify(messages));
    }
  }, [messages, currentChatId]);

  const generateChatTitle = (userMessage: string): string => {
    // Create a title based on the first user message
    const maxLength = 30;
    return userMessage.length > maxLength 
      ? userMessage.substring(0, maxLength) + '...'
      : userMessage;
  };

  const saveNewChat = (userMessage: string) => {
    const newChatId = uuidv4();
    const newChat: ChatSession = {
      id: newChatId,
      title: generateChatTitle(userMessage),
      lastMessage: userMessage,
      timestamp: new Date().toISOString(),
    };

    // Update sessions list
    const updatedSessions = [newChat, ...chatSessions];
    setChatSessions(updatedSessions);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
    
    // Set current chat ID
    setCurrentChatId(newChatId);
    
    // Return the new chat ID
    return newChatId;
  };

  const updateChatSession = (chatId: string, lastUserMessage: string) => {
    const updatedSessions = chatSessions.map(session => {
      if (session.id === chatId) {
        return {
          ...session,
          lastMessage: lastUserMessage,
          timestamp: new Date().toISOString()
        };
      }
      return session;
    });
    
    // Sort by most recent first
    updatedSessions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setChatSessions(updatedSessions);
    localStorage.setItem('chat_sessions', JSON.stringify(updatedSessions));
  };

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

    // Determine chat ID
    let chatId = currentChatId;
    if (!chatId) {
      chatId = saveNewChat(input.trim());
    } else {
      updateChatSession(chatId, input.trim());
    }

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
            { role: 'system', content: SYSTEM_PROMPT },
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
      
      // Save updated chat
      localStorage.setItem(`chat_${chatId}`, JSON.stringify([...messages, userMessage, assistantMessage]));
      
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

  const handleStartNewChat = () => {
    onNewChat();
    setMessages([DEFAULT_WELCOME_MESSAGE]);
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {messages.length <= 1 && (
          <div className="flex justify-center items-center py-8">
            <Button
              variant="outline"
              size="lg"
              onClick={handleStartNewChat}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              New Chat
            </Button>
          </div>
        )}
        
        <div className="divide-y divide-border">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t bg-background sticky bottom-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <ModelSelector
            models={AVAILABLE_MODELS}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <Input
              ref={inputRef}
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
    </div>
  );
};

export default ChatInterface;

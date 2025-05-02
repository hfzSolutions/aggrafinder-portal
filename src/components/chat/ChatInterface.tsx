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

  // Handle chat selection or creation
  useEffect(() => {
    // In a real implementation, you would fetch the chat history for the selected chat
    if (selectedChatId) {
      // Simulated chat history loading for demo purposes
      console.log(`Loading chat with ID: ${selectedChatId}`);

      // Find the chat in our simulated history (in a real app, this would be an API call)
      const chatHistory = [
        {
          id: '1',
          messages: [
            {
              id: '1-1',
              role: 'assistant',
              content:
                "👋 Hi there! I'm your AI assistant for DeepListAI. How can I help you today?",
            },
            {
              id: '1-2',
              role: 'user',
              content: 'Can you recommend some AI tools for content creation?',
            },
            {
              id: '1-3',
              role: 'assistant',
              content:
                "Absolutely! Here are some top AI tools for content creation:\n\n1. **Jasper** - Comprehensive AI writing assistant for blog posts, social media, and marketing copy\n2. **Copy.ai** - Creates various types of marketing copy and content\n3. **Writesonic** - Generates articles, landing pages, and ads\n4. **Midjourney** - Creates stunning AI-generated images from text descriptions\n5. **DALL-E** - OpenAI's image generation model for unique visuals\n6. **Descript** - AI-powered audio and video editing with text-based editing\n7. **Synthesia** - Creates AI videos with virtual presenters\n\nWould you like more specific recommendations based on your particular content needs?",
            },
          ],
        },
        {
          id: '2',
          messages: [
            {
              id: '2-1',
              role: 'assistant',
              content:
                "👋 Hi there! I'm your AI assistant for DeepListAI. How can I help you today?",
            },
            {
              id: '2-2',
              role: 'user',
              content:
                'What are the best machine learning models for image recognition?',
            },
            {
              id: '2-3',
              role: 'assistant',
              content:
                "Here are some of the best machine learning models for image recognition:\n\n1. **Convolutional Neural Networks (CNNs)**\n   - ResNet (Residual Networks)\n   - EfficientNet\n   - VGG-16 and VGG-19\n   - Inception/GoogLeNet\n   - DenseNet\n\n2. **Vision Transformers (ViT)**\n   - Google's Vision Transformer\n   - DeiT (Data-efficient image Transformers)\n   - Swin Transformer\n\n3. **Object Detection Models**\n   - YOLO (You Only Look Once)\n   - SSD (Single Shot MultiBox Detector)\n   - Faster R-CNN\n   - RetinaNet\n\n4. **Pre-trained Models**\n   - ImageNet models\n   - CLIP (Contrastive Language-Image Pre-Training)\n\nDo you need more specific information about any of these models?",
            },
          ],
        },
        {
          id: '3',
          messages: [
            {
              id: '3-1',
              role: 'assistant',
              content:
                "👋 Hi there! I'm your AI assistant for DeepListAI. How can I help you today?",
            },
            {
              id: '3-2',
              role: 'user',
              content: 'How does GPT-4 compare to Claude for text generation?',
            },
            {
              id: '3-3',
              role: 'assistant',
              content:
                "Here's a comparison between GPT-4 and Claude for text generation:\n\n**GPT-4 (OpenAI)**\n- Generally considered more capable for complex reasoning tasks\n- Stronger at coding and mathematical problems\n- Better at following precise instructions\n- More expensive to use\n- Has a knowledge cutoff date\n- Available through ChatGPT Plus and API\n\n**Claude (Anthropic)**\n- Often better at longer conversations with more context\n- Excellent at maintaining a consistent tone\n- Strong focus on harmlessness and helpfulness\n- Generally less expensive than GPT-4\n- More transparent about limitations\n- Available through Claude.ai and API partners\n\nBoth models are excellent for general text generation, but they have different strengths. GPT-4 might be better for technical content, while Claude often excels at nuanced writing with a consistent voice.\n\nIs there a specific aspect of text generation you're most interested in comparing?",
            },
          ],
        },
        {
          id: '4',
          messages: [
            {
              id: '4-1',
              role: 'assistant',
              content:
                "👋 Hi there! I'm your AI assistant for DeepListAI. How can I help you today?",
            },
            {
              id: '4-2',
              role: 'user',
              content:
                'What are the best AI tools for generating realistic images?',
            },
            {
              id: '4-3',
              role: 'assistant',
              content:
                "Here are the best AI tools for generating realistic images:\n\n1. **Midjourney** - Known for artistic, highly realistic images with excellent composition\n\n2. **DALL-E 3** - OpenAI's latest image generator with improved realism and prompt following\n\n3. **Stable Diffusion** - Open-source model with various fine-tuned versions like SDXL\n\n4. **Adobe Firefly** - Specialized in commercial-safe content generation integrated with Adobe products\n\n5. **Runway Gen-2** - Excellent for video and image generation with strong artistic control\n\n6. **Leonardo.ai** - Popular for gaming and concept art with specialized models\n\n7. **Bing Image Creator** - Microsoft's implementation of DALL-E, free with limitations\n\nEach tool has different strengths - Midjourney for artistic quality, DALL-E 3 for following detailed prompts, Stable Diffusion for customization, and Firefly for commercial usage.\n\nWould you like more specific information about any of these tools?",
            },
          ],
        },
        {
          id: '5',
          messages: [
            {
              id: '5-1',
              role: 'assistant',
              content:
                "👋 Hi there! I'm your AI assistant for DeepListAI. How can I help you today?",
            },
            {
              id: '5-2',
              role: 'user',
              content:
                'Can you share some advanced prompt engineering techniques?',
            },
            {
              id: '5-3',
              role: 'assistant',
              content: `Here are some advanced prompt engineering techniques:\n\n1. **Chain-of-Thought Prompting**\n   - Ask the AI to "think step by step" to solve complex problems\n   - Example: "Think step by step about how to solve this math problem..."\n\n2. **Few-Shot Learning**\n   - Provide 2-3 examples of desired input/output pairs before your actual request\n   - Example: "Q: What's the capital of France? A: Paris. Q: What's the capital of Japan? A: Tokyo. Q: What's the capital of Brazil? A:"\n\n3. **Role Prompting**\n   - Assign a specific role or expertise to the AI\n   - Example: "As an expert physicist, explain quantum entanglement..."\n\n4. **Persona-Based Prompting**\n   - Define a detailed character with specific traits\n   - Example: "You are a senior software engineer with 15 years of experience in Python..."\n\n5. **Format Specification**\n   - Explicitly define the output format you want\n   - Example: "Provide your answer as a bulleted list with 3 points"\n\n6. **Self-Consistency Techniques**\n   - Ask the AI to generate multiple solutions and then find consensus\n   - Example: "Generate 3 different approaches to this problem, then determine which is best"\n\n7. **Reflection Prompting**\n   - Ask the AI to evaluate its own response\n   - Example: "Now review your answer and identify any potential flaws"\n\n8. **Context Stuffing**\n   - Provide comprehensive background information before asking your question\n   - Useful for specialized knowledge domains\n\nWould you like me to elaborate on any of these techniques?`,
            },
          ],
        },
      ];

      const selectedChat = chatHistory.find(
        (chat) => chat.id === selectedChatId
      );
      if (selectedChat) {
        setMessages(selectedChat.messages);
      }
    } else {
      // Start a new chat with welcome message
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content:
            "👋 Hi there! I'm your AI assistant for DeepListAI. I can help you find the right AI tools for your needs, answer questions about AI technology, or discuss how different AI tools compare. How can I assist you today?",
        },
      ]);
      setInput('');
    }
  }, [selectedChatId]);

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

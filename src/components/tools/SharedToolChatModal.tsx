import { useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, X, Bot, Loader2, Info, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSharedChat } from '@/contexts/SharedChatContext';
import { Badge } from '@/components/ui/badge';
import { ComparisonToolCards } from '@/components/tools/ComparisonToolCards';

const SharedToolChatModal = () => {
  const {
    messages,
    isOpen,
    isLoading,
    typingIndicator,
    currentTool,
    comparisonTools,
    input,
    suggestions,
    loadingSuggestions,
    setInput,
    closeChat,
    sendMessage,
    handleSuggestionClick,
  } = useSharedChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentTool) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 transition-all duration-300 sm:max-h-[85vh] h-[85vh] rounded-xl shadow-lg border-0 overflow-hidden">
        <DialogHeader className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur flex flex-row items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-full">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-medium">
                {/* {messages.some((msg) =>
                    msg.id?.includes('welcome-comparison')
                  )
                    ? 'Tool Comparison'
                    : currentTool.name} */}
                AI Assistant
              </DialogTitle>
              <p className="text-xs text-muted-foreground">
                {/* {messages.some((msg) =>
                    msg.id?.includes('welcome-comparison')
                  )
                    ? 'Comparing multiple tools'
                    : 'AI Assistant'} */}
                Ask me anything
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {currentTool.url && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-primary/10"
                      onClick={() => window.open(currentTool.url, '_blank')}
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
                    {/* Show tool badge if message is from a different tool than current */}
                    {/* {message.toolId &&
                        message.toolId !== currentTool.id &&
                        message.toolName && (
                          <Badge
                            variant="outline"
                            className="mb-2 text-xs bg-primary/10 border-primary/20"
                          >
                            {message.toolName}
                          </Badge>
                        )} */}

                    {/* Display comparison tool cards if in comparison mode */}
                    {message.id?.includes('welcome-comparison') &&
                    ((message.comparisonToolCards &&
                      message.comparisonToolCards.length > 1) ||
                      (comparisonTools && comparisonTools.length > 1)) ? (
                      <ComparisonToolCards
                        tools={message.comparisonToolCards || comparisonTools}
                      />
                    ) : (
                      message.toolCard && (
                        <div className="mb-3 p-3 rounded-lg bg-background/80 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 group">
                          <div className="flex items-center gap-3">
                            {message.toolCard.imageUrl ? (
                              <img
                                src={message.toolCard.imageUrl}
                                alt={message.toolCard.name}
                                className="w-14 h-14 rounded-md object-cover shadow-sm"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    'none';
                                }}
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center shadow-sm">
                                <span className="text-sm font-medium text-primary">
                                  {message.toolCard.name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm truncate">
                                  {message.toolCard.name}
                                </h4>
                                {message.toolCard.url && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(
                                        message.toolCard?.url,
                                        '_blank'
                                      );
                                    }}
                                  >
                                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.toolCard.tagline}
                              </p>
                              <div className="flex items-center gap-1 mt-1.5">
                                {/* <Badge
                                  variant="outline"
                                  className="text-[10px] px-1.5 py-0 bg-primary/5"
                                >
                                  {message.toolCard.pricing}
                                </Badge>
                                {message.toolCard.category &&
                                  message.toolCard.category[0] && (
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] px-1.5 py-0 bg-primary/5"
                                    >
                                      {message.toolCard.category[0]}
                                    </Badge>
                                  )} */}
                              </div>
                            </div>
                          </div>
                          {/* {message.toolCard.description && (
                            <div className="mt-2 pt-2 border-t border-border/30 text-xs text-muted-foreground line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                              {message.toolCard.description}
                            </div>
                          )} */}
                        </div>
                      )
                    )}

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
                  sendMessage();
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
      </DialogContent>
    </Dialog>
  );
};

export default SharedToolChatModal;

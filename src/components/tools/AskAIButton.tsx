import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSharedChat } from '@/contexts/SharedChatContext';
import { AITool } from '@/types/tools';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';

interface AskAIButtonProps {
  isActive?: boolean;
  onClick?: (e: React.MouseEvent) => void; // Optional now as we'll use context
  className?: string;
  buttonText?: string;
  tool: AITool; // Add tool prop to identify which tool to chat about
}

export const AskAIButton = ({
  isActive = false,
  onClick,
  className,
  buttonText = 'Ask AI',
  tool,
}: AskAIButtonProps) => {
  const { openChat } = useSharedChat();
  const { trackEvent } = useToolAnalytics();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    } else {
      openChat(tool);
      trackEvent(tool.id, 'chat_open');
    }
  };
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={handleClick}
      className={cn(
        'group transition-all duration-200',
        isActive && 'bg-primary text-primary-foreground',
        className
      )}
    >
      <MessageSquare
        className={cn(
          buttonText ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4',
          isActive ? 'text-primary-foreground' : 'text-primary'
        )}
      />
      {buttonText}
    </Button>
  );
};

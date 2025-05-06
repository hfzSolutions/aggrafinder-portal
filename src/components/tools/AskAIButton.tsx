import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AskAIButtonProps {
  isActive?: boolean;
  onClick: (e: React.MouseEvent) => void; // Updated to accept the event parameter
  className?: string;
  buttonText?: string;
}

export const AskAIButton = ({
  isActive = false,
  onClick,
  className,
  buttonText = 'Compare',
}: AskAIButtonProps) => {
  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn(
        'group transition-all duration-200',
        isActive && 'bg-primary text-primary-foreground',
        className
      )}
    >
      <Bot
        className={cn(
          'h-3.5 w-3.5',
          buttonText ? 'mr-1.5' : '',
          isActive ? 'text-primary-foreground' : 'text-primary'
        )}
      />
      {buttonText}
    </Button>
  );
};

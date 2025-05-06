import React from 'react';
import { Button } from '@/components/ui/button';
import { GitCompare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompareButtonProps {
  isActive?: boolean;
  onClick: (e: React.MouseEvent) => void; // Updated to accept the event parameter
  className?: string;
  buttonText?: string;
}

export const CompareButton = ({
  isActive = false,
  onClick,
  className,
  buttonText = 'Compare',
}: CompareButtonProps) => {
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
      <GitCompare
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

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: {
    text: string;
    icon?: ReactNode;
  };
  isVisible?: boolean;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  badgeClassName?: string;
}

export function SectionHeader({
  title,
  description,
  badge,
  isVisible = true,
  className,
  titleClassName,
  descriptionClassName,
  badgeClassName,
}: SectionHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {badge && (
        <div
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary shadow-sm border border-primary/10 backdrop-blur-sm transition-all duration-700',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            badgeClassName
          )}
        >
          {badge.icon}
          <span className="text-sm font-medium">{badge.text}</span>
        </div>
      )}

      <h2
        className={cn(
          'text-3xl md:text-4xl font-bold transition-all duration-700',
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
          titleClassName
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cn(
            'text-muted-foreground max-w-2xl transition-all duration-700 delay-100',
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
            descriptionClassName
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

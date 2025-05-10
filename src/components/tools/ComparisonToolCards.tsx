import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AITool } from '@/types/tools';
import { cn } from '@/lib/utils';

interface ComparisonToolCardsProps {
  tools: AITool[];
}

export const ComparisonToolCards = ({ tools }: ComparisonToolCardsProps) => {
  const [isImageLoadedMap, setIsImageLoadedMap] = useState<
    Record<string, boolean>
  >({});

  const handleImageLoaded = (id: string) => {
    setIsImageLoadedMap((prev) => ({ ...prev, [id]: true }));
  };

  if (!tools || tools.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground mb-1">
        Comparing:
      </p>
      <div className="grid grid-cols-1 gap-2">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="p-3 rounded-lg bg-background/80 border border-border/40 shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              {tool.imageUrl ? (
                <div className="relative h-14 w-14 rounded-md overflow-hidden bg-secondary/20">
                  {!isImageLoadedMap[tool.id] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                    </div>
                  )}
                  <img
                    src={tool.imageUrl}
                    alt={tool.name}
                    className={cn(
                      'h-full w-full object-cover transition-opacity',
                      isImageLoadedMap[tool.id] ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => handleImageLoaded(tool.id)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-md bg-primary/10 flex items-center justify-center shadow-sm">
                  <span className="text-sm font-medium text-primary">
                    {tool.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                  {tool.url && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(tool.url, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {tool.tagline || tool.description?.substring(0, 60)}
                </p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 bg-primary/5"
                  >
                    {tool.pricing}
                  </Badge>
                  {tool.category && tool.category[0] && (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 bg-primary/5"
                    >
                      {tool.category[0]}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { useState } from 'react';
import { X, ArrowRightLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToolsCompare } from '@/hooks/useToolsCompare';
import { cn } from '@/lib/utils';

export const CompareToolsBar = () => {
  const [isImageLoadedMap, setIsImageLoadedMap] = useState<
    Record<string, boolean>
  >({});
  const {
    selectedTools,
    clearSelectedTools,
    compareTools,
    canCompare,
    removeToolFromComparison,
  } = useToolsCompare();

  const handleImageLoaded = (id: string) => {
    setIsImageLoadedMap((prev) => ({ ...prev, [id]: true }));
  };

  if (selectedTools.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-200/90 dark:bg-slate-800/90 backdrop-blur-sm border-t border-border shadow-lg z-50 transition-all duration-300">
      <div className="container px-4 md:px-8 mx-auto py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium mr-3">Compare Tools</h3>
              <span className="text-xs bg-secondary px-2 py-1 rounded-full">
                {selectedTools.length} selected
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {selectedTools.length < 2
                ? 'Select at least one more tool to compare'
                : 'Ready to compare'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTools.map((tool) => (
                <div
                  key={tool.id}
                  className="relative h-10 w-10 rounded-md overflow-hidden bg-secondary/20 border border-border/40 group"
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                    {!isImageLoadedMap[tool.id] && (
                      <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                  </div>
                  <img
                    src={tool.imageUrl}
                    alt={tool.name}
                    className={cn(
                      'h-full w-full object-cover transition-opacity',
                      isImageLoadedMap[tool.id] ? 'opacity-100' : 'opacity-0'
                    )}
                    onLoad={() => handleImageLoaded(tool.id)}
                  />
                  <button
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity cursor-pointer"
                    onClick={() => removeToolFromComparison(tool)}
                    aria-label={`Remove ${tool.name} from comparison`}
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelectedTools}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear
              </Button>

              <Button
                onClick={compareTools}
                disabled={!canCompare}
                size="sm"
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
              >
                <ArrowRightLeft className="h-4 w-4" />
                Compare Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

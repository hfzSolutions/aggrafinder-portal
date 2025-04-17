
import { AITool } from '@/types/tools';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import { ToolCard } from './ToolCard';

interface RecommendedToolsProps {
  tools: Omit<AITool, 'user_id' | 'created_at' | 'id'>[];
  isLoading: boolean;
}

export const RecommendedTools = ({ tools, isLoading }: RecommendedToolsProps) => {
  const [recommendedTools, setRecommendedTools] = useState<AITool[]>([]);

  useEffect(() => {
    const recommendedTools: AITool[] = tools.map(tool => ({
      ...tool,
      tagline: tool.tagline || '', // Add this line to ensure tagline is present
    }));
    setRecommendedTools(recommendedTools);
  }, [tools]);

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tools || tools.length === 0) {
    return <p>No tools found.</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {recommendedTools.map((tool) => (
        <ToolCard key={tool.name} tool={tool} />
      ))}
    </div>
  );
};

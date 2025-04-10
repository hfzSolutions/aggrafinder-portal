
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolCard } from './ToolCard';
import { AITool } from '@/types/tools';

interface RecommendedToolsProps {
  userId?: string;
  currentToolId?: string;
  limit?: number;
  title?: string;
  description?: string;
}

export function RecommendedTools({
  userId,
  currentToolId,
  limit = 3,
  title = 'Recommended for You',
  description = 'Based on your preferences and browsing history',
}: RecommendedToolsProps) {
  const [tools, setTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedTools = async () => {
      try {
        setLoading(true);

        // First try to get user preferences if userId is provided
        let preferredCategories: string[] = [];
        let preferredPricing: string | null = null;

        if (userId) {
          const { data: prefsData } = await supabase
            .from('user_preferences')
            .select('preferred_categories, preferred_pricing')
            .eq('user_id', userId)
            .single();

          if (prefsData) {
            preferredCategories = prefsData.preferred_categories || [];
            preferredPricing =
              prefsData.preferred_pricing !== 'All'
                ? prefsData.preferred_pricing
                : null;
          }
        }

        // If we have user preferences, use them to filter recommendations
        let query = supabase.from('ai_tools').select('*');

        // Exclude current tool if provided
        if (currentToolId) {
          query = query.neq('id', currentToolId);
        }

        // Apply category filter if we have preferences
        if (preferredCategories.length > 0) {
          // Get tools that match any of the preferred categories
          query = query.or(
            preferredCategories.map((cat) => `category.cs.{${cat}}`).join(',')
          );
        }

        // Apply pricing filter if we have a preference
        if (preferredPricing) {
          query = query.eq('pricing', preferredPricing);
        }

        // If no preferences, just get popular or featured tools
        if (!userId || preferredCategories.length === 0) {
          query = query.eq('featured', true);
        }

        // Limit and order
        query = query.limit(limit).order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;

        // Transform the data to match our AITool type
        const transformedData: AITool[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          tagline: item.tagline || '', // Add tagline with fallback
          imageUrl: item.image_url,
          category: item.category,
          url: item.url,
          youtubeUrl: item.youtube_url || '', // Add YouTube URL with fallback
          featured: item.featured,
          pricing: item.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
          tags: item.tags,
        }));

        setTools(transformedData);
      } catch (error) {
        console.error('Error fetching recommended tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedTools();
  }, [userId, currentToolId, limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(limit)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tools.length === 0) {
    return null; // Don't show anything if no recommendations
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

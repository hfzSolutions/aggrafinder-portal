import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';
import { toast } from 'sonner';
import { format, addDays, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Calendar, Search, Plus, X, Check, Star } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export function TodaysToolPicker() {
  const [tools, setTools] = useState<AITool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [featuredTools, setFeaturedTools] = useState<AITool[]>([]);
  const [featuredToolIds, setFeaturedToolIds] = useState<string[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [showToolSelector, setShowToolSelector] = useState(false);

  // Fetch featured tools for the selected date
  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        setFeaturedLoading(true);

        // Get featured tools for the selected date
        const { data: featuredData, error: featuredError } = await supabase
          .from('daily_featured_tools')
          .select('tool_id, notes')
          .eq('feature_date', selectedDate);

        if (featuredError) throw featuredError;

        // Set notes if available
        if (featuredData && featuredData.length > 0) {
          setNotes(featuredData[0].notes || '');
        } else {
          setNotes('');
        }

        // Extract tool IDs
        const toolIds = featuredData?.map((item) => item.tool_id) || [];
        setFeaturedToolIds(toolIds);

        if (toolIds.length > 0) {
          // Fetch the actual tool data
          const { data: toolsData, error: toolsError } = await supabase
            .from('ai_tools')
            .select('*')
            .in('id', toolIds);

          if (toolsError) throw toolsError;

          const transformedTools = toolsData?.map(transformToolData) || [];
          setFeaturedTools(transformedTools);
        } else {
          setFeaturedTools([]);
        }
      } catch (error) {
        console.error('Error fetching featured tools:', error);
        toast.error('Failed to load featured tools');
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedTools();
  }, [selectedDate]);

  // Fetch all tools for selection
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setToolsLoading(true);

        let query = supabase
          .from('ai_tools')
          .select('*')
          .eq('approval_status', 'approved')
          .order('name');

        // Apply search filter if provided
        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        const transformedTools = data?.map(transformToolData) || [];
        setTools(transformedTools);
      } catch (error) {
        console.error('Error fetching tools:', error);
        toast.error('Failed to load tools');
      } finally {
        setToolsLoading(false);
      }
    };

    if (showToolSelector) {
      fetchTools();
    }
  }, [searchTerm, showToolSelector]);

  // Transform the raw database tool data into the AITool type
  const transformToolData = (item: any): AITool => ({
    id: item.id,
    name: item.name,
    tagline: item.tagline,
    description: item.description,
    imageUrl: item.image_url
      ? `${import.meta.env.VITE_STORAGE_URL}/${item.image_url}`
      : '',
    category: item.category,
    url: item.url,
    youtubeUrl: item.youtube_url || '',
    featured: item.featured,
    pricing: item.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
    tags: item.tags || [],
    userId: item.user_id,
    approvalStatus: item.approval_status,
    isAdminAdded: item.is_admin_added || false,
  });

  // Add a tool to featured list
  const addToolToFeatured = async (tool: AITool) => {
    try {
      setSaving(true);

      // Check if we already have 4 tools
      if (featuredToolIds.length >= 4) {
        toast.error('Maximum of 4 tools can be featured for a day');
        return;
      }

      // Check if tool is already featured
      if (featuredToolIds.includes(tool.id)) {
        toast.error('This tool is already featured for this date');
        return;
      }

      // Add to database
      const { error } = await supabase.from('daily_featured_tools').insert({
        tool_id: tool.id,
        feature_date: selectedDate,
        notes: notes,
      });

      if (error) throw error;

      // Update local state
      setFeaturedTools([...featuredTools, tool]);
      setFeaturedToolIds([...featuredToolIds, tool.id]);
      toast.success(`Added ${tool.name} to featured tools`);
    } catch (error) {
      console.error('Error adding featured tool:', error);
      toast.error('Failed to add tool to featured list');
    } finally {
      setSaving(false);
      setShowToolSelector(false);
    }
  };

  // Remove a tool from featured list
  const removeToolFromFeatured = async (toolId: string) => {
    try {
      setSaving(true);

      // Remove from database
      const { error } = await supabase
        .from('daily_featured_tools')
        .delete()
        .eq('tool_id', toolId)
        .eq('feature_date', selectedDate);

      if (error) throw error;

      // Update local state
      setFeaturedTools(featuredTools.filter((tool) => tool.id !== toolId));
      setFeaturedToolIds(featuredToolIds.filter((id) => id !== toolId));
      toast.success('Removed tool from featured list');
    } catch (error) {
      console.error('Error removing featured tool:', error);
      toast.error('Failed to remove tool from featured list');
    } finally {
      setSaving(false);
    }
  };

  // Update notes for the featured tools
  const updateNotes = async () => {
    try {
      setSaving(true);

      if (featuredToolIds.length > 0) {
        // Update notes for all featured tools on this date
        const { error } = await supabase
          .from('daily_featured_tools')
          .update({ notes })
          .eq('feature_date', selectedDate);

        if (error) throw error;
        toast.success('Notes updated successfully');
      }
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error('Failed to update notes');
    } finally {
      setSaving(false);
    }
  };

  // Navigate to next/previous day
  const changeDate = (direction: 'next' | 'prev') => {
    const currentDate = parseISO(selectedDate);
    const newDate =
      direction === 'next' ? addDays(currentDate, 1) : addDays(currentDate, -1);
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Today's AI Tool Picks</CardTitle>
        <CardDescription>
          Manage which tools are featured on the homepage for specific dates
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Date selector */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate('prev')}
          >
            Previous Day
          </Button>

          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => changeDate('next')}
          >
            Next Day
          </Button>
        </div>

        {/* Notes for the featured tools */}
        <div className="mb-6">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about why these tools were selected"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1"
          />
          <Button
            size="sm"
            onClick={updateNotes}
            disabled={saving}
            className="mt-2"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notes'
            )}
          </Button>
        </div>

        {/* Featured tools list */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Featured Tools</h3>
            <Button
              size="sm"
              onClick={() => setShowToolSelector(true)}
              disabled={featuredToolIds.length >= 4 || saving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Tool
            </Button>
          </div>

          {featuredLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : featuredTools.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-md">
              <p className="text-muted-foreground">
                No tools featured for this date. Add up to 4 tools.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {featuredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-amber-500" />
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {tool.tagline}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeToolFromFeatured(tool.id)}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tool selector dialog */}
        <Dialog open={showToolSelector} onOpenChange={setShowToolSelector}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Select Tool to Feature</DialogTitle>
              <DialogDescription>
                Choose a tool to feature on {selectedDate}. You can feature up
                to 4 tools per day.
              </DialogDescription>
            </DialogHeader>

            <div className="my-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tools..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {toolsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : tools.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No tools found matching your search.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => addToolToFeatured(tool)}
                  >
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-md">
                        {tool.tagline}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowToolSelector(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

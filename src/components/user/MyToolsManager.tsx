import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';

// Extended AITool interface with quick tool properties
interface ExtendedAITool extends AITool {
  tool_type?: 'external' | 'quick';
  is_public?: boolean;
  usageCount?: number;
  prompt?: string;
}
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Bot,
  Globe,
} from 'lucide-react';
import { ToolBadge } from '@/components/tools/ToolBadge';
import { ToolSubmissionForm } from '@/components/admin/ToolSubmissionForm';
import { QuickToolForm } from '@/components/quick-tools/QuickToolForm';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { QuickToolFormSimplified } from '../quick-tools/QuickToolFormSimplified';

interface MyToolsManagerProps {
  userId: string;
  toolType?: 'external' | 'quick';
  showActionButton?: boolean;
}

export const MyToolsManager = ({
  userId,
  toolType = 'external',
}: MyToolsManagerProps) => {
  const [userTools, setUserTools] = useState<ExtendedAITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [openQuickToolDialog, setOpenQuickToolDialog] = useState(false);
  const [editingTool, setEditingTool] = useState<ExtendedAITool | null>(null);
  const [editingQuickTool, setEditingQuickTool] =
    useState<ExtendedAITool | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTools, setTotalTools] = useState(0);
  const itemsPerPage = 5;

  const fetchUserTools = async () => {
    try {
      setLoading(true);

      // Build query with tool type filter
      let query = supabase
        .from('ai_tools')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Add tool type filter
      if (toolType === 'quick') {
        query = query.eq('tool_type', 'quick');
      } else {
        // For external tools or if not specified
        query = query.eq('tool_type', 'external');
      }

      // Get total count for pagination
      const { count, error: countError } = await query;

      if (countError) throw countError;

      setTotalTools(count || 0);

      // Get paginated data
      let dataQuery = supabase
        .from('ai_tools')
        .select('*')
        .eq('user_id', userId);

      // Add tool type filter to data query
      if (toolType === 'quick') {
        dataQuery = dataQuery.eq('tool_type', 'quick');
      } else {
        dataQuery = dataQuery.eq('tool_type', 'external');
      }

      const { data, error } = await dataQuery
        .order('created_at', { ascending: false })
        .range(
          (currentPage - 1) * itemsPerPage,
          currentPage * itemsPerPage - 1
        );

      if (error) throw error;

      const tools: ExtendedAITool[] = data.map((tool) => ({
        id: tool.id,
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        imageUrl: tool.image_url
          ? `${import.meta.env.VITE_STORAGE_URL}/${tool.image_url}`
          : '',
        category: tool.category,
        url: tool.url,
        youtubeUrl: tool.youtube_url,
        featured: tool.featured,
        pricing: tool.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
        tags: tool.tags || [],
        userId: tool.user_id,
        approvalStatus: tool.approval_status as
          | 'pending'
          | 'approved'
          | 'rejected',
        // Add quick tool specific properties
        tool_type: tool.tool_type as 'external' | 'quick',
        is_public: tool.is_public || false,
        usageCount: tool.usage_count || 0,
        prompt: tool.prompt || '',
        initial_message: tool.initial_message || '',
        suggested_replies: tool.suggested_replies || false,
      }));

      setUserTools(tools);
    } catch (error) {
      console.error('Error fetching user tools:', error);
      toast.error('Failed to load your tools');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTools();
  }, [userId, currentPage]);

  const handleEditTool = (tool: ExtendedAITool) => {
    if (tool.tool_type === 'quick') {
      setEditingQuickTool(tool);
      setOpenQuickToolDialog(true);
    } else {
      setEditingTool(tool);
      setOpenSubmitDialog(true);
    }
  };

  const handleDeleteClick = (toolId: string) => {
    setToolToDelete(toolId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteTool = async () => {
    if (!toolToDelete) return;

    try {
      // First get the tool details to get the image path
      const { data: toolData, error: fetchError } = await supabase
        .from('ai_tools')
        .select('image_url')
        .eq('id', toolToDelete)
        .single();

      if (fetchError) throw fetchError;

      // Delete the tool from the database
      const { error: deleteError } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolToDelete);

      if (deleteError) throw deleteError;

      // If the tool had an image and it's stored in Supabase Storage, delete it
      if (toolData?.image_url && !toolData.image_url.startsWith('http')) {
        const { error: storageError } = await supabase.storage
          .from('assets')
          .remove([toolData.image_url]);

        if (storageError) {
          console.error('Error deleting tool image:', storageError);
          // We don't throw here as the tool was already deleted
        }
      }

      setUserTools((prev) => prev.filter((tool) => tool.id !== toolToDelete));
      toast.success('Tool deleted successfully');
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast.error('Failed to delete tool');
    } finally {
      setOpenDeleteDialog(false);
      setToolToDelete(null);
    }
  };

  const handleSubmitSuccess = () => {
    setOpenSubmitDialog(false);
    setEditingTool(null);
    fetchUserTools();
  };

  const handleQuickToolSuccess = () => {
    setOpenQuickToolDialog(false);
    setEditingQuickTool(null);
    fetchUserTools();
  };

  const getStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {userTools.length === 0 && !loading ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50">
          <div className="inline-flex bg-primary/10 p-3 rounded-full mb-3">
            {toolType === 'quick' ? (
              <Bot className="h-6 w-6 text-primary" />
            ) : (
              <Globe className="h-6 w-6 text-primary" />
            )}
          </div>
          <h3 className="text-lg font-medium mb-4">
            You don't have any {toolType === 'quick' ? 'quick' : 'external'}{' '}
            tools yet
          </h3>
          {toolType === 'quick' ? (
            <Button
              onClick={() => setOpenQuickToolDialog(true)}
              variant="default"
              size="lg"
              className="font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Quick Tool
            </Button>
          ) : (
            <Button
              onClick={() => setOpenSubmitDialog(true)}
              variant="default"
              size="lg"
              className="font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit Your First Tool
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {userTools.map((tool) => (
            <Card key={tool.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                    {tool.imageUrl ? (
                      <img
                        src={tool.imageUrl}
                        alt={tool.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <span className="text-xs text-secondary-foreground">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{tool.name}</h3>
                        {tool.tagline && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {tool.tagline}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {tool.description}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1 items-end">
                        <div>{getStatusBadge(tool.approvalStatus)}</div>
                        <Badge
                          variant={tool.is_public ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          {tool.is_public ? 'Public' : 'Private'}
                        </Badge>
                        {toolType === 'quick' ? (
                          <div className="text-xs text-muted-foreground">
                            {tool.usageCount} uses
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tool.category.map((cat) => (
                        <Badge
                          key={cat}
                          variant="secondary"
                          className="text-xs"
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    {toolType === 'external' &&
                      tool.approvalStatus === 'approved' && (
                        <div className="mt-3 border-t pt-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex-shrink-0">
                              <ToolBadge
                                toolId={tool.id}
                                toolName={tool.name}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Add this badge to show your tool is LISTED ON
                              DeepList AI
                            </span>
                          </div>
                        </div>
                      )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {toolType === 'external' ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/tools/${tool.id}`, '_blank')
                          }
                          disabled={tool.approvalStatus !== 'approved'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTool(tool)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            window.open(`/quick-tools/${tool.id}`, '_blank')
                          }
                          disabled={tool.approvalStatus !== 'approved'}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTool(tool)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(tool.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalTools > itemsPerPage && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from({
                  length: Math.ceil(totalTools / itemsPerPage),
                }).map((_, index) => {
                  const pageNumber = index + 1;
                  // Show current page, first page, last page, and pages around current
                  const isVisible =
                    pageNumber === 1 ||
                    pageNumber === Math.ceil(totalTools / itemsPerPage) ||
                    Math.abs(pageNumber - currentPage) <= 1;

                  if (
                    (!isVisible && pageNumber === 2) ||
                    (!isVisible &&
                      pageNumber === Math.ceil(totalTools / itemsPerPage) - 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (isVisible) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          isActive={pageNumber === currentPage}
                          onClick={() => setCurrentPage(pageNumber)}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, Math.ceil(totalTools / itemsPerPage))
                      )
                    }
                    className={
                      currentPage === Math.ceil(totalTools / itemsPerPage)
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Submit/Edit Tool Dialog */}
      <Dialog open={openSubmitDialog} onOpenChange={setOpenSubmitDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? 'Edit AI Tool' : 'Submit New AI Tool'}
            </DialogTitle>
            <DialogDescription>
              {editingTool
                ? 'Update your AI tool details.'
                : 'Share an AI tool with the community. Submissions require admin approval before they appear publicly.'}
            </DialogDescription>
          </DialogHeader>
          <ToolSubmissionForm
            toolToEdit={editingTool || undefined}
            onSuccess={handleSubmitSuccess}
            userId={userId}
            editMode={!!editingTool}
          />
        </DialogContent>
      </Dialog>

      {/* Quick Tool Dialog */}
      <Dialog open={openQuickToolDialog} onOpenChange={setOpenQuickToolDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuickTool ? 'Edit Quick Tool' : 'Create Quick Tool'}
            </DialogTitle>
            <DialogDescription>
              {editingQuickTool
                ? 'Update your quick AI tool'
                : 'Create a quick AI tool that you can use in your workflows'}
            </DialogDescription>
          </DialogHeader>
          <QuickToolFormSimplified
            userId={userId}
            onSuccess={handleQuickToolSuccess}
            editMode={!!editingQuickTool}
            toolToEdit={editingQuickTool || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              tool from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTool}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

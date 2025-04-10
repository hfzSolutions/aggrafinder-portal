import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Eye, AlertCircle } from 'lucide-react';
import { ToolSubmissionForm } from '@/components/admin/ToolSubmissionForm';
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

interface MyToolsManagerProps {
  userId: string;
}

export const MyToolsManager = ({ userId }: MyToolsManagerProps) => {
  const [userTools, setUserTools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSubmitDialog, setOpenSubmitDialog] = useState(false);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<string | null>(null);

  const fetchUserTools = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_tools')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tools: AITool[] = data.map((tool) => ({
        id: tool.id,
        name: tool.name,
        tagline: tool.tagline,
        description: tool.description,
        imageUrl: tool.image_url
          ? `${import.meta.env.VITE_STORAGE_URL}/${tool.image_url}`
          : '',
        category: tool.category,
        url: tool.url,
        featured: tool.featured,
        pricing: tool.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
        tags: tool.tags || [],
        userId: tool.user_id,
        approvalStatus: tool.approval_status as
          | 'pending'
          | 'approved'
          | 'rejected',
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
  }, [userId]);

  const handleEditTool = (tool: AITool) => {
    setEditingTool(tool);
    setOpenSubmitDialog(true);
  };

  const handleDeleteClick = (toolId: string) => {
    setToolToDelete(toolId);
    setOpenDeleteDialog(true);
  };

  const handleDeleteTool = async () => {
    if (!toolToDelete) return;

    try {
      const { error } = await supabase
        .from('ai_tools')
        .delete()
        .eq('id', toolToDelete);

      if (error) throw error;

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
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My AI Tools</h2>
        <Button
          onClick={() => {
            setEditingTool(null);
            setOpenSubmitDialog(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Submit New Tool
        </Button>
      </div>

      {userTools.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No tools yet</h3>
          <p className="text-muted-foreground mb-4">
            Submit your AI tools to share with the community
          </p>
          <Button onClick={() => setOpenSubmitDialog(true)} variant="default">
            <Plus className="w-4 h-4 mr-2" />
            Submit Your First Tool
          </Button>
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
                      <div>{getStatusBadge(tool.approvalStatus)}</div>
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
                      <Badge variant="outline" className="text-xs">
                        {tool.pricing}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(`/tools/${tool.id}`, '_blank')}
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

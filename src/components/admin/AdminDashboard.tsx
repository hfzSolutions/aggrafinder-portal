import { useState, useEffect } from 'react';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { supabase } from '@/integrations/supabase/client';
import { AITool } from '@/types/tools';
import { AIOucome } from '@/types/outcomes';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FileText,
  FolderPlus,
  InboxIcon,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface AdminDashboardProps {
  userId: string;
}

interface ToolRequest {
  id: string;
  name: string;
  description: string;
  url: string;
  category: string[];
  pricing: string | null;
  status: string;
  submitter_name: string | null;
  submitter_email: string | null;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

export function AdminDashboard({ userId }: AdminDashboardProps) {
  // State for tools management
  const [tools, setTools] = useState<AITool[]>([]);
  const [toolsLoading, setToolsLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [isToolDialogOpen, setIsToolDialogOpen] = useState(false);

  // State for outcomes management
  const [outcomes, setOutcomes] = useState<AIOucome[]>([]);
  const [outcomesLoading, setOutcomesLoading] = useState(true);

  // State for categories management
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');

  // State for tool requests management
  const [toolRequests, setToolRequests] = useState<ToolRequest[]>([]);
  const [toolRequestsLoading, setToolRequestsLoading] = useState(true);

  // New tool form state
  const [newTool, setNewTool] = useState<Omit<AITool, 'id'>>({
    name: '',
    description: '',
    imageUrl: '',
    category: [],
    url: '',
    featured: false,
    pricing: 'Free',
    tags: [],
  });

  // Admin hook
  const {
    createTool,
    updateTool,
    deleteTool,
    deleteOutcome,
    updateCategory,
    createCategory,
    deleteCategory,
    approveToolRequest,
    rejectToolRequest,
    loading: adminActionLoading,
  } = useSupabaseAdmin();

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // This is a simplified approach. In a real app, you would have a proper admin role system
        // For now, we'll check if the user has a specific email domain or is in an admin list
        const { data: userData } = await supabase.auth.getUser();

        if (userData?.user) {
          // You can implement your own admin check logic here
          // For example, check against an admin table in your database
          const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', userData.user.id)
            .single();

          setIsAdmin(!!data);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdminStatus();
  }, [userId]);

  // Fetch tools
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setToolsLoading(true);
        const { data, error } = await supabase
          .from('ai_tools')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedData: AITool[] = data.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.image_url,
          category: item.category,
          url: item.url,
          featured: item.featured,
          pricing: item.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
          tags: item.tags,
        }));

        setTools(transformedData);
      } catch (error) {
        console.error('Error fetching tools:', error);
        toast.error('Failed to load tools');
      } finally {
        setToolsLoading(false);
      }
    };

    if (isAdmin) {
      fetchTools();
    }
  }, [isAdmin]);

  // Fetch outcomes
  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        setOutcomesLoading(true);
        const { data, error } = await supabase
          .from('ai_outcomes')
          .select('*, ai_tools(name)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedData: AIOucome[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description,
          imageUrl: item.image_url,
          toolId: item.tool_id,
          toolName: item.ai_tools?.name || 'Unknown Tool',
          createdAt: item.created_at,
          submitterName: item.submitter_name,
          submitterEmail: item.submitter_email,
          userId: item.user_id,
        }));

        setOutcomes(transformedData);
      } catch (error) {
        console.error('Error fetching outcomes:', error);
        toast.error('Failed to load outcomes');
      } finally {
        setOutcomesLoading(false);
      }
    };

    if (isAdmin) {
      fetchOutcomes();
    }
  }, [isAdmin]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (error) throw error;

        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (isAdmin) {
      fetchCategories();
    }
  }, [isAdmin]);

  // Fetch tool requests
  useEffect(() => {
    const fetchToolRequests = async () => {
      try {
        setToolRequestsLoading(true);
        const { data, error } = await supabase
          .from('tool_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        setToolRequests(data);
      } catch (error) {
        console.error('Error fetching tool requests:', error);
        toast.error('Failed to load tool requests');
      } finally {
        setToolRequestsLoading(false);
      }
    };

    if (isAdmin) {
      fetchToolRequests();
    }
  }, [isAdmin]);

  // Handle tool form input changes
  const handleToolInputChange = (
    field: keyof Omit<AITool, 'id'>,
    value: any
  ) => {
    setNewTool((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle tool form submission
  const handleToolSubmit = async () => {
    if (!newTool.name || !newTool.description || !newTool.url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingTool) {
        // Update existing tool
        const { success, error } = await updateTool(editingTool.id, newTool);

        if (!success) throw new Error(error);

        // Update local state
        setTools((prev) =>
          prev.map((tool) =>
            tool.id === editingTool.id ? { ...tool, ...newTool } : tool
          )
        );

        toast.success('Tool updated successfully');
      } else {
        // Create new tool
        const { success, data, error } = await createTool(newTool);

        if (!success) throw new Error(error);

        // Add to local state
        if (data) {
          setTools((prev) => [data, ...prev]);
        }

        toast.success('Tool created successfully');
      }

      // Reset form and close dialog
      setNewTool({
        name: '',
        description: '',
        imageUrl: '',
        category: [],
        url: '',
        featured: false,
        pricing: 'Free',
        tags: [],
      });
      setEditingTool(null);
      setIsToolDialogOpen(false);
    } catch (error: any) {
      console.error('Error saving tool:', error);
      toast.error(error.message || 'Failed to save tool');
    }
  };

  // Handle tool edit
  const handleEditTool = (tool: AITool) => {
    setEditingTool(tool);
    setNewTool({
      name: tool.name,
      description: tool.description,
      imageUrl: tool.imageUrl,
      category: tool.category,
      url: tool.url,
      featured: tool.featured,
      pricing: tool.pricing,
      tags: tool.tags,
    });
    setIsToolDialogOpen(true);
  };

  // Handle tool delete
  const handleDeleteTool = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const { success, error } = await deleteTool(id);

      if (!success) throw new Error(error);

      // Remove from local state
      setTools((prev) => prev.filter((tool) => tool.id !== id));

      toast.success('Tool deleted successfully');
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      toast.error(error.message || 'Failed to delete tool');
    }
  };

  // Handle outcome delete
  const handleDeleteOutcome = async (id: string) => {
    if (!confirm('Are you sure you want to delete this outcome?')) return;

    try {
      const { success, error } = await deleteOutcome(id);

      if (!success) throw new Error(error);

      // Remove from local state
      setOutcomes((prev) => prev.filter((outcome) => outcome.id !== id));

      toast.success('Outcome deleted successfully');
    } catch (error: any) {
      console.error('Error deleting outcome:', error);
      toast.error(error.message || 'Failed to delete outcome');
    }
  };

  // Handle category creation
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Please enter a category name');
      return;
    }

    try {
      const { success, error } = await createCategory(newCategoryName);

      if (!success) throw new Error(error);

      // Refresh categories
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data);
      setNewCategoryName('');

      toast.success('Category created successfully');
    } catch (error: any) {
      console.error('Error creating category:', error);
      toast.error(error.message || 'Failed to create category');
    }
  };

  // Handle category delete
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { success, error } = await deleteCategory(id);

      if (!success) throw new Error(error);

      // Remove from local state
      setCategories((prev) => prev.filter((category) => category.id !== id));

      toast.success('Category deleted successfully');
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast.error(error.message || 'Failed to delete category');
    }
  };

  // Handle tool request approval
  const handleApproveToolRequest = async (id: string) => {
    if (!confirm('Are you sure you want to approve this tool request?')) return;

    try {
      const { success, error } = await approveToolRequest(id);

      if (!success) throw new Error(error);

      // Update local state
      setToolRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: 'approved' } : request
        )
      );

      // Refresh tools list
      const { data, error: fetchError } = await supabase
        .from('ai_tools')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const transformedData: AITool[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        imageUrl: item.image_url,
        category: item.category,
        url: item.url,
        featured: item.featured,
        pricing: item.pricing as 'Free' | 'Freemium' | 'Paid' | 'Free Trial',
        tags: item.tags,
      }));

      setTools(transformedData);

      toast.success('Tool request approved successfully');
    } catch (error: any) {
      console.error('Error approving tool request:', error);
      toast.error(error.message || 'Failed to approve tool request');
    }
  };

  // Handle tool request rejection
  const handleRejectToolRequest = async (id: string) => {
    if (!confirm('Are you sure you want to reject this tool request?')) return;

    try {
      const { success, error } = await rejectToolRequest(id);

      if (!success) throw new Error(error);

      // Update local state
      setToolRequests((prev) =>
        prev.map((request) =>
          request.id === id ? { ...request, status: 'rejected' } : request
        )
      );

      toast.success('Tool request rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting tool request:', error);
      toast.error(error.message || 'Failed to reject tool request');
    }
  };

  if (checkingAdmin) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Checking admin status...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You do not have permission to access the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            Please contact the site administrator if you believe this is an
            error.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>
            Manage your AI tools, outcomes, categories, and tool requests.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tools">
            <TabsList className="mb-4">
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="requests">Tool Requests</TabsTrigger>
            </TabsList>

            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Manage AI Tools</h3>
                <Button
                  onClick={() => {
                    setEditingTool(null);
                    setNewTool({
                      name: '',
                      description: '',
                      imageUrl: '',
                      category: [],
                      url: '',
                      featured: false,
                      pricing: 'Free',
                      tags: [],
                    });
                    setIsToolDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tool
                </Button>
              </div>

              {toolsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading tools...</span>
                </div>
              ) : tools.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="h-12 w-12 text-gray-400" />
                    <h3 className="font-semibold">No Tools Added Yet</h3>
                    <p className="text-sm text-gray-500">
                      Get started by adding your first AI tool.
                    </p>
                    <Button
                      onClick={() => {
                        setEditingTool(null);
                        setNewTool({
                          name: '',
                          description: '',
                          imageUrl: '',
                          category: [],
                          url: '',
                          featured: false,
                          pricing: 'Free',
                          tags: [],
                        });
                        setIsToolDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Tool
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tools.map((tool) => (
                    <Card key={tool.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{tool.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {tool.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">URL:</span> {tool.url}
                          </div>
                          <div>
                            <span className="font-medium">Categories:</span>{' '}
                            {tool.category.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Pricing:</span>{' '}
                            {tool.pricing}
                          </div>
                          <div>
                            <span className="font-medium">Featured:</span>{' '}
                            {tool.featured ? 'Yes' : 'No'}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2 pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditTool(tool)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTool(tool.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Outcomes Tab */}
            <TabsContent value="outcomes" className="space-y-4">
              <h3 className="text-lg font-medium">Manage User Outcomes</h3>

              {outcomesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading outcomes...</span>
                </div>
              ) : outcomes.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <h3 className="font-semibold">No Outcomes Yet</h3>
                    <p className="text-sm text-gray-500">
                      User outcomes will appear here once they are submitted.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outcomes.map((outcome) => (
                    <Card key={outcome.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {outcome.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {outcome.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">Tool:</span>{' '}
                            {outcome.toolName}
                          </div>
                          <div>
                            <span className="font-medium">Submitter:</span>{' '}
                            {outcome.submitterName}
                          </div>
                          <div>
                            <span className="font-medium">Email:</span>{' '}
                            {outcome.submitterEmail || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(outcome.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-end pt-0">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteOutcome(outcome.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4">
              <h3 className="text-lg font-medium">Manage Categories</h3>

              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="New category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
                <Button
                  onClick={handleCreateCategory}
                  disabled={adminActionLoading}
                >
                  {adminActionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Add
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading categories...</span>
                </div>
              ) : categories.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <FolderPlus className="h-12 w-12 text-gray-400" />
                    <h3 className="font-semibold">No Categories Yet</h3>
                    <p className="text-sm text-gray-500">
                      Add categories to organize your AI tools.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-2">
                        {editingCategory?.id === category.id ? (
                          <div className="flex space-x-2">
                            <Input
                              value={editCategoryName}
                              onChange={(e) =>
                                setEditCategoryName(e.target.value)
                              }
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!editCategoryName.trim()) {
                                  toast.error('Please enter a category name');
                                  return;
                                }
                                try {
                                  const { success, error } =
                                    await updateCategory(
                                      category.id,
                                      editCategoryName
                                    );
                                  if (!success) throw new Error(error);
                                  setCategories((prev) =>
                                    prev.map((cat) =>
                                      cat.id === category.id
                                        ? { ...cat, name: editCategoryName }
                                        : cat
                                    )
                                  );
                                  setEditingCategory(null);
                                  setEditCategoryName('');
                                  toast.success(
                                    'Category updated successfully'
                                  );
                                } catch (error: any) {
                                  console.error(
                                    'Error updating category:',
                                    error
                                  );
                                  toast.error(
                                    error.message || 'Failed to update category'
                                  );
                                }
                              }}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCategory(null);
                                setEditCategoryName('');
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <CardTitle className="text-base">
                            {category.name}
                          </CardTitle>
                        )}
                      </CardHeader>
                      <CardFooter className="flex justify-end space-x-2 pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditCategoryName(category.name);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Tool Requests Tab */}
            <TabsContent value="requests" className="space-y-4">
              <h3 className="text-lg font-medium">Manage Tool Requests</h3>

              {toolRequestsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading tool requests...</span>
                </div>
              ) : toolRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <InboxIcon className="h-12 w-12 text-gray-400" />
                    <h3 className="font-semibold">No Tool Requests</h3>
                    <p className="text-sm text-gray-500">
                      New tool requests from users will appear here.
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {toolRequests.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">
                            {request.name}
                          </CardTitle>
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              request.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {request.status.charAt(0).toUpperCase() +
                              request.status.slice(1)}
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {request.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="font-medium">URL:</span>{' '}
                            {request.url}
                          </div>
                          <div>
                            <span className="font-medium">Categories:</span>{' '}
                            {request.category.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Pricing:</span>{' '}
                            {request.pricing || 'Not specified'}
                          </div>
                          <div>
                            <span className="font-medium">Submitter:</span>{' '}
                            {request.submitter_name || 'Anonymous'}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span>{' '}
                            {new Date(request.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </CardContent>
                      {request.status === 'pending' && (
                        <CardFooter className="flex justify-end space-x-2 pt-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveToolRequest(request.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectToolRequest(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Tool Dialog */}
      <Dialog open={isToolDialogOpen} onOpenChange={setIsToolDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? 'Edit Tool' : 'Add New Tool'}
            </DialogTitle>
            <DialogDescription>
              {editingTool
                ? 'Update the tool details below.'
                : 'Fill in the details for the new AI tool.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newTool.name}
                onChange={(e) => handleToolInputChange('name', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTool.description}
                onChange={(e) =>
                  handleToolInputChange('description', e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                URL
              </Label>
              <Input
                id="url"
                value={newTool.url}
                onChange={(e) => handleToolInputChange('url', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="imageUrl" className="text-right">
                Image URL
              </Label>
              <Input
                id="imageUrl"
                value={newTool.imageUrl}
                onChange={(e) =>
                  handleToolInputChange('imageUrl', e.target.value)
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pricing" className="text-right">
                Pricing
              </Label>
              <Select
                value={newTool.pricing}
                onValueChange={(value) =>
                  handleToolInputChange('pricing', value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select pricing model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Freemium">Freemium</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Free Trial">Free Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Categories</Label>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        const categoryName = category.name;
                        setNewTool((prev) => ({
                          ...prev,
                          category: prev.category.includes(categoryName)
                            ? prev.category.filter(
                                (cat) => cat !== categoryName
                              )
                            : [...prev.category, categoryName],
                        }));
                      }}
                      className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                        newTool.category.includes(category.name)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
                {newTool.category.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {newTool.category.join(', ')}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Featured</Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Checkbox
                  id="featured"
                  checked={newTool.featured}
                  onCheckedChange={(checked) =>
                    handleToolInputChange('featured', checked)
                  }
                />
                <Label htmlFor="featured">Mark as featured tool</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsToolDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleToolSubmit}
              disabled={adminActionLoading}
            >
              {adminActionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingTool ? 'Update Tool' : 'Add Tool'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSupabaseTools } from '@/hooks/useSupabaseTools';
import { Badge } from '@/components/ui/badge';
import { BulkToolUpload } from './BulkToolUpload';
import { ToolSubmissionForm } from './ToolSubmissionForm';
import { SupportMessages } from './SupportMessages';
import { ToolClaimRequests } from './ToolClaimRequests';
import { useAdminPendingCounts } from '@/hooks/useAdminPendingCounts';
import { 
  MessageSquare, 
  ClipboardCheck, 
  Plus, 
  Upload, 
  Settings, 
  Database 
} from 'lucide-react';

export function AdminDashboard({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState('pending');
  const { counts, loading: countsLoading } = useAdminPendingCounts();
  
  const { tools: pendingTools, loading } = useSupabaseTools({
    includeUnapproved: true,
    customQuery: (query) => query.eq('approval_status', 'pending'),
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your AI tools, support requests, and tool claims.
        </p>
      </div>

      {!countsLoading && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tools</p>
                  <p className="text-2xl font-bold">{counts.tools}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Support Messages</p>
                  <p className="text-2xl font-bold">{counts.supportMessages}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-3 rounded-full">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tool Claims</p>
                  <p className="text-2xl font-bold">{counts.claimRequests}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending" className="relative">
            Pending Tools
            {counts.tools > 0 && (
              <Badge className="ml-2 bg-primary text-white" variant="default">
                {counts.tools}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="relative">
            Support Messages
            {counts.supportMessages > 0 && (
              <Badge className="ml-2 bg-primary text-white" variant="default">
                {counts.supportMessages}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="claims" className="relative">
            Tool Claims
            {counts.claimRequests > 0 && (
              <Badge className="ml-2 bg-primary text-white" variant="default">
                {counts.claimRequests}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="add">
            <Plus className="h-4 w-4 mr-2" />
            Add Tool
          </TabsTrigger>
          <TabsTrigger value="bulk">
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Tool Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTools.length > 0 ? (
                <ul className="space-y-4">
                  {pendingTools.map((tool) => (
                    <li
                      key={tool.id}
                      className="flex items-center justify-between border p-4 rounded-md"
                    >
                      <div>
                        <h3 className="font-medium">{tool.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {tool.description.substring(0, 100)}
                          {tool.description.length > 100 ? '...' : ''}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/tools/${tool.id}`, '_blank')}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            const { error } = await supabase.rpc('reject_tool', {
                              tool_id: tool.id,
                            });
                            if (!error) setActiveTab('pending');
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={async () => {
                            const { error } = await supabase.rpc('approve_tool', {
                              tool_id: tool.id,
                            });
                            if (!error) setActiveTab('pending');
                          }}
                        >
                          Approve
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    {loading ? 'Loading...' : 'No pending tools to approve'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <SupportMessages />
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          <ToolClaimRequests />
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          <ToolSubmissionForm />
        </TabsContent>

        <TabsContent value="bulk" className="mt-6">
          <BulkToolUpload />
        </TabsContent>
      </Tabs>
    </div>
  );
}

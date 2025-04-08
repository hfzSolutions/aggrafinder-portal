
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupportMessages } from './SupportMessages';
import { ToolClaimRequests } from './ToolClaimRequests';

export function AdminMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Support & Feedback</h2>
        <p className="text-muted-foreground">
          Manage user support messages, feedback submissions, and tool claim requests.
        </p>
      </div>
      
      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Support Messages</TabsTrigger>
          <TabsTrigger value="claims">Tool Claims</TabsTrigger>
        </TabsList>
        <TabsContent value="messages">
          <SupportMessages />
        </TabsContent>
        <TabsContent value="claims">
          <ToolClaimRequests />
        </TabsContent>
      </Tabs>
    </div>
  );
}

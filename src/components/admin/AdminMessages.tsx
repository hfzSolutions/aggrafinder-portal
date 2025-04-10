
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SupportMessages } from './SupportMessages';
import { Youtube } from 'lucide-react';

export function AdminMessages() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Support & Feedback
        </h2>
        <p className="text-muted-foreground">
          Manage user support messages, feedback submissions, and YouTube demo submissions.
        </p>
      </div>

      <Tabs defaultValue="messages">
        <TabsList>
          <TabsTrigger value="messages">Support Messages</TabsTrigger>
          <TabsTrigger value="youtube" className="flex items-center gap-1">
            <Youtube className="h-4 w-4 text-red-500" />
            YouTube Demos
          </TabsTrigger>
        </TabsList>
        <TabsContent value="messages">
          <SupportMessages />
        </TabsContent>
        <TabsContent value="youtube">
          <div className="rounded-md border p-4">
            <h3 className="text-lg font-medium mb-2">YouTube Demo Submissions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage YouTube demo videos submitted by users.
            </p>
            <div className="bg-muted p-8 rounded-md flex items-center justify-center">
              <p className="text-muted-foreground">No YouTube demos have been submitted yet.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

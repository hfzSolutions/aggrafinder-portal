import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Copy, Check, Code2, Star } from 'lucide-react';
import { toast } from 'sonner';

interface ToolBadgeProps {
  toolId: string;
  toolName: string;
}

export const ToolBadge = ({ toolId, toolName }: ToolBadgeProps) => {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Use the VITE_SITE_URL environment variable if available, otherwise fallback to window.location.origin
  const baseUrl = import.meta.env.VITE_SITE_URL || window.location.origin;
  const toolUrl = `${baseUrl}/tools/${toolId}?utm_source=badge&utm_medium=referral&utm_campaign=tool_badge&utm_content=${encodeURIComponent(
    toolName
  )}`;

  const badgeHtml = `<a href="${toolUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-right:8px;text-decoration:none;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:300px;font-family:system-ui,-apple-system,sans-serif"><div style="display:flex;align-items:center;padding:10px;background:white"><div style="width:36px;height:36px;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-right:10px"><img src="${baseUrl}/images/web-logo.png" alt="Logo" style="width:30px;height:30px;object-fit:contain" /></div><div style="flex:1"><div style="font-size:12px;font-weight:500;color:#4b5563">LISTED ON</div><div style="font-size:16px;font-weight:700;color:#111827">DeepList AI</div></div><div style="color:#2563eb;margin-left:13px">★</div></div></a>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(badgeHtml);
    setCopied(true);
    toast.success('Badge code copied to clipboard');

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2 font-medium hover:bg-muted/80 transition-colors"
        onClick={() => setOpen(true)}
        title="Add this badge to your website"
      >
        <Code2 className="h-4 w-4" />
        Tool Badge
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tool Badge to Your Website</DialogTitle>
            <DialogDescription>
              Show visitors your tool is listed on DeepList AI
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4">
            <div className="rounded-lg border overflow-hidden">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-6 flex flex-col items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4 max-w-xs mx-auto">
                  <div className="flex items-center gap-3">
                    <div className="text-white rounded-lg w-10 h-10 flex items-center justify-center">
                      <img
                        src="/images/web-logo.png"
                        alt="Logo"
                        className="w-15 h-15 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-600">
                        LISTED ON
                      </div>
                      <div className="text-lg font-bold">DeepList AI</div>
                    </div>
                    <Star className="h-6 w-6 text-blue-600 fill-current ml-3" />
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Badge Preview
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  variant="default"
                  onClick={() => handleCopy()}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Badge Code
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

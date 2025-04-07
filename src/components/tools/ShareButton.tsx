
// Fix the import for AnalyticsAction
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';
import { toast } from 'sonner';

interface ShareButtonProps {
  toolId: string;
  toolName: string;
  toolUrl: string;
  className?: string;
}

const ShareButton = ({ toolId, toolName, toolUrl, className }: ShareButtonProps) => {
  const { trackToolAction } = useToolAnalytics();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    // Get the current URL or construct a URL to the tool
    const shareUrl = `${window.location.origin}/tools/${toolId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
        
        // Track the share action
        trackToolAction(toolId, "share_copy_link" as any);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast.error('Failed to copy link');
      });
  };

  const shareNative = () => {
    const shareUrl = `${window.location.origin}/tools/${toolId}`;
    if (navigator.share) {
      navigator.share({
        title: toolName,
        text: `Check out this AI tool: ${toolName}`,
        url: shareUrl,
      })
      .then(() => {
        // Track the share action
        trackToolAction(toolId, "share_native" as any);
      })
      .catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      copyLink();
    }
  };

  const shareTwitter = () => {
    const shareUrl = `${window.location.origin}/tools/${toolId}`;
    window.open(`https://twitter.com/intent/tweet?text=Check out ${toolName}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    trackToolAction(toolId, "share_twitter" as any);
  };

  const shareFacebook = () => {
    const shareUrl = `${window.location.origin}/tools/${toolId}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    trackToolAction(toolId, "share_facebook" as any);
  };

  const shareLinkedIn = () => {
    const shareUrl = `${window.location.origin}/tools/${toolId}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
    trackToolAction(toolId, "share_linkedin" as any);
  };

  const shareEmail = () => {
    const shareUrl = `${window.location.origin}/tools/${toolId}`;
    window.open(`mailto:?subject=Check out this AI tool: ${toolName}&body=I found this interesting AI tool: ${toolName}. Check it out here: ${shareUrl}`, '_blank');
    trackToolAction(toolId, "share_email" as any);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={copyLink}>
          Copy link
        </DropdownMenuItem>
        {navigator.share && (
          <DropdownMenuItem onClick={shareNative}>
            Share...
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={shareTwitter}>
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareFacebook}>
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareLinkedIn}>
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareEmail}>
          Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;

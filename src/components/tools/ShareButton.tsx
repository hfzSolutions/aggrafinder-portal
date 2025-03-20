import { useState } from 'react';
import {
  Share2,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';

interface ShareButtonProps {
  title: string;
  description: string;
  url: string;
  toolId?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

export const ShareButton = ({
  title,
  description,
  url,
  toolId,
  variant = 'outline',
  size = 'sm',
  showText = true,
  className = '',
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackEvent } = useToolAnalytics();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard');
      if (toolId) trackEvent(toolId, 'share_copy_link');
    } catch (error) {
      toast.error('Failed to copy link');
      console.error('Error copying link:', error);
    }
  };

  const handleShare = async (platform: string) => {
    let shareUrl = '';
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title,
              text: description,
              url,
            });
            toast.success('Shared successfully');
            if (toolId) trackEvent(toolId, 'share_native');
          } catch (error) {
            if (error instanceof Error && error.name !== 'AbortError') {
              toast.error('Failed to share');
              console.error('Error sharing:', error);
            }
          }
        } else {
          handleCopyLink();
        }
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        window.open(shareUrl, '_blank');
        if (toolId) trackEvent(toolId, 'share_twitter');
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(shareUrl, '_blank');
        if (toolId) trackEvent(toolId, 'share_facebook');
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`;
        window.open(shareUrl, '_blank');
        if (toolId) trackEvent(toolId, 'share_linkedin');
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        window.location.href = shareUrl;
        if (toolId) trackEvent(toolId, 'share_email');
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`transition-all hover:bg-secondary rounded-xl ${className}`}
        >
          <Share2 className="h-4 w-4" />
          {showText && <span className="ml-1">Share</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-2">
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer py-2"
          onClick={() => handleCopyLink()}
        >
          <Copy className="h-4 w-4" />
          <span>Copy link</span>
        </DropdownMenuItem>

        {navigator.share && (
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer py-2"
            onClick={() => handleShare('native')}
          >
            <Share2 className="h-4 w-4" />
            <span>Share via device</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer py-2"
          onClick={() => handleShare('twitter')}
        >
          <Twitter className="h-4 w-4" />
          <span>Share on Twitter</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer py-2"
          onClick={() => handleShare('facebook')}
        >
          <Facebook className="h-4 w-4" />
          <span>Share on Facebook</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer py-2"
          onClick={() => handleShare('linkedin')}
        >
          <Linkedin className="h-4 w-4" />
          <span>Share on LinkedIn</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer py-2"
          onClick={() => handleShare('email')}
        >
          <Mail className="h-4 w-4" />
          <span>Share via Email</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, CheckCircle, Twitter, Facebook, Linkedin, Mail, Link2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useToolAnalytics } from '@/hooks/useToolAnalytics';

export interface ShareButtonProps {
  toolId: string;
  toolName: string;
  toolUrl: string;
  className?: string;
  showText?: boolean;  // Make showText optional
}

const ShareButton = ({ 
  toolId, 
  toolName, 
  toolUrl, 
  className = '',
  showText = true  // Default value for showText
}: ShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { trackEvent } = useToolAnalytics();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
      trackEvent(toolId, 'share_copy_link');
    } catch (err) {
      toast.error('Failed to copy link');
      console.error('Failed to copy: ', err);
    }
  };

  const handleShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'native') => {
    let shareUrl = '';
    const text = `Check out ${toolName} - An AI tool I found`;
    const url = window.location.href;

    const analyticsAction = `share_${platform}` as 'share_twitter' | 'share_facebook' | 'share_linkedin' | 'share_email' | 'share_native';

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}: ${url}`)}`;
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: toolName,
            text: text,
            url: url,
          }).catch(err => console.error('Error sharing:', err));
        }
        break;
    }

    // Track the share event
    trackEvent(toolId, analyticsAction);

    if (shareUrl && platform !== 'native') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      handleShare('native');
    } else {
      // Fallback - open the dropdown
      setIsOpen(true);
    }
  };

  // If browser supports Web Share API and we're on mobile, use native share
  const canUseNativeShare = typeof navigator !== 'undefined' && 
                            navigator.share && 
                            window.innerWidth < 768;

  if (canUseNativeShare) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        className={className}
        onClick={handleNativeShare}
      >
        <Share2 className="h-4 w-4 mr-2" />
        {showText && "Share"}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={className}
        >
          <Share2 className="h-4 w-4 mr-2" />
          {showText && "Share"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => handleShare('twitter')}>
          <Twitter className="h-4 w-4 mr-2" />
          Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('facebook')}>
          <Facebook className="h-4 w-4 mr-2" />
          Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('linkedin')}>
          <Linkedin className="h-4 w-4 mr-2" />
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleCopyLink}>
          <Link2 className="h-4 w-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareButton;

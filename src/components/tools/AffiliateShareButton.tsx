
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAffiliate } from '@/hooks/useAffiliate';
import { trackEvent } from '@/utils/analytics';

interface AffiliateShareButtonProps {
  toolId: string;
  toolName: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AffiliateShareButton({
  toolId,
  toolName,
  className,
  variant = 'outline',
  size = 'sm',
}: AffiliateShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { affiliateData, fetchAffiliateData } = useAffiliate();
  
  useEffect(() => {
    if (isOpen && !affiliateData) {
      fetchAffiliateData();
      setLoading(false);
    }
  }, [isOpen, affiliateData]);

  const generateAffiliateLink = () => {
    if (!affiliateData) return '';
    
    const baseUrl = window.location.origin;
    return `${baseUrl}/tools/${toolId}?ref=${affiliateData.affiliateCode}`;
  };

  const copyToClipboard = () => {
    const affiliateLink = generateAffiliateLink();
    navigator.clipboard.writeText(affiliateLink)
      .then(() => {
        toast.success('Affiliate link copied to clipboard');
        trackEvent('affiliate', 'share', toolName);
        setIsOpen(false);
      })
      .catch(() => {
        toast.error('Failed to copy affiliate link');
      });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Share2 className="h-4 w-4 mr-2" />
          Share as Affiliate
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4">
        {!affiliateData ? (
          <div className="space-y-3 text-center">
            <h3 className="font-medium">Become an Affiliate</h3>
            <p className="text-sm text-muted-foreground">
              Join our affiliate program to earn rewards when sharing AI tools
            </p>
            <Button 
              variant="default" 
              className="w-full"
              asChild
            >
              <a href="/dashboard?tab=affiliate">Become an Affiliate</a>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <h3 className="font-medium mb-1">Your Affiliate Link</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Share this link to earn rewards
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Input 
                value={generateAffiliateLink()}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

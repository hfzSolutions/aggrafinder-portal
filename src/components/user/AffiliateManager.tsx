
import { useState, useEffect } from 'react';
import { useAffiliate } from '@/hooks/useAffiliate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Copy, DollarSign, ExternalLink, Gift, Info, Mail, Percent, Share2, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/utils/analytics';

type AffiliateClickData = {
  id: string;
  toolId: string;
  toolName: string;
  createdAt: string;
  converted: boolean;
  conversionValue: number | null;
};

export function AffiliateManager() {
  const { 
    affiliateData, 
    isLoading, 
    isCreating, 
    fetchAffiliateData, 
    createAffiliateAccount,
    updateAffiliateSettings 
  } = useAffiliate();
  
  const [clicksData, setClicksData] = useState<AffiliateClickData[]>([]);
  const [loadingClicks, setLoadingClicks] = useState(false);
  const [paymentEmail, setPaymentEmail] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  useEffect(() => {
    if (affiliateData?.paymentEmail) {
      setPaymentEmail(affiliateData.paymentEmail);
    }
    
    if (affiliateData?.id) {
      fetchAffiliateClicks();
    }
  }, [affiliateData]);

  const fetchAffiliateClicks = async () => {
    if (!affiliateData?.id) return;
    
    try {
      setLoadingClicks(true);
      
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select(`
          id,
          tool_id,
          created_at,
          converted,
          conversion_value,
          ai_tools (name)
        `)
        .eq('affiliate_id', affiliateData.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        const transformedData: AffiliateClickData[] = data.map((item) => ({
          id: item.id,
          toolId: item.tool_id,
          toolName: item.ai_tools?.name || 'Unknown Tool',
          createdAt: item.created_at,
          converted: item.converted,
          conversionValue: item.conversion_value,
        }));
        
        setClicksData(transformedData);
      }
    } catch (error) {
      console.error('Error fetching affiliate clicks:', error);
    } finally {
      setLoadingClicks(false);
    }
  };

  const copyAffiliateLink = (toolId?: string) => {
    if (!affiliateData) return;
    
    const baseUrl = window.location.origin;
    const url = toolId 
      ? `${baseUrl}/tools/${toolId}?ref=${affiliateData.affiliateCode}`
      : `${baseUrl}?ref=${affiliateData.affiliateCode}`;
      
    navigator.clipboard.writeText(url)
      .then(() => {
        toast.success('Affiliate link copied to clipboard');
        trackEvent('affiliate', 'copy_link', affiliateData.affiliateCode);
      })
      .catch(() => {
        toast.error('Failed to copy affiliate link');
      });
  };
  
  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    const success = await updateAffiliateSettings(paymentEmail || null);
    setIsUpdating(false);
    
    if (success) {
      trackEvent('affiliate', 'update_settings', affiliateData?.affiliateCode);
    }
  };

  const getClickCount = () => {
    return clicksData.length;
  };
  
  const getConversionCount = () => {
    return clicksData.filter(click => click.converted).length;
  };
  
  const getConversionRate = () => {
    const clicks = getClickCount();
    const conversions = getConversionCount();
    
    if (clicks === 0) return '0%';
    
    return `${Math.round((conversions / clicks) * 100)}%`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // User doesn't have an affiliate account yet
  if (!affiliateData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="mr-2 h-5 w-5" />
            Become an Affiliate
          </CardTitle>
          <CardDescription>
            Share AI tools and earn rewards when visitors use your affiliate links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Earn rewards</AlertTitle>
            <AlertDescription>
              Join our affiliate program to earn rewards when users discover AI tools through your custom affiliate links.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <Share2 className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Share Links</h3>
              <p className="text-sm text-muted-foreground">Get your unique affiliate links for any AI tool</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Track Engagement</h3>
              <p className="text-sm text-muted-foreground">Monitor clicks and conversions in real time</p>
            </div>
            <div className="flex flex-col items-center text-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mb-2 text-primary" />
              <h3 className="font-medium">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">Receive payments for successful referrals</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={createAffiliateAccount} disabled={isCreating}>
            {isCreating ? 'Creating Account...' : 'Become an Affiliate'}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="links">Affiliate Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getClickCount()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getConversionRate()}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${affiliateData.earnings.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Affiliate Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {affiliateData.affiliateCode}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyAffiliateLink()}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Clicks</CardTitle>
              <CardDescription>
                Track user engagement with your affiliate links
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingClicks ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : clicksData.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Share2 className="h-8 w-8 mx-auto mb-2" />
                  <p>No clicks yet. Share your affiliate links to start earning!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Tool</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clicksData.map((click) => (
                        <TableRow key={click.id}>
                          <TableCell>
                            {new Date(click.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{click.toolName}</TableCell>
                          <TableCell>
                            {click.converted ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Converted
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Clicked
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {click.converted && click.conversionValue
                              ? `$${click.conversionValue.toFixed(2)}`
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="links" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Affiliate Links</CardTitle>
              <CardDescription>
                Share these links to earn rewards when users visit through them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Main Site Link</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={`${window.location.origin}?ref=${affiliateData.affiliateCode}`}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyAffiliateLink()}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Share this link to the main page of our website
                </p>
              </div>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Visit any AI tool page and use the "Share as Affiliate" button to get a 
                  tool-specific affiliate link.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">How to use affiliate links</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm">
                    <div className="min-w-[20px] mt-0.5">1.</div>
                    <div>Copy your affiliate link</div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="min-w-[20px] mt-0.5">2.</div>
                    <div>Share it on social media, blogs, emails, etc.</div>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <div className="min-w-[20px] mt-0.5">3.</div>
                    <div>When users click your link, you'll earn rewards for their engagement</div>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your affiliate account preferences and payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="affiliateCode">Your Affiliate Code</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="affiliateCode"
                    value={affiliateData.affiliateCode}
                    readOnly
                    className="font-mono"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(affiliateData.affiliateCode);
                      toast.success('Affiliate code copied');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentEmail">Payment Email</Label>
                <Input 
                  id="paymentEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={paymentEmail}
                  onChange={(e) => setPaymentEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  We'll use this email for sending payment for your affiliate earnings
                </p>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleUpdateSettings} 
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Affiliate Program Details</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Percent className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Earn rewards for each user who visits through your affiliate link
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      Payments are processed monthly for accounts with a minimum balance of $50
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ExternalLink className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <p>
                      For more details about our affiliate program, please contact our support team
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

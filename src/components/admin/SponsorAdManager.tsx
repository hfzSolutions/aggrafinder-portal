import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { SponsorAdCard } from '../tools/SponsorAdCard';

interface SponsorAd {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  link_text: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SponsorAdManager() {
  const [ads, setAds] = useState<SponsorAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<SponsorAd | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('Learn More');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isActive, setIsActive] = useState(true);

  // Preview state
  const [previewAd, setPreviewAd] = useState<SponsorAd | null>(null);

  // Fetch ads
  const fetchAds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsor_ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAds(data || []);
    } catch (error) {
      console.error('Error fetching sponsor ads:', error);
      toast.error('Failed to load sponsor ads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setLinkText('Learn More');
    setStartDate(new Date());
    setEndDate(new Date());
    setIsActive(true);
    setEditingAd(null);
  };

  // Open dialog for creating a new ad
  const handleCreateAd = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open dialog for editing an existing ad
  const handleEditAd = (ad: SponsorAd) => {
    setEditingAd(ad);
    setTitle(ad.title);
    setDescription(ad.description);
    setImageUrl(ad.image_url);
    setLink(ad.link);
    setLinkText(ad.link_text);
    setStartDate(ad.start_date ? new Date(ad.start_date) : new Date());
    setEndDate(ad.end_date ? new Date(ad.end_date) : new Date());
    setIsActive(ad.is_active);
    setDialogOpen(true);
  };

  // Preview an ad
  const handlePreviewAd = (ad: SponsorAd) => {
    setPreviewAd(ad);
    setPreviewDialogOpen(true);
  };

  // Check for date range overlaps with existing ads
  const checkDateOverlap = (start: Date, end: Date, currentAdId?: string) => {
    // Filter out the current ad being edited (if any)
    const otherAds = currentAdId
      ? ads.filter((ad) => ad.id !== currentAdId)
      : ads;

    // Check for overlaps with any other ad
    const overlappingAd = otherAds.find((ad) => {
      const adStart = new Date(ad.start_date);
      const adEnd = new Date(ad.end_date);

      // Check if date ranges overlap
      return (
        (start <= adEnd && end >= adStart) || (adStart <= end && adEnd >= start)
      );
    });

    return overlappingAd;
  };

  // Save ad (create or update)
  const handleSaveAd = async () => {
    try {
      if (
        !title ||
        !description ||
        !imageUrl ||
        !link ||
        !linkText ||
        !startDate ||
        !endDate
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate dates
      if (startDate > endDate) {
        toast.error('Start date must be before end date');
        return;
      }

      // Check for overlapping date ranges
      const overlappingAd = checkDateOverlap(startDate, endDate, editingAd?.id);

      if (overlappingAd) {
        toast.error(
          `Date range overlaps with existing ad: ${overlappingAd.title}`
        );
        return;
      }

      const adData = {
        title,
        description,
        image_url: imageUrl,
        link,
        link_text: linkText,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_active: isActive,
        updated_at: new Date().toISOString(),
      };

      let result;

      if (editingAd) {
        // Update existing ad
        result = await supabase
          .from('sponsor_ads')
          .update(adData)
          .eq('id', editingAd.id);

        if (result.error) throw result.error;
        toast.success('Sponsor ad updated successfully');
      } else {
        // Create new ad
        result = await supabase.from('sponsor_ads').insert([adData]);

        if (result.error) throw result.error;
        toast.success('Sponsor ad created successfully');
      }

      // Close dialog and refresh ads
      setDialogOpen(false);
      fetchAds();
    } catch (error) {
      console.error('Error saving sponsor ad:', error);
      toast.error('Failed to save sponsor ad');
    }
  };

  // Delete ad
  const handleDeleteAd = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sponsor ad?')) return;

    try {
      const { error } = await supabase
        .from('sponsor_ads')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Sponsor ad deleted successfully');
      fetchAds();
    } catch (error) {
      console.error('Error deleting sponsor ad:', error);
      toast.error('Failed to delete sponsor ad');
    }
  };

  // Toggle ad active status
  const handleToggleActive = async (ad: SponsorAd) => {
    try {
      const { error } = await supabase
        .from('sponsor_ads')
        .update({
          is_active: !ad.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ad.id);

      if (error) throw error;

      toast.success(
        `Sponsor ad ${ad.is_active ? 'deactivated' : 'activated'} successfully`
      );
      fetchAds();
    } catch (error) {
      console.error('Error toggling sponsor ad status:', error);
      toast.error('Failed to update sponsor ad status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsor Ads</CardTitle>
        <CardDescription>
          Manage promotional ads that appear in the tools listing.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <Button onClick={handleCreateAd}>
            <Plus className="h-4 w-4 mr-2" /> Add New Ad
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sponsor ads found. Create your first ad to get started.
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => {
                  const isActive =
                    ad.is_active &&
                    new Date(ad.start_date) <= new Date() &&
                    new Date(ad.end_date) >= new Date();

                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>
                        {isActive ? (
                          <Badge
                            variant="success"
                            className="bg-green-100 text-green-800"
                          >
                            Active
                          </Badge>
                        ) : ad.is_active ? (
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800"
                          >
                            Scheduled
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-800"
                          >
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(ad.start_date), 'MMM d, yyyy')} -{' '}
                        {format(new Date(ad.end_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePreviewAd(ad)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAd(ad)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(ad)}
                          >
                            {ad.is_active ? (
                              <span className="text-xs">Disable</span>
                            ) : (
                              <span className="text-xs">Enable</span>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAd(ad.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Ad Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'Edit Sponsor Ad' : 'Create Sponsor Ad'}
              </DialogTitle>
              <DialogDescription>
                {editingAd
                  ? 'Update the details of this sponsor ad.'
                  : 'Create a new sponsor ad to display in the tools listing.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Premium AI Solution"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Boost your productivity with our cutting-edge AI tools..."
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder=""
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com/sponsor"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Learn More"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        {startDate ? (
                          format(startDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        {endDate ? (
                          format(endDate, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isActive" className="text-sm font-normal">
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAd}>
                {editingAd ? 'Update Ad' : 'Create Ad'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ad Preview</DialogTitle>
              <DialogDescription>
                This is how the ad will appear in the tools listing.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {previewAd && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Grid View</h3>
                    <SponsorAdCard viewType="grid" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">List View</h3>
                    <SponsorAdCard viewType="list" />
                  </div>
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      List View (Compact)
                    </h3>
                    <SponsorAdCard viewType="list" compact />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

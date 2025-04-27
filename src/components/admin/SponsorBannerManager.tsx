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

interface SponsorBanner {
  id: string;
  message: string;
  link: string;
  link_text: string;
  background_color: string;
  text_color: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function SponsorBannerManager() {
  const [banners, setBanners] = useState<SponsorBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<SponsorBanner | null>(
    null
  );

  // Form state
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [linkText, setLinkText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('bg-primary');
  const [textColor, setTextColor] = useState('text-primary-foreground');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  // Preview state
  const [previewBanner, setPreviewBanner] = useState<SponsorBanner | null>(
    null
  );

  // Background color options
  const backgroundOptions = [
    { value: 'bg-primary', label: 'Primary' },
    { value: 'bg-secondary', label: 'Secondary' },
    { value: 'bg-accent', label: 'Accent' },
    { value: 'bg-destructive', label: 'Destructive' },
    { value: 'bg-muted', label: 'Muted' },
    { value: 'bg-black', label: 'Black' },
    { value: 'bg-blue-500', label: 'Blue' },
    { value: 'bg-green-500', label: 'Green' },
    { value: 'bg-red-500', label: 'Red' },
    { value: 'bg-yellow-500', label: 'Yellow' },
    { value: 'bg-purple-500', label: 'Purple' },
  ];

  // Text color options
  const textOptions = [
    { value: 'text-primary-foreground', label: 'Primary Foreground' },
    { value: 'text-secondary-foreground', label: 'Secondary Foreground' },
    { value: 'text-accent-foreground', label: 'Accent Foreground' },
    { value: 'text-destructive-foreground', label: 'Destructive Foreground' },
    { value: 'text-muted-foreground', label: 'Muted Foreground' },
    { value: 'text-white', label: 'White' },
    { value: 'text-black', label: 'Black' },
  ];

  // Fetch banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sponsor_banners')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching sponsor banners:', error);
      toast.error('Failed to load sponsor banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Reset form
  const resetForm = () => {
    setMessage('');
    setLink('');
    setLinkText('');
    setBackgroundColor('bg-primary');
    setTextColor('text-primary-foreground');
    setStartDate(new Date());
    setEndDate(new Date());
    setEditingBanner(null);
  };

  // Open dialog for creating a new banner
  const handleCreateBanner = () => {
    resetForm();
    setDialogOpen(true);
  };

  // Open dialog for editing an existing banner
  const handleEditBanner = (banner: SponsorBanner) => {
    setEditingBanner(banner);
    setMessage(banner.message);
    setLink(banner.link);
    setLinkText(banner.link_text);
    setBackgroundColor(banner.background_color);
    setTextColor(banner.text_color);
    setStartDate(banner.start_date ? new Date(banner.start_date) : new Date());
    setEndDate(banner.end_date ? new Date(banner.end_date) : new Date());
    setDialogOpen(true);
  };

  // Preview a banner
  const handlePreviewBanner = (banner: SponsorBanner) => {
    setPreviewBanner(banner);
    setPreviewDialogOpen(true);
  };

  // Check for date range overlaps with existing banners
  const checkDateOverlap = (
    start: Date,
    end: Date,
    currentBannerId?: string
  ) => {
    // Filter out the current banner being edited (if any)
    const otherBanners = currentBannerId
      ? banners.filter((banner) => banner.id !== currentBannerId)
      : banners;

    // Check for overlaps with any other banner
    const overlappingBanner = otherBanners.find((banner) => {
      const bannerStart = new Date(banner.start_date);
      const bannerEnd = new Date(banner.end_date);

      // Check if date ranges overlap
      // Two date ranges overlap if one range's start date is before or equal to the other range's end date
      // AND one range's end date is after or equal to the other range's start date
      return (
        (start <= bannerEnd && end >= bannerStart) ||
        (bannerStart <= end && bannerEnd >= start)
      );
    });

    return overlappingBanner;
  };

  // Save banner (create or update)
  const handleSaveBanner = async () => {
    try {
      if (!message || !link || !linkText || !startDate || !endDate) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (startDate > endDate) {
        toast.error('Start date must be before end date');
        return;
      }

      // Check for date range overlaps
      const overlappingBanner = checkDateOverlap(
        startDate,
        endDate,
        editingBanner?.id
      );

      if (overlappingBanner) {
        const overlapStart = new Date(
          overlappingBanner.start_date
        ).toLocaleDateString();
        const overlapEnd = new Date(
          overlappingBanner.end_date
        ).toLocaleDateString();

        toast.error(
          `Date range overlaps with existing banner: "${overlappingBanner.message}" (${overlapStart} - ${overlapEnd})`
        );
        return;
      }

      const bannerData = {
        message,
        link,
        link_text: linkText,
        background_color: backgroundColor,
        text_color: textColor,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from('sponsor_banners')
          .update(bannerData)
          .eq('id', editingBanner.id);

        if (error) throw error;
        toast.success('Banner updated successfully');
      } else {
        // Create new banner
        const { error } = await supabase
          .from('sponsor_banners')
          .insert(bannerData);

        if (error) throw error;
        toast.success('Banner created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  // Delete banner
  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('sponsor_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Banner deleted successfully');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Failed to delete banner');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Sponsor Banners</CardTitle>
          <CardDescription>
            Manage sponsor banners that appear at the top of the site
          </CardDescription>
        </div>
        <Button onClick={handleCreateBanner}>
          <Plus className="mr-2 h-4 w-4" /> Add Banner
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sponsor banners found. Create one to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Colors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => (
                <TableRow key={banner.id}>
                  <TableCell className="font-medium">
                    {banner.message}
                  </TableCell>
                  <TableCell>
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {banner.link_text}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>
                        {new Date(banner.start_date).toLocaleDateString()} -{' '}
                      </div>
                      <div>
                        {new Date(banner.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-4 h-4 rounded ${banner.background_color}`}
                      ></div>
                      <span>/</span>
                      <div
                        className={`w-4 h-4 rounded border ${banner.text_color.replace(
                          'text-',
                          'bg-'
                        )}`}
                      ></div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(banner.start_date) <= new Date() &&
                    new Date(banner.end_date) >= new Date() ? (
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                    ) : new Date(banner.start_date) > new Date() ? (
                      <Badge
                        variant="outline"
                        className="text-yellow-500 border-yellow-500"
                      >
                        Scheduled
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        Expired
                      </Badge>
                    )}

                    {/* Check for date overlaps with other banners */}
                    {banners.some(
                      (otherBanner) =>
                        otherBanner.id !== banner.id &&
                        ((new Date(banner.start_date) <=
                          new Date(otherBanner.end_date) &&
                          new Date(banner.end_date) >=
                            new Date(otherBanner.start_date)) ||
                          (new Date(otherBanner.start_date) <=
                            new Date(banner.end_date) &&
                            new Date(otherBanner.end_date) >=
                              new Date(banner.start_date)))
                    ) && (
                      <Badge
                        variant="outline"
                        className="ml-2 bg-red-100 text-red-800 border-red-300"
                      >
                        Overlap
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePreviewBanner(banner)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditBanner(banner)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBanner(banner.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Create/Edit Banner Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? 'Edit Banner' : 'Create Banner'}
              </DialogTitle>
              <DialogDescription>
                {editingBanner
                  ? 'Update the sponsor banner details'
                  : 'Add a new sponsor banner to the site'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="This site is sponsored by our partners"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="link">Link URL</Label>
                <Input
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="linkText">Link Text</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Learn more"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <Select
                  value={backgroundColor}
                  onValueChange={setBackgroundColor}
                >
                  <SelectTrigger id="backgroundColor">
                    <SelectValue placeholder="Select background color" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded mr-2 ${option.value}`}
                          ></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="textColor">Text Color</Label>
                <Select value={textColor} onValueChange={setTextColor}>
                  <SelectTrigger id="textColor">
                    <SelectValue placeholder="Select text color" />
                  </SelectTrigger>
                  <SelectContent>
                    {textOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded mr-2 border ${option.value.replace(
                              'text-',
                              'bg-'
                            )}`}
                          ></div>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
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
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
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

              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Banners are automatically activated based on their date range.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveBanner}>
                {editingBanner ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Banner Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Banner Preview</DialogTitle>
            </DialogHeader>
            {previewBanner && (
              <div
                className={`w-full ${previewBanner.background_color} ${previewBanner.text_color} py-2 px-4 rounded`}
              >
                <div className="flex items-center justify-center space-x-4 text-center">
                  <p className="text-sm font-medium">{previewBanner.message}</p>
                  <a
                    href={previewBanner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold underline underline-offset-2"
                  >
                    {previewBanner.link_text}
                  </a>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

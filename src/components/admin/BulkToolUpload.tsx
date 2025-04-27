import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, AlertCircle } from 'lucide-react';
import { useSupabaseAdmin } from '@/hooks/useSupabaseAdmin';
import { AITool } from '@/types/tools';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface BulkToolUploadProps {
  onSuccess: () => void;
  categories: { id: number; name: string }[];
}

interface ToolUploadData {
  name: string;
  description: string;
  tagline?: string;
  url: string;
  youtubeUrl?: string;
  category: string[];
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Free Trial';
  // Other fields will be set with defaults
}

export function BulkToolUpload({ onSuccess, categories }: BulkToolUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [parsedTools, setParsedTools] = useState<ToolUploadData[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const { bulkSubmitTools, loading } = useSupabaseAdmin();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if file is CSV
      if (!selectedFile.name.endsWith('.csv')) {
        toast.error('Please upload a CSV file');
        return;
      }
      setFile(selectedFile);
      setValidationErrors([]);
      setParsedTools([]);
      setPreviewMode(false);
    }
  };

  const validateToolData = (
    data: any,
    rowIndex: number
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!data.name) errors.push(`Row ${rowIndex}: Name is required`);
    if (!data.description)
      errors.push(`Row ${rowIndex}: Description is required`);
    if (!data.url) errors.push(`Row ${rowIndex}: URL is required`);

    // URL validation
    if (data.url && !/^https?:\/\/.+/.test(data.url)) {
      errors.push(
        `Row ${rowIndex}: URL must be a valid URL starting with http:// or https://`
      );
    }

    // YouTube URL validation (if provided)
    if (
      data.youtubeUrl &&
      !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/.test(data.youtubeUrl)
    ) {
      errors.push(`Row ${rowIndex}: YouTube URL must be a valid YouTube URL`);
    }

    // Category validation
    if (
      !data.category ||
      !Array.isArray(data.category) ||
      data.category.length === 0
    ) {
      errors.push(`Row ${rowIndex}: At least one category is required`);
    } else {
      // Check if categories exist
      const categoryNames = categories.map((c) => c.name);
      const invalidCategories = data.category.filter(
        (c: string) => !categoryNames.includes(c)
      );
      if (invalidCategories.length > 0) {
        errors.push(
          `Row ${rowIndex}: Invalid categories: ${invalidCategories.join(', ')}`
        );
      }
    }

    // Pricing validation
    const validPricing = ['Free', 'Freemium', 'Paid', 'Free Trial'];
    if (data.pricing && !validPricing.includes(data.pricing)) {
      errors.push(
        `Row ${rowIndex}: Pricing must be one of: ${validPricing.join(', ')}`
      );
    }
    console.log('Bulk Item', data);
    return { isValid: errors.length === 0, errors };
  };

  // Function to parse CSV properly handling quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // Add the last value
    result.push(currentValue.trim());

    // Remove quotes from values
    return result.map((value) => {
      if (value.startsWith('"') && value.endsWith('"')) {
        return value.substring(1, value.length - 1).trim();
      }
      return value.trim();
    });
  };

  const parseCSV = async () => {
    if (!file) return;

    setIsUploading(true);
    setValidationErrors([]);

    try {
      const text = await file.text();
      const rows = text.split('\n');
      const headers = parseCSVLine(rows[0]);

      // Validate headers
      const requiredHeaders = ['name', 'description', 'url'];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h)
      );

      if (missingHeaders.length > 0) {
        setValidationErrors([
          `Missing required headers: ${missingHeaders.join(', ')}`,
        ]);
        setIsUploading(false);
        return;
      }

      const tools: ToolUploadData[] = [];
      const allErrors: string[] = [];

      // Parse each row
      for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue; // Skip empty rows

        const values = parseCSVLine(rows[i]);
        const tool: any = {};

        // Map CSV values to tool properties
        headers.forEach((header, index) => {
          if (header === 'category') {
            // Handle category as array
            tool[header] = values[index]
              ? values[index].split(';').map((c: string) => c.trim())
              : [];
          } else {
            tool[header] = values[index] || '';
          }
        });

        // Set defaults for missing fields
        if (!tool.tagline) tool.tagline = '';
        if (!tool.pricing) tool.pricing = 'Free';

        // Validate the tool data
        const { isValid, errors } = validateToolData(tool, i);
        if (!isValid) {
          allErrors.push(...errors);
        } else {
          tools.push(tool as ToolUploadData);
        }

        // Update progress
        setUploadProgress(Math.floor((i / (rows.length - 1)) * 100));
      }

      if (allErrors.length > 0) {
        setValidationErrors(allErrors);
      } else if (tools.length === 0) {
        setValidationErrors(['No valid tools found in the CSV file']);
      } else {
        setParsedTools(tools);
        setPreviewMode(true);
        toast.success(`Successfully parsed ${tools.length} tools`);
      }
    } catch (error) {
      console.error('Error parsing CSV:', error);
      setValidationErrors(['Error parsing CSV file. Please check the format.']);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    if (parsedTools.length === 0) {
      toast.error('No tools to upload');
      return;
    }

    setIsUploading(true);

    try {
      // Convert to the format expected by the API
      const toolsData = parsedTools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        tagline: tool.tagline,
        url: tool.url,
        youtube_url: tool.youtubeUrl,
        category: tool.category,
        pricing: tool.pricing,
        featured: false,
        tags: [],
      }));

      const { success, error, count } = await bulkSubmitTools(toolsData);

      if (!success) throw new Error(error);

      if (error && count === 0) {
        toast.info(error);
      } else if (error) {
        toast.success(`${error}`);
      } else {
        toast.success(`Successfully uploaded ${count} tools`);
      }
      setFile(null);
      setParsedTools([]);
      setPreviewMode(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error uploading tools:', error);
      toast.error(error.message || 'Failed to upload tools');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="csv-file">Upload CSV File</Label>
        <Input
          id="csv-file"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <p className="text-sm text-muted-foreground">
          Upload a CSV file with the following headers: name, description,
          tagline (optional), url, youtubeUrl (optional), category
          (semicolon-separated), pricing (optional)
        </p>
      </div>

      {file && !previewMode && (
        <Button
          onClick={parseCSV}
          disabled={isUploading || !file}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing... {uploadProgress}%
            </>
          ) : (
            <>Validate & Preview</>
          )}
        </Button>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation Errors</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {previewMode && parsedTools.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Preview ({parsedTools.length} tools)
          </h3>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Tagline</th>
                  <th className="p-2 text-left">URL</th>
                  <th className="p-2 text-left">YouTube URL</th>
                  <th className="p-2 text-left">Categories</th>
                  <th className="p-2 text-left">Pricing</th>
                </tr>
              </thead>
              <tbody>
                {parsedTools.slice(0, 5).map((tool, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{tool.name}</td>
                    <td className="p-2">
                      {tool.description.length > 30
                        ? `${tool.description.substring(0, 30)}...`
                        : tool.description}
                    </td>
                    <td className="p-2">{tool.tagline || '-'}</td>
                    <td className="p-2">{tool.url}</td>
                    <td className="p-2">{tool.youtubeUrl || '-'}</td>
                    <td className="p-2">{tool.category.join(', ')}</td>
                    <td className="p-2">{tool.pricing}</td>
                  </tr>
                ))}
                {parsedTools.length > 5 && (
                  <tr className="border-t">
                    <td
                      colSpan={7} // Updated colspan for the new column
                      className="p-2 text-center text-muted-foreground"
                    >
                      ... and {parsedTools.length - 5} more tools
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={loading || parsedTools.length === 0}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {parsedTools.length} Tools
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

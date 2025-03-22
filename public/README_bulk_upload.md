# Bulk Tool Upload Guide

This guide explains how to use the sample CSV file for bulk uploading AI tools to the Aggrafinder Portal.

## CSV Format

The `sample_bulk_upload.csv` file in this directory provides a template with example data for bulk uploading tools. The CSV file must include the following headers:

### Required Fields

- **name**: The name of the AI tool
- **description**: A detailed description of the tool
- **url**: The website URL of the tool (must start with http:// or https://)
- **category**: One or more categories separated by semicolons (;)

### Optional Fields

- **imageUrl**: URL to the tool's image (must start with http:// or https://). If not provided, a placeholder image will be used.
- **pricing**: Must be one of: "Free", "Freemium", "Paid", or "Free Trial". Defaults to "Free" if not specified.
- **featured**: Set to "true" or "false" to indicate if the tool should be featured. Defaults to "false" if not specified.
- **tags**: Keywords related to the tool, separated by semicolons (;)

## Special Formatting Notes

1. **Categories and Tags**: Multiple values must be separated by semicolons (;) without spaces, e.g., `AI Assistant;Natural Language Processing`
2. **Featured**: Use the string "true" or "false" (lowercase)
3. **URLs**: All URLs must include the protocol (http:// or https://)

## Example

The sample CSV includes examples of different AI tools with various configurations. You can use this as a reference for formatting your own bulk upload file.

## Upload Process

1. Prepare your CSV file following the format in the sample
2. Navigate to the Admin Dashboard
3. Click on "Bulk Tool Upload"
4. Select your CSV file
5. Click "Validate & Preview" to check for any errors
6. If validation passes, review the preview and click "Upload" to complete the process

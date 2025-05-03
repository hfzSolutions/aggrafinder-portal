# Email Notifications with Resend

This integration enables email notifications for various events in the AggraFinder portal, such as when an admin approves a tool submission.

## Setup

1. Sign up for a [Resend](https://resend.com) account
2. Create an API key in the Resend dashboard
3. Add the API key to your `.env` file:
   ```
   VITE_RESEND_API_KEY=your_resend_api_key
   ```
4. Install the Resend package:
   ```bash
   npm install resend
   ```

## Usage

The email service is implemented in `client.ts` and provides functions for sending different types of notification emails:

### Tool Approval Notification

Sends an email to a user when their tool submission is approved by an admin:

```typescript
import { sendToolApprovalEmail } from '@/integrations/resend/client';

// Send notification email
await sendToolApprovalEmail('user@example.com', 'My Amazing AI Tool');
```

## Email Templates

Email templates are currently defined inline in the `client.ts` file. For more complex templates, consider moving them to separate HTML files in an `email-templates` directory.

## Adding New Email Types

To add a new type of email notification:

1. Create a new function in `client.ts` following the pattern of existing functions
2. Design your email template with HTML
3. Call the function from the appropriate place in your application

## Troubleshooting

- Check the console for error messages if emails aren't being sent
- Verify your Resend API key is correctly set in the `.env` file
- Make sure the recipient email address is valid

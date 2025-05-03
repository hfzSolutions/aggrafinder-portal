import { Resend } from 'resend';

// Initialize Resend with API key
const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
const resend = new Resend(resendApiKey);

/**
 * Send a notification email to a user when their tool submission is approved
 * @param to Recipient email address
 * @param toolName Name of the approved tool
 */
export const sendToolApprovalEmail = async (
  to: string,
  toolName: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!resendApiKey) {
      console.error('Resend API key is not configured');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: 'AggraFinder <notifications@aggrafinder.com>',
      to,
      subject: `Your Tool "${toolName}" Has Been Approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4f46e5;">Good News!</h1>
          <p>Your tool submission <strong>${toolName}</strong> has been approved and is now live on AggraFinder!</p>
          <p>Your tool is now visible to all users and can be found in our directory.</p>
          <p>Thank you for contributing to the AggraFinder community!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
            <p style="font-size: 12px; color: #666;">© ${new Date().getFullYear()} AggraFinder. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending approval email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending approval email:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
};

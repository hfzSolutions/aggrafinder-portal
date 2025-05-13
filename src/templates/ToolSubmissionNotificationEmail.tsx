import React from 'react';

interface ToolSubmissionNotificationEmailProps {
  toolName: string;
  submitterName: string;
  toolUrl: string;
  siteUrl: string;
  adminDashboardUrl: string;
}

export const ToolSubmissionNotificationEmailTemplate = ({
  toolName,
  submitterName,
  toolUrl,
  siteUrl,
  adminDashboardUrl,
}: ToolSubmissionNotificationEmailProps) => {
  const logoUrl = `${siteUrl}/images/web-logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Tool Submission on DeepList AI</title>
    <style type="text/css">
      /* Base styles */
      body,
      html {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        color: #333333;
        line-height: 1.6;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
      }
      .header {
        text-align: center;
        padding: 20px 0;
        border-bottom: 1px solid #eeeeee;
      }
      .logo {
        max-width: 180px;
        height: auto;
      }
      .content {
        padding: 30px 20px;
        background-color: #ffffff;
      }
      .footer {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #888888;
        border-top: 1px solid #eeeeee;
      }
      h1 {
        color: #333333;
        font-size: 24px;
        margin: 0 0 20px 0;
        font-weight: bold;
      }
      p {
        margin: 0 0 20px 0;
        font-size: 16px;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #2563eb;
        color: #ffffff !important;
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        margin: 20px 0;
        text-align: center;
      }
      .button:hover {
        background-color: #2563eb;
      }
      .info-box {
        background-color: #f9fafb;
        border-radius: 4px;
        padding: 15px;
        margin: 20px 0;
        border-left: 4px solid #2563eb;
      }
      .help-text {
        font-size: 14px;
        color: #666666;
      }
      .link-fallback {
        word-break: break-all;
        color: #2563eb;
        font-size: 14px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img
          src="${logoUrl}"
          alt="DeepList AI"
          class="logo"
        />
      </div>

      <div class="content">
        <h1>New Tool Submission</h1>

        <p>Hello Admin,</p>

        <p>
          A new tool <strong>${toolName}</strong> has been submitted by ${submitterName} and is pending your review.
        </p>

        <div style="text-align: center">
          <a href="${adminDashboardUrl}" class="button">Review Tool</a>
        </div>
        
        <div class="info-box">
          <p style="margin-bottom: 10px;"><strong>Tool Details:</strong></p>
          <p style="margin-bottom: 5px;">Name: ${toolName}</p>
          <p style="margin-bottom: 5px;">Submitted by: ${submitterName}</p>
          <p style="margin-bottom: 0;">Tool URL: ${toolUrl}</p>
        </div>

        <p>
          If the button above doesn't work, copy and paste the following link
          into your browser to access the admin dashboard:
        </p>
        <p class="link-fallback">${adminDashboardUrl}</p>

        <p>Thank you,<br />DeepList AI System</p>
      </div>

      <div class="footer">
        <p>© 2025 DeepList AI. All rights reserved.</p>
        <p>
          This is an automated notification sent to administrators when new tools are submitted.
        </p>
      </div>
    </div>
  </body>
</html>
`;
};

export default ToolSubmissionNotificationEmailTemplate;

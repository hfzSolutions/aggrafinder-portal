import React from 'react';

interface ToolApprovalEmailProps {
  toolName: string;
  userName: string;
  toolUrl: string;
  siteUrl: string;
}

export const ToolApprovalEmailTemplate = ({
  toolName,
  userName,
  toolUrl,
  siteUrl,
}: ToolApprovalEmailProps) => {
  const logoUrl = `${siteUrl}/images/web-logo.png`;

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Tool Approved on DeepList AI</title>
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
        <h1>Your Tool Has Been Approved!</h1>

        <p>Hello ${userName},</p>

        <p>
          Good news! Your tool <strong>${toolName}</strong> has been approved and is now listed on DeepList AI.
        </p>

        <div style="text-align: center">
          <a href="${toolUrl}" class="button">View Your Tool</a>
        </div>

      <div class="info-box">
        <p style="margin-bottom: 10px;"><strong>Write the First Comment:</strong></p>
        <p class="help-text">
          Got a tip or something cool to share about this tool? Start things off by leaving the first comment to help others learn more about it.
        </p>
      </div>

      <div class="info-box">
        <p style="margin-bottom: 10px;"><strong>Your Tool Badge is Ready:</strong></p>
        <p class="help-text">
          A badge is available in your dashboard. You can add it to your site to show your tool is listed on DeepList AI.
        </p>
      </div>

        
        <p>
          If the button above doesn't work, copy and paste the following link
          into your browser:
        </p>
        <p class="link-fallback">${toolUrl}</p>

        <p>
          Thank you for contributing to our growing collection of AI tools. Your submission helps make DeepList AI a valuable resource for the community.
        </p>

        <p>Thank you,<br />The DeepList AI Team</p>
      </div>

      <div class="footer">
        <p>© 2025 DeepList AI. All rights reserved.</p>
        <p>
          If you have any questions, please contact our support team at
          <a href="mailto:support@deeplistai.com">support@deeplistai.com</a>
        </p>
        <p>
          This email was sent to you because you submitted a tool to our platform.
        </p>
      </div>
    </div>
  </body>
</html>
`;
};

export default ToolApprovalEmailTemplate;

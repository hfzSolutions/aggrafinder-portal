
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ApprovalEmailRequest {
  toolName: string;
  userEmail: string;
  userName?: string;
  toolUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { toolName, userEmail, userName, toolUrl }: ApprovalEmailRequest = await req.json();

    if (!toolName || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Tool name and user email are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const name = userName || "there"; // Fallback if no name is provided
    
    const emailResponse = await resend.emails.send({
      from: "AggraFinder <noreply@aggrafinder.com>",
      to: [userEmail],
      subject: `Your tool ${toolName} has been approved!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Congratulations ${name}!</h2>
          <p>Your AI tool <strong>${toolName}</strong> has been reviewed and approved by our team.</p>
          <p>Your tool is now live on AggraFinder and visible to all users.</p>
          ${toolUrl ? `<p>You can view your tool here: <a href="${toolUrl}" style="color: #4F46E5;">${toolName}</a></p>` : ''}
          <p>Thank you for contributing to the AggraFinder community!</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
            <p style="color: #666; font-size: 14px;">The AggraFinder Team</p>
          </div>
        </div>
      `,
    });

    console.log("Tool approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-tool-approval-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

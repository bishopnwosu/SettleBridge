// SettleBridge: review-application Edge Function
// Approves or rejects a provider application, then emails the provider.
// Runs on Supabase's servers. The Resend key stays here, never in the browser.

import { createClient } from "npm:@supabase/supabase-js@2";

// TODO before launch: replace "*" with your real website address.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Stops provider-typed text (e.g. business name) from breaking the email HTML.
function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmail(status: "approved" | "rejected", contactName: string, businessName: string) {
  const approved = status === "approved";
  const safeName = escapeHtml(contactName || "there");
  const safeBusiness = escapeHtml(businessName || "your business");

  const subject = approved
    ? "Your SettleBridge provider application has been approved"
    : "Update on your SettleBridge provider application";

  const heading = approved ? "Welcome to SettleBridge" : "Thank you for applying";
  const badgeColour = approved ? "#16A085" : "#0A3D62";
  const badgeText = approved ? "Application approved" : "Application reviewed";

  const messageHtml = approved
    ? `<p style="margin:0 0 14px;">Good news. We have reviewed the application for <strong>${safeBusiness}</strong> and it has been <strong>approved</strong>.</p>
       <p style="margin:0 0 14px;">Our team will be in touch with the next steps for listing your services on SettleBridge.</p>`
    : `<p style="margin:0 0 14px;">Thank you for your interest in offering services through SettleBridge. We have carefully reviewed the application for <strong>${safeBusiness}</strong>.</p>
       <p style="margin:0 0 14px;">Unfortunately, we are not able to approve it at this time.</p>
       <p style="margin:0 0 14px;">If you have any questions, please get in touch through the Contact page on our website.</p>`;

  const messageText = approved
    ? `Good news. We have reviewed the application for ${businessName || "your business"} and it has been approved.\n\nOur team will be in touch with the next steps for listing your services on SettleBridge.`
    : `Thank you for your interest in offering services through SettleBridge. We have carefully reviewed the application for ${businessName || "your business"}.\n\nUnfortunately, we are not able to approve it at this time.\n\nIf you have any questions, please get in touch through the Contact page on our website.`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F4F7FA;font-family:Arial,Helvetica,sans-serif;color:#172B3A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F7FA;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#0A3D62;padding:24px;text-align:center;">
          <div style="color:#FFFFFF;font-size:24px;font-weight:bold;">SettleBridge</div>
          <div style="color:#FFFFFF;font-size:13px;margin-top:6px;">Arrive with a plan. Settle with confidence.</div>
        </td></tr>
        <tr><td style="padding:32px 28px;font-size:15px;line-height:1.6;">
          <span style="display:inline-block;background:${badgeColour};color:#FFFFFF;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:999px;">${badgeText}</span>
          <h1 style="font-size:22px;color:#0A3D62;margin:20px 0 14px;">${heading}</h1>
          <p style="margin:0 0 14px;">Hello ${safeName},</p>
          ${messageHtml}
          <p style="margin:24px 0 0;">Kind regards,<br>The SettleBridge Team</p>
        </td></tr>
        <tr><td style="background:#F4F7FA;padding:16px 28px;font-size:12px;color:#5B6B78;text-align:center;">
          You are receiving this email because you applied to become a service provider on SettleBridge.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hello ${contactName || "there"},\n\n${messageText}\n\nKind regards,\nThe SettleBridge Team\n\nArrive with a plan. Settle with confidence.`;

  return { subject, html, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // This is the PUBLIC publishable key (already used in main.js). It is safe here.
  // It is a fallback in case your project has no legacy SUPABASE_ANON_KEY.
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  // Until you verify your own domain, Resend only allows this test sender.
  const emailFrom = Deno.env.get("EMAIL_FROM") ?? "SettleBridge <onboarding@resend.dev>";

  if (!supabaseUrl || !supabaseAnonKey || !resendApiKey) {
    console.error("Missing configuration", {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasResendKey: !!resendApiKey,
    });
    return jsonResponse({ error: "Server is not configured correctly." }, 500);
  }

  // 1. The caller must be logged in.
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return jsonResponse({ error: "Not logged in." }, 401);

  // Acts AS the logged-in user, so your existing RLS policies still apply.
  // No service-role key is used anywhere.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  // 2. The caller must be a SettleBridge admin.
  const { data: isAdmin, error: adminError } = await supabase.rpc("is_settlebridge_admin");
  if (adminError || isAdmin !== true) {
    return jsonResponse({ error: "Not authorised." }, 403);
  }

  // 3. Read and check the request. Only "approve" or "reject" are accepted.
  let body: { applicationId?: unknown; decision?: unknown };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request." }, 400);
  }

  const applicationId = body.applicationId;
  const decision = body.decision;

  if ((typeof applicationId !== "string" && typeof applicationId !== "number") || applicationId === "") {
    return jsonResponse({ error: "Missing application ID." }, 400);
  }
  if (decision !== "approve" && decision !== "reject") {
    return jsonResponse({ error: "Decision must be approve or reject." }, 400);
  }

  const newStatus: "approved" | "rejected" = decision === "approve" ? "approved" : "rejected";

  // 4. Update ONLY if the application is still pending.
  //    A double-click or repeat request changes nothing and sends no second email.
  const { data: application, error: updateError } = await supabase
    .from("provider_applications")
    .update({ status: newStatus, reviewed_at: new Date().toISOString() })
    .eq("id", applicationId)
    .eq("status", "pending")
    .select("id, contact_name, email, business_name, status")
    .maybeSingle();

  if (updateError) {
    console.error("Status update failed", updateError.message);
    return jsonResponse({ error: "Could not update the application." }, 500);
  }

  if (!application) {
    return jsonResponse(
      { error: "This application was not found or has already been reviewed. No email was sent." },
      409,
    );
  }

  // 5. Send the email through Resend.
  const { subject, html, text } = buildEmail(newStatus, application.contact_name, application.business_name);

  let emailSent = false;
  let emailError: string | null = null;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        // Extra protection: Resend will not send the same email twice for this key.
        "Idempotency-Key": `application-${application.id}-${newStatus}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [application.email],
        subject,
        html,
        text,
      }),
    });

    if (resendResponse.ok) {
      emailSent = true;
    } else {
      const details = await resendResponse.text();
      emailError = `Resend error ${resendResponse.status}: ${details}`.slice(0, 500);
    }
  } catch (err) {
    emailError = `Could not reach Resend: ${String(err)}`.slice(0, 500);
  }

  // 6. Record the email result on the application.
  const { error: trackingError } = await supabase
    .from("provider_applications")
    .update(
      emailSent
        ? { decision_email_sent_at: new Date().toISOString(), decision_email_error: null }
        : { decision_email_error: emailError },
    )
    .eq("id", application.id);

  if (trackingError) console.error("Could not save email result", trackingError.message);
  if (!emailSent) console.error("Email failed for application", application.id, emailError);

  return jsonResponse({
    ok: true,
    status: newStatus,
    emailSent,
    message: emailSent
      ? `Application ${newStatus}. The provider has been emailed.`
      : `Application ${newStatus}, but the email could not be sent.`,
  });
});

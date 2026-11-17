// SettleBridge: review-application Edge Function
// Approves or rejects a provider application, emails the provider and,
// for approvals, attaches a personalised provider agreement with a signing link.
// Runs on Supabase's servers. The Resend key stays here, never in the browser.

import { createClient } from "npm:@supabase/supabase-js@2";
import * as PDFLib from "npm:pdf-lib@1.17.1";

// ---------- AGREEMENT PDF BUILDER ----------
// The same builder is used by the "review-application" and "provider-agreement"
// functions. If you change the layout, change it in both files.

type AgreementContent = {
  title: string;
  intro: string;
  labels: Record<string, string>;
  sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
};

type AgreementDetails = {
  reference: string;
  version: string;
  businessName: string;
  contactName: string;
  email: string;
  category: string;
  location: string;
  approvedOn: string;
  showDraftBanner: boolean;
};

type AgreementSignature = {
  name: string;
  signedAt: string;
  ip: string;
  imagePng?: Uint8Array | null;
} | null;

async function buildAgreementPdf(
  content: AgreementContent,
  details: AgreementDetails,
  signature: AgreementSignature,
): Promise<Uint8Array> {
  const { PDFDocument, StandardFonts, rgb } = PDFLib;
  const L = content.labels;

  const NAVY = rgb(10 / 255, 61 / 255, 98 / 255);
  const TEAL = rgb(14 / 255, 124 / 255, 102 / 255);
  const TEXT = rgb(23 / 255, 43 / 255, 58 / 255);
  const MUTED = rgb(71 / 255, 85 / 255, 105 / 255);
  const LIGHT = rgb(244 / 255, 247 / 255, 250 / 255);
  const BORDER = rgb(226 / 255, 232 / 255, 240 / 255);
  const WHITE = rgb(1, 1, 1);

  const pdf = await PDFDocument.create();
  pdf.setTitle(content.title + " - " + details.businessName);
  pdf.setAuthor("SettleBridge");
  pdf.setSubject(content.title + " " + details.reference);
  pdf.setCreator("SettleBridge");

  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const italic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const PAGE_W = 595.28; // A4
  const PAGE_H = 841.89;
  const MARGIN = 56;
  const WIDTH = PAGE_W - MARGIN * 2;

  // Replace characters the built-in PDF font cannot draw (for example Chinese or Arabic)
  // deno-lint-ignore no-explicit-any
  function safe(text: unknown, font: any): string {
    let out = "";
    for (const ch of String(text ?? "")) {
      try {
        font.encodeText(ch);
        out += ch;
      } catch {
        out += "?";
      }
    }
    return out;
  }

  function fill(text: string): string {
    return String(text)
      .replace(/\{businessName\}/g, details.businessName)
      .replace(/\{contactName\}/g, details.contactName || details.businessName);
  }

  // deno-lint-ignore no-explicit-any
  function wrap(text: string, font: any, size: number, maxWidth: number): string[] {
    const words = safe(text, font).split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = line ? line + " " + word : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        line = test;
      } else {
        if (line) lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  // deno-lint-ignore no-explicit-any
  let page: any;
  let y = 0;

  function newPage() {
    page = pdf.addPage([PAGE_W, PAGE_H]);
    y = PAGE_H - MARGIN;

    if (pdf.getPageCount() > 1) {
      page.drawText(safe("SettleBridge  |  " + content.title + "  |  " + details.reference, regular), {
        x: MARGIN, y: PAGE_H - 32, size: 8, font: regular, color: MUTED,
      });
      y = PAGE_H - MARGIN - 6;
    }
  }

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN + 30) newPage();
  }

  // deno-lint-ignore no-explicit-any
  function paragraph(text: string, options: { font?: any; size?: number; color?: any; after?: number } = {}) {
    const font = options.font || regular;
    const size = options.size || 10;
    const lineHeight = size * 1.45;
    for (const line of wrap(fill(text), font, size, WIDTH)) {
      ensureSpace(lineHeight);
      page.drawText(line, { x: MARGIN, y: y - size, size, font, color: options.color || TEXT });
      y -= lineHeight;
    }
    y -= options.after ?? 6;
  }

  // ---------- PAGE 1 HEADER ----------
  newPage();
  page.drawRectangle({ x: 0, y: PAGE_H - 96, width: PAGE_W, height: 96, color: NAVY });
  page.drawText("Settle", { x: MARGIN, y: PAGE_H - 52, size: 24, font: bold, color: WHITE });
  page.drawText("Bridge", {
    x: MARGIN + bold.widthOfTextAtSize("Settle", 24), y: PAGE_H - 52, size: 24, font: bold,
    color: rgb(0.55, 0.85, 0.78),
  });
  page.drawText("Arrive with a plan. Settle with confidence.", {
    x: MARGIN, y: PAGE_H - 74, size: 10, font: regular, color: rgb(0.84, 0.89, 0.94),
  });
  y = PAGE_H - 96 - 34;

  page.drawText(safe(content.title, bold), { x: MARGIN, y: y - 20, size: 22, font: bold, color: NAVY });
  y -= 34;
  page.drawText(
    safe(L.reference + " " + details.reference + "   |   " + L.version + " " + details.version, regular),
    { x: MARGIN, y: y - 9, size: 9, font: regular, color: MUTED },
  );
  y -= 24;

  if (details.showDraftBanner) {
    page.drawRectangle({ x: MARGIN, y: y - 22, width: WIDTH, height: 22, color: rgb(1, 0.96, 0.84) });
    page.drawText(safe(L.draft, bold), { x: MARGIN + 10, y: y - 15, size: 9, font: bold, color: rgb(0.47, 0.21, 0.06) });
    y -= 34;
  }

  // ---------- DETAILS BOX ----------
  const rows: [string, string][] = [
    [L.provider, details.businessName],
    [L.representedBy, details.contactName],
    [L.email, details.email],
    [L.category, details.category],
    [L.location, details.location],
    [L.approvedOn, details.approvedOn],
  ];
  const boxHeight = rows.length * 17 + 18;
  page.drawRectangle({
    x: MARGIN, y: y - boxHeight, width: WIDTH, height: boxHeight,
    color: LIGHT, borderColor: BORDER, borderWidth: 1,
  });
  let rowY = y - 20;
  for (const [label, value] of rows) {
    page.drawText(safe(label, regular), { x: MARGIN + 14, y: rowY, size: 9, font: regular, color: MUTED });
    const valueLine = wrap(value || L.notProvided, bold, 9.5, WIDTH - 150)[0] || "";
    page.drawText(valueLine, { x: MARGIN + 130, y: rowY, size: 9.5, font: bold, color: TEXT });
    rowY -= 17;
  }
  y -= boxHeight + 18;

  paragraph(content.intro, { after: 10 });

  // ---------- SECTIONS ----------
  for (const section of content.sections) {
    ensureSpace(40);
    paragraph(section.heading, { font: bold, size: 11.5, color: NAVY, after: 3 });

    for (const text of section.paragraphs || []) paragraph(text);

    for (const text of section.bullets || []) {
      const lines = wrap(fill(text), regular, 10, WIDTH - 16);
      lines.forEach((line, index) => {
        ensureSpace(14.5);
        if (index === 0) page.drawCircle({ x: MARGIN + 4, y: y - 6.5, size: 1.6, color: TEAL });
        page.drawText(line, { x: MARGIN + 16, y: y - 10, size: 10, font: regular, color: TEXT });
        y -= 14.5;
      });
      y -= 2;
    }
    y -= 6;
  }

  // ---------- SIGNATURES ----------
  ensureSpace(185);
  y -= 6;
  paragraph(L.signatures, { font: bold, size: 11.5, color: NAVY, after: 8 });

  const colW = (WIDTH - 16) / 2;
  const boxTop = y;
  const sigBoxH = 150;

  // deno-lint-ignore no-explicit-any
  function signatureBox(x: number, title: string, lines: [string, any][]) {
    page.drawRectangle({ x, y: boxTop - sigBoxH, width: colW, height: sigBoxH, borderColor: BORDER, borderWidth: 1 });
    page.drawText(safe(title, bold), { x: x + 12, y: boxTop - 20, size: 10, font: bold, color: NAVY });
    page.drawLine({
      start: { x: x + 12, y: boxTop - 86 }, end: { x: x + colW - 12, y: boxTop - 86 },
      thickness: 0.8, color: MUTED,
    });

    let lineY = boxTop - 100;
    for (const [text, font] of lines) {
      for (const fitted of wrap(text, font, 8.5, colW - 24).slice(0, 2)) {
        page.drawText(fitted, { x: x + 12, y: lineY, size: 8.5, font, color: TEXT });
        lineY -= 11;
      }
    }
  }

  if (signature) {
    let drawnImage = false;
    if (signature.imagePng && signature.imagePng.length > 0) {
      try {
        const image = await pdf.embedPng(signature.imagePng);
        const dims = image.scaleToFit(colW - 24, 46);
        page.drawImage(image, { x: MARGIN + 12, y: boxTop - 34 - dims.height, width: dims.width, height: dims.height });
        drawnImage = true;
      } catch {
        drawnImage = false;
      }
    }
    if (!drawnImage) {
      page.drawText(safe(signature.name, italic), { x: MARGIN + 12, y: boxTop - 70, size: 18, font: italic, color: NAVY });
    }
    signatureBox(MARGIN, L.forProvider, [
      [safe(L.signedBy + " " + signature.name, bold), bold],
      [safe(L.dateTime + ": " + signature.signedAt, regular), regular],
      [safe(L.ip + ": " + (signature.ip || L.notProvided), regular), regular],
      [safe(L.emailConfirmed + ": " + details.email, regular), regular],
    ]);
  } else {
    signatureBox(MARGIN, L.forProvider, [
      [safe(L.notSigned, bold), bold],
      [safe(L.signHint, regular), regular],
    ]);
  }

  page.drawText("SettleBridge", {
    x: MARGIN + colW + 16 + 12, y: boxTop - 70, size: 18, font: italic, color: NAVY,
  });
  signatureBox(MARGIN + colW + 16, L.forSettleBridge, [
    [safe(L.approvedBy, bold), bold],
    [safe(L.date + ": " + details.approvedOn, regular), regular],
    [safe(L.signatory, regular), regular],
  ]);

  // ---------- FOOTER ON EVERY PAGE ----------
  const pages = pdf.getPages();
  pages.forEach((p, index) => {
    p.drawLine({ start: { x: MARGIN, y: 40 }, end: { x: PAGE_W - MARGIN, y: 40 }, thickness: 0.5, color: BORDER });
    p.drawText(safe("SettleBridge  |  " + content.title + "  |  " + details.reference, regular), {
      x: MARGIN, y: 26, size: 8, font: regular, color: MUTED,
    });
    const label = safe(L.page + " " + (index + 1) + " " + L.of + " " + pages.length, regular);
    p.drawText(label, {
      x: PAGE_W - MARGIN - regular.widthOfTextAtSize(label, 8), y: 26, size: 8, font: regular, color: MUTED,
    });
  });

  return await pdf.save();
}

// Uint8Array -> base64 (for email attachments)
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function sha256Hex(data: Uint8Array | string): Promise<string> {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function formatAgreementDate(date: Date, language: string, withTime: boolean): string {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon",
  };
  if (withTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.timeZoneName = "short";
  }
  return date.toLocaleString(language === "pt" ? "pt-PT" : "en-GB", options);
}

// ---------- SETTINGS ----------
// Website address used in the "Review and sign" link
const SITE_URL = (Deno.env.get("PUBLIC_SITE_URL") ?? "https://settlebridgee.netlify.app").replace(/\/+$/, "");

// Shows "DRAFT FOR LEGAL REVIEW" on agreements until you set the secret AGREEMENT_DRAFT to "false"
const SHOW_DRAFT_BANNER = (Deno.env.get("AGREEMENT_DRAFT") ?? "true") !== "false";

// Only these websites may call this function from a browser.
const ALLOWED_ORIGINS = [
  "https://settlebridgee.netlify.app", // live site on Netlify
  "http://127.0.0.1:5500", // VS Code Live Server
  "http://localhost:5500", // VS Code Live Server (other spelling)
];

function corsHeadersFor(req: Request) {
  const origin = req.headers.get("Origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
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

function randomHex(byteCount: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

type CreatedAgreement = {
  id: string;
  reference: string;
  signUrl: string;
  pdfBase64: string;
  filename: string;
};

function buildEmail(
  status: "approved" | "rejected",
  contactName: string,
  businessName: string,
  agreement: CreatedAgreement | null,
) {
  const approved = status === "approved";
  const safeName = escapeHtml(contactName || "there");
  const safeBusiness = escapeHtml(businessName || "your business");

  const subject = approved
    ? "Your SettleBridge provider application has been approved"
    : "Update on your SettleBridge provider application";

  const heading = approved ? "Welcome to SettleBridge" : "Thank you for applying";
  const badgeColour = approved ? "#16A085" : "#0A3D62";
  const badgeText = approved ? "Application approved" : "Application reviewed";

  const agreementHtml = agreement
    ? `<p style="margin:0 0 14px;">Your provider agreement (reference <strong>${escapeHtml(agreement.reference)}</strong>) is attached as a PDF. Please read it and sign it online:</p>
       <p style="margin:0 0 14px;"><a href="${escapeHtml(agreement.signUrl)}" style="display:inline-block;background:#0E7C66;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:6px;">Review and sign the agreement</a></p>
       <p style="margin:0 0 14px;font-size:13px;color:#5B6B78;">This link is personal to you, so please don't share it. It expires in 30 days. You can read the agreement in English or Portuguese. Once you sign, we will email you a signed copy.</p>`
    : "";

  const agreementText = agreement
    ? `\n\nYour provider agreement (reference ${agreement.reference}) is attached as a PDF. Please read it and sign it online:\n${agreement.signUrl}\n\nThis link is personal to you, so please don't share it. It expires in 30 days. Once you sign, we will email you a signed copy.`
    : "";

  const messageHtml = approved
    ? `<p style="margin:0 0 14px;">Good news. We have reviewed the application for <strong>${safeBusiness}</strong> and it has been <strong>approved</strong>.</p>
       ${agreementHtml}
       <p style="margin:0 0 14px;">Our team will be in touch with the next steps for listing your services on SettleBridge.</p>`
    : `<p style="margin:0 0 14px;">Thank you for your interest in offering services through SettleBridge. We have carefully reviewed the application for <strong>${safeBusiness}</strong>.</p>
       <p style="margin:0 0 14px;">Unfortunately, we are not able to approve it at this time.</p>
       <p style="margin:0 0 14px;">If you have any questions, please get in touch through the Contact page on our website.</p>`;

  const messageText = approved
    ? `Good news. We have reviewed the application for ${businessName || "your business"} and it has been approved.${agreementText}\n\nOur team will be in touch with the next steps for listing your services on SettleBridge.`
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

// ---------- CREATE THE AGREEMENT FOR AN APPROVED PROVIDER ----------
// deno-lint-ignore no-explicit-any
async function createAgreement(supabase: any, application: any): Promise<CreatedAgreement> {
  // The current English agreement text
  const { data: versionRow, error: versionError } = await supabase
    .from("agreement_versions")
    .select("version, content")
    .eq("language", "en")
    .eq("is_current", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (versionError || !versionRow) {
    throw new Error("No current agreement text: " + (versionError?.message ?? "none found"));
  }

  let categoryName = "";
  if (application.category_id) {
    const { data: category } = await supabase
      .from("service_categories")
      .select("name")
      .eq("id", application.category_id)
      .maybeSingle();
    categoryName = category?.name ?? "";
  }

  // The public profile is created automatically by the database when the status becomes "approved"
  const { data: provider } = await supabase
    .from("providers")
    .select("id")
    .eq("application_id", application.id)
    .maybeSingle();

  // Any older unsigned agreement for this application is replaced by the new one
  await supabase
    .from("provider_agreements")
    .update({ status: "void" })
    .eq("application_id", application.id)
    .eq("status", "sent");

  const token = randomHex(32); // the secret part of the signing link
  const reference = "SB-PA-" + randomHex(4).toUpperCase();
  const approvedOn = new Date();
  const location = [application.city, application.country].filter(Boolean).join(", ");

  const { data: agreement, error: insertError } = await supabase
    .from("provider_agreements")
    .insert({
      reference,
      application_id: application.id,
      provider_id: provider?.id ?? null,
      version: versionRow.version,
      business_name: application.business_name,
      contact_name: application.contact_name,
      email: application.email,
      category_name: categoryName || null,
      location: location || null,
      approved_on: approvedOn.toISOString().slice(0, 10),
      token_hash: await sha256Hex(token), // only the hash is stored, never the link itself
    })
    .select("id, reference")
    .single();

  if (insertError) throw new Error("Could not save agreement: " + insertError.message);

  const pdfBytes = await buildAgreementPdf(
    versionRow.content,
    {
      reference,
      version: versionRow.version,
      businessName: application.business_name || "",
      contactName: application.contact_name || "",
      email: application.email || "",
      category: categoryName,
      location,
      approvedOn: formatAgreementDate(approvedOn, "en", false),
      showDraftBanner: SHOW_DRAFT_BANNER,
    },
    null,
  );

  return {
    id: agreement.id,
    reference,
    signUrl: SITE_URL + "/sign-agreement.html?token=" + token,
    pdfBase64: bytesToBase64(pdfBytes),
    filename: "SettleBridge-Provider-Agreement-" + reference + ".pdf",
  };
}

Deno.serve(async (req) => {
  const corsHeaders = corsHeadersFor(req);

  function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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
    .select("id, contact_name, email, business_name, status, category_id, city, country, reviewed_at")
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

  // 5. For approvals, create the provider agreement (PDF + signing link).
  //    If this fails, the approval email is still sent, without the agreement.
  let agreement: CreatedAgreement | null = null;
  let agreementError: string | null = null;

  if (newStatus === "approved") {
    try {
      agreement = await createAgreement(supabase, application);
    } catch (err) {
      agreementError = String(err instanceof Error ? err.message : err).slice(0, 300);
      console.error("Agreement failed for application", application.id, agreementError);
    }
  }

  // 6. Send the email through Resend.
  const { subject, html, text } = buildEmail(
    newStatus,
    application.contact_name,
    application.business_name,
    agreement,
  );

  let emailSent = false;
  let emailError: string | null = null;

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        // Extra protection against duplicate emails. reviewed_at changes on every decision,
        // so approving again after "Unapprove" still sends a new email.
        "Idempotency-Key": `application-${application.id}-${newStatus}-${application.reviewed_at}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [application.email],
        subject,
        html,
        text,
        attachments: agreement ? [{ filename: agreement.filename, content: agreement.pdfBase64 }] : undefined,
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

  // 7. Record the email result on the application (and on the agreement).
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

  if (agreement) {
    await supabase
      .from("provider_agreements")
      .update(
        emailSent
          ? { email_sent_at: new Date().toISOString(), email_error: null }
          : { email_error: emailError },
      )
      .eq("id", agreement.id);
  }

  let message = emailSent
    ? `Application ${newStatus}. The provider has been emailed.`
    : `Application ${newStatus}, but the email could not be sent.`;

  if (newStatus === "approved") {
    message += agreement
      ? ` Agreement ${agreement.reference} was ${emailSent ? "sent for signing" : "created"}.`
      : " The agreement could not be created.";
  }

  return jsonResponse({
    ok: true,
    status: newStatus,
    emailSent,
    agreementReference: agreement?.reference ?? null,
    agreementError,
    message,
  });
});

// SettleBridge: provider-agreement Edge Function
// Creates agreement PDFs for the signing page and the admin, and emails
// the signed copy to the provider once they have signed.
// IMPORTANT: in Supabase, turn OFF "Verify JWT" for this function, because providers
// are not logged in. Security comes from the secret signing link instead, and the
// admin download still checks that the caller is a SettleBridge admin.

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
// Shows "DRAFT FOR LEGAL REVIEW" on agreements until you set the secret AGREEMENT_DRAFT to "false"
const SHOW_DRAFT_BANNER = (Deno.env.get("AGREEMENT_DRAFT") ?? "true") !== "false";

// Optional: if you add the secret ADMIN_NOTIFICATION_EMAIL, you get a copy of every signed agreement
const ADMIN_NOTIFICATION_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") ?? "";

// Website address used in the "Review and sign" link in reminders
const SITE_URL = (Deno.env.get("PUBLIC_SITE_URL") ?? "https://settlebridgee.netlify.app").replace(/\/+$/, "");

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reminder-secret",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

function randomHex(byteCount: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteCount));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------- REMINDER EMAIL ----------
// deno-lint-ignore no-explicit-any
async function sendReminderEmail(agreement: any, token: string, pdf: { bytes: Uint8Array; filename: string }, reminderNumber: number) {
  const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const emailFrom = Deno.env.get("EMAIL_FROM") ?? "SettleBridge <onboarding@resend.dev>";
  const signUrl = SITE_URL + "/sign-agreement.html?token=" + token;
  const name = escapeHtml(agreement.contact_name || agreement.business_name || "there");
  const reference = escapeHtml(agreement.reference);

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
          <span style="display:inline-block;background:#0A3D62;color:#FFFFFF;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:999px;">Reminder</span>
          <h1 style="font-size:22px;color:#0A3D62;margin:20px 0 14px;">Please sign your provider agreement</h1>
          <p style="margin:0 0 14px;">Hello ${name},</p>
          <p style="margin:0 0 14px;">Your SettleBridge provider agreement (reference <strong>${reference}</strong>) is still waiting for your signature. The agreement is attached again as a PDF.</p>
          <p style="margin:0 0 14px;"><a href="${escapeHtml(signUrl)}" style="display:inline-block;background:#0E7C66;color:#FFFFFF;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:6px;">Review and sign the agreement</a></p>
          <p style="margin:0 0 14px;font-size:13px;color:#5B6B78;">This is a new personal link, valid for 30 days. Links in our earlier emails no longer work. If you have a question about the agreement, simply reply to this email.</p>
          <p style="margin:24px 0 0;">Kind regards,<br>The SettleBridge Team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hello ${agreement.contact_name || agreement.business_name || "there"},\n\nYour SettleBridge provider agreement (reference ${agreement.reference}) is still waiting for your signature. The agreement is attached again as a PDF.\n\nReview and sign the agreement:\n${signUrl}\n\nThis is a new personal link, valid for 30 days. Links in our earlier emails no longer work.\n\nKind regards,\nThe SettleBridge Team`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `agreement-${agreement.id}-reminder-${reminderNumber}-${token.slice(0, 8)}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [agreement.email],
        subject: "Reminder: please sign your SettleBridge provider agreement (" + agreement.reference + ")",
        html,
        text,
        attachments: [{ filename: pdf.filename, content: bytesToBase64(pdf.bytes) }],
      }),
    });

    if (response.ok) return null;
    return `Resend error ${response.status}: ${await response.text()}`.slice(0, 500);
  } catch (err) {
    return `Could not reach Resend: ${String(err)}`.slice(0, 500);
  }
}

// deno-lint-ignore no-explicit-any
async function loadContent(supabase: any, version: string, language: string) {
  const wanted = language === "pt" ? "pt" : "en";

  const { data } = await supabase
    .from("agreement_versions")
    .select("language, content")
    .eq("version", version)
    .in("language", [wanted, "en"]);

  // deno-lint-ignore no-explicit-any
  const rows = (data ?? []) as any[];
  const match = rows.find((row) => row.language === wanted) ?? rows.find((row) => row.language === "en");
  if (!match) throw new Error("Agreement text not found for version " + version);
  return { content: match.content, language: match.language as string };
}

// deno-lint-ignore no-explicit-any
async function makePdf(supabase: any, agreement: any, language: string, includeSignature: boolean) {
  const { content, language: usedLanguage } = await loadContent(supabase, agreement.version, language);
  const approvedOn = new Date(agreement.approved_on + "T12:00:00Z");

  const signature = includeSignature && agreement.status === "signed"
    ? {
      name: agreement.signer_name,
      signedAt: formatAgreementDate(new Date(agreement.signed_at), usedLanguage, true),
      ip: agreement.signer_ip ?? "",
      imagePng: agreement.signature_png ? base64ToBytes(agreement.signature_png) : null,
    }
    : null;

  const bytes = await buildAgreementPdf(
    content,
    {
      reference: agreement.reference,
      version: agreement.version,
      businessName: agreement.business_name ?? "",
      contactName: agreement.contact_name ?? "",
      email: agreement.email ?? "",
      category: agreement.category_name ?? "",
      location: agreement.location ?? "",
      approvedOn: formatAgreementDate(approvedOn, usedLanguage, false),
      showDraftBanner: SHOW_DRAFT_BANNER,
    },
    signature,
  );

  const suffix = signature ? "-signed" : "";
  const languageSuffix = usedLanguage === "pt" ? "-PT" : "";

  return {
    bytes,
    filename: "SettleBridge-Provider-Agreement-" + agreement.reference + languageSuffix + suffix + ".pdf",
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
  const supabaseAnonKey =
    Deno.env.get("SUPABASE_ANON_KEY") ?? "sb_publishable_axNzNrJ9AD2qZeS7EYHrFA_pTYlnfs8";
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM") ?? "SettleBridge <onboarding@resend.dev>";

  if (!supabaseUrl || !resendApiKey) {
    console.error("Missing configuration", { hasUrl: !!supabaseUrl, hasResendKey: !!resendApiKey });
    return jsonResponse({ error: "Server is not configured correctly." }, 500);
  }

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request." }, 400);
  }

  const action = body?.action;

  try {
    // ---------- AUTOMATIC DAILY REMINDERS (called by the scheduled job) ----------
    if (action === "auto-remind") {
      const secret = req.headers.get("x-reminder-secret") ?? "";
      const cronClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });

      // The database checks the private secret; without it, nothing is returned
      const { data: due, error: dueError } = await cronClient.rpc("agreements_due_for_reminder", {
        p_secret: secret,
      });

      if (dueError) {
        console.error("Reminder check refused", dueError.message);
        return jsonResponse({ error: "Not allowed." }, 403);
      }

      let sent = 0;
      let failed = 0;

      // deno-lint-ignore no-explicit-any
      for (const row of (due ?? []) as any[]) {
        try {
          const token = randomHex(32);
          const { data: changed } = await cronClient.rpc("agreement_reminder_new_link", {
            p_secret: secret,
            p_agreement_id: row.id,
            p_token_hash: await sha256Hex(token),
          });
          if (!changed) continue; // signed in the meantime

          const pdf = await makePdf(cronClient, { ...row, status: "sent" }, "en", false);
          const reminderError = await sendReminderEmail(row, token, pdf, row.reminder_count + 1);

          await cronClient.rpc("agreement_reminder_record", {
            p_secret: secret,
            p_agreement_id: row.id,
            p_error: reminderError,
          });

          if (reminderError) {
            failed += 1;
            console.error("Reminder failed", row.reference, reminderError);
          } else {
            sent += 1;
          }
        } catch (err) {
          failed += 1;
          console.error("Reminder failed", row.reference, err instanceof Error ? err.message : err);
        }

        await wait(700); // stay within the email service's sending speed limit
      }

      console.log("Agreement reminders:", { due: (due ?? []).length, sent, failed });
      return jsonResponse({ ok: true, due: (due ?? []).length, sent, failed });
    }

    // ---------- ADMIN: SEND A REMINDER NOW ----------
    if (action === "admin-remind") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return jsonResponse({ error: "Not logged in." }, 401);

      const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });

      const { data: isAdmin, error: adminError } = await adminClient.rpc("is_settlebridge_admin");
      if (adminError || isAdmin !== true) return jsonResponse({ error: "Not authorised." }, 403);

      if (typeof body.agreementId !== "string") {
        return jsonResponse({ error: "Missing agreement ID." }, 400);
      }

      const { data: agreement } = await adminClient
        .from("provider_agreements")
        .select("*")
        .eq("id", body.agreementId)
        .maybeSingle();

      if (!agreement) return jsonResponse({ error: "Agreement not found." }, 404);
      if (agreement.status !== "sent") {
        return jsonResponse({ error: "Only agreements waiting for a signature can be reminded." }, 409);
      }

      // New personal link, valid for another 30 days
      const token = randomHex(32);
      const { error: linkError } = await adminClient
        .from("provider_agreements")
        .update({
          token_hash: await sha256Hex(token),
          token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("id", agreement.id)
        .eq("status", "sent");

      if (linkError) {
        console.error("Reminder link error", linkError.message);
        return jsonResponse({ error: "Could not create a new signing link." }, 500);
      }

      const pdf = await makePdf(adminClient, agreement, "en", false);
      const reminderNumber = (agreement.reminder_count ?? 0) + 1;
      const reminderError = await sendReminderEmail(agreement, token, pdf, reminderNumber);

      await adminClient
        .from("provider_agreements")
        .update(
          reminderError
            ? { reminder_error: reminderError }
            : { reminder_count: reminderNumber, last_reminder_at: new Date().toISOString(), reminder_error: null },
        )
        .eq("id", agreement.id);

      if (reminderError) {
        console.error("Reminder failed", agreement.reference, reminderError);
        return jsonResponse({ error: "The reminder email could not be sent. Please try again." }, 502);
      }

      return jsonResponse({ ok: true, reminderCount: reminderNumber });
    }

    // ---------- ADMIN: DOWNLOAD ANY AGREEMENT ----------
    if (action === "admin-download") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return jsonResponse({ error: "Not logged in." }, 401);

      // Acts as the logged-in user, so the database only allows admins
      const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });

      const { data: isAdmin, error: adminError } = await adminClient.rpc("is_settlebridge_admin");
      if (adminError || isAdmin !== true) return jsonResponse({ error: "Not authorised." }, 403);

      if (typeof body.agreementId !== "string") {
        return jsonResponse({ error: "Missing agreement ID." }, 400);
      }

      const { data: agreement, error } = await adminClient
        .from("provider_agreements")
        .select("*")
        .eq("id", body.agreementId)
        .maybeSingle();

      if (error || !agreement) return jsonResponse({ error: "Agreement not found." }, 404);

      const language = agreement.status === "signed" ? agreement.signed_language ?? "en" : "en";
      const pdf = await makePdf(adminClient, agreement, body.language ?? language, true);

      return jsonResponse({ ok: true, filename: pdf.filename, pdfBase64: bytesToBase64(pdf.bytes) });
    }

    // ---------- PROVIDER ACTIONS (use the secret link, no login) ----------
    const token = typeof body.token === "string" ? body.token.trim().toLowerCase() : "";
    if (!TOKEN_PATTERN.test(token)) {
      return jsonResponse({ error: "This signing link is not valid." }, 400);
    }

    // No login: the database only allows reading the agreement that matches this link
    const publicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    const { data: rows, error: loadError } = await publicClient.rpc("get_agreement_for_pdf", {
      p_token: token,
    });

    // deno-lint-ignore no-explicit-any
    const agreement = (rows as any[] | null)?.[0];

    if (loadError || !agreement) {
      return jsonResponse({ error: "This signing link is not valid." }, 404);
    }

    if (agreement.status === "void") {
      return jsonResponse({ error: "This agreement has been replaced. Please use the link in your latest email." }, 410);
    }

    // Download the agreement (unsigned, or signed once signed) in English or Portuguese
    if (action === "download") {
      const pdf = await makePdf(publicClient, agreement, body.language ?? "en", true);
      return jsonResponse({ ok: true, filename: pdf.filename, pdfBase64: bytesToBase64(pdf.bytes) });
    }

    // After signing: create the signed copy and email it (only once)
    if (action === "signed-copy") {
      if (agreement.status !== "signed") {
        return jsonResponse({ error: "This agreement has not been signed yet." }, 409);
      }

      const pdf = await makePdf(publicClient, agreement, agreement.signed_language ?? "en", true);
      const pdfBase64 = bytesToBase64(pdf.bytes);
      let emailSent = !!agreement.signed_email_sent_at;

      if (!agreement.signed_email_sent_at) {
        let emailError: string | null = null;

        const name = escapeHtml(agreement.contact_name || agreement.signer_name || "there");
        const reference = escapeHtml(agreement.reference);

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
          <span style="display:inline-block;background:#16A085;color:#FFFFFF;font-size:12px;font-weight:bold;padding:6px 12px;border-radius:999px;">Agreement signed</span>
          <h1 style="font-size:22px;color:#0A3D62;margin:20px 0 14px;">Thank you for signing</h1>
          <p style="margin:0 0 14px;">Hello ${name},</p>
          <p style="margin:0 0 14px;">Your SettleBridge provider agreement (reference <strong>${reference}</strong>) has been signed. Your signed copy is attached as a PDF. Please keep it for your records.</p>
          <p style="margin:0 0 14px;">If you did not sign this agreement, please reply to this email straight away.</p>
          <p style="margin:24px 0 0;">Kind regards,<br>The SettleBridge Team</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const text = `Hello ${agreement.contact_name || agreement.signer_name || "there"},\n\nYour SettleBridge provider agreement (reference ${agreement.reference}) has been signed. Your signed copy is attached as a PDF. Please keep it for your records.\n\nIf you did not sign this agreement, please reply to this email straight away.\n\nKind regards,\nThe SettleBridge Team`;

        try {
          const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
              "Idempotency-Key": `agreement-${agreement.id}-signed`,
            },
            body: JSON.stringify({
              from: emailFrom,
              to: [agreement.email],
              bcc: ADMIN_NOTIFICATION_EMAIL ? [ADMIN_NOTIFICATION_EMAIL] : undefined,
              subject: "Your signed SettleBridge provider agreement (" + agreement.reference + ")",
              html,
              text,
              attachments: [{ filename: pdf.filename, content: pdfBase64 }],
            }),
          });

          if (resendResponse.ok) {
            emailSent = true;
          } else {
            emailError = `Resend error ${resendResponse.status}: ${await resendResponse.text()}`.slice(0, 500);
          }
        } catch (err) {
          emailError = `Could not reach Resend: ${String(err)}`.slice(0, 500);
        }

        if (emailError) console.error("Signed copy email failed", agreement.reference, emailError);

        await publicClient.rpc("record_signed_agreement_email", {
          p_token: token,
          p_pdf_sha256: await sha256Hex(pdf.bytes),
          p_error: emailError,
        });
      }

      return jsonResponse({ ok: true, emailSent, filename: pdf.filename, pdfBase64 });
    }

    return jsonResponse({ error: "Unknown action." }, 400);
  } catch (err) {
    console.error("Agreement function error", err instanceof Error ? err.message : err);
    return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
  }
});

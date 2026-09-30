import nodemailer, { type Transporter } from "nodemailer";
import { INTERESTS, LIMITS, MIN_FILL_MS, isInterest } from "../../contact-form";

// nodemailer needs Node APIs (net/tls), not the edge runtime
export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Best-effort limit per IP. It lives in this server instance's memory, so it resets on deploy
   and is per-instance on serverless; the honeypot and fill-time checks do most of the work. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const recent = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

let transporter: Transporter | null = null;

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      // 465 is implicit TLS; 587 upgrades with STARTTLS
      secure: port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: "invalid" }, 400);
  }

  // Bots: pretend it worked so they don't retry with a different strategy.
  const elapsed = Number(data.elapsed);
  if (text(data.website, 200) || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) {
    return json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  // single-line fields end up in mail headers (subject, reply-to): no line breaks allowed
  const name = text(data.name, LIMITS.name).replace(/[\r\n]+/g, " ");
  const email = text(data.email, LIMITS.email);
  const phone = text(data.phone, LIMITS.phone).replace(/[\r\n]+/g, " ");
  const message = text(data.message, LIMITS.message);
  const interest = data.interest;
  const locale = data.locale === "en" ? "en" : "pt";

  if (!name || !EMAIL_PATTERN.test(email) || !message || !isInterest(interest)) {
    return json({ ok: false, error: "invalid" }, 400);
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.error("[contact] SMTP_HOST, SMTP_USER and SMTP_PASS must be set to send the contact form");
    return json({ ok: false, error: "unavailable" }, 503);
  }

  const interestLabel = INTERESTS[interest].pt;
  const rows: [string, string][] = [
    ["Nome", name],
    ["E-mail", email],
    ["Telefone", phone || "—"],
    ["Interesse", interestLabel],
    ["Idioma do site", locale === "en" ? "Inglês" : "Português"],
  ];

  const plain = `${rows.map(([label, value]) => `${label}: ${value}`).join("\n")}\n\nMensagem:\n${message}\n`;
  const html = `
    <table cellpadding="6" style="border-collapse:collapse;font:14px/1.5 -apple-system,Segoe UI,sans-serif">
      ${rows.map(([label, value]) => `<tr><td style="color:#666;padding-right:16px">${label}</td><td><strong>${escapeHtml(value)}</strong></td></tr>`).join("")}
    </table>
    <p style="font:14px/1.6 -apple-system,Segoe UI,sans-serif;white-space:pre-wrap;margin-top:16px">${escapeHtml(message)}</p>`;

  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM || `"Site Lucas Ritter Dias" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_TO || "lucas@polvor.com",
      // answering the notification goes straight to the visitor
      replyTo: { name, address: email },
      subject: `Contato pelo site: ${interestLabel} — ${name}`,
      text: plain,
      html,
    });
  } catch (error) {
    console.error("[contact] send failed:", error);
    return json({ ok: false, error: "send_failed" }, 502);
  }

  return json({ ok: true });
}

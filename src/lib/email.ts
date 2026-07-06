import nodemailer from "nodemailer";

/**
 * Low-level sender. Prefers Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD) which
 * can email ANY recipient with no domain needed; falls back to Resend.
 */
async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, "") },
      });
      await transporter.sendMail({
        from: `Cherryflix <${gmailUser}>`,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        replyTo: opts.replyTo,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Cherryflix <onboarding@resend.dev>";
  if (!apiKey) return { ok: false, error: "No email sender configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        reply_to: opts.replyTo,
      }),
    });
    if (!res.ok) return { ok: false, error: await res.text() };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function sendInviteEmail(to: string, loginUrl: string) {
  return sendMail({
    to,
    subject: "You're invited to Cherryflix 🍒",
    html: signInEmailHtml(loginUrl),
  });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function sendContactEmail(
  to: string,
  msg: { name: string; email: string; message: string }
) {
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.5;">
    <h2 style="margin:0 0 12px;">New message from Cherryflix</h2>
    <p style="margin:4px 0;"><strong>Name:</strong> ${escapeHtml(msg.name)}</p>
    <p style="margin:4px 0;"><strong>Email:</strong> ${escapeHtml(msg.email)}</p>
    <p style="margin:12px 0 4px;"><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;margin:0;">${escapeHtml(msg.message)}</p>
  </div>`;
  return sendMail({
    to,
    subject: `New Cherryflix message from ${msg.name}`,
    replyTo: msg.email,
    html,
  });
}

// Branded HTML for the Cherryflix magic-link / invite email.
// Inline styles only — email clients ignore <style> and external CSS.
export function signInEmailHtml(url: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#0b0b0f;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b0b0f;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#141418;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:40px 40px 8px 40px;" align="center">
                <div style="font-size:30px;font-weight:800;letter-spacing:-0.5px;">
                  <span style="color:#e11d48;">Cherry</span><span style="color:#ffffff;">flix</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 0 40px;" align="center">
                <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">You&rsquo;re invited 🍒</h1>
                <p style="margin:12px 0 0 0;color:rgba(255,255,255,0.65);font-size:15px;line-height:22px;">
                  Click the button below to sign in and start watching. This link
                  is just for you and expires in 24 hours.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 8px 40px;" align="center">
                <a href="${url}" style="display:inline-block;background:#e11d48;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:14px 34px;border-radius:10px;">
                  ▶ Start watching
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 40px 40px;" align="center">
                <p style="margin:0;color:rgba(255,255,255,0.35);font-size:12px;line-height:18px;">
                  If the button doesn&rsquo;t work, copy and paste this link:<br />
                  <span style="color:rgba(255,255,255,0.5);word-break:break-all;">${url}</span>
                </p>
                <p style="margin:16px 0 0 0;color:rgba(255,255,255,0.3);font-size:12px;">
                  If you weren&rsquo;t expecting this, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:20px 0 0 0;color:rgba(255,255,255,0.25);font-size:11px;">
            Cherryflix &mdash; a private streaming space.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

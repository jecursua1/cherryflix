import nodemailer from "nodemailer";

const SUBJECT = "You're invited to Cherryflix 🍒";

/**
 * Send an invitation email. Prefers Gmail SMTP (GMAIL_USER + GMAIL_APP_PASSWORD)
 * which can email ANY recipient with no domain needed; falls back to Resend.
 * Returns whether it actually delivered so the caller can be honest to the admin.
 */
export async function sendInviteEmail(
  to: string,
  loginUrl: string
): Promise<{ ok: boolean; error?: string }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const html = signInEmailHtml(loginUrl);

  // Preferred: send from the owner's Gmail (works to anyone, no domain needed).
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
        to,
        subject: SUBJECT,
        html,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  }

  // Fallback: Resend (sandbox sender only reaches the Resend account owner).
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
      body: JSON.stringify({ from, to, subject: SUBJECT, html }),
    });
    if (!res.ok) return { ok: false, error: await res.text() };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
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

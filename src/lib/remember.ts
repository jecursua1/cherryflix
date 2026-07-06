import { createHmac, timingSafeEqual } from "crypto";

// "Remember me on this device" token: email + HMAC signature so it can't be
// forged. Stored in the httpOnly cf_remember cookie. Node runtime only.

function secret(): string {
  return process.env.AUTH_SECRET ?? "cherryflix-dev-secret";
}

export function signRemember(email: string): string {
  const e = email.toLowerCase().trim();
  const sig = createHmac("sha256", secret()).update(e).digest("hex");
  return `${e}.${sig}`;
}

export function verifyRemember(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const email = token.slice(0, i);
  const sig = token.slice(i + 1);
  const expected = createHmac("sha256", secret()).update(email).digest("hex");
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return email;
}

export const REMEMBER_COOKIE = "cf_remember";
export const REMEMBER_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

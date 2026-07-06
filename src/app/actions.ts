"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import {
  isAdmin,
  addInvite,
  removeInvite,
  setProfile,
  setImage,
  setPasscode,
  getMember,
} from "@/lib/invites";
import { sendInviteEmail, sendContactEmail } from "@/lib/email";
import {
  signRemember,
  verifyRemember,
  REMEMBER_COOKIE,
  REMEMBER_MAX_AGE,
} from "@/lib/remember";

const rememberCookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export type ActionState = { ok: boolean; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Admin invites someone by email. Adds them to the allowlist and emails them a sign-in link. */
export async function inviteAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return { ok: false, message: "Not authorized." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  await addInvite(email);

  // Grant is what matters (login is email-only). Try to email them a link too.
  const base = process.env.AUTH_URL || "https://cherryflix.vercel.app";
  const loginUrl = `${base}/login?email=${encodeURIComponent(email)}`;
  const sent = await sendInviteEmail(email, loginUrl);
  revalidatePath("/admin");

  if (sent.ok) {
    return {
      ok: true,
      message: `Invite email sent to ${email}. They can sign in with their email.`,
    };
  }
  return {
    ok: true,
    message: `${email} now has access — but the email couldn't be sent automatically (verify a domain in Resend to email anyone). Just share this link with them: ${base}/login`,
  };
}

/** Admin removes someone's access. */
export async function removeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return { ok: false, message: "Not authorized." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  await removeInvite(email);
  revalidatePath("/admin");
  return { ok: true, message: `Removed ${email}.` };
}

/** Member signs in with their invited email + 4-digit passcode. */
export async function memberLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const passcode = String(formData.get("passcode") ?? "").trim();
  const remember = formData.get("remember") != null;

  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  // Owner accounts can't use the member login. They use /admin-login.
  if (isAdmin(email)) {
    return { ok: false, message: "This is an owner account. Please use the owner login." };
  }
  const member = await getMember(email);
  if (!member) {
    return {
      ok: false,
      message: "This email hasn't been invited yet. Ask the owner for access.",
    };
  }
  // If a passcode was set, it must match. (First-time members have none yet.)
  if (member.passcode) {
    if (!/^\d{4}$/.test(passcode)) {
      return { ok: false, message: "Enter your 4-digit passcode." };
    }
    if (passcode !== member.passcode) {
      return { ok: false, message: "Wrong passcode. Ask the owner if you forgot it." };
    }
  }

  const jar = await cookies();
  if (remember) {
    jar.set(REMEMBER_COOKIE, signRemember(email), {
      ...rememberCookieOpts,
      maxAge: REMEMBER_MAX_AGE,
    });
  } else {
    jar.delete(REMEMBER_COOKIE);
  }

  try {
    await signIn("member", { email, passcode, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Sign in failed. Please try again." };
    }
    throw error;
  }
  return { ok: true, message: "" };
}

/** One-click sign-in for a remembered device (no typing). */
export async function rememberLoginAction(): Promise<void> {
  const jar = await cookies();
  const email = verifyRemember(jar.get(REMEMBER_COOKIE)?.value);
  if (!email || isAdmin(email)) redirect("/login");
  const member = await getMember(email);
  if (!member) redirect("/login");
  await signIn("member", {
    email,
    passcode: member.passcode ?? "",
    redirectTo: "/",
  });
}

/** Owner sets or resets a member's passcode (in case they forget it). */
export async function setMemberPasscodeAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return { ok: false, message: "Not authorized." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const passcode = String(formData.get("passcode") ?? "").trim();
  if (!/^\d{4}$/.test(passcode)) {
    return { ok: false, message: "Passcode must be exactly 4 digits." };
  }
  await setPasscode(email, passcode);
  revalidatePath(`/admin/member/${email}`);
  revalidatePath("/admin");
  return { ok: true, message: `Passcode updated to ${passcode}.` };
}

/** Owner sign-in with email + password (no email/DB needed). */
export async function ownerLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const expected = process.env.OWNER_PASSWORD ?? "";

  // Pre-validate so wrong credentials show an inline error here instead of
  // bouncing to /login (Auth.js redirects failed sign-ins to the error page).
  if (!expected) {
    return {
      ok: false,
      message:
        "Owner password isn't set on the server. Add OWNER_PASSWORD to .env.local and restart.",
    };
  }
  if (!isAdmin(email)) {
    return { ok: false, message: "That email isn't an owner account." };
  }
  if (password !== expected) {
    return { ok: false, message: "Wrong owner password." };
  }

  try {
    // Owner lands on the management dashboard, not the streaming home.
    await signIn("owner", { email, password, redirectTo: "/admin" });
  } catch (error) {
    // A successful sign-in throws a Next.js redirect — let it propagate.
    if (error instanceof AuthError) {
      return { ok: false, message: "Sign in failed. Please try again." };
    }
    throw error;
  }
  return { ok: true, message: "Signed in." };
}

/** New member sets up their first + last name before they can watch. */
export async function saveProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, message: "You're not signed in." };
  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  const passcode = String(formData.get("passcode") ?? "").trim();
  const confirm = String(formData.get("confirmPasscode") ?? "").trim();
  if (!first || !last) {
    return { ok: false, message: "Please enter your first and last name." };
  }
  if (!/^\d{4}$/.test(passcode)) {
    return { ok: false, message: "Set a 4-digit passcode (numbers only)." };
  }
  if (passcode !== confirm) {
    return { ok: false, message: "Passcodes don't match." };
  }
  await setProfile(email, first, last);
  await setPasscode(email, passcode);

  const image = String(formData.get("image") ?? "");
  const validImage =
    image.startsWith("data:image/") || image.startsWith("/avatars/");
  if (validImage && image.length <= 300_000) {
    await setImage(email, image);
  }
  redirect("/");
}

/** Member edits their name from the account page (stays on the page). */
export async function updateNameAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, message: "You're not signed in." };
  const first = String(formData.get("firstName") ?? "").trim();
  const last = String(formData.get("lastName") ?? "").trim();
  if (!first || !last) {
    return { ok: false, message: "Please enter your first and last name." };
  }
  await setProfile(email, first, last);
  revalidatePath("/");
  revalidatePath("/account");
  return { ok: true, message: "Saved! Your name has been updated." };
}

/** Update or remove the member's profile photo (small data-URL stored in Neon). */
export async function updateAvatarAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return { ok: false, message: "You're not signed in." };
  const image = String(formData.get("image") ?? "");
  const valid =
    !image || image.startsWith("data:image/") || image.startsWith("/avatars/");
  if (!valid) {
    return { ok: false, message: "That doesn't look like an image." };
  }
  if (image.length > 300_000) {
    return { ok: false, message: "Image is too large. Try a smaller photo." };
  }
  await setImage(email, image || null);
  revalidatePath("/");
  revalidatePath("/account");
  return {
    ok: true,
    message: image ? "Profile photo updated." : "Profile photo removed.",
  };
}

/** Public "Contact Us" form — emails the owner. No login required. */
export async function contactAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !EMAIL_RE.test(email) || message.length < 2) {
    return { ok: false, message: "Please add your name, a valid email, and a message." };
  }
  if (message.length > 3000) {
    return { ok: false, message: "Message is too long (max 3000 characters)." };
  }

  const to =
    (process.env.ADMIN_EMAILS ?? "").split(",")[0]?.trim() ||
    process.env.GMAIL_USER ||
    "";
  if (!to) {
    return { ok: false, message: "Contact isn't available right now. Please try later." };
  }

  const sent = await sendContactEmail(to, { name, email, message });
  if (!sent.ok) {
    return { ok: false, message: "Couldn't send your message right now. Please try again later." };
  }
  return {
    ok: true,
    message: "Thanks! Your message has been sent — we'll get back to you soon.",
  };
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete(REMEMBER_COOKIE);
  await signOut({ redirectTo: "/login" });
}

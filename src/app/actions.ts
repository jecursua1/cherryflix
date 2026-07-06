"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn, signOut } from "@/auth";
import {
  isAdmin,
  isAllowed,
  addInvite,
  removeInvite,
  setProfile,
} from "@/lib/invites";

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
  try {
    // Sends the invitee a magic sign-in link ("accept & watch").
    await signIn("resend", { email, redirect: false, redirectTo: "/" });
  } catch {
    revalidatePath("/admin");
    return {
      ok: true,
      message: `Added ${email} to the allowlist, but the invite email failed to send. Check your RESEND_API_KEY / EMAIL_FROM.`,
    };
  }
  revalidatePath("/admin");
  return { ok: true, message: `Invite sent to ${email}.` };
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

/** Member signs in with their invited email (no password needed). */
export async function memberLoginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "Please enter a valid email address." };
  }
  if (!(await isAllowed(email))) {
    return {
      ok: false,
      message: "This email hasn't been invited yet. Ask the owner for access.",
    };
  }
  try {
    await signIn("member", { email, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, message: "Sign in failed. Please try again." };
    }
    throw error;
  }
  return { ok: true, message: "" };
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
  if (!first || !last) {
    return { ok: false, message: "Please enter your first and last name." };
  }
  await setProfile(email, first, last);
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

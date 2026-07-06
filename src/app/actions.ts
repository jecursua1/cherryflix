"use server";

import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { isAdmin, isAllowed, addInvite, removeInvite } from "@/lib/invites";

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

/** A returning member requests a fresh sign-in link. Blocked unless invited. */
export async function loginAction(
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
      message: "This email hasn't been invited yet. Ask the owner for an invite.",
    };
  }
  try {
    await signIn("resend", { email, redirect: false, redirectTo: "/" });
  } catch {
    return { ok: false, message: "Could not send the sign-in email. Please try again." };
  }
  return { ok: true, message: "Check your inbox — we sent you a sign-in link." };
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, hasProfile } from "./invites";

/**
 * For member-only pages: ensures the visitor is signed in AND has completed
 * their first/last name setup. Returns their email. Admins are exempt from
 * the name requirement (they use the dashboard, not the watch flow).
 */
export async function requireProfile(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");
  if (!isAdmin(email) && !(await hasProfile(email))) redirect("/welcome");
  return email;
}

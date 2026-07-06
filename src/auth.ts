import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/lib/db";
import authConfig from "@/auth.config";
import { isAdmin, isAllowed, markAccepted, getMember } from "@/lib/invites";
import { signInEmailHtml } from "@/lib/email";

// Full Auth.js instance (Node runtime — has the database adapter, so the
// email/magic-link provider is safe to use here).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  providers: [
    // Magic-link login for invited members (branded email via Resend).
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM ?? "Cherryflix <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier: email, url }) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM ?? "Cherryflix <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to Cherryflix 🍒",
            html: signInEmailHtml(url),
          }),
        });
        if (!res.ok) {
          throw new Error(`Resend error ${res.status}: ${await res.text()}`);
        }
      },
    }),
    // Member login with email only — allowed if the owner has invited them.
    Credentials({
      id: "member",
      name: "Member",
      credentials: {
        email: { label: "Email", type: "email" },
        passcode: { label: "Passcode", type: "password" },
      },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const passcode = String(creds?.passcode ?? "");
        if (!email) return null;
        // SECURITY: admins must NEVER sign in through the member login. They can
        // only enter via /admin-login (OWNER_PASSWORD). This stops anyone who
        // knows the admin email from taking over the account.
        if (isAdmin(email)) return null;
        const member = await getMember(email);
        if (!member) return null; // not invited
        // If a passcode has been set, it must match. (First login has none yet.)
        if (member.passcode && passcode !== member.passcode) return null;
        return { id: email, email };
      },
    }),
    // Owner (email + password) provider carried over from the edge config.
    ...authConfig.providers,
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Invite-only gate: only invited (or admin) emails may complete sign-in.
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      if (isAdmin(email)) return true;
      const ok = await isAllowed(email);
      if (ok) {
        try {
          await markAccepted(email);
        } catch {
          // don't block sign-in if the presence update fails
        }
      }
      return ok;
    },
  },
});

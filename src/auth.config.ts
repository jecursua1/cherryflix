import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { isAdmin } from "@/lib/roles";
import { signInEmailHtml } from "@/lib/email";

// Edge-safe portion of the Auth.js config (no database adapter here so it can
// run inside middleware). The adapter + db-backed callbacks live in auth.ts.
export const authConfig = {
  providers: [
    // Magic-link login for invited members (requires Resend).
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
    // Owner login (email + password) — lets you in without email/DB setup.
    Credentials({
      id: "owner",
      name: "Owner",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase().trim();
        const password = String(creds?.password ?? "");
        const expected = process.env.OWNER_PASSWORD ?? "";
        if (isAdmin(email) && expected && password === expected) {
          return { id: email, email, name: "Owner" };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?sent=1",
    error: "/login",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  callbacks: {
    jwt({ token }) {
      token.isAdmin = isAdmin(token.email as string | undefined);
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.isAdmin = Boolean(token.isAdmin);
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;

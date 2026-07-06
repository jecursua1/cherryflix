import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { isAdmin } from "@/lib/roles";

// Edge-safe config for middleware/proxy. IMPORTANT: no Email (Resend) provider
// here — email providers require a database adapter, which can't run on the
// edge. The Resend provider lives in auth.ts (Node runtime) instead.
// The Credentials "owner" provider needs no adapter, so it's safe here.
export const authConfig = {
  providers: [
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
    jwt({ token, user }) {
      if (user?.email) token.email = user.email;
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

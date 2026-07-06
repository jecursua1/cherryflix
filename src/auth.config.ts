import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { isAdmin } from "@/lib/roles";

// Edge-safe portion of the Auth.js config (no database adapter here so it can
// run inside middleware). The adapter + db-backed callbacks live in auth.ts.
export const authConfig = {
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      // e.g. "Cherryflix <onboarding@resend.dev>" for testing,
      // or "Cherryflix <no-reply@yourdomain.com>" once your domain is verified.
      from: process.env.EMAIL_FROM ?? "Cherryflix <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login?sent=1",
    error: "/login",
  },
  session: { strategy: "jwt" },
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

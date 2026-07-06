import NextAuth from "next-auth";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/lib/db";
import authConfig from "@/auth.config";
import { isAllowed, markAccepted } from "@/lib/invites";

// Full Auth.js instance (runs in the Node runtime — has the database adapter).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(pool),
  callbacks: {
    ...authConfig.callbacks,
    // Invite-only gate: only invited (or admin) emails may complete sign-in.
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      const ok = await isAllowed(email);
      if (ok) await markAccepted(email);
      return ok;
    },
  },
});

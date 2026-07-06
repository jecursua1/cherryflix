// Edge-safe role check (reads env only — no database import).
// Kept separate from invites.ts so middleware can import it without pulling in `pg`.
export function isAdmin(email?: string | null): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

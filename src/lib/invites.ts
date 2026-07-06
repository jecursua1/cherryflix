import { pool } from "./db";
import { isAdmin } from "./roles";

export { isAdmin };

export type Invite = {
  email: string;
  status: "invited" | "accepted";
  invited_at: string;
  accepted_at: string | null;
  last_seen: string | null;
};

/** Anyone who was invited (or is an admin) is allowed to sign in. */
export async function isAllowed(email: string): Promise<boolean> {
  if (isAdmin(email)) return true;
  const r = await pool.query("SELECT 1 FROM invites WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);
  return (r.rowCount ?? 0) > 0;
}

export async function addInvite(email: string): Promise<string> {
  const e = email.toLowerCase().trim();
  await pool.query(
    `INSERT INTO invites (email, status)
     VALUES ($1, 'invited')
     ON CONFLICT (email) DO NOTHING`,
    [e]
  );
  return e;
}

export async function markAccepted(email: string): Promise<void> {
  await pool.query(
    `UPDATE invites
        SET status = 'accepted', accepted_at = now(), last_seen = now()
      WHERE email = $1 AND status <> 'accepted'`,
    [email.toLowerCase().trim()]
  );
}

/** Update last_seen for an active member (called on authenticated page loads). */
export async function touchUser(email: string): Promise<void> {
  try {
    await pool.query(`UPDATE invites SET last_seen = now() WHERE email = $1`, [
      email.toLowerCase().trim(),
    ]);
  } catch {
    // never let presence-tracking break a page render
  }
}

export async function removeInvite(email: string): Promise<void> {
  await pool.query("DELETE FROM invites WHERE email = $1", [
    email.toLowerCase().trim(),
  ]);
}

export async function listInvites(): Promise<Invite[]> {
  const r = await pool.query(
    `SELECT email, status, invited_at, accepted_at, last_seen
       FROM invites
      ORDER BY (status = 'accepted') DESC, invited_at DESC`
  );
  return r.rows as Invite[];
}

export async function getStats(): Promise<{
  members: number;
  pending: number;
  activeWeek: number;
}> {
  const q = await pool.query(
    `SELECT
        count(*) FILTER (WHERE status = 'accepted')::int AS members,
        count(*) FILTER (WHERE status = 'invited')::int  AS pending,
        count(*) FILTER (WHERE status = 'accepted' AND last_seen > now() - interval '7 days')::int AS active_week
      FROM invites`
  );
  const row = q.rows[0] ?? {};
  return {
    members: row.members ?? 0,
    pending: row.pending ?? 0,
    activeWeek: row.active_week ?? 0,
  };
}

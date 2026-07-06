import { pool } from "./db";
import { isAdmin } from "./roles";
import { hashPassword, verifyPassword } from "./password";

export { isAdmin };

export type Invite = {
  email: string;
  status: "invited" | "accepted";
  invited_at: string;
  accepted_at: string | null;
  last_seen: string | null;
  first_name: string | null;
  last_name: string | null;
  image: string | null;
  now_watching_id: string | null;
  now_watching_title: string | null;
  now_watching_at: string | null;
};

export type WatchEvent = {
  watch_id: string;
  title_slug: string | null;
  title_name: string | null;
  episode_label: string | null;
  watched_at: string;
};

const norm = (email: string) => email.toLowerCase().trim();

/** Full name if set, otherwise the email. */
export function displayName(m: {
  first_name?: string | null;
  last_name?: string | null;
  email: string;
}): string {
  const name = [m.first_name, m.last_name].filter(Boolean).join(" ").trim();
  return name || m.email;
}

/** Anyone who was invited (or is an admin) is allowed to sign in. */
export async function isAllowed(email: string): Promise<boolean> {
  if (isAdmin(email)) return true;
  const r = await pool.query("SELECT 1 FROM invites WHERE email = $1", [
    norm(email),
  ]);
  return (r.rowCount ?? 0) > 0;
}

export async function addInvite(email: string): Promise<string> {
  const e = norm(email);
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
    [norm(email)]
  );
}

/** Update last_seen for an active member (called on authenticated page loads). */
export async function touchUser(email: string): Promise<void> {
  try {
    await pool.query(`UPDATE invites SET last_seen = now() WHERE email = $1`, [
      norm(email),
    ]);
  } catch {
    // never let presence-tracking break a page render
  }
}

export async function removeInvite(email: string): Promise<void> {
  await pool.query("DELETE FROM invites WHERE email = $1", [norm(email)]);
  await pool.query("DELETE FROM watch_events WHERE email = $1", [norm(email)]);
}

export async function getMember(email: string): Promise<Invite | null> {
  const r = await pool.query(
    `SELECT email, status, invited_at, accepted_at, last_seen,
            first_name, last_name, image, now_watching_id, now_watching_title, now_watching_at
       FROM invites WHERE email = $1`,
    [norm(email)]
  );
  return (r.rows[0] as Invite) ?? null;
}

/** True once the member has completed their first/last name setup. */
export async function hasProfile(email: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM invites WHERE email = $1 AND first_name IS NOT NULL AND first_name <> ''`,
    [norm(email)]
  );
  return (r.rowCount ?? 0) > 0;
}

export async function setProfile(
  email: string,
  firstName: string,
  lastName: string
): Promise<void> {
  await pool.query(
    `UPDATE invites SET first_name = $2, last_name = $3 WHERE email = $1`,
    [norm(email), firstName.trim(), lastName.trim()]
  );
}

/** Set (or clear with null) the member's profile image (stored as a data URL). */
export async function setImage(email: string, image: string | null): Promise<void> {
  await pool.query(`UPDATE invites SET image = $2 WHERE email = $1`, [
    norm(email),
    image,
  ]);
}

/** Set name + password together (member finishes setup at /welcome). */
export async function setProfileWithPassword(
  email: string,
  firstName: string,
  lastName: string,
  password: string
): Promise<void> {
  await pool.query(
    `UPDATE invites SET first_name = $2, last_name = $3, password_hash = $4 WHERE email = $1`,
    [norm(email), firstName.trim(), lastName.trim(), hashPassword(password)]
  );
}

/** Verify a member's email + password for password login. */
export async function verifyMemberPassword(
  email: string,
  password: string
): Promise<boolean> {
  const r = await pool.query(
    `SELECT password_hash FROM invites WHERE email = $1`,
    [norm(email)]
  );
  const hash = r.rows[0]?.password_hash as string | null | undefined;
  return verifyPassword(password, hash ?? null);
}

/** True once the member has finished setup (name + password). */
export async function hasPassword(email: string): Promise<boolean> {
  const r = await pool.query(
    `SELECT 1 FROM invites WHERE email = $1 AND password_hash IS NOT NULL`,
    [norm(email)]
  );
  return (r.rowCount ?? 0) > 0;
}

export async function listInvites(): Promise<Invite[]> {
  const r = await pool.query(
    `SELECT email, status, invited_at, accepted_at, last_seen,
            first_name, last_name, image, now_watching_id, now_watching_title, now_watching_at
       FROM invites
      ORDER BY (status = 'accepted') DESC, invited_at DESC`
  );
  return r.rows as Invite[];
}

export async function getStats(): Promise<{
  members: number;
  pending: number;
  activeWeek: number;
  activeNow: number;
  inactive: number;
}> {
  const q = await pool.query(
    `SELECT
        count(*) FILTER (WHERE status = 'accepted')::int AS members,
        count(*) FILTER (WHERE status = 'invited')::int  AS pending,
        count(*) FILTER (WHERE status = 'accepted' AND last_seen > now() - interval '7 days')::int AS active_week,
        count(*) FILTER (WHERE last_seen > now() - interval '5 minutes')::int AS active_now,
        count(*) FILTER (WHERE status = 'accepted' AND (last_seen IS NULL OR last_seen <= now() - interval '7 days'))::int AS inactive
      FROM invites`
  );
  const row = q.rows[0] ?? {};
  return {
    members: row.members ?? 0,
    pending: row.pending ?? 0,
    activeWeek: row.active_week ?? 0,
    activeNow: row.active_now ?? 0,
    inactive: row.inactive ?? 0,
  };
}

export type DashboardLive = {
  activeNow: number;
  watchingNow: number;
  inactive: number;
  totalMembers: number;
  pending: number;
  watching: { email: string; name: string; title: string; image: string | null }[];
};

/** Combined snapshot for the live-polling dashboard endpoint. */
export async function getDashboardLive(): Promise<DashboardLive> {
  const [stats, live] = await Promise.all([getStats(), getLiveStats()]);
  return {
    activeNow: live.activeNow,
    watchingNow: live.watching.length,
    inactive: stats.inactive,
    totalMembers: stats.members,
    pending: stats.pending,
    watching: live.watching.map((w) => ({
      email: w.email,
      name: displayName(w),
      title: w.now_watching_title ?? "",
      image: w.image ?? null,
    })),
  };
}

/** Total watch time (seconds) accumulated by a member. */
export async function getMemberSeconds(email: string): Promise<number> {
  const r = await pool.query(
    `SELECT COALESCE(sum(seconds), 0)::int AS n FROM watch_time WHERE email = $1`,
    [norm(email)]
  );
  return r.rows[0]?.n ?? 0;
}

/** Who is online right now and who is actively watching (with what). */
export async function getLiveStats(): Promise<{
  activeNow: number;
  watching: Invite[];
}> {
  const active = await pool.query(
    `SELECT count(*)::int AS n FROM invites WHERE last_seen > now() - interval '5 minutes'`
  );
  const watching = await pool.query(
    `SELECT email, first_name, last_name, image, now_watching_id, now_watching_title, now_watching_at,
            status, invited_at, accepted_at, last_seen
       FROM invites
      WHERE now_watching_at > now() - interval '2 minutes'
      ORDER BY now_watching_at DESC`
  );
  return {
    activeNow: active.rows[0]?.n ?? 0,
    watching: watching.rows as Invite[],
  };
}

export type MemberReportRow = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  invited_at: string;
  last_seen: string | null;
  active_week: boolean;
  active_now: boolean;
  watching_now: boolean;
  now_watching_title: string | null;
  views_90d: number;
  total_seconds: number;
  seconds_7d: number;
};

/** One row per member with computed activity + watch-time — used by the report. */
export async function getMembersReport(): Promise<MemberReportRow[]> {
  const r = await pool.query(
    `SELECT i.email, i.first_name, i.last_name, i.status, i.invited_at, i.last_seen,
            (i.last_seen > now() - interval '7 days')    AS active_week,
            (i.last_seen > now() - interval '5 minutes')  AS active_now,
            (i.now_watching_at > now() - interval '2 minutes') AS watching_now,
            i.now_watching_title,
            COALESCE((SELECT count(*) FROM watch_events w
                       WHERE w.email = i.email AND w.watched_at > now() - interval '90 days'), 0)::int AS views_90d,
            COALESCE((SELECT sum(seconds) FROM watch_time t WHERE t.email = i.email), 0)::int AS total_seconds,
            COALESCE((SELECT sum(seconds) FROM watch_time t
                       WHERE t.email = i.email AND t.day > current_date - 7), 0)::int AS seconds_7d
       FROM invites i
      ORDER BY (i.status = 'accepted') DESC, i.invited_at DESC`
  );
  return r.rows as MemberReportRow[];
}

export type MemberRangeRow = {
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  invited_at: string;
  last_seen: string | null;
  active: boolean;
  watching_now: boolean;
  views: number;
  seconds: number;
};

/** Members report scoped to a date range (activity, views, and watch time within it). */
export async function getMembersReportRange(
  sinceISO: string,
  untilISO: string
): Promise<MemberRangeRow[]> {
  const r = await pool.query(
    `SELECT i.email, i.first_name, i.last_name, i.status, i.invited_at, i.last_seen,
            (i.last_seen >= $1) AS active,
            (i.now_watching_at > now() - interval '2 minutes') AS watching_now,
            COALESCE((SELECT count(*) FROM watch_events w
                       WHERE w.email = i.email AND w.watched_at >= $1 AND w.watched_at < $2), 0)::int AS views,
            COALESCE((SELECT sum(seconds) FROM watch_time t
                       WHERE t.email = i.email AND t.day >= $1::date
                         AND t.day <= ($2::timestamptz - interval '1 second')::date), 0)::int AS seconds
       FROM invites i
      ORDER BY (i.status = 'accepted') DESC, i.invited_at DESC`,
    [sinceISO, untilISO]
  );
  return r.rows as MemberRangeRow[];
}

/** Segment label for a range row. */
export function rowSegment(r: MemberRangeRow): "active" | "inactive" | "pending" {
  if (r.status !== "accepted") return "pending";
  return r.active ? "active" : "inactive";
}

/** Format seconds into a compact "Xh Ym" / "Xm" label. */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return "0m";
}

// --------------------------- watch tracking --------------------------------

/** Record a viewing. Deduped within 30 min so refreshes don't spam history. */
export async function logWatch(
  email: string,
  ev: {
    watchId: string;
    titleSlug?: string;
    titleName?: string;
    episodeLabel?: string;
  }
): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO watch_events (email, watch_id, title_slug, title_name, episode_label)
       SELECT $1, $2, $3, $4, $5
       WHERE NOT EXISTS (
         SELECT 1 FROM watch_events
          WHERE email = $1 AND watch_id = $2 AND watched_at > now() - interval '30 minutes'
       )`,
      [norm(email), ev.watchId, ev.titleSlug ?? null, ev.titleName ?? null, ev.episodeLabel ?? null]
    );
  } catch {
    // history logging must never break playback
  }
}

/** Presence + "now watching" heartbeat (called periodically from the client). */
export async function heartbeat(
  email: string,
  watchId?: string,
  title?: string
): Promise<void> {
  try {
    if (watchId) {
      await pool.query(
        `UPDATE invites
            SET last_seen = now(), now_watching_id = $2,
                now_watching_title = $3, now_watching_at = now()
          WHERE email = $1`,
        [norm(email), watchId, title ?? null]
      );
      // Accumulate ~one heartbeat interval of watch time for today.
      await pool.query(
        `INSERT INTO watch_time (email, day, seconds)
         VALUES ($1, current_date, 25)
         ON CONFLICT (email, day) DO UPDATE SET seconds = watch_time.seconds + 25`,
        [norm(email)]
      );
    } else {
      await pool.query(`UPDATE invites SET last_seen = now() WHERE email = $1`, [
        norm(email),
      ]);
    }
  } catch {
    // ignore presence failures
  }
}

/** A member's watch history within a date range (max 90 days enforced by caller). */
export async function getMemberHistory(
  email: string,
  sinceISO: string,
  untilISO: string
): Promise<WatchEvent[]> {
  const r = await pool.query(
    `SELECT watch_id, title_slug, title_name, episode_label, watched_at
       FROM watch_events
      WHERE email = $1 AND watched_at >= $2 AND watched_at < $3
      ORDER BY watched_at DESC`,
    [norm(email), sinceISO, untilISO]
  );
  return r.rows as WatchEvent[];
}

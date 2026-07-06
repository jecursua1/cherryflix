import { auth } from "@/auth";
import {
  isAdmin,
  getMembersReport,
  getStats,
  formatDuration,
} from "@/lib/invites";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const [rows, stats] = await Promise.all([getMembersReport(), getStats()]);
  const totalSeconds = rows.reduce((s, r) => s + (r.total_seconds ?? 0), 0);
  const watchingNow = rows.filter((r) => r.watching_now).length;

  const summary = toCsv(
    ["Metric", "Value"],
    [
      ["Total members", stats.members],
      ["Active now", stats.activeNow],
      ["Watching now", watchingNow],
      ["Inactive users", stats.inactive],
      ["Pending invites", stats.pending],
      ["Total watch time", formatDuration(totalSeconds)],
      ["Total watch time (hours)", (totalSeconds / 3600).toFixed(2)],
      ["Exported at", new Date().toISOString()],
    ]
  );

  const table = toCsv(
    [
      "First name",
      "Last name",
      "Email",
      "Status",
      "Active this week",
      "Active now",
      "Watching now",
      "Now watching",
      "Watch time (total)",
      "Watch hours (total)",
      "Watch time (7d)",
      "Views (90d)",
      "Invited at",
      "Last seen",
    ],
    rows.map((r) => [
      r.first_name ?? "",
      r.last_name ?? "",
      r.email,
      r.status,
      r.active_week ? "yes" : "no",
      r.active_now ? "yes" : "no",
      r.watching_now ? "yes" : "no",
      r.watching_now ? r.now_watching_title ?? "" : "",
      formatDuration(r.total_seconds),
      (r.total_seconds / 3600).toFixed(2),
      formatDuration(r.seconds_7d),
      r.views_90d,
      r.invited_at ? new Date(r.invited_at).toISOString() : "",
      r.last_seen ? new Date(r.last_seen).toISOString() : "",
    ])
  );

  const csv = `CHERRYFLIX REPORT\r\n${summary}\r\n\r\nMEMBERS\r\n${table}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cherryflix-report-${date}.csv"`,
    },
  });
}

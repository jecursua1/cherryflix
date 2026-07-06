import { auth } from "@/auth";
import { isAdmin, getMembersReport, getStats } from "@/lib/invites";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const [rows, stats] = await Promise.all([getMembersReport(), getStats()]);

  const summary = toCsv(
    ["Metric", "Value"],
    [
      ["Total members", stats.members],
      ["Pending invites", stats.pending],
      ["Active this week", stats.activeWeek],
      ["Active now", stats.activeNow],
      ["Exported at", new Date().toISOString()],
    ]
  );

  const table = toCsv(
    [
      "Email",
      "First name",
      "Last name",
      "Status",
      "Invited at",
      "Last seen",
      "Active this week",
      "Active now",
      "Views (90d)",
    ],
    rows.map((r) => [
      r.email,
      r.first_name ?? "",
      r.last_name ?? "",
      r.status,
      r.invited_at ? new Date(r.invited_at).toISOString() : "",
      r.last_seen ? new Date(r.last_seen).toISOString() : "",
      r.active_week ? "yes" : "no",
      r.active_now ? "yes" : "no",
      r.views_90d,
    ])
  );

  const csv = `${summary}\r\n\r\nMEMBERS\r\n${table}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cherryflix-report-${date}.csv"`,
    },
  });
}

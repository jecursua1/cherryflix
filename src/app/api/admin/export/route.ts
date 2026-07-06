import { auth } from "@/auth";
import {
  isAdmin,
  getMembersReportRange,
  rowSegment,
  formatDuration,
} from "@/lib/invites";
import { resolveRange } from "@/lib/range";
import { parseReportSelection, COLUMNS, csvValue } from "@/lib/reports";
import { toCsv } from "@/lib/csv";

export async function GET(req: Request) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(req.url);
  const sp: Record<string, string | string[] | undefined> = {
    days: url.searchParams.get("days") ?? undefined,
    from: url.searchParams.get("from") ?? undefined,
    to: url.searchParams.get("to") ?? undefined,
    submitted: url.searchParams.get("submitted") ?? undefined,
    seg: url.searchParams.getAll("seg"),
    col: url.searchParams.getAll("col"),
  };

  const { since, until, label } = resolveRange(sp);
  const { segs, cols } = parseReportSelection(sp);

  const all = await getMembersReportRange(since.toISOString(), until.toISOString());
  const rows = all.filter((r) => segs.includes(rowSegment(r)));
  const activeCols = COLUMNS.filter((c) => cols.includes(c.key));

  const totalSeconds = rows.reduce((s, r) => s + r.seconds, 0);
  const summary = toCsv(
    ["Metric", "Value"],
    [
      ["Range", label],
      ["Members shown", rows.length],
      ["Active", rows.filter((r) => rowSegment(r) === "active").length],
      ["Inactive", rows.filter((r) => rowSegment(r) === "inactive").length],
      ["Pending", rows.filter((r) => rowSegment(r) === "pending").length],
      ["Total watch time", formatDuration(totalSeconds)],
      ["Exported at", new Date().toISOString()],
    ]
  );

  const table = activeCols.length
    ? toCsv(
        activeCols.map((c) => c.label),
        rows.map((r) => activeCols.map((c) => csvValue(c.key, r)))
      )
    : "";

  const csv = `CHERRYFLIX REPORT\r\n${summary}\r\n\r\nMEMBERS\r\n${table}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cherryflix-report-${date}.csv"`,
    },
  });
}

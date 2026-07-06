import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  isAdmin,
  getStats,
  getMembersReport,
  displayName,
  formatDuration,
  type MemberReportRow,
} from "@/lib/invites";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

function fmt(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function rowStatus(r: MemberReportRow): "active" | "inactive" | "pending" {
  if (r.status !== "accepted") return "pending";
  return r.active_week ? "active" : "inactive";
}

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-white/10 text-white/50",
  pending: "bg-amber-500/15 text-amber-400",
};

export default async function ReportsPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  const [stats, rows] = await Promise.all([getStats(), getMembersReport()]);
  const totalSeconds = rows.reduce((s, r) => s + (r.total_seconds ?? 0), 0);
  const watchingNow = rows.filter((r) => r.watching_now).length;

  const summary = [
    { label: "Active now", value: String(stats.activeNow), tone: "emerald" },
    { label: "Watching now", value: String(watchingNow), tone: "cherry" },
    { label: "Inactive users", value: String(stats.inactive), tone: "muted" },
    { label: "Total members", value: String(stats.members), tone: "muted" },
    { label: "Pending invites", value: String(stats.pending), tone: "amber" },
    { label: "Total watch time", value: formatDuration(totalSeconds), tone: "muted" },
  ];

  return (
    <>
      <AdminHeader />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-8">
        <Link href="/admin" className="text-sm text-white/60 hover:text-white">
          ← Back to dashboard
        </Link>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Reports</h1>
            <p className="mt-1 text-sm text-white/50">
              Usage &amp; membership overview
            </p>
          </div>
          <a
            href="/api/admin/export"
            className="inline-flex items-center gap-2 rounded-lg bg-cherry px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cherry-dark"
          >
            ⬇ Export full report (CSV)
          </a>
        </div>

        {/* Summary */}
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
          {summary.map((s) => (
            <div
              key={s.label}
              className={`rounded-2xl border p-5 ${
                s.tone === "emerald"
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : s.tone === "cherry"
                    ? "border-cherry/40 bg-cherry/10"
                    : s.tone === "amber"
                      ? "border-amber-500/30 bg-amber-500/10"
                      : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <p className="text-sm text-white/60">{s.label}</p>
              <p className="mt-2 text-3xl font-extrabold tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Full table */}
        <h2 className="mb-4 mt-10 text-lg font-bold">
          Members ({rows.length})
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time (total)</th>
                <th className="px-4 py-3">Time (7d)</th>
                <th className="px-4 py-3">Views (90d)</th>
                <th className="px-4 py-3">Last seen</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                    No members yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const status = rowStatus(r);
                return (
                  <tr key={r.email} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/member/${encodeURIComponent(r.email)}`}
                        className="font-medium text-white hover:text-cherry"
                      >
                        {displayName(r)}
                      </Link>
                      <div className="text-xs text-white/40">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[status]}`}>
                        {r.watching_now ? "watching" : status}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/80">
                      {formatDuration(r.total_seconds)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">
                      {formatDuration(r.seconds_7d)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-white/60">{r.views_90d}</td>
                    <td className="px-4 py-3 text-white/60">{fmt(r.last_seen)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

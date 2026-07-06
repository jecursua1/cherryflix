import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  isAdmin,
  getMembersReportRange,
  rowSegment,
  displayName,
  formatDuration,
  type MemberRangeRow,
} from "@/lib/invites";
import { resolveRange, type RangeParams } from "@/lib/range";
import {
  SEGMENTS,
  COLUMNS,
  parseReportSelection,
  type ColKey,
} from "@/lib/reports";
import AdminHeader from "@/components/AdminHeader";

export const dynamic = "force-dynamic";

const RANGE_PRESETS = [7, 14, 30, 60, 90];

function fmt(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const SEG_STYLE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-white/10 text-white/50",
  pending: "bg-amber-500/15 text-amber-400",
  watching: "bg-cherry/15 text-cherry",
};

function cell(key: ColKey, r: MemberRangeRow) {
  switch (key) {
    case "name":
      return (
        <Link
          href={`/admin/member/${encodeURIComponent(r.email)}`}
          className="font-medium text-white hover:text-cherry"
        >
          {displayName(r)}
        </Link>
      );
    case "email":
      return <span className="text-white/60">{r.email}</span>;
    case "status": {
      const seg = r.watching_now ? "watching" : rowSegment(r);
      return (
        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${SEG_STYLE[seg]}`}>
          {seg}
        </span>
      );
    }
    case "time":
      return <span className="tabular-nums text-white/80">{formatDuration(r.seconds)}</span>;
    case "views":
      return <span className="tabular-nums text-white/60">{r.views}</span>;
    case "lastseen":
      return <span className="text-white/60">{fmt(r.last_seen)}</span>;
    case "invited":
      return <span className="text-white/60">{fmt(r.invited_at)}</span>;
  }
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<RangeParams & Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  const sp = await searchParams;
  const { since, until, days, label, isCustom } = resolveRange(sp);
  const { segs, cols } = parseReportSelection(sp);

  const all = await getMembersReportRange(since.toISOString(), until.toISOString());
  const rows = all.filter((r) => segs.includes(rowSegment(r)));
  const activeCols = COLUMNS.filter((c) => cols.includes(c.key));

  const totalSeconds = rows.reduce((s, r) => s + r.seconds, 0);
  const counts = {
    active: rows.filter((r) => rowSegment(r) === "active").length,
    inactive: rows.filter((r) => rowSegment(r) === "inactive").length,
    pending: rows.filter((r) => rowSegment(r) === "pending").length,
  };

  // Export href mirrors the current selection.
  const qp = new URLSearchParams();
  if (isCustom && sp.from && sp.to) {
    qp.set("from", String(sp.from));
    qp.set("to", String(sp.to));
  } else {
    qp.set("days", String(days));
  }
  segs.forEach((s) => qp.append("seg", s));
  cols.forEach((c) => qp.append("col", c));
  qp.set("submitted", "1");
  const exportHref = `/api/admin/export?${qp.toString()}`;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-8">
        <Link href="/admin" className="text-sm text-white/60 hover:text-white">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Reports</h1>
        <p className="mt-1 text-sm text-white/50">
          Choose what to see, then export it if you want.
        </p>

        {/* FILTER FORM */}
        <form
          method="get"
          className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6"
        >
          <input type="hidden" name="submitted" value="1" />

          {/* Range */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              Time range (max 90 days)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <select
                name="days"
                defaultValue={isCustom ? "" : String(days)}
                className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cherry"
              >
                {RANGE_PRESETS.map((d) => (
                  <option key={d} value={d} className="bg-background">
                    Last {d} days
                  </option>
                ))}
              </select>
              <span className="text-xs text-white/40">or custom:</span>
              <input
                type="date"
                name="from"
                defaultValue={typeof sp.from === "string" ? sp.from : undefined}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-cherry"
              />
              <span className="text-white/40">→</span>
              <input
                type="date"
                name="to"
                defaultValue={typeof sp.to === "string" ? sp.to : undefined}
                className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-cherry"
              />
            </div>
          </div>

          {/* Segments */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              Include
            </p>
            <div className="flex flex-wrap gap-4">
              {SEGMENTS.map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-2 text-sm capitalize">
                  <input
                    type="checkbox"
                    name="seg"
                    value={s}
                    defaultChecked={segs.includes(s)}
                    className="h-4 w-4 accent-cherry"
                  />
                  {s} users
                </label>
              ))}
            </div>
          </div>

          {/* Columns */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
              Columns to show / export
            </p>
            <div className="flex flex-wrap gap-4">
              {COLUMNS.map((c) => (
                <label key={c.key} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="col"
                    value={c.key}
                    defaultChecked={cols.includes(c.key)}
                    className="h-4 w-4 accent-cherry"
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-white/85">
              Apply
            </button>
            <a
              href={exportHref}
              className="inline-flex items-center gap-2 rounded-lg bg-cherry px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cherry-dark"
            >
              ⬇ Export CSV
            </a>
          </div>
        </form>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label={`Showing (${label})`} value={String(rows.length)} accent />
          <Stat label="Active" value={String(counts.active)} />
          <Stat label="Inactive" value={String(counts.inactive)} />
          <Stat label="Total watch time" value={formatDuration(totalSeconds)} />
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
              <tr>
                {activeCols.map((c) => (
                  <th key={c.key} className="px-4 py-3">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(rows.length === 0 || activeCols.length === 0) && (
                <tr>
                  <td
                    colSpan={Math.max(1, activeCols.length)}
                    className="px-4 py-10 text-center text-white/40"
                  >
                    {activeCols.length === 0
                      ? "Select at least one column."
                      : "No members match this selection."}
                  </td>
                </tr>
              )}
              {activeCols.length > 0 &&
                rows.map((r) => (
                  <tr key={r.email} className="border-t border-white/5 hover:bg-white/[0.03]">
                    {activeCols.map((c) => (
                      <td key={c.key} className="px-4 py-3">
                        {cell(c.key, r)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "border-cherry/40 bg-cherry/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-2 text-2xl font-extrabold tabular-nums">{value}</p>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  isAdmin,
  getStats,
  getLiveStats,
  listInvites,
  displayName,
  type Invite,
} from "@/lib/invites";
import InviteForm from "@/components/InviteForm";
import RemoveButton from "@/components/RemoveButton";
import AutoRefresh from "@/components/AutoRefresh";
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

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  let stats = { members: 0, pending: 0, activeWeek: 0, activeNow: 0 };
  let live = { activeNow: 0, watching: [] as Invite[] };
  let invites: Invite[] = [];
  let dbError = false;
  try {
    [stats, live, invites] = await Promise.all([
      getStats(),
      getLiveStats(),
      listInvites(),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <>
      <AutoRefresh seconds={20} />
      <AdminHeader />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold">Owner Dashboard</h1>
            <p className="mt-1 text-sm text-white/50">
              {session?.user?.email} · live counts refresh automatically
            </p>
          </div>
          <a
            href="/api/admin/export"
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ⬇ Export report (CSV)
          </a>
        </div>

        {dbError && (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
            ⚠️ Can&apos;t reach the database. Check <code>DATABASE_URL</code> and run
            the DB init script.
          </div>
        )}

        {/* LIVE */}
        <section className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
              Live now
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Active now" value={live.activeNow} accent />
            <Stat label="Watching now" value={live.watching.length} />
            <Stat label="Active this week" value={stats.activeWeek} />
            <Stat label="Total members" value={stats.members} />
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="mb-3 text-sm font-semibold text-white/70">
              Watching right now
            </h3>
            {live.watching.length === 0 ? (
              <p className="text-sm text-white/40">No one is watching at the moment.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {live.watching.map((w) => (
                  <li key={w.email} className="flex items-center justify-between py-2.5">
                    <Link
                      href={`/admin/member/${encodeURIComponent(w.email)}`}
                      className="font-medium text-white hover:text-cherry"
                    >
                      {displayName(w)}
                    </Link>
                    <span className="flex items-center gap-2 text-sm text-white/60">
                      <span className="text-emerald-400">▶</span>
                      {w.now_watching_title ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* INVITE */}
        <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold">Invite someone</h2>
          <p className="mb-4 mt-1 text-sm text-white/50">
            Enter their email. They&apos;ll get a sign-in link, then set up their
            name before watching.
          </p>
          <InviteForm />
        </div>

        {/* MEMBERS */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold">
            Members &amp; invites ({invites.length})
            <span className="ml-2 text-sm font-normal text-white/40">
              — click a member to see their watch history
            </span>
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Invited</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Last seen</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {invites.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-white/40">
                      No one invited yet. Add your first member above.
                    </td>
                  </tr>
                )}
                {invites.map((inv) => (
                  <tr key={inv.email} className="border-t border-white/5 hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/member/${encodeURIComponent(inv.email)}`}
                        className="font-medium text-white hover:text-cherry"
                      >
                        {displayName(inv)}
                      </Link>
                      {(inv.first_name || inv.last_name) && (
                        <div className="text-xs text-white/40">{inv.email}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {inv.status === "accepted" ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-400">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden text-white/60 sm:table-cell">
                      {fmt(inv.invited_at)}
                    </td>
                    <td className="px-4 py-3 hidden text-white/60 sm:table-cell">
                      {fmt(inv.last_seen)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <RemoveButton email={inv.email} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-5 ${
        accent ? "border-cherry/40 bg-cherry/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-2 text-4xl font-extrabold">{value}</p>
    </div>
  );
}

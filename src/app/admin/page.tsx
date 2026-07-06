import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  isAdmin,
  getDashboardLive,
  listInvites,
  displayName,
  type Invite,
} from "@/lib/invites";
import InviteForm from "@/components/InviteForm";
import RemoveButton from "@/components/RemoveButton";
import AdminHeader from "@/components/AdminHeader";
import LiveDashboard from "@/components/LiveDashboard";

export const dynamic = "force-dynamic";

function fmt(d: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function memberStatus(inv: Invite): "active" | "inactive" | "pending" {
  if (inv.status !== "accepted") return "pending";
  const seen = inv.last_seen ? new Date(inv.last_seen).getTime() : 0;
  return seen > 0 && Date.now() - seen < 7 * 86400000 ? "active" : "inactive";
}

const STATUS_STYLE: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  inactive: "bg-white/10 text-white/50",
  pending: "bg-amber-500/15 text-amber-400",
};

export default async function AdminPage() {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  let live = {
    activeNow: 0,
    watchingNow: 0,
    inactive: 0,
    totalMembers: 0,
    pending: 0,
    watching: [] as { email: string; name: string; title: string }[],
  };
  let invites: Invite[] = [];
  let dbError = false;
  try {
    [live, invites] = await Promise.all([getDashboardLive(), listInvites()]);
  } catch {
    dbError = true;
  }

  return (
    <>
      <AdminHeader />

      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Owner Dashboard</h1>
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-2 rounded-lg bg-cherry px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cherry-dark"
          >
            📊 Reports
          </Link>
        </div>

        {dbError && (
          <div className="mt-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
            ⚠️ Can&apos;t reach the database. Check <code>DATABASE_URL</code>.
          </div>
        )}

        <div className="mt-8">
          <LiveDashboard initial={live} />
        </div>

        {/* INVITE */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-cherry/[0.07] to-white/[0.02] p-6">
          <h2 className="text-lg font-bold">Invite someone</h2>
          <p className="mb-4 mt-1 text-sm text-white/50">
            Enter their email. They&apos;ll get a sign-in link, then set up their
            name before watching.
          </p>
          <InviteForm />
        </div>

        {/* MEMBERS */}
        <div className="mt-10">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-bold">
              Members &amp; invites
              <span className="ml-2 text-sm font-normal text-white/40">
                ({invites.length})
              </span>
            </h2>
            <span className="text-xs text-white/40">
              click a member for watch history
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
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
                    <td colSpan={5} className="px-4 py-10 text-center text-white/40">
                      No one invited yet. Add your first member above.
                    </td>
                  </tr>
                )}
                {invites.map((inv) => {
                  const status = memberStatus(inv);
                  const name = displayName(inv);
                  return (
                    <tr
                      key={inv.email}
                      className="border-t border-white/5 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/member/${encodeURIComponent(inv.email)}`}
                          className="flex items-center gap-3"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-cherry/20 text-xs font-bold text-cherry">
                            {name.charAt(0).toUpperCase()}
                          </span>
                          <span>
                            <span className="block font-medium text-white hover:text-cherry">
                              {name}
                            </span>
                            {(inv.first_name || inv.last_name) && (
                              <span className="block text-xs text-white/40">
                                {inv.email}
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_STYLE[status]}`}
                        >
                          {status}
                        </span>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

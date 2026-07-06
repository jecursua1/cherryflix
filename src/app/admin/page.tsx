import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, getStats, listInvites } from "@/lib/invites";
import Navbar from "@/components/Navbar";
import InviteForm from "@/components/InviteForm";
import RemoveButton from "@/components/RemoveButton";

export const dynamic = "force-dynamic";

function fmt(d: string | null): string {
  if (!d) return "—";
  const date = new Date(d);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function AdminPage() {
  // Middleware already gates this, but double-check server-side.
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  const [stats, invites] = await Promise.all([getStats(), listInvites()]);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-10 sm:px-8">
        <h1 className="text-3xl font-extrabold">Owner Dashboard</h1>
        <p className="mt-1 text-sm text-white/50">
          Signed in as {session?.user?.email}. Only you can see this page.
        </p>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat label="Active members" value={stats.members} accent />
          <Stat label="Pending invites" value={stats.pending} />
          <Stat label="Active this week" value={stats.activeWeek} />
        </div>

        {/* Invite */}
        <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-bold">Invite someone</h2>
          <p className="mb-4 mt-1 text-sm text-white/50">
            Enter their email. They&apos;ll get a &quot;Sign in to
            Cherryflix&quot; link — one click and they can watch.
          </p>
          <InviteForm />
        </div>

        {/* Members table */}
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-bold">
            Members &amp; invites ({invites.length})
          </h2>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
                <tr>
                  <th className="px-4 py-3">Email</th>
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
                  <tr key={inv.email} className="border-t border-white/5">
                    <td className="px-4 py-3 font-medium">{inv.email}</td>
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
      className={`rounded-xl border p-6 ${
        accent
          ? "border-cherry/40 bg-cherry/10"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-2 text-4xl font-extrabold">{value}</p>
    </div>
  );
}

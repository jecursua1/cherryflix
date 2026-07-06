import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  isAdmin,
  getMember,
  getMemberHistory,
  getMemberSeconds,
  formatDuration,
  displayName,
} from "@/lib/invites";
import { resolveRange, type RangeParams } from "@/lib/range";
import AdminHeader from "@/components/AdminHeader";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

function fmtDateTime(d: string): string {
  return new Date(d).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ email: string }>;
  searchParams: Promise<RangeParams>;
}) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) redirect("/");

  const { email: rawEmail } = await params;
  const email = decodeURIComponent(rawEmail);
  const sp = await searchParams;
  const member = await getMember(email);

  if (!member) {
    return (
      <>
        <AdminHeader />
        <main className="mx-auto max-w-[900px] px-4 py-16 sm:px-8">
          <Link href="/admin" className="text-sm text-white/60 hover:text-white">
            ← Back to dashboard
          </Link>
          <p className="mt-8 text-white/60">No member found for “{email}”.</p>
        </main>
      </>
    );
  }

  const { since, until, days, label } = resolveRange(sp);
  const [history, totalSeconds] = await Promise.all([
    getMemberHistory(email, since.toISOString(), until.toISOString()),
    getMemberSeconds(email),
  ]);

  const seen = member.last_seen ? new Date(member.last_seen).getTime() : 0;
  const activeNow = seen > 0 && Date.now() - seen < 5 * 60 * 1000;
  const watchAt = member.now_watching_at
    ? new Date(member.now_watching_at).getTime()
    : 0;
  const watchingNow = watchAt > 0 && Date.now() - watchAt < 2 * 60 * 1000;

  const presets = [30, 60, 90];
  const enc = encodeURIComponent(email);
  const exportQuery = sp.from && sp.to ? `from=${sp.from}&to=${sp.to}` : `days=${days}`;

  return (
    <>
      <AdminHeader />
      <main className="mx-auto w-full max-w-[900px] px-4 py-10 sm:px-8">
        <Link href="/admin" className="text-sm text-white/60 hover:text-white">
          ← Back to dashboard
        </Link>

        {/* Member header */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar
              image={member.image}
              name={displayName(member)}
              size={56}
              rounded="rounded-full"
              className="text-xl"
            />
            <div>
              <h1 className="text-3xl font-extrabold">{displayName(member)}</h1>
              <p className="mt-1 text-sm text-white/50">{member.email}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full px-2 py-0.5 ${
                  member.status === "accepted"
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "bg-amber-500/15 text-amber-400"
                }`}
              >
                {member.status === "accepted" ? "Active member" : "Pending invite"}
              </span>
              {activeNow && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400">
                  ● Online now
                </span>
              )}
              {watchingNow && (
                <span className="rounded-full bg-cherry/15 px-2 py-0.5 text-cherry">
                  ▶ Watching: {member.now_watching_title}
                </span>
              )}
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/70">
                ⏱ {formatDuration(totalSeconds)} total watch time
              </span>
              </div>
            </div>
          </div>
          <a
            href={`/api/admin/member/${enc}/export?${exportQuery}`}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ⬇ Export history (CSV)
          </a>
        </div>

        {/* Range selector */}
        <div className="mt-8 flex flex-wrap items-center gap-2">
          {presets.map((d) => (
            <Link
              key={d}
              href={`/admin/member/${enc}?days=${d}`}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                !sp.from && days === d
                  ? "border-cherry bg-cherry/15 text-white"
                  : "border-white/15 text-white/70 hover:bg-white/10"
              }`}
            >
              {d} days
            </Link>
          ))}
          <form method="get" className="flex items-center gap-2">
            <input
              type="date"
              name="from"
              defaultValue={sp.from}
              className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-cherry"
            />
            <span className="text-white/40">→</span>
            <input
              type="date"
              name="to"
              defaultValue={sp.to}
              className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-sm text-white outline-none focus:border-cherry"
            />
            <button className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
              Apply
            </button>
          </form>
        </div>
        <p className="mt-2 text-xs text-white/40">
          Showing: {label} · {history.length} view
          {history.length === 1 ? "" : "s"} · max range is 90 days
        </p>

        {/* History */}
        <div className="mt-6 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 hidden sm:table-cell">Episode</th>
                <th className="px-4 py-3">Watched</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-white/40">
                    No watch history in this range.
                  </td>
                </tr>
              )}
              {history.map((h, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium">{h.title_name ?? h.watch_id}</td>
                  <td className="px-4 py-3 hidden text-white/60 sm:table-cell">
                    {h.episode_label ?? "Movie"}
                  </td>
                  <td className="px-4 py-3 text-white/60">{fmtDateTime(h.watched_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { getWatchable } from "@/lib/content";
import { requireProfile } from "@/lib/gate";
import { logWatch } from "@/lib/invites";
import VideoPlayer from "@/components/VideoPlayer";
import Heartbeat from "@/components/Heartbeat";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const email = await requireProfile();
  const { id } = await params;
  const w = getWatchable(id);
  if (!w) notFound();

  const episodeLabel = w.episode
    ? `Episode ${w.episode.number} · ${w.episode.title}`
    : null;

  // Record the view for the member's watch history.
  await logWatch(email, {
    watchId: id,
    titleSlug: w.title.slug,
    titleName: w.title.name,
    episodeLabel: episodeLabel ?? undefined,
  });

  const nowTitle = w.episode
    ? `${w.title.name} — E${w.episode.number}`
    : w.title.name;

  return (
    <main className="fixed inset-0 flex flex-col bg-black">
      <Heartbeat watchId={id} title={nowTitle} />
      <div className="flex items-center gap-4 px-4 py-3">
        <Link
          href={w.backTo}
          className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
        >
          ← Back
        </Link>
        <div className="min-w-0">
          <p className="truncate font-semibold text-white">{w.heading}</p>
          <p className="truncate text-xs text-white/50">{w.subheading}</p>
        </div>
      </div>
      <div className="relative flex-1">
        <VideoPlayer src={w.video} poster={w.title.backdrop} />
      </div>
    </main>
  );
}

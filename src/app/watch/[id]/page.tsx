import Link from "next/link";
import { notFound } from "next/navigation";
import { getWatchable } from "@/lib/content";
import VideoPlayer from "@/components/VideoPlayer";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const w = getWatchable(id);
  if (!w) notFound();

  return (
    <main className="fixed inset-0 flex flex-col bg-black">
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

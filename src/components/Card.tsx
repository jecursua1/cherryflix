import Link from "next/link";
import type { Title } from "@/lib/content";

export default function Card({ title }: { title: Title }) {
  return (
    <Link
      href={`/title/${title.slug}`}
      className="group relative block w-[150px] shrink-0 sm:w-[180px]"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-white/5 ring-1 ring-white/10 transition duration-200 group-hover:ring-cherry/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={title.poster}
          alt={title.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/80">
          {title.type}
        </span>
      </div>
      <div className="mt-2">
        <p className="truncate text-sm font-medium text-white/90">{title.name}</p>
        <p className="truncate text-xs text-white/50">
          {title.year} · {title.genres.slice(0, 2).join(", ")}
        </p>
      </div>
    </Link>
  );
}

import Link from "next/link";
import type { Title } from "@/lib/content";

export default function Hero({ title }: { title: Title }) {
  const watchId =
    title.type === "movie" ? title.slug : title.episodes?.[0]?.id ?? title.slug;

  return (
    <section className="relative h-[62vh] min-h-[420px] w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={title.backdrop}
        alt={title.name}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/30 to-transparent" />

      <div className="relative flex h-full max-w-[1600px] flex-col justify-end px-4 pb-14 sm:px-8">
        <span className="mb-3 w-fit rounded bg-cherry px-2 py-1 text-xs font-bold uppercase tracking-wide">
          Featured
        </span>
        <h1 className="max-w-2xl text-4xl font-extrabold drop-shadow-lg sm:text-6xl">
          {title.name}
        </h1>
        <p className="mt-2 text-sm text-white/70">
          {title.year} · {title.rating} · {title.genres.join(" · ")}
        </p>
        <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base line-clamp-3">
          {title.description}
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href={`/watch/${watchId}`}
            className="flex items-center gap-2 rounded-md bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-white/85"
          >
            ▶ Play
          </Link>
          <Link
            href={`/title/${title.slug}`}
            className="flex items-center gap-2 rounded-md bg-white/15 px-6 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/25"
          >
            More Info
          </Link>
        </div>
      </div>
    </section>
  );
}

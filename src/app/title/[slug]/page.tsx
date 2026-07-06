import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug } from "@/lib/content";
import Navbar from "@/components/Navbar";

export default async function TitlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const title = getBySlug(slug);
  if (!title) notFound();

  const watchId =
    title.type === "movie" ? title.slug : title.episodes?.[0]?.id ?? title.slug;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative h-[50vh] min-h-[340px] w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={title.backdrop}
            alt={title.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </section>

        <div className="mx-auto -mt-40 max-w-[1100px] px-4 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={title.poster}
              alt={title.name}
              className="hidden w-44 shrink-0 rounded-lg ring-1 ring-white/10 sm:block"
            />
            <div className="relative">
              <h1 className="text-3xl font-extrabold sm:text-5xl">{title.name}</h1>
              <p className="mt-2 text-sm text-white/60">
                {title.year} · {title.rating} ·{" "}
                {title.type === "movie" ? title.duration : `${title.episodes?.length ?? 0} episodes`}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {title.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-4 max-w-2xl text-white/80">{title.description}</p>
              <Link
                href={`/watch/${watchId}`}
                className="mt-6 inline-flex items-center gap-2 rounded-md bg-cherry px-6 py-2.5 font-semibold text-white transition hover:bg-cherry-dark"
              >
                ▶ {title.type === "movie" ? "Play Movie" : "Play Episode 1"}
              </Link>
            </div>
          </div>

          {title.type === "anime" && title.episodes && (
            <section className="mt-12 pb-16">
              <h2 className="mb-4 text-xl font-bold">Episodes</h2>
              <ul className="space-y-3">
                {title.episodes.map((ep) => (
                  <li key={ep.id}>
                    <Link
                      href={`/watch/${ep.id}`}
                      className="group flex items-center gap-4 rounded-lg border border-white/5 bg-white/[0.03] p-3 transition hover:bg-white/[0.07]"
                    >
                      <div className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-white/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ep.thumbnail ?? title.backdrop}
                          alt={ep.title}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 grid place-items-center bg-black/30 text-2xl opacity-0 transition group-hover:opacity-100">
                          ▶
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">
                          {ep.number}. {ep.title}
                        </p>
                        <p className="text-xs text-white/50">{ep.duration}</p>
                        {ep.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-white/60">
                            {ep.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

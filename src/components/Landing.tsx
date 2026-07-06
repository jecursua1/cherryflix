import Link from "next/link";
import { CATALOG } from "@/lib/content";
import Faq from "./Faq";
import GetStartedForm from "./GetStartedForm";
import Logo from "./Logo";

const FEATURES = [
  {
    title: "Anime + movies",
    desc: "Full series with every episode, plus a growing library of films — all in one place.",
    icon: "🎬",
  },
  {
    title: "Private & ad-free",
    desc: "Invite-only access. No ads, no tracking, no noise. Just your people and the shows.",
    icon: "🔒",
  },
  {
    title: "Watch anywhere",
    desc: "Phone, tablet, laptop, or smart TV. Sign in from any browser and press play.",
    icon: "📺",
  },
  {
    title: "One click to watch",
    desc: "No passwords. We email you a secure magic link — click it and you're in.",
    icon: "⚡",
  },
];

export default function Landing() {
  const collage = [...CATALOG, ...CATALOG, ...CATALOG].slice(0, 24);
  const trending = CATALOG.slice(0, 8);

  return (
    <div className="flex flex-col">
      {/* NAV */}
      <header className="absolute top-0 z-30 w-full">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-5 sm:px-8">
          <Logo className="h-12 w-auto sm:h-14" />
          <Link
            href="/login"
            className="rounded-md bg-cherry px-5 py-2 font-semibold text-white transition hover:bg-cherry-dark"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative flex min-h-[94vh] items-center justify-center overflow-hidden border-b border-white/5">
        {/* poster collage background */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 gap-1.5 opacity-25 blur-[2px] sm:grid-cols-6 sm:grid-rows-4 lg:grid-cols-8 lg:grid-rows-3">
          {collage.map((t, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={t.poster}
              alt=""
              className="h-full w-full object-cover"
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
        <div className="absolute inset-0 [background:radial-gradient(circle_at_50%_35%,rgba(225,29,72,0.28),transparent_60%)]" />

        <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
          <h1 className="text-4xl font-extrabold leading-tight drop-shadow-xl sm:text-6xl">
            Unlimited anime &amp; movies,
            <br className="hidden sm:block" /> all in one place.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/75 sm:text-xl">
            Your private streaming space. Ad-free, invite-only, and always ready
            when you are.
          </p>
          <p className="mt-8 text-sm text-white/60">
            Already invited? Enter your email to sign in.
          </p>
          <div className="mt-3">
            <GetStartedForm />
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8">
        <h2 className="mb-6 text-2xl font-bold">Trending Now</h2>
        <div className="no-scrollbar flex gap-6 overflow-x-auto pb-4 pl-2">
          {trending.map((t, i) => (
            <Link
              href="/login"
              key={t.slug}
              className="group relative flex shrink-0 items-end"
              aria-label={t.name}
            >
              <span className="select-none text-[120px] font-extrabold leading-[0.8] text-white/[0.12] transition group-hover:text-cherry/30">
                {i + 1}
              </span>
              <div className="relative -ml-8 h-[220px] w-[150px] overflow-hidden rounded-lg ring-1 ring-white/10 transition group-hover:ring-cherry/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={t.poster}
                  alt={t.name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8">
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl">
          More reasons to join
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-cherry/10 to-white/[0.02] p-6"
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-sm text-white/65">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8">
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">
          Frequently asked questions
        </h2>
        <Faq />
        <div className="mx-auto mt-12 max-w-lg text-center">
          <p className="mb-3 text-white/70">
            Ready to watch? Sign in with your invited email.
          </p>
          <GetStartedForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-5 py-10 text-center text-sm text-white/40 sm:px-8">
        <Logo className="mx-auto h-11 w-auto" />
        <p className="mt-3">A private streaming space · Invite-only</p>
      </footer>
    </div>
  );
}

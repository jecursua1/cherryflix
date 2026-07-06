import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { touchUser, isAdmin, hasProfile } from "@/lib/invites";
import { getFeatured, getRows, getByType, type Title } from "@/lib/content";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Row from "@/components/Row";
import Card from "@/components/Card";
import Landing from "@/components/Landing";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();

  // Guests see the public marketing landing page.
  if (!session?.user) return <Landing />;

  // Members must set up their name before watching.
  const email = session.user.email;
  if (email && !isAdmin(email) && !(await hasProfile(email))) {
    redirect("/welcome");
  }

  const { type } = await searchParams;
  if (email) await touchUser(email);

  const filtered: Title[] | null =
    type === "anime" || type === "movie" ? getByType(type) : null;

  return (
    <>
      <Navbar />
      <main className="flex-1">
        {filtered ? (
          <section className="mx-auto max-w-[1600px] px-4 pt-24 sm:px-8">
            <h1 className="mb-6 text-2xl font-bold capitalize">
              {type === "anime" ? "Anime Series" : "Movies"}
            </h1>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {filtered.map((t) => (
                <Card key={t.slug} title={t} />
              ))}
            </div>
          </section>
        ) : (
          <>
            <Hero title={getFeatured()} />
            <div className="relative z-10 -mt-16 space-y-8 pb-16">
              {getRows().map((row) => (
                <Row key={row.title} title={row.title} items={row.items} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-8 text-center text-xs text-white/40 sm:px-8">
      <span className="text-cherry font-bold">Cherry</span>flix — a private
      streaming space. Invite-only.
    </footer>
  );
}

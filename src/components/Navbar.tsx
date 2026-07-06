import Link from "next/link";
import { auth } from "@/auth";
import { signOutAction } from "@/app/actions";
import { getMember } from "@/lib/invites";
import Heartbeat from "@/components/Heartbeat";
import Logo from "@/components/Logo";

export default async function Navbar() {
  const session = await auth();
  const email = session?.user?.email ?? "";
  const member = email ? await getMember(email) : null;
  const firstName = member?.first_name ?? "";
  const initial = (firstName.charAt(0) || email.charAt(0) || "?").toUpperCase();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-white/5">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-6 px-4 sm:px-8">
        <Link href="/" className="shrink-0">
          <Logo className="h-8 w-auto" />
        </Link>

        <nav className="hidden gap-5 text-sm text-white/70 sm:flex">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/?type=anime" className="hover:text-white">Anime</Link>
          <Link href="/?type=movie" className="hover:text-white">Movies</Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/account"
            className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-white/5"
            title="Account settings"
          >
            <span className="grid h-8 w-8 place-items-center rounded-md bg-cherry text-sm font-bold text-white">
              {initial}
            </span>
            {firstName && (
              <span className="hidden text-sm text-white/80 sm:inline">
                {firstName}
              </span>
            )}
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="text-sm text-white/60 hover:text-white"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
      <Heartbeat />
    </header>
  );
}

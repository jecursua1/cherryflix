import Link from "next/link";
import { cookies } from "next/headers";
import MemberLoginForm from "@/components/MemberLoginForm";
import Logo from "@/components/Logo";
import Avatar from "@/components/Avatar";
import { verifyRemember, REMEMBER_COOKIE } from "@/lib/remember";
import { getMember, displayName, isAdmin } from "@/lib/invites";
import { rememberLoginAction } from "@/app/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  // "Remember me on this device" — offer one-click sign-in.
  const jar = await cookies();
  const remEmail = verifyRemember(jar.get(REMEMBER_COOKIE)?.value);
  let remembered: { email: string; name: string; image: string | null } | null =
    null;
  if (remEmail && !isAdmin(remEmail)) {
    const m = await getMember(remEmail);
    if (m) remembered = { email: remEmail, name: displayName(m), image: m.image };
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Link href="/" aria-label="Cherryflix home">
            <Logo className="mx-auto h-14 w-auto" />
          </Link>
          <p className="mx-auto mt-4 max-w-xs text-sm text-white/50">
            Invite-only streaming. Sign in with the email you were invited with.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl sm:p-7">
          {remembered && (
            <>
              <form action={rememberLoginAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl border border-cherry/40 bg-cherry/10 p-3 text-left transition hover:bg-cherry/20"
                >
                  <Avatar
                    image={remembered.image}
                    name={remembered.name}
                    size={44}
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">
                      Continue as {remembered.name}
                    </span>
                    <span className="block truncate text-xs text-white/50">
                      {remembered.email}
                    </span>
                  </span>
                  <span className="ml-auto text-lg text-cherry">→</span>
                </button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                or sign in
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </>
          )}

          <MemberLoginForm prefill={email} />

          <p className="mt-5 text-center text-xs leading-relaxed text-white/40">
            First time? Just enter your email to set up your passcode.
            <br />
            Only emails invited by the owner can enter.
          </p>

          <div className="mt-5 border-t border-white/5 pt-4 text-center">
            <Link
              href="/"
              className="text-sm text-white/50 transition hover:text-white"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

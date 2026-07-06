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
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <Link
        href="/"
        className="absolute left-5 top-5 text-sm text-white/60 transition hover:text-white"
      >
        ← Back to home
      </Link>
      <div className="w-full max-w-sm">
        <Link href="/" aria-label="Cherryflix home">
          <Logo className="mx-auto h-14 w-auto" />
        </Link>
        <p className="mt-4 text-center text-sm text-white/50">
          Invite-only streaming. Sign in with the email you were invited with.
        </p>

        {remembered && (
          <form
            action={rememberLoginAction}
            className="mt-8 rounded-xl border border-cherry/30 bg-cherry/10 p-4"
          >
            <button
              type="submit"
              className="flex w-full items-center gap-3 text-left"
            >
              <Avatar image={remembered.image} name={remembered.name} size={44} />
              <span className="min-w-0">
                <span className="block font-semibold text-white">
                  Continue as {remembered.name}
                </span>
                <span className="block truncate text-xs text-white/50">
                  {remembered.email}
                </span>
              </span>
              <span className="ml-auto text-cherry">→</span>
            </button>
          </form>
        )}

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          {remembered && (
            <p className="mb-3 text-center text-xs uppercase tracking-wide text-white/30">
              Or sign in
            </p>
          )}
          <MemberLoginForm prefill={email} />
          <p className="mt-4 text-center text-xs text-white/40">
            First time? Just enter your email to set up your passcode. Only
            emails invited by the owner can enter.
          </p>
        </div>
      </div>
    </main>
  );
}

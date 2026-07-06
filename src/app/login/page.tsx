import LoginForm from "@/components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string; email?: string }>;
}) {
  const { sent, error, email } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-4xl font-extrabold">
          <span className="text-cherry">Cherry</span>flix
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">
          Invite-only streaming. Sign in with the email you were invited with.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          {sent ? (
            <p className="text-center text-sm text-emerald-400">
              ✔ Check your inbox — we sent your sign-in link. You can close this
              tab.
            </p>
          ) : (
            <>
              {error && (
                <p className="mb-3 text-center text-sm text-red-400">
                  Something went wrong signing in. Try again.
                </p>
              )}
              <LoginForm prefill={email} />
              <p className="mt-4 text-center text-xs text-white/40">
                Only members invited by the owner can enter. Not invited yet?
                Reach out to get access.
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

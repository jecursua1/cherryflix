import LoginForm from "@/components/LoginForm";
import OwnerLoginForm from "@/components/OwnerLoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-4xl font-extrabold">
          <span className="text-cherry">Cherry</span>flix
        </h1>
        <p className="mt-2 text-center text-sm text-white/50">
          Private streaming — sign in with your invited email.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          {sent ? (
            <p className="text-center text-sm text-emerald-400">
              ✔ Check your inbox — we sent you a sign-in link. You can close this
              tab.
            </p>
          ) : (
            <>
              {error && (
                <p className="mb-3 text-center text-sm text-red-400">
                  Something went wrong signing in. Try again.
                </p>
              )}
              <LoginForm />
              <p className="mt-4 text-center text-xs text-white/40">
                No password needed. We&apos;ll email you a magic link. Only
                invited emails can enter.
              </p>
              <OwnerLoginForm email="jerico.ursua1@gmail.com" />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

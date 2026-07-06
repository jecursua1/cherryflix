import MemberLoginForm from "@/components/MemberLoginForm";
import Logo from "@/components/Logo";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Logo className="mx-auto h-14 w-auto" />
        <p className="mt-4 text-center text-sm text-white/50">
          Invite-only streaming. Sign in with the email you were invited with.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <MemberLoginForm prefill={email} />
          <p className="mt-4 text-center text-xs text-white/40">
            No password needed. Only emails invited by the owner can enter.
          </p>
        </div>
      </div>
    </main>
  );
}

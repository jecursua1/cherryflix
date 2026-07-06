import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, hasProfile } from "@/lib/invites";
import WelcomeForm from "@/components/WelcomeForm";
import Logo from "@/components/Logo";

export const dynamic = "force-dynamic";

export default async function WelcomePage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");
  // Admins and members who already set their name don't need this page.
  if (isAdmin(email) || (await hasProfile(email))) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Logo className="mx-auto h-12 w-auto" />
        <h1 className="mt-4 text-center text-2xl font-extrabold">Welcome!</h1>
        <p className="mt-2 text-center text-sm text-white/60">
          One quick step — tell us your name so we can set up your profile.
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <WelcomeForm />
        </div>
      </div>
    </main>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMember } from "@/lib/invites";
import Navbar from "@/components/Navbar";
import AccountForm from "@/components/AccountForm";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");
  const member = await getMember(email);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-8">
        <h1 className="text-3xl font-extrabold">Your account</h1>
        <p className="mt-1 text-sm text-white/50">{email}</p>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-1 text-lg font-bold">Your name</h2>
          <p className="mb-4 text-sm text-white/50">
            This is how you appear on Cherryflix.
          </p>
          <AccountForm
            first={member?.first_name ?? ""}
            last={member?.last_name ?? ""}
          />
        </div>
      </main>
    </>
  );
}

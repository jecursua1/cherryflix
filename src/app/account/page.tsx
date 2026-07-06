import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMember, displayName } from "@/lib/invites";
import Navbar from "@/components/Navbar";
import AccountProfile from "@/components/AccountProfile";

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
        <h1 className="mb-6 text-3xl font-extrabold">Your account</h1>
        <AccountProfile
          image={member?.image ?? null}
          firstName={member?.first_name ?? ""}
          lastName={member?.last_name ?? ""}
          email={email}
          fullName={member ? displayName(member) : email}
        />
      </main>
    </>
  );
}

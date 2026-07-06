import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMember, displayName } from "@/lib/invites";
import Navbar from "@/components/Navbar";
import AccountForm from "@/components/AccountForm";
import ProfileImageForm from "@/components/ProfileImageForm";
import Avatar from "@/components/Avatar";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect("/login");
  const member = await getMember(email);

  const fullName = member ? displayName(member) : email;
  const hasName = Boolean(member?.first_name);

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-12 sm:px-8">
        <h1 className="text-3xl font-extrabold">Your account</h1>

        {/* Current profile summary */}
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <Avatar image={member?.image} name={fullName} size={72} className="text-2xl" />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold">
              {hasName ? fullName : "Add your name below"}
            </p>
            <p className="truncate text-sm text-white/50">{email}</p>
            <p className="mt-1 text-xs text-white/30">
              Your email is fixed and can&apos;t be changed.
            </p>
          </div>
        </div>

        {/* Edit profile photo */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-1 text-lg font-bold">Profile photo</h2>
          <p className="mb-4 text-sm text-white/50">
            Pick one of our avatars or upload your own. Stored privately, no
            upload service.
          </p>
          <ProfileImageForm current={member?.image ?? null} name={fullName} />
        </div>

        {/* Edit name */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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

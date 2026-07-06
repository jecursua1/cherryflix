import OwnerLoginForm from "@/components/OwnerLoginForm";

// Secret admin/owner sign-in page. Not linked anywhere; protected by OWNER_PASSWORD.
export const metadata = {
  title: "Cherryflix Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-center text-3xl font-extrabold">
          <span className="text-cherry">Cherry</span>flix
        </h1>
        <p className="mt-2 text-center text-xs uppercase tracking-widest text-white/40">
          Admin access
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/[0.03] p-6">
          <OwnerLoginForm />
        </div>
      </div>
    </main>
  );
}

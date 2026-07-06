import Link from "next/link";
import { signOutAction } from "@/app/actions";
import Logo from "@/components/Logo";

export default function AdminHeader() {
  return (
    <header className="border-b border-white/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-8">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo className="h-10 w-auto" />
          <span className="text-sm font-normal text-white/40">Admin</span>
        </Link>
        <form action={signOutAction}>
          <button type="submit" className="text-sm text-white/60 hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

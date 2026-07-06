import Link from "next/link";
import { signOutAction } from "@/app/actions";

export default function AdminHeader() {
  return (
    <header className="border-b border-white/5 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 sm:px-8">
        <Link href="/admin" className="text-2xl font-extrabold tracking-tight">
          <span className="text-cherry">Cherry</span>
          <span className="text-white">flix</span>
          <span className="ml-2 text-sm font-normal text-white/40">Admin</span>
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

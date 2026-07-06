"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GetStartedForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`);
      }}
      className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row"
    >
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Enter your invited email"
        className="flex-1 rounded-md border border-white/20 bg-black/50 px-4 py-3.5 text-white placeholder-white/50 outline-none backdrop-blur focus:border-cherry"
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-1 rounded-md bg-cherry px-7 py-3.5 text-lg font-semibold text-white transition hover:bg-cherry-dark"
      >
        Get Started ›
      </button>
    </form>
  );
}

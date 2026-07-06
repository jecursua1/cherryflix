"use client";

import { useState } from "react";
import { useActionState } from "react";
import { ownerLoginAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function OwnerLoginForm({ email }: { email?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(ownerLoginAction, initial);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full text-center text-xs text-white/50 underline-offset-2 hover:text-white hover:underline"
      >
        Owner? Sign in with a password instead
      </button>
    );
  }

  return (
    <form action={action} className="mt-4 space-y-2 border-t border-white/10 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">
        Owner sign in
      </p>
      <input
        name="email"
        type="email"
        required
        defaultValue={email}
        placeholder="owner email"
        className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-cherry"
      />
      <input
        name="password"
        type="password"
        required
        placeholder="owner password"
        className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-cherry"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-white px-4 py-2.5 font-semibold text-black transition hover:bg-white/85 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in as owner"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
    </form>
  );
}

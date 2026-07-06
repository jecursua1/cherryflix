"use client";

import { useActionState } from "react";
import { memberLoginAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function MemberLoginForm({ prefill }: { prefill?: string }) {
  const [state, action, pending] = useActionState(memberLoginAction, initial);

  return (
    <form action={action} className="space-y-3">
      <input
        name="email"
        type="email"
        required
        defaultValue={prefill}
        placeholder="you@email.com"
        className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry"
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-cherry px-4 py-3 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
    </form>
  );
}

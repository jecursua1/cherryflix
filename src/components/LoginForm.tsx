"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function LoginForm({ prefill }: { prefill?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);

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
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      {state.message && (
        <p
          className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}

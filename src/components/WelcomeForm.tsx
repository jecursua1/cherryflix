"use client";

import { useActionState } from "react";
import { saveProfileAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function WelcomeForm() {
  const [state, action, pending] = useActionState(saveProfileAction, initial);

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="firstName"
          required
          placeholder="First name"
          className="flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry"
        />
        <input
          name="lastName"
          required
          placeholder="Last name"
          className="flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-cherry px-4 py-3 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Start watching"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { saveProfileAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function WelcomeForm() {
  const [state, action, pending] = useActionState(saveProfileAction, initial);

  const inputCls =
    "w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry";

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input name="firstName" required placeholder="First name" className={inputCls} />
        <input name="lastName" required placeholder="Last name" className={inputCls} />
      </div>
      <input
        name="password"
        type="password"
        required
        placeholder="Create a password (min 6 characters)"
        className={inputCls}
      />
      <input
        name="confirm"
        type="password"
        required
        placeholder="Confirm password"
        className={inputCls}
      />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-cherry px-4 py-3 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save & start watching"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { memberLoginAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function MemberLoginForm({ prefill }: { prefill?: string }) {
  const [state, action, pending] = useActionState(memberLoginAction, initial);

  const inputCls =
    "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition focus:border-cherry focus:bg-white/[0.07]";

  return (
    <form action={action} className="space-y-3">
      <input
        name="email"
        type="email"
        required
        defaultValue={prefill}
        placeholder="you@email.com"
        className={inputCls}
      />
      <input
        name="passcode"
        type="password"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        placeholder="4-digit passcode"
        className={`${inputCls} text-center tracking-widest`}
      />
      <label className="flex cursor-pointer select-none items-center gap-2 py-1 text-sm text-white/60">
        <input
          type="checkbox"
          name="remember"
          value="1"
          className="h-4 w-4 accent-cherry"
        />
        Remember me on this device
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-cherry px-4 py-3 font-semibold text-white shadow-lg shadow-cherry/20 transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {state.message && !state.ok && (
        <p className="text-center text-sm text-red-400">{state.message}</p>
      )}
    </form>
  );
}

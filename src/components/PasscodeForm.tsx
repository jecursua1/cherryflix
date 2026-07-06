"use client";

import { useActionState } from "react";
import { setMemberPasscodeAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function PasscodeForm({
  email,
  current,
}: {
  email: string;
  current: string | null;
}) {
  const [state, action, pending] = useActionState(setMemberPasscodeAction, initial);

  return (
    <form action={action} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="email" value={email} />
      <div className="mr-2">
        <span className="text-sm text-white/50">Current passcode: </span>
        <span className="font-mono text-lg tracking-[0.3em] text-white">
          {current ?? "not set"}
        </span>
      </div>
      <input
        name="passcode"
        inputMode="numeric"
        pattern="\d{4}"
        maxLength={4}
        placeholder="New 4-digit"
        className="w-32 rounded-md border border-white/15 bg-white/5 px-3 py-2 text-white tracking-widest placeholder-white/40 outline-none focus:border-cherry"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set passcode"}
      </button>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { inviteAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function InviteForm() {
  const [state, action, pending] = useActionState(inviteAction, initial);

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          name="email"
          type="email"
          required
          placeholder="friend@email.com"
          className="flex-1 rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-cherry"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-cherry px-5 py-2.5 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
        >
          {pending ? "Inviting…" : "Send invite"}
        </button>
      </div>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

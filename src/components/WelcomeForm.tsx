"use client";

import { useActionState } from "react";
import { saveProfileAction, type ActionState } from "@/app/actions";
import AvatarPicker from "./AvatarPicker";

const initial: ActionState = { ok: false, message: "" };

export default function WelcomeForm() {
  const [state, action, pending] = useActionState(saveProfileAction, initial);

  const inputCls =
    "w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry";

  return (
    <form action={action} className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input name="firstName" required placeholder="First name" className={inputCls} />
        <input name="lastName" required placeholder="Last name" className={inputCls} />
      </div>

      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 text-sm font-semibold text-white/70">
          Choose a profile photo{" "}
          <span className="font-normal text-white/40">(optional)</span>
        </p>
        <AvatarPicker current={null} name="" />
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

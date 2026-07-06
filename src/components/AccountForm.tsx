"use client";

import { useActionState } from "react";
import { updateNameAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function AccountForm({
  first,
  last,
}: {
  first: string;
  last: string;
}) {
  const [state, action, pending] = useActionState(updateNameAction, initial);

  const inputCls =
    "w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry";

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          name="firstName"
          required
          defaultValue={first}
          placeholder="First name"
          className={inputCls}
        />
        <input
          name="lastName"
          required
          defaultValue={last}
          placeholder="Last name"
          className={inputCls}
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-cherry px-5 py-3 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

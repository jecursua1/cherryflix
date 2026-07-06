"use client";

import { useActionState } from "react";
import { removeAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function RemoveButton({ email }: { email: string }) {
  const [, action, pending] = useActionState(removeAction, initial);

  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-white/15 px-3 py-1 text-xs text-white/60 transition hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
      >
        {pending ? "…" : "Remove"}
      </button>
    </form>
  );
}

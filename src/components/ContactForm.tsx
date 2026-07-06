"use client";

import { useActionState } from "react";
import { contactAction, type ActionState } from "@/app/actions";

const initial: ActionState = { ok: false, message: "" };

export default function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, initial);

  const inputCls =
    "w-full rounded-md border border-white/15 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none focus:border-cherry";

  if (state.ok) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center text-emerald-300">
        ✔ {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input name="name" required placeholder="Your name" className={inputCls} />
        <input
          name="email"
          type="email"
          required
          placeholder="Your email"
          className={inputCls}
        />
      </div>
      <textarea
        name="message"
        required
        rows={5}
        placeholder="How can we help you?"
        className={`${inputCls} resize-y`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-cherry px-6 py-3 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send message"}
      </button>
      {state.message && !state.ok && (
        <p className="text-sm text-red-400">{state.message}</p>
      )}
    </form>
  );
}

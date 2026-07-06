"use client";

import { useActionState } from "react";
import { updateAvatarAction, type ActionState } from "@/app/actions";
import AvatarPicker from "./AvatarPicker";

const initial: ActionState = { ok: false, message: "" };

export default function ProfileImageForm({
  current,
  name,
}: {
  current: string | null;
  name: string;
}) {
  const [state, action, pending] = useActionState(updateAvatarAction, initial);

  return (
    <form action={action} className="space-y-5">
      <AvatarPicker current={current} name={name} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-cherry px-6 py-2.5 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save photo"}
      </button>
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

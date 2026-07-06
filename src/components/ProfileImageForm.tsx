"use client";

import { useActionState, useRef, useState } from "react";
import { updateAvatarAction, type ActionState } from "@/app/actions";
import Avatar from "./Avatar";

const initial: ActionState = { ok: false, message: "" };

// Resize + center-crop to a small square JPEG data URL (keeps DB storage tiny).
function resizeToDataUrl(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("no canvas"));
      const scale = Math.max(size / img.width, size / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => reject(new Error("bad image"));
    img.src = url;
  });
}

export default function ProfileImageForm({
  current,
  name,
}: {
  current: string | null;
  name: string;
}) {
  const [image, setImage] = useState<string>(current ?? "");
  const [err, setErr] = useState("");
  const [state, action, pending] = useActionState(updateAvatarAction, initial);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    if (!f.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    try {
      setImage(await resizeToDataUrl(f));
    } catch {
      setErr("Couldn't read that image. Try another one.");
    }
  }

  return (
    <form action={action} className="space-y-4">
      <div className="flex items-center gap-5">
        <Avatar image={image || null} name={name} size={80} className="text-3xl" />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Choose photo
          </button>
          {image && (
            <button
              type="button"
              onClick={() => setImage("")}
              className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/60 hover:border-red-500/50 hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
      <input type="hidden" name="image" value={image} />

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-cherry px-5 py-2.5 font-semibold text-white transition hover:bg-cherry-dark disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save photo"}
      </button>

      {err && <p className="text-sm text-red-400">{err}</p>}
      {state.message && (
        <p className={`text-sm ${state.ok ? "text-emerald-400" : "text-red-400"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

"use client";

import { useRef, useState } from "react";
import Avatar from "./Avatar";

const PRESETS = Array.from({ length: 6 }, (_, i) => `/avatars/avatar-${i + 1}.png`);

// Resize + center-crop an uploaded file to a small square JPEG data URL.
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

export default function AvatarPicker({
  current,
  name,
}: {
  current: string | null;
  name: string;
}) {
  const [image, setImage] = useState<string>(current ?? "");
  const [err, setErr] = useState("");
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
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar image={image || null} name={name} size={72} className="text-2xl" />
        <div className="text-sm text-white/50">
          {image ? "Your selected photo" : "No photo yet"}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">
          Pick an avatar
        </p>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p) => {
            const selected = image === p;
            return (
              <button
                type="button"
                key={p}
                onClick={() => setImage(p)}
                className={`overflow-hidden rounded-full ring-2 transition ${
                  selected ? "ring-cherry" : "ring-transparent hover:ring-white/30"
                }`}
                aria-label="Choose this avatar"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p} alt="" className="h-14 w-14 object-cover" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="rounded-md border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          Upload your own
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

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
      <input type="hidden" name="image" value={image} />
      {err && <p className="text-sm text-red-400">{err}</p>}
    </div>
  );
}

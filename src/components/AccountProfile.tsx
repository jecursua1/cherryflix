"use client";

import { useState } from "react";
import Avatar from "./Avatar";
import ProfileImageForm from "./ProfileImageForm";
import AccountForm from "./AccountForm";

function Pencil({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export default function AccountProfile({
  image,
  firstName,
  lastName,
  email,
  fullName,
}: {
  image: string | null;
  firstName: string;
  lastName: string;
  email: string;
  fullName: string;
}) {
  const [editPhoto, setEditPhoto] = useState(false);
  const [editName, setEditName] = useState(false);
  const displayName = firstName ? fullName : "Add your name";

  return (
    <div>
      {/* Profile summary */}
      <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <button
          type="button"
          onClick={() => setEditPhoto((v) => !v)}
          className="group relative shrink-0 rounded-md"
          title="Change photo"
          aria-label="Change photo"
        >
          <Avatar image={image} name={fullName} size={72} className="text-2xl" />
          <span className="absolute inset-0 grid place-items-center rounded-md bg-black/55 opacity-0 transition group-hover:opacity-100">
            <Pencil className="h-6 w-6 text-white" />
          </span>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-xl font-bold">{displayName}</p>
            <button
              type="button"
              onClick={() => setEditName((v) => !v)}
              className="shrink-0 rounded p-1 text-white/40 transition hover:bg-white/10 hover:text-white"
              title="Edit name"
              aria-label="Edit name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          <p className="truncate text-sm text-white/50">{email}</p>
        </div>
      </div>

      {/* Inline photo editor */}
      {editPhoto && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Profile photo</h2>
            <button
              type="button"
              onClick={() => setEditPhoto(false)}
              className="text-sm text-white/50 hover:text-white"
            >
              Close
            </button>
          </div>
          <ProfileImageForm current={image} name={fullName} />
        </div>
      )}

      {/* Inline name editor */}
      {editName && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Your name</h2>
            <button
              type="button"
              onClick={() => setEditName(false)}
              className="text-sm text-white/50 hover:text-white"
            >
              Close
            </button>
          </div>
          <AccountForm first={firstName} last={lastName} />
        </div>
      )}
    </div>
  );
}

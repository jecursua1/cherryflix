"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "What is Cherryflix?",
    a: "Cherryflix is a private, invite-only streaming space for anime series and movies. No ads, no tracking — just you and the shows you love.",
  },
  {
    q: "How do I get access?",
    a: "Access is invite-only. The owner adds your email, and you'll receive a “Sign in to Cherryflix” email with a secure link. One click and you're watching.",
  },
  {
    q: "Do I need a password?",
    a: "Nope. We email you a one-time magic link every time you sign in, so there's no password to remember or lose.",
  },
  {
    q: "What can I watch?",
    a: "Full anime series with individual episodes, plus a growing library of movies. New titles are added regularly.",
  },
  {
    q: "Where can I watch?",
    a: "Anywhere with a modern web browser — your phone, tablet, laptop, or smart TV. Just sign in and press play.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-medium text-white transition hover:bg-white/[0.04]"
            >
              {item.q}
              <span
                className={`text-2xl text-cherry transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-5 text-white/70">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

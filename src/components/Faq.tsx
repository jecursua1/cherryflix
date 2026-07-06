"use client";

import { useState } from "react";

const ITEMS: { q: string; a: string }[] = [
  {
    q: "What is Cherryflix?",
    a: "Cherryflix is a private streaming platform where you can watch anime series and movies online in one place. It's ad-free and invite-only, so you get a clean, distraction-free viewing experience anytime you want.",
  },
  {
    q: "How do I get access to Cherryflix?",
    a: "Cherryflix is invite-only. Once the owner adds your email, you'll get an invitation and can sign in with that same email address, with no lengthy sign-up forms and no waiting.",
  },
  {
    q: "How do I sign in to Cherryflix?",
    a: "Signing in is simple: go to the login page and enter the email address you were invited with. There's no password to remember. If you've been invited, you're in and ready to watch.",
  },
  {
    q: "What anime and movies can I watch on Cherryflix?",
    a: "You can stream full anime series with individual episodes, plus a growing library of movies across genres like action, fantasy, romance, and sci-fi. New titles are added regularly.",
  },
  {
    q: "Can I watch Cherryflix on my phone, laptop, or TV?",
    a: "Yes. Cherryflix works in any modern web browser, so you can watch anime and movies on your phone, tablet, laptop, or smart TV. Just sign in and press play, with no app to install.",
  },
  {
    q: "Is Cherryflix ad-free?",
    a: "Absolutely. Cherryflix is completely ad-free. Your viewing is private, with no ads interrupting your favorite anime and movies.",
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

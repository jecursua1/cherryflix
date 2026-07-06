"use client";

import { useRef } from "react";
import type { Title } from "@/lib/content";
import Card from "./Card";

export default function Row({ title, items }: { title: string; items: Title[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    ref.current?.scrollBy({ left: dir * 600, behavior: "smooth" });
  };

  return (
    <section className="group/row relative">
      <h2 className="mb-3 px-4 text-lg font-bold text-white sm:px-8">{title}</h2>

      <button
        aria-label="Scroll left"
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 z-20 hidden h-24 -translate-y-1/2 items-center bg-gradient-to-r from-background to-transparent px-2 text-3xl text-white/70 opacity-0 transition hover:text-white group-hover/row:opacity-100 sm:flex"
      >
        ‹
      </button>

      <div
        ref={ref}
        className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-4 pb-2 sm:px-8"
      >
        {items.map((t) => (
          <Card key={t.slug} title={t} />
        ))}
      </div>

      <button
        aria-label="Scroll right"
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 z-20 hidden h-24 -translate-y-1/2 items-center bg-gradient-to-l from-background to-transparent px-2 text-3xl text-white/70 opacity-0 transition hover:text-white group-hover/row:opacity-100 sm:flex"
      >
        ›
      </button>
    </section>
  );
}

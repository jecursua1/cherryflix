"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "./Avatar";

type Live = {
  activeNow: number;
  watchingNow: number;
  inactive: number;
  totalMembers: number;
  pending: number;
  watching: { email: string; name: string; title: string; image: string | null }[];
};

export default function LiveDashboard({ initial }: { initial: Live }) {
  const [data, setData] = useState<Live>(initial);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/admin/live", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as Live;
        if (alive) {
          setData(json);
          setPulse((p) => p + 1);
        }
      } catch {
        // ignore transient errors
      }
    };
    const id = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">
          Live now
        </h2>
        <span className="ml-1 text-xs text-white/30">updates every 5s</span>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active now"
          value={data.activeNow}
          tone="live"
          pulse={pulse}
        />
        <StatCard
          label="Watching now"
          value={data.watchingNow}
          tone="cherry"
          pulse={pulse}
        />
        <StatCard label="Inactive users" value={data.inactive} tone="muted" />
        <StatCard label="Total members" value={data.totalMembers} tone="muted" />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="mb-3 text-sm font-semibold text-white/70">
          Watching right now
        </h3>
        {data.watching.length === 0 ? (
          <p className="text-sm text-white/40">
            No one is watching at the moment.
          </p>
        ) : (
          <ul className="divide-y divide-white/5">
            {data.watching.map((w) => (
              <li
                key={w.email}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <Link
                  href={`/admin/member/${encodeURIComponent(w.email)}`}
                  className="flex items-center gap-2 font-medium text-white hover:text-cherry"
                >
                  <Avatar
                    image={w.image}
                    name={w.name}
                    size={28}
                    rounded="rounded-full"
                    className="text-xs"
                  />
                  {w.name}
                </Link>
                <span className="flex items-center gap-2 truncate text-sm text-white/60">
                  <span className="text-emerald-400">▶</span>
                  <span className="truncate">{w.title || "—"}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  tone,
  pulse,
}: {
  label: string;
  value: number;
  tone: "live" | "cherry" | "muted";
  pulse?: number;
}) {
  const styles =
    tone === "live"
      ? "border-emerald-500/30 bg-emerald-500/10"
      : tone === "cherry"
        ? "border-cherry/40 bg-cherry/10"
        : "border-white/10 bg-white/[0.03]";
  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      <p className="text-sm text-white/60">{label}</p>
      <p
        key={pulse}
        className="mt-2 text-4xl font-extrabold tabular-nums"
        style={{ animation: pulse ? "cf-pop 0.4s ease" : undefined }}
      >
        {value}
      </p>
    </div>
  );
}

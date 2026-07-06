"use client";

import { useEffect } from "react";

// Pings the server so the dashboard can show who's online / watching now.
// On the watch page, pass the current watchId + title.
export default function Heartbeat({
  watchId,
  title,
}: {
  watchId?: string;
  title?: string;
}) {
  useEffect(() => {
    let stopped = false;
    const ping = () => {
      if (stopped) return;
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchId, title }),
        keepalive: true,
      }).catch(() => {});
    };
    ping();
    const id = setInterval(ping, 25000);
    return () => {
      stopped = true;
      clearInterval(id);
    };
  }, [watchId, title]);

  return null;
}

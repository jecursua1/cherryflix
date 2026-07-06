"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Periodically refreshes server data so the dashboard's live counts stay fresh.
export default function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}

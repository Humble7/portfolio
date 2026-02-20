"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const visitRef = useRef<{ id: string; start: number } | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    // Send duration for the previous visit before tracking the new one
    sendDuration();

    const start = Date.now();
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: pathname,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.visitId) {
          visitRef.current = { id: data.visitId, start };
        }
      })
      .catch(() => {});

    const onHide = () => {
      if (document.visibilityState === "hidden") sendDuration();
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function sendDuration() {
    const visit = visitRef.current;
    if (!visit) return;

    const duration = Math.round((Date.now() - visit.start) / 1000);
    visitRef.current = null;
    if (duration < 1) return;

    // sendBeacon is reliable even when the page is closing
    navigator.sendBeacon(
      "/api/analytics/track",
      new Blob([JSON.stringify({ visitId: visit.id, duration })], {
        type: "application/json",
      })
    );
  }

  return null;
}

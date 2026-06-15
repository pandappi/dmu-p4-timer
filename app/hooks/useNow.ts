"use client";

import { useEffect, useState } from "react";

/** Ticks `now` on a fixed interval so countdowns re-render smoothly. */
export function useNow(intervalMs = 250) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

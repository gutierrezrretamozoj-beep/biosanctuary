"use client";

import { useState, useEffect, useCallback } from "react";

export function useCountdown(initialSeconds: number | null, onComplete?: () => void) {
  const [seconds, setSeconds] = useState<number | null>(initialSeconds);

  useEffect(() => {
    if (initialSeconds === null || initialSeconds <= 0) return;

    let current = initialSeconds;
    const timer = setInterval(() => {
      current -= 1;
      setSeconds(current <= 0 ? null : current);
      if (current <= 0) {
        clearInterval(timer);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [initialSeconds, onComplete]);

  const reset = useCallback((newSec: number | null) => {
    setSeconds(newSec);
  }, []);

  return {
    seconds,
    isCounting: seconds !== null && seconds > 0,
    reset,
  };
}

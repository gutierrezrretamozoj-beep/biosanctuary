"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";

export function useIdempotencyKey() {
  const [key, setKey] = useState<string>(() => uuidv4());

  const regenerateKey = useCallback(() => {
    const newKey = uuidv4();
    setKey(newKey);
    return newKey;
  }, []);

  return {
    key,
    regenerateKey,
  };
}

"use client";

import React, { useEffect } from "react";
import { Clock } from "lucide-react";

export interface RateLimitBannerProps {
  seconds: number;
  message?: string;
  onFinished?: () => void;
}

export function RateLimitBanner({
  seconds,
  message = "Has excedido el límite de peticiones permitido para tu santuario.",
  onFinished,
}: RateLimitBannerProps) {
  useEffect(() => {
    if (seconds <= 0) {
      onFinished?.();
    }
  }, [seconds, onFinished]);

  const shouldAnnounce = seconds <= 0 || seconds % 10 === 0;

  return (
    <div
      role="alert"
      className="p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-amber-500/15 backdrop-blur-xl shadow-lg shadow-amber-500/10 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight mb-0.5">
            Ventana de limitación temporal activa (Rate Limiting)
          </p>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
            {message} Podrás volver a enviar tu solicitud cuando termine la cuenta regresiva.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0 bg-amber-500/20 px-3.5 py-1.5 rounded-xl border border-amber-500/30">
        <span className="text-xs font-semibold uppercase text-amber-900 dark:text-amber-300">
          Reintento en:
        </span>
        <span className="font-mono text-base font-extrabold text-amber-700 dark:text-amber-300">
          {seconds}s
        </span>
      </div>

      <div aria-live="polite" className="sr-only">
        {shouldAnnounce
          ? `Límite de peticiones alcanzado. Espera ${seconds} segundos para reintentar.`
          : ""}
      </div>
    </div>
  );
}

export default RateLimitBanner;

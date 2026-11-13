"use client";

import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type BannerType = "success" | "warning" | "error" | "info";

export interface BannerProps {
  type: BannerType;
  title?: string;
  message: React.ReactNode;
  onDismiss?: () => void;
  autoDismissMs?: number;
  className?: string;
}

export function Banner({
  type,
  title,
  message,
  onDismiss,
  autoDismissMs = type === "success" ? 5000 : 0,
  className = "",
}: BannerProps) {
  useEffect(() => {
    if (autoDismissMs > 0 && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [autoDismissMs, onDismiss]);

  const role = type === "error" || type === "warning" ? "alert" : "status";

  const config = {
    error: {
      border: "border-red-500/30",
      bg: "bg-red-500/15 text-red-950 dark:text-red-100",
      icon: <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />,
    },
    warning: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/15 text-amber-950 dark:text-amber-100",
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />,
    },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/15 text-emerald-950 dark:text-emerald-100",
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
    info: {
      border: "border-teal-500/30",
      bg: "bg-teal-500/15 text-teal-950 dark:text-teal-100",
      icon: <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />,
    },
  }[type];

  return (
    <div
      role={role}
      className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2.5 backdrop-blur-md transition-all ${config.border} ${config.bg} ${className}`}
    >
      <div className="flex items-center gap-2.5">
        {config.icon}
        <div>
          {title && <p className="font-bold mb-0.5">{title}</p>}
          <div className="leading-relaxed">{message}</div>
        </div>
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificación"
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default Banner;

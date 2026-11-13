import React from "react";
import { Loader2 } from "lucide-react";

export function Spinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-10 h-10",
  }[size];

  return (
    <Loader2
      className={`animate-spin text-emerald-600 dark:text-emerald-400 ${sizeClasses} ${className}`}
      aria-label="Cargando contenido"
    />
  );
}

export function Skeleton({
  className = "h-4 w-full",
}: {
  className?: string;
}) {
  return (
    <div
      className={`animate-pulse bg-emerald-900/10 dark:bg-emerald-400/10 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-10 text-center rounded-2xl border border-dashed border-emerald-600/30 dark:border-emerald-400/25 bg-emerald-500/5 dark:bg-emerald-950/20 ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-emerald-900/70 dark:text-emerald-300/70 max-w-sm mb-5 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

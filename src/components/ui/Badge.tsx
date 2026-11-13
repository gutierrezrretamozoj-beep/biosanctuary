import React from "react";

export type BadgeVariant = "default" | "brand" | "success" | "warning" | "danger" | "info";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  const variantClasses = {
    default:
      "bg-emerald-900/10 dark:bg-emerald-400/10 text-emerald-900 dark:text-emerald-300 border-emerald-500/20",
    brand:
      "bg-emerald-500/15 dark:bg-emerald-400/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    success:
      "bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border-emerald-500/40",
    warning:
      "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40",
    danger:
      "bg-red-500/20 text-red-900 dark:text-red-200 border-red-500/40",
    info:
      "bg-sky-500/20 text-sky-900 dark:text-sky-200 border-sky-500/40",
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;

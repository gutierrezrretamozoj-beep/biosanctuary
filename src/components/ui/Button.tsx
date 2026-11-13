"use client";

import React from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  children,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 select-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "px-4 py-2.5 text-sm rounded-xl gap-2",
    lg: "px-8 py-4 text-base rounded-2xl gap-2.5",
  }[size];

  const variantClasses = {
    primary:
      "text-white bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0",
    secondary:
      "backdrop-blur-xl bg-white/80 dark:bg-emerald-950/60 border border-emerald-600/30 dark:border-emerald-400/30 text-emerald-950 dark:text-emerald-100 font-extrabold hover:bg-white dark:hover:bg-emerald-900/60 shadow-md hover:-translate-y-0.5",
    ghost:
      "text-emerald-900 dark:text-emerald-100 hover:bg-emerald-500/15 border border-emerald-600/15 dark:border-emerald-400/20",
    danger:
      "text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-md shadow-red-600/20 hover:-translate-y-0.5",
  }[variant];

  const isDisabled = disabled || loading;
  const disabledClasses = isDisabled
    ? "opacity-60 cursor-not-allowed hover:transform-none pointer-events-none"
    : "";

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Procesando…</span>
        </>
      ) : (
        <>
          {iconLeft && <span className="shrink-0">{iconLeft}</span>}
          {children}
          {iconRight && <span className="shrink-0">{iconRight}</span>}
        </>
      )}
    </button>
  );
}

export default Button;

"use client";

import React, { useId } from "react";
import { AlertCircle } from "lucide-react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  optional?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      id: customId,
      error,
      hint,
      optional = false,
      required,
      disabled,
      className = "",
      rows = 3,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const errorId = `${textareaId}-error`;
    const hintId = `${textareaId}-hint`;

    return (
      <div className="w-full text-left">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={textareaId}
              className="text-xs font-bold uppercase tracking-wider text-emerald-950 dark:text-emerald-100"
            >
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            {optional && (
              <span className="text-[11px] text-emerald-800/60 dark:text-emerald-300/60">
                (opcional)
              </span>
            )}
          </div>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          aria-required={required}
          className={`w-full p-3.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 backdrop-blur-md resize-none ${
            error
              ? "border-red-500/80 bg-red-50/50 dark:bg-red-950/20 text-red-950 dark:text-red-100 focus:ring-red-400 border"
              : "border-emerald-600/25 dark:border-emerald-400/25 bg-white/70 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-50 focus:ring-emerald-400 border hover:border-emerald-500/40"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
          {...props}
        />

        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={hintId} className="mt-1 text-xs text-emerald-900/60 dark:text-emerald-300/60">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;

"use client";

import React, { useId } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  icon?: React.ReactNode;
  error?: string | null;
  hint?: string;
  optional?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      id: customId,
      icon,
      error,
      hint,
      optional = false,
      required,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;

    return (
      <div className="w-full text-left">
        {label && (
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor={selectId}
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

        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 pointer-events-none w-4 h-4 flex items-center justify-center">
              {icon}
            </div>
          )}

          <select
            ref={ref}
            id={selectId}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            aria-required={required}
            className={`w-full ${
              icon ? "pl-10" : "pl-3.5"
            } pr-10 py-2.5 rounded-xl text-sm appearance-none transition-all focus:outline-none focus:ring-2 backdrop-blur-md cursor-pointer ${
              error
                ? "border-red-500/80 bg-red-50/50 dark:bg-red-950/20 text-red-950 dark:text-red-100 focus:ring-red-400 border"
                : "border-emerald-600/25 dark:border-emerald-400/25 bg-white/70 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-50 focus:ring-emerald-400 border hover:border-emerald-500/40"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-emerald-950 text-white"
              >
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400 pointer-events-none w-4 h-4 flex items-center justify-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

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

Select.displayName = "Select";
export default Select;

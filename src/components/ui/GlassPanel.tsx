import React from "react";

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  radius?: "xl" | "2xl" | "3xl";
  padding?: string;
  children: React.ReactNode;
}

export function GlassPanel({
  as: Component = "div",
  radius = "2xl",
  padding = "p-6",
  className = "",
  children,
  ...props
}: GlassPanelProps) {
  const radiusClass =
    radius === "xl" ? "rounded-xl" : radius === "3xl" ? "rounded-3xl" : "rounded-2xl";

  return (
    <Component
      className={`backdrop-blur-2xl bg-white/75 dark:bg-emerald-950/45 border border-emerald-600/25 dark:border-emerald-400/20 shadow-2xl shadow-emerald-950/15 dark:shadow-black/60 transition-all duration-300 ${radiusClass} ${padding} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default GlassPanel;

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useNatureTheme } from "@/context/NatureThemeContext";

export function DayNightSwitch() {
  const { mode, toggleMode, isDay } = useNatureTheme();

  return (
    <button
      onClick={toggleMode}
      type="button"
      aria-label={`Cambiar a modo ${isDay ? "noche" : "día"}`}
      className={`relative inline-flex h-9 w-18 items-center rounded-full p-1 transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
        isDay
          ? "bg-gradient-to-r from-amber-200 via-emerald-200 to-sky-200 border border-amber-300 shadow-md shadow-amber-500/20"
          : "bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/40 shadow-lg shadow-emerald-500/20"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`flex h-7 w-7 items-center justify-center rounded-full shadow-md ${
          isDay
            ? "translate-x-0 bg-gradient-to-br from-amber-400 to-yellow-500 text-amber-950 shadow-amber-400/50"
            : "translate-x-9 bg-gradient-to-br from-slate-200 via-sky-100 to-emerald-200 text-emerald-950 shadow-emerald-400/40"
        }`}
      >
        {isDay ? (
          <motion.div
            initial={{ rotate: -90, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Sun className="h-4 w-4 text-amber-950 stroke-[2.5]" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ rotate: 90, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Moon className="h-4 w-4 text-slate-800 stroke-[2.5]" />
          </motion.div>
        )}
      </motion.div>
      <span className="sr-only">
        {isDay ? "Modo Día (Sol activo)" : "Modo Noche (Luna activa)"}
      </span>
    </button>
  );
}

export default DayNightSwitch;

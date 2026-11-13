"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type NatureThemeMode = "day" | "night";

interface NatureThemeContextType {
  mode: NatureThemeMode;
  toggleMode: () => void;
  setMode: (mode: NatureThemeMode) => void;
  isDay: boolean;
  isNight: boolean;
}

const NatureThemeContext = createContext<NatureThemeContextType | undefined>(undefined);

export function NatureThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<NatureThemeMode>("day");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Lectura de preferencia visual no sensitiva en localStorage (sin tokens ni datos de sesión)
    try {
      const saved = localStorage.getItem("biosanctuary_theme_mode") as NatureThemeMode;
      if (saved === "day" || saved === "night") {
        setModeState(saved);
      }
    } catch {
      // Ignorar en caso de restricciones de almacenamiento del navegador
    }
    setMounted(true);
  }, []);

  const setMode = (newMode: NatureThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem("biosanctuary_theme_mode", newMode);
    } catch {
      // Ignorar
    }
  };

  const toggleMode = () => {
    const next = mode === "day" ? "night" : "day";
    setMode(next);
  };

  return (
    <NatureThemeContext.Provider
      value={{
        mode: mounted ? mode : "day",
        toggleMode,
        setMode,
        isDay: (mounted ? mode : "day") === "day",
        isNight: (mounted ? mode : "day") === "night",
      }}
    >
      <div
        className={`min-h-screen transition-colors duration-700 ${
          (mounted ? mode : "day") === "day"
            ? "bg-[#ECFDF5] text-emerald-950"
            : "bg-[#040D09] text-emerald-50"
        }`}
      >
        {children}
      </div>
    </NatureThemeContext.Provider>
  );
}

export function useNatureTheme() {
  const context = useContext(NatureThemeContext);
  if (!context) {
    throw new Error("useNatureTheme debe usarse dentro de un NatureThemeProvider");
  }
  return context;
}

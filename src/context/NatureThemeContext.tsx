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

  useEffect(() => {
    if (typeof document !== "undefined") {
      if (currentMode === "night") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [currentMode]);

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

  const currentMode = mounted ? mode : "day";

  return (
    <NatureThemeContext.Provider
      value={{
        mode: currentMode,
        toggleMode,
        setMode,
        isDay: currentMode === "day",
        isNight: currentMode === "night",
      }}
    >
      <div
        className={`w-full h-full min-h-screen transition-colors duration-700 ${
          currentMode === "day"
            ? "bg-gradient-to-b from-[#99F6E4] via-[#6EE7B7] to-[#047857] text-emerald-950"
            : "bg-gradient-to-b from-[#0F172A] via-[#022C22] to-[#040D09] text-emerald-50"
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

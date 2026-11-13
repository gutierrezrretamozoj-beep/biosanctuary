"use client";

import dynamic from "next/dynamic";
import React from "react";

const LivingSanctuaryCanvas = dynamic(
  () => import("./LivingSanctuaryCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-emerald-950/20 to-teal-950/20 backdrop-blur-sm animate-pulse" />
    ),
  }
);

export function DynamicLivingSanctuary() {
  return <LivingSanctuaryCanvas />;
}

export default DynamicLivingSanctuary;

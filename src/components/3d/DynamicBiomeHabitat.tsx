"use client";

import dynamic from "next/dynamic";
import React from "react";
import type { BiomaType } from "./BiomeHabitat3D";

const BiomeHabitat3D = dynamic(
  () => import("./BiomeHabitat3D"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-44 rounded-xl bg-emerald-950/20 animate-pulse flex items-center justify-center text-xs text-emerald-400/60">
        Cargando hábitat 3D...
      </div>
    ),
  }
);

export function DynamicBiomeHabitat({ bioma }: { bioma: BiomaType }) {
  return <BiomeHabitat3D bioma={bioma} />;
}

export default DynamicBiomeHabitat;

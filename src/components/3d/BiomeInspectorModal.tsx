"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RotateCw,
  Sparkles,
} from "lucide-react";
import { useNatureTheme } from "@/context/NatureThemeContext";
import {
  WildlifeFox,
  WildlifeParrot,
  WildlifeFlamingo,
  WildlifeHorse,
  WildlifeFish,
  RealisticPlant,
} from "./models";

/**
 * Flores Bioluminiscentes en Forma de Campana en el Borde del Pedestal
 */
function BioluminescentFlora({ isDay }: { isDay: boolean }) {
  const flowerPoints: Array<[number, number, number, number]> = [
    [-1.25, 0.28, 0.85, 0],
    [-0.95, 0.28, -1.05, 1],
    [1.25, 0.28, 0.75, 2],
    [1.15, 0.28, -0.95, 3],
    [-1.35, 0.28, -0.15, 4],
    [0.85, 0.28, 1.25, 5],
  ];

  return (
    <group>
      {flowerPoints.map(([fx, fy, fz, id]) => (
        <group key={id} position={[fx, fy, fz]}>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.02, 0.035, 0.36, 5]} />
            <meshStandardMaterial color="#059669" flatShading />
          </mesh>

          <mesh position={[0, 0.4, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.11, 0.2, 6]} />
            <meshStandardMaterial
              color={isDay ? "#FEF08A" : "#38BDF8"}
              emissive={isDay ? "#FACC15" : "#0284C7"}
              emissiveIntensity={isDay ? 1.4 : 3.0}
            />
          </mesh>

          <pointLight
            distance={1.6}
            intensity={isDay ? 0.3 : 1.2}
            color={isDay ? "#FDE047" : "#38BDF8"}
            position={[0, 0.42, 0]}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Fauna 3D Realista Representativa para Cada Bioma
 */
function BiomeFaunaPresenter({ biomeIndex }: { biomeIndex: number }) {
  switch (biomeIndex) {
    case 0: // JUNGLE
      return (
        <group position={[0, 0.3, 0]}>
          <WildlifeParrot position={[0, 0.65, 0]} rotation={[0, -0.6, 0]} scale={0.012} speed={1.2} />
          <RealisticPlant position={[-0.8, 0.22, 0.4]} scale={1.2} />
          <RealisticPlant position={[0.7, 0.22, -0.5]} scale={1.0} rotation={[0, 1.4, 0]} />
        </group>
      );
    case 1: // AQUATIC
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeFlamingo position={[-0.25, 0.25, 0.1]} rotation={[0, 0.5, 0]} scale={0.0045} speed={0.9} />
          <WildlifeFish position={[0.5, 0.3, -0.2]} rotation={[0, Math.PI / 2, 0]} scale={1.6} swimSpeed={2.0} />
          <RealisticPlant position={[0.75, 0.22, 0.5]} scale={0.9} />
        </group>
      );
    case 2: // SAVANNA
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeHorse position={[0, 0.25, 0]} rotation={[0, 0.4, 0]} scale={0.0036} speed={1.1} />
          <RealisticPlant position={[-0.85, 0.22, -0.6]} scale={0.7} />
        </group>
      );
    case 3: // DESERT
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeFox position={[0, 0.25, 0]} rotation={[0, -0.5, 0]} scale={0.014} animation="Survey" speed={0.9} />
        </group>
      );
    case 4: // FOREST
    default:
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeFox position={[0, 0.25, 0]} rotation={[0, 0.3, 0]} scale={0.015} animation="Survey" speed={1.0} />
          <RealisticPlant position={[-0.8, 0.22, -0.5]} scale={1.1} rotation={[0, 2.0, 0]} />
          <RealisticPlant position={[0.8, 0.22, 0.4]} scale={0.9} rotation={[0, -0.5, 0]} />
        </group>
      );
  }
}

/**
 * Pedestal Giratorio Metálico con Anillo de Luz Neón y Modelo Realista
 */
function TurntableScene({
  isDay,
  biomeIndex,
  isRotating,
}: {
  isDay: boolean;
  biomeIndex: number;
  isRotating: boolean;
}) {
  const turntableRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (turntableRef.current && isRotating) {
      turntableRef.current.rotation.y = clock.getElapsedTime() * 0.35;
    }
  });

  const biomeColors = ["#047857", "#0284C7", "#CA8A04", "#D97706", "#166534"];
  const currentTerrain = isDay
    ? biomeColors[biomeIndex % biomeColors.length]
    : "#064E3B";

  return (
    <group ref={turntableRef} position={[0, -0.65, 0]}>
      {/* Base metálica cilíndrica del pedestal */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <cylinderGeometry args={[2.05, 2.25, 0.38, 36]} />
        <meshStandardMaterial
          color="#0B132B"
          roughness={0.35}
          metalness={0.85}
        />
      </mesh>

      {/* Anillo de luz Neón perimetral */}
      <mesh position={[0, 0.2, 0]}>
        <torusGeometry args={[2.08, 0.045, 16, 64]} />
        <meshBasicMaterial color={isDay ? "#10B981" : "#38BDF8"} />
      </mesh>

      {/* Plataforma de césped / bioma */}
      <mesh position={[0, 0.24, 0]} receiveShadow>
        <cylinderGeometry args={[1.96, 1.98, 0.14, 36]} />
        <meshStandardMaterial
          color={currentTerrain}
          roughness={0.85}
          flatShading
        />
      </mesh>

      {/* Pequeños guijarros en el pedestal */}
      {[
        [-0.8, 0.33, 0.4],
        [0.75, 0.33, -0.5],
        [0.3, 0.33, 0.9],
        [-0.5, 0.33, -0.7],
      ].map(([px, py, pz], idx) => (
        <mesh key={idx} position={[px, py, pz]} scale={[0.12, 0.08, 0.12]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#64748B" roughness={0.9} flatShading />
        </mesh>
      ))}

      {/* Fauna Realista Auténtica por Bioma */}
      <Suspense fallback={null}>
        <BiomeFaunaPresenter biomeIndex={biomeIndex} />
      </Suspense>

      {/* Flores bioluminiscentes alrededor */}
      <BioluminescentFlora isDay={isDay} />
    </group>
  );
}

const BIOME_PRESETS = [
  {
    type: "JUNGLE",
    name: "Selva Nocturna Tropical",
    desc: "Ecosistema tropical de dosel denso y humedad constante con fauna aviar colorida.",
    specimens: "14 Especies",
    occupancy: "82% Ocupación",
    status: "ÓPTIMO",
    humidity: "88%",
  },
  {
    type: "AQUATIC",
    name: "Humedal y Laguna",
    desc: "Cuerpo de agua dulce con vegetación de ribera, flamencos y peces nativos.",
    specimens: "9 Especies",
    occupancy: "65% Ocupación",
    status: "ÓPTIMO",
    humidity: "95%",
  },
  {
    type: "SAVANNA",
    name: "Sabana Abierta",
    desc: "Pradera de pastos dorados y fauna corredora en llanura abierta.",
    specimens: "11 Especies",
    occupancy: "74% Ocupación",
    status: "ESTABLE",
    humidity: "42%",
  },
  {
    type: "DESERT",
    name: "Cañón Desértico",
    desc: "Ambiente árido con suculentas y refugios térmicos rocosos adaptados.",
    specimens: "5 Especies",
    occupancy: "45% Ocupación",
    status: "ÓPTIMO",
    humidity: "20%",
  },
  {
    type: "FOREST",
    name: "Bosque Templado Andino",
    desc: "Bosque de pinos alpinos, líquenes y mamíferos silvestres en libertad protegida.",
    specimens: "8 Especies",
    occupancy: "70% Ocupación",
    status: "ÓPTIMO",
    humidity: "68%",
  },
];

export function BiomeInspectorModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { isDay } = useNatureTheme();
  const [biomeIdx, setBiomeIdx] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  if (!isOpen) return null;

  const currentBiome = BIOME_PRESETS[biomeIdx];

  const handlePrev = () => {
    setBiomeIdx((prev) => (prev === 0 ? BIOME_PRESETS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setBiomeIdx((prev) => (prev === BIOME_PRESETS.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl backdrop-blur-2xl bg-emerald-950/90 border border-emerald-400/40 shadow-2xl shadow-black/90 overflow-hidden text-emerald-50">
        {/* CABECERA DEL MODAL */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-800/60 bg-emerald-900/30">
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5 mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visor Holográfico de Hábitat Realista</span>
            </div>
            <h2 className="text-lg font-black text-white">
              Vista del Bioma 3D — {currentBiome.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-800/60 text-emerald-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CINTA DE TELEMETRÍA Y BADGES DE SEGURIDAD */}
        <div className="px-5 py-2.5 bg-black/30 border-b border-emerald-800/40 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-2 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Idempotencia: <strong className="text-white">Confirmada</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 text-emerald-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              Rate Limit: <strong className="text-white">0 / 100 reqs</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Estado: {currentBiome.status}</span>
          </div>
        </div>

        {/* ESCENA 3D CENTRAL DEL TURNTABLE */}
        <div className="relative w-full h-80 bg-gradient-to-b from-emerald-950/60 via-black/40 to-emerald-950/80">
          <Canvas
            shadows
            camera={{ position: [0, 1.8, 4.4], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={isDay ? 1.0 : 0.5} />
            <directionalLight
              intensity={isDay ? 2.2 : 1.2}
              position={[2, 4, 3]}
              color={isDay ? "#FFFBEB" : "#BAE6FD"}
              castShadow
            />
            <TurntableScene
              isDay={isDay}
              biomeIndex={biomeIdx}
              isRotating={isRotating}
            />
          </Canvas>

          {/* Flecha Izquierda */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shadow-xl transition-all hover:scale-110 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Flecha Derecha */}
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shadow-xl transition-all hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Botón flotante inferior para pausar/reanudar giro */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/60 border border-emerald-400/40 text-emerald-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`}
              />
              <span>{isRotating ? "Giro Activo" : "Reanudar Giro"}</span>
            </button>
          </div>
        </div>

        {/* PIE DEL MODAL CON ESTADÍSTICAS DEL HÁBITAT */}
        <div className="p-5 bg-emerald-950/80 border-t border-emerald-800/60 space-y-3">
          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {currentBiome.desc}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
              <div className="text-[10px] text-emerald-300">Fauna Albergada</div>
              <div className="font-black text-white">{currentBiome.specimens}</div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
              <div className="text-[10px] text-emerald-300">Ocupación</div>
              <div className="font-black text-emerald-300">
                {currentBiome.occupancy}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-900/40 border border-emerald-700/40">
              <div className="text-[10px] text-emerald-300">Humedad Bioma</div>
              <div className="font-black text-sky-300">
                {currentBiome.humidity}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiomeInspectorModal;

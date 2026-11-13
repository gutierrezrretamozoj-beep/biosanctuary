"use client";

import React, { useRef, useState, useMemo } from "react";
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
  TreePine,
  Waves,
  Sun,
  Flame,
  Info,
} from "lucide-react";
import { useNatureTheme } from "@/context/NatureThemeContext";

/**
 * Escultura Low-Poly del Ciervo en Reposo (Resting Deer)
 * Reproducción fidedigna con cornamenta ramificada, pelaje leonado,
 * manchas en el lomo, orejas atentas y patas replegadas
 */
function SculptedDeer({ isDay }: { isDay: boolean }) {
  const deerRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (deerRef.current) {
      // Respiración sutil del animal
      const breath = Math.sin(clock.getElapsedTime() * 2.0) * 0.015;
      deerRef.current.position.y = 0.32 + breath;
    }
  });

  return (
    <group ref={deerRef} position={[0, 0.32, 0]} scale={[0.9, 0.9, 0.9]}>
      {/* Cuerpo principal (pecho y lomo) */}
      <mesh position={[0, 0.32, -0.05]} castShadow>
        <boxGeometry args={[0.72, 0.48, 1.25]} />
        <meshStandardMaterial
          color="#B45309"
          roughness={0.82}
          metalness={0.05}
          flatShading
        />
      </mesh>

      {/* Vientre y pecho claro */}
      <mesh position={[0, 0.22, 0.05]}>
        <boxGeometry args={[0.68, 0.3, 1.1]} />
        <meshStandardMaterial color="#FEF3C7" roughness={0.85} flatShading />
      </mesh>

      {/* Cuello esbelto y curvado */}
      <mesh position={[0, 0.78, 0.48]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.32, 0.6, 0.38]} />
        <meshStandardMaterial color="#D97706" roughness={0.8} flatShading />
      </mesh>

      {/* Cabeza del ciervo */}
      <mesh position={[0, 1.15, 0.62]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.28, 0.44]} />
        <meshStandardMaterial color="#B45309" roughness={0.8} flatShading />
      </mesh>

      {/* Hocico */}
      <mesh position={[0, 1.08, 0.84]}>
        <boxGeometry args={[0.2, 0.16, 0.2]} />
        <meshStandardMaterial color="#451A03" roughness={0.7} flatShading />
      </mesh>

      {/* Ojos oscuros */}
      <mesh position={[-0.14, 1.2, 0.68]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#0F172A" />
      </mesh>
      <mesh position={[0.14, 1.2, 0.68]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color="#0F172A" />
      </mesh>

      {/* Orejas triangulares estilizadas */}
      <mesh position={[-0.2, 1.28, 0.48]} rotation={[0.2, 0, -0.45]}>
        <coneGeometry args={[0.08, 0.24, 4]} />
        <meshStandardMaterial color="#D97706" flatShading />
      </mesh>
      <mesh position={[0.2, 1.28, 0.48]} rotation={[0.2, 0, 0.45]}>
        <coneGeometry args={[0.08, 0.24, 4]} />
        <meshStandardMaterial color="#D97706" flatShading />
      </mesh>

      {/* Cornamenta ramificada elegante (Astas) */}
      <group position={[0, 1.35, 0.52]}>
        {/* Asta izquierda */}
        <mesh position={[-0.15, 0.2, 0]} rotation={[0.15, 0, -0.32]}>
          <cylinderGeometry args={[0.025, 0.04, 0.45, 5]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} flatShading />
        </mesh>
        <mesh position={[-0.26, 0.38, 0.04]} rotation={[0.3, 0, -0.7]}>
          <cylinderGeometry args={[0.018, 0.025, 0.24, 4]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} flatShading />
        </mesh>
        <mesh position={[-0.18, 0.45, -0.06]} rotation={[-0.2, 0, -0.2]}>
          <cylinderGeometry args={[0.015, 0.022, 0.22, 4]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} flatShading />
        </mesh>

        {/* Asta derecha */}
        <mesh position={[0.15, 0.2, 0]} rotation={[0.15, 0, 0.32]}>
          <cylinderGeometry args={[0.025, 0.04, 0.45, 5]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} flatShading />
        </mesh>
        <mesh position={[0.26, 0.38, 0.04]} rotation={[0.3, 0, 0.7]}>
          <cylinderGeometry args={[0.018, 0.025, 0.24, 4]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} flatShading />
        </mesh>
        <mesh position={[0.18, 0.45, -0.06]} rotation={[-0.2, 0, 0.2]}>
          <cylinderGeometry args={[0.015, 0.022, 0.22, 4]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.6} flatShading />
        </mesh>
      </group>

      {/* Patas replegadas en reposo */}
      <mesh position={[-0.32, 0.1, 0.28]} rotation={[0.1, 0, 0.2]}>
        <boxGeometry args={[0.2, 0.22, 0.55]} />
        <meshStandardMaterial color="#92400E" flatShading />
      </mesh>
      <mesh position={[0.32, 0.1, 0.28]} rotation={[0.1, 0, -0.2]}>
        <boxGeometry args={[0.2, 0.22, 0.55]} />
        <meshStandardMaterial color="#92400E" flatShading />
      </mesh>
      <mesh position={[-0.34, 0.08, -0.35]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.22, 0.24, 0.65]} />
        <meshStandardMaterial color="#92400E" flatShading />
      </mesh>
      <mesh position={[0.34, 0.08, -0.35]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.22, 0.24, 0.65]} />
        <meshStandardMaterial color="#92400E" flatShading />
      </mesh>

      {/* Manchas blancas leonadas sobre el lomo */}
      {[
        [-0.18, 0.57, 0.1],
        [-0.12, 0.57, -0.2],
        [-0.2, 0.57, -0.4],
        [0.18, 0.57, 0.15],
        [0.14, 0.57, -0.15],
        [0.2, 0.57, -0.35],
      ].map(([sx, sy, sz], idx) => (
        <mesh key={idx} position={[sx, sy, sz]}>
          <circleGeometry args={[0.045, 6]} />
          <meshBasicMaterial color="#FEF3C7" />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Flores Bioluminiscentes en Forma de Campana
 * Con tallo verde, capullo brillante y halo luminoso ambiental
 */
function BioluminescentFlora({ isDay }: { isDay: boolean }) {
  const flowerPoints: Array<[number, number, number, number]> = [
    [-1.15, 0.28, 0.85, 0],
    [-0.95, 0.28, -0.95, 1],
    [1.15, 0.28, 0.75, 2],
    [1.25, 0.28, -0.85, 3],
    [-1.35, 0.28, -0.15, 4],
    [0.85, 0.28, 1.15, 5],
  ];

  return (
    <group>
      {flowerPoints.map(([fx, fy, fz, id]) => (
        <group key={id} position={[fx, fy, fz]}>
          {/* Tallo orgánico */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.035, 0.42, 5]} />
            <meshStandardMaterial color="#059669" flatShading />
          </mesh>

          {/* Campanilla bioluminiscente */}
          <mesh position={[0, 0.44, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 0.22, 6]} />
            <meshStandardMaterial
              color={isDay ? "#FEF08A" : "#38BDF8"}
              emissive={isDay ? "#FACC15" : "#0284C7"}
              emissiveIntensity={isDay ? 1.4 : 3.2}
            />
          </mesh>

          {/* Luz puntual emitida por la flor */}
          <pointLight
            distance={1.6}
            intensity={isDay ? 0.3 : 1.2}
            color={isDay ? "#FDE047" : "#38BDF8"}
            position={[0, 0.45, 0]}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Pedestal Giratorio Metálico con Anillo de Luz Neón
 * Como se muestra exactamente en el video
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

      {/* Ciervo descansando en el centro */}
      <SculptedDeer isDay={isDay} />

      {/* Flores bioluminiscentes alrededor */}
      <BioluminescentFlora isDay={isDay} />
    </group>
  );
}

const BIOME_PRESETS = [
  {
    type: "JUNGLE",
    name: "Selva Nocturna",
    desc: "Ecosistema tropical de dosel denso y humedad constante",
    specimens: "14 Especies",
    occupancy: "82% Ocupación",
    status: "ÓPTIMO",
    humidity: "88%",
  },
  {
    type: "AQUATIC",
    name: "Humedal y Laguna",
    desc: "Cuerpo de agua dulce con vegetación de ribera y nutrias",
    specimens: "9 Especies",
    occupancy: "65% Ocupación",
    status: "ÓPTIMO",
    humidity: "95%",
  },
  {
    type: "SAVANNA",
    name: "Sabana Abierta",
    desc: "Pradera de acacias, termiteros y pastos dorados",
    specimens: "11 Especies",
    occupancy: "74% Ocupación",
    status: "ESTABLE",
    humidity: "42%",
  },
  {
    type: "DESERT",
    name: "Cañón Desértico",
    desc: "Ambiente árido con suculentas y refugios térmicos rocosos",
    specimens: "5 Especies",
    occupancy: "45% Ocupación",
    status: "ÓPTIMO",
    humidity: "20%",
  },
  {
    type: "FOREST",
    name: "Bosque Templado",
    desc: "Bosque de pinos alpinos, líquenes y microclima fresco",
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
              <span>Visor Holográfico de Hábitat</span>
            </div>
            <h2 className="text-lg font-black text-white">
              Vista del Bioma 3D — {currentBiome.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-800/60 text-emerald-300 hover:text-white transition-all"
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
            gl={{ antialias: true, alpha: true }}
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
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shadow-xl transition-all hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Flecha Derecha */}
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shadow-xl transition-all hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Botón flotante inferior para pausar/reanudar giro */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="px-3.5 py-1.5 rounded-full backdrop-blur-md bg-black/60 border border-emerald-400/40 text-emerald-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg"
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

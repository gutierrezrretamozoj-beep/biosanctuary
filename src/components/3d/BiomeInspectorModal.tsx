"use client";

import React, { useRef, useState, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  RotateCw,
} from "lucide-react";
import { useNatureTheme } from "@/context/NatureThemeContext";
import {
  WildlifeFlamingo,
  WildlifeHorse,
  WildlifeFox,
  WildlifeFish,
  RealisticPlant,
} from "./models";

/**
 * Escultura del Ciervo en Reposo (Resting Deer)
 * Reproducción fidedigna con cornamenta ramificada, pelaje leonado,
 * manchas en el lomo, orejas atentas y patas replegadas
 * Tal como se observa exactamente en la telemetría del video (frame_0160)
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

      {/* Orejas triangulares */}
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
          <meshBasicMaterial color={isDay ? "#FEF3C7" : "#FFFFFF"} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Flores Bioluminiscentes en Forma de Campana en el Borde del Pedestal
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
 * Presentador de Fauna para el Visor Turntable
 * Para Selva Nocturna (Index 0): Ciervo en reposo con flores bioluminiscentes (frame_0160)
 * Para otros biomas: Fauna realista animada
 */
function BiomeFaunaPresenter({ biomeIndex, isDay }: { biomeIndex: number; isDay: boolean }) {
  switch (biomeIndex) {
    case 0: // JUNGLE - Selva Nocturna (tal como se ve exactamente en frame_0160)
      return (
        <group>
          <SculptedDeer isDay={isDay} />
          <BioluminescentFlora isDay={isDay} />
        </group>
      );
    case 1: // AQUATIC - Humedal
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeFlamingo position={[-0.25, 0.25, 0.1]} rotation={[0, 0.5, 0]} scale={0.0045} speed={0.9} />
          <WildlifeFish position={[0.5, 0.3, -0.2]} rotation={[0, Math.PI / 2, 0]} scale={1.6} swimSpeed={2.0} />
          <RealisticPlant position={[0.75, 0.22, 0.5]} scale={0.9} />
        </group>
      );
    case 2: // SAVANNA - Sabana
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeHorse position={[0, 0.25, 0]} rotation={[0, 0.4, 0]} scale={0.0036} speed={1.1} />
          <RealisticPlant position={[-0.85, 0.22, -0.6]} scale={0.7} />
        </group>
      );
    case 3: // DESERT - Cañón
      return (
        <group position={[0, 0.25, 0]}>
          <WildlifeFox position={[0, 0.25, 0]} rotation={[0, -0.5, 0]} scale={0.014} animation="Survey" speed={0.9} />
        </group>
      );
    case 4: // FOREST - Bosque
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
 * Pedestal Giratorio Metálico con Anillo de Luz Neón
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

      {/* Fauna del Bioma Activo */}
      <Suspense fallback={null}>
        <BiomeFaunaPresenter biomeIndex={biomeIndex} isDay={isDay} />
      </Suspense>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in pointer-events-auto">
      {/* Tarjeta Flotante Glassmorphism Exacta a frame_0160 */}
      <div className="relative w-full max-w-[420px] rounded-3xl backdrop-blur-2xl bg-[#041a12]/85 border border-emerald-400/40 shadow-2xl shadow-black/90 p-4 text-emerald-50">
        {/* CABECERA DEL VISOR */}
        <div className="flex items-center justify-between pb-2.5 border-b border-emerald-800/40">
          <h2 className="text-sm font-black text-white tracking-wide">
            Vista del Bioma 3D - {currentBiome.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800/60 text-emerald-300 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PILLS SUBHEADER: GIRO PERMITIDO / PRUEBA IDEMPOTENCIA */}
        <div className="flex items-center gap-2 pt-2.5 pb-2 text-[10px] font-semibold text-emerald-300">
          <div className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <RotateCw className="w-3 h-3 text-emerald-400" />
            <span>Giro Permitido</span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3 h-3 text-[#00E599]" />
            <span>Prueba Idempotencia</span>
          </div>
        </div>

        {/* FILA DE TELEMETRÍA: IDEMPOTENCIA, CONFIRMACIÓN, RATE LIMIT */}
        <div className="py-2 border-y border-emerald-800/40 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-5 bg-[#00E599] rounded-full inline-block" />
            <div>
              <div className="text-[9px] text-emerald-300/80 font-sans">Idempotencia:</div>
              <div className="font-bold text-white">92 %</div>
            </div>
          </div>

          <div>
            <div className="text-[9px] text-emerald-300/80 font-sans">Confirmación:</div>
            <div className="font-bold text-[#00E599]">Confirmada</div>
          </div>

          <div>
            <div className="text-[9px] text-emerald-300/80 font-sans">Rate Limit:</div>
            <div className="font-bold text-white">0/100 reqs</div>
          </div>
        </div>

        {/* ESCENA 3D TURNTABLE */}
        <div className="relative w-full h-64 my-1">
          <Canvas
            shadows
            camera={{ position: [0, 1.6, 4.0], fov: 42 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            <ambientLight intensity={isDay ? 1.0 : 0.55} />
            <directionalLight
              intensity={isDay ? 2.2 : 1.3}
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
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shadow-xl transition-all hover:scale-110 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Flecha Derecha */}
          <button
            onClick={handleNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shadow-xl transition-all hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Botón flotante inferior para pausar/reanudar giro */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center">
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="px-3 py-1 rounded-full backdrop-blur-md bg-black/70 border border-emerald-400/40 text-emerald-200 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-lg cursor-pointer"
            >
              <RotateCw
                className={`w-3 h-3 ${isRotating ? "animate-spin" : ""}`}
              />
              <span>{isRotating ? "Giro Activo" : "Reanudar Giro"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BiomeInspectorModal;

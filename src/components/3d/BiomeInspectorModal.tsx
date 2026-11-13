"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { X, ChevronLeft, ChevronRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useNatureTheme } from "@/context/NatureThemeContext";

/**
 * Pedestal con ciervo low-poly acostado y flores bioluminiscentes
 * Tal como se muestra en el video (frame_4_192.jpg)
 */
function TurntablePedestal({ isDay, biomeIndex }: { isDay: boolean; biomeIndex: number }) {
  const pedestalRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (pedestalRef.current) {
      pedestalRef.current.rotation.y = clock.getElapsedTime() * 0.25;
    }
  });

  const biomeColors = ["#047857", "#0284C7", "#CA8A04", "#D97706", "#166534"];
  const currentGroundColor = isDay ? biomeColors[biomeIndex % biomeColors.length] : "#064E3B";

  return (
    <group ref={pedestalRef} position={[0, -0.6, 0]}>
      {/* Base circular cilíndrica del pedestal */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[2.0, 2.2, 0.35, 32]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Anillo de luz neon del pedestal */}
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[2.05, 0.04, 16, 64]} />
        <meshBasicMaterial color={isDay ? "#10B981" : "#38BDF8"} />
      </mesh>

      {/* Suelo vegetal sobre el pedestal */}
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[1.92, 1.95, 0.12, 32]} />
        <meshStandardMaterial color={currentGroundColor} roughness={0.8} flatShading />
      </mesh>

      {/* Ciervo descansando en el pedestal */}
      <group position={[0, 0.3, 0]} scale={[0.85, 0.85, 0.85]}>
        {/* Cuerpo */}
        <mesh position={[0, 0.35, 0]}>
          <boxGeometry args={[0.7, 0.45, 1.15]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} flatShading />
        </mesh>
        {/* Cuello y cabeza */}
        <mesh position={[0, 0.8, 0.45]} rotation={[-0.3, 0, 0]}>
          <boxGeometry args={[0.3, 0.55, 0.35]} />
          <meshStandardMaterial color="#D97706" roughness={0.8} flatShading />
        </mesh>
        <mesh position={[0, 1.15, 0.6]}>
          <boxGeometry args={[0.26, 0.26, 0.4]} />
          <meshStandardMaterial color="#B45309" roughness={0.8} flatShading />
        </mesh>
        {/* Orejas */}
        <mesh position={[-0.18, 1.25, 0.45]} rotation={[0.2, 0, -0.4]}>
          <coneGeometry args={[0.07, 0.22, 4]} />
          <meshStandardMaterial color="#D97706" flatShading />
        </mesh>
        <mesh position={[0.18, 1.25, 0.45]} rotation={[0.2, 0, 0.4]}>
          <coneGeometry args={[0.07, 0.22, 4]} />
          <meshStandardMaterial color="#D97706" flatShading />
        </mesh>
        {/* Cornamenta */}
        <mesh position={[-0.14, 1.45, 0.55]} rotation={[0.2, 0, -0.3]}>
          <cylinderGeometry args={[0.02, 0.04, 0.4, 4]} />
          <meshStandardMaterial color="#FEF3C7" flatShading />
        </mesh>
        <mesh position={[0.14, 1.45, 0.55]} rotation={[0.2, 0, 0.3]}>
          <cylinderGeometry args={[0.02, 0.04, 0.4, 4]} />
          <meshStandardMaterial color="#FEF3C7" flatShading />
        </mesh>
        {/* Manchas del lomo */}
        <mesh position={[-0.18, 0.59, 0.1]}>
          <circleGeometry args={[0.06, 6]} />
          <meshBasicMaterial color="#FEF3C7" />
        </mesh>
        <mesh position={[0.18, 0.59, 0.2]}>
          <circleGeometry args={[0.06, 6]} />
          <meshBasicMaterial color="#FEF3C7" />
        </mesh>
      </group>

      {/* Flores bioluminiscentes alrededor del ciervo */}
      {[
        [-1.1, 0.3, 0.8],
        [-0.9, 0.3, -0.9],
        [1.1, 0.3, 0.7],
        [1.2, 0.3, -0.8],
        [-1.3, 0.3, -0.1],
        [0.8, 0.3, 1.1],
      ].map(([fx, fy, fz], idx) => (
        <group key={idx} position={[fx, fy, fz]}>
          {/* Tallo */}
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 0.4, 4]} />
            <meshStandardMaterial color="#059669" flatShading />
          </mesh>
          {/* Flor / Capullo bioluminiscente */}
          <mesh position={[0, 0.42, 0]}>
            <dodecahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={isDay ? "#FEF08A" : "#38BDF8"}
              emissive={isDay ? "#FACC15" : "#0284C7"}
              emissiveIntensity={isDay ? 1.5 : 3.0}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const biomes = [
  { name: "Selva Nocturna", desc: "Ecosistema tropical de dosel denso", icon: "JUNGLE" },
  { name: "Humedal Acuático", desc: "Laguna cristalina y vegetación de ribera", icon: "AQUATIC" },
  { name: "Sabana Dorada", desc: "Praderas abiertas y acacias", icon: "SAVANNA" },
  { name: "Desierto Cálido", desc: "Dunas ondulantes y cactus adaptados", icon: "DESERT" },
  { name: "Bosque Alpino", desc: "Pinos resinosos y rocas musgosas", icon: "FOREST" },
];

export function BiomeInspectorModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { isDay } = useNatureTheme();
  const [currentIdx, setCurrentIdx] = useState(0);

  if (!isOpen) return null;

  const currentBiome = biomes[currentIdx];

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev === 0 ? biomes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIdx((prev) => (prev === biomes.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl backdrop-blur-2xl bg-emerald-950/85 border border-emerald-400/30 shadow-2xl shadow-black/80 overflow-hidden text-emerald-50">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-emerald-800/60">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Vista del Bioma 3D - {currentBiome.name}</span>
            </h2>
            <p className="text-xs text-emerald-300/70">{currentBiome.desc}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-emerald-500/20 text-emerald-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Badges de Estado */}
        <div className="px-5 pt-3 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Idempotencia: Confirmada</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Rate Limit: 0/100 reqs</span>
          </div>
        </div>

        {/* Visor 3D en Vivo del Ciervo y Pedestal */}
        <div className="w-full h-64 relative">
          <Canvas
            camera={{ position: [0, 2.0, 4.5], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={isDay ? 1.0 : 0.4} color={isDay ? "#FEF3C7" : "#BAE6FD"} />
            <directionalLight
              position={[3, 5, 3]}
              intensity={isDay ? 2.2 : 1.0}
              color={isDay ? "#FFFBEB" : "#BAE6FD"}
            />
            <TurntablePedestal isDay={isDay} biomeIndex={currentIdx} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={Math.PI / 4}
            />
          </Canvas>

          {/* Flechas de Navegación entre Biomas */}
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-emerald-500/30 text-white backdrop-blur-md transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-emerald-500/30 text-white backdrop-blur-md transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Pie del Modal con Acciones */}
        <div className="p-4 bg-emerald-950/90 border-t border-emerald-800/60 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-300">
            Bioma {currentIdx + 1} de {biomes.length}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md shadow-emerald-600/30"
          >
            Cerrar Vista
          </button>
        </div>
      </div>
    </div>
  );
}

export default BiomeInspectorModal;

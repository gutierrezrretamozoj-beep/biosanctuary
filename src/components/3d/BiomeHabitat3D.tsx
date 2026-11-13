"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useNatureTheme } from "@/context/NatureThemeContext";

export type BiomaType = "JUNGLE" | "AQUATIC" | "SAVANNA" | "DESERT" | "FOREST";

function BiomeContent({ bioma, isDay }: { bioma: BiomaType; isDay: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Rotación pasiva muy sutil
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
  });

  switch (bioma) {
    case "JUNGLE":
      return (
        <group ref={groupRef}>
          {/* Suelo húmedo de selva */}
          <mesh position={[0, -0.6, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 24]} />
            <meshStandardMaterial color={isDay ? "#047857" : "#022C22"} roughness={0.8} />
          </mesh>
          {/* Árbol tropical central frondoso */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.15, 0.25, 1.6, 6]} />
            <meshStandardMaterial color="#5C2C16" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.4, 0]}>
            <dodecahedronGeometry args={[0.9, 1]} />
            <meshStandardMaterial color={isDay ? "#10B981" : "#065F46"} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[-0.6, 1.1, 0.4]}>
            <dodecahedronGeometry args={[0.6, 1]} />
            <meshStandardMaterial color={isDay ? "#059669" : "#047857"} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0.6, 1.2, -0.3]}>
            <dodecahedronGeometry args={[0.65, 1]} />
            <meshStandardMaterial color={isDay ? "#34D399" : "#059669"} roughness={0.7} flatShading />
          </mesh>
          {/* Helechos y lianas bajas */}
          <mesh position={[-0.8, -0.35, -0.8]}>
            <coneGeometry args={[0.4, 0.7, 5]} />
            <meshStandardMaterial color="#059669" flatShading />
          </mesh>
          <mesh position={[1, -0.35, 0.6]}>
            <coneGeometry args={[0.35, 0.6, 5]} />
            <meshStandardMaterial color="#10B981" flatShading />
          </mesh>
        </group>
      );

    case "AQUATIC":
      return (
        <group ref={groupRef}>
          {/* Cuenco de agua cristalina */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 24]} />
            <meshStandardMaterial color={isDay ? "#0284C7" : "#0C4A6E"} roughness={0.2} metalness={0.8} />
          </mesh>
          {/* Isla central de piedra */}
          <mesh position={[0, -0.35, 0]}>
            <dodecahedronGeometry args={[0.8, 1]} />
            <meshStandardMaterial color="#64748B" roughness={0.9} flatShading />
          </mesh>
          {/* Nenúfares flotantes */}
          <mesh position={[-0.9, -0.38, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.35, 8]} />
            <meshStandardMaterial color="#22C55E" roughness={0.6} />
          </mesh>
          <mesh position={[1.1, -0.38, -0.6]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.4, 8]} />
            <meshStandardMaterial color="#16A34A" roughness={0.6} />
          </mesh>
          {/* Juncos acuáticos */}
          <mesh position={[1.4, 0.1, 0.8]}>
            <cylinderGeometry args={[0.04, 0.05, 1.1, 4]} />
            <meshStandardMaterial color="#65A30D" flatShading />
          </mesh>
          <mesh position={[1.5, 0.15, 0.6]}>
            <cylinderGeometry args={[0.04, 0.05, 1.25, 4]} />
            <meshStandardMaterial color="#84CC16" flatShading />
          </mesh>
        </group>
      );

    case "SAVANNA":
      return (
        <group ref={groupRef}>
          {/* Tierra árida dorada */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 24]} />
            <meshStandardMaterial color={isDay ? "#CA8A04" : "#713F12"} roughness={0.9} />
          </mesh>
          {/* Acacia de copa plana estilizada */}
          <mesh position={[-0.2, 0.35, 0]}>
            <cylinderGeometry args={[0.12, 0.22, 1.5, 6]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          <mesh position={[-0.2, 1.2, 0]}>
            <cylinderGeometry args={[1.3, 0.8, 0.35, 8]} />
            <meshStandardMaterial color={isDay ? "#65A30D" : "#3F6212"} roughness={0.8} flatShading />
          </mesh>
          {/* Pastizales secos */}
          <mesh position={[1.1, -0.3, 0.8]}>
            <coneGeometry args={[0.3, 0.6, 4]} />
            <meshStandardMaterial color="#EAB308" flatShading />
          </mesh>
          <mesh position={[-1.2, -0.3, -0.8]}>
            <coneGeometry args={[0.25, 0.5, 4]} />
            <meshStandardMaterial color="#FACC15" flatShading />
          </mesh>
        </group>
      );

    case "DESERT":
      return (
        <group ref={groupRef}>
          {/* Duna de arena suave */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 24]} />
            <meshStandardMaterial color={isDay ? "#F59E0B" : "#B45309"} roughness={0.95} />
          </mesh>
          {/* Cactus saguaro geométrico */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 1.6, 8]} />
            <meshStandardMaterial color={isDay ? "#15803D" : "#166534"} roughness={0.7} flatShading />
          </mesh>
          {/* Brazo izquierdo cactus */}
          <mesh position={[-0.32, 0.35, 0]}>
            <boxGeometry args={[0.35, 0.16, 0.16]} />
            <meshStandardMaterial color={isDay ? "#15803D" : "#166534"} flatShading />
          </mesh>
          <mesh position={[-0.45, 0.6, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 6]} />
            <meshStandardMaterial color={isDay ? "#15803D" : "#166534"} flatShading />
          </mesh>
          {/* Brazo derecho cactus */}
          <mesh position={[0.32, 0.55, 0]}>
            <boxGeometry args={[0.35, 0.16, 0.16]} />
            <meshStandardMaterial color={isDay ? "#15803D" : "#166534"} flatShading />
          </mesh>
          <mesh position={[0.45, 0.8, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.5, 6]} />
            <meshStandardMaterial color={isDay ? "#15803D" : "#166534"} flatShading />
          </mesh>
          {/* Rocas del desierto */}
          <mesh position={[-0.9, -0.32, 0.9]}>
            <dodecahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} flatShading />
          </mesh>
        </group>
      );

    case "FOREST":
    default:
      return (
        <group ref={groupRef}>
          {/* Suelo de bosque con musgo */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 24]} />
            <meshStandardMaterial color={isDay ? "#166534" : "#064E3B"} roughness={0.85} />
          </mesh>
          {/* Pino alpino en capas */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.14, 0.22, 1.3, 6]} />
            <meshStandardMaterial color="#451A03" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[1.0, 1.1, 6]} />
            <meshStandardMaterial color={isDay ? "#15803D" : "#065F46"} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.75, 0.9, 6]} />
            <meshStandardMaterial color={isDay ? "#16A34A" : "#047857"} roughness={0.8} flatShading />
          </mesh>
          <mesh position={[0, 2.05, 0]}>
            <coneGeometry args={[0.5, 0.7, 6]} />
            <meshStandardMaterial color={isDay ? "#22C55E" : "#059669"} roughness={0.7} flatShading />
          </mesh>
          {/* Roca con musgo */}
          <mesh position={[1.1, -0.3, -0.6]}>
            <dodecahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#475569" roughness={0.8} flatShading />
          </mesh>
        </group>
      );
  }
}

export function BiomeHabitat3D({ bioma }: { bioma: BiomaType }) {
  const { isDay } = useNatureTheme();

  return (
    <div className="w-full h-44 rounded-xl overflow-hidden bg-gradient-to-b from-transparent to-black/10 relative">
      <Canvas
        camera={{ position: [0, 2.2, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isDay ? 1.0 : 0.4} color={isDay ? "#FEF3C7" : "#BAE6FD"} />
        <directionalLight
          position={isDay ? [4, 6, 3] : [-4, 6, -3]}
          intensity={isDay ? 1.8 : 0.9}
          color={isDay ? "#FFFBEB" : "#BAE6FD"}
        />
        <BiomeContent bioma={bioma} isDay={isDay} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={1.0}
        />
      </Canvas>
    </div>
  );
}

export default BiomeHabitat3D;

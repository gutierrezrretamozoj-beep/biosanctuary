"use client";

import React, { useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useNatureTheme } from "@/context/NatureThemeContext";
import {
  WildlifeFox,
  WildlifeParrot,
  WildlifeFlamingo,
  WildlifeHorse,
  WildlifeFish,
  WildlifeDuck,
  RealisticPlant,
} from "./models";

export type BiomaType = "JUNGLE" | "AQUATIC" | "SAVANNA" | "DESERT" | "FOREST";

function BiomeContent({ bioma, isDay }: { bioma: BiomaType; isDay: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Rotación pasiva muy sutil para exhibición de 360 grados
      groupRef.current.rotation.y = clock.getElapsedTime() * 0.12;
    }
  });

  switch (bioma) {
    case "JUNGLE":
      return (
        <group ref={groupRef}>
          {/* Suelo húmedo de selva esmeralda */}
          <mesh position={[0, -0.6, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
            <meshStandardMaterial color={isDay ? "#047857" : "#022C22"} roughness={0.8} />
          </mesh>

          {/* Loro Guacamayo Tropical Realista con Aleteo Vivo */}
          <WildlifeParrot
            position={[0, 0.35, 0]}
            rotation={[0, -Math.PI / 4, 0]}
            scale={0.009}
            speed={1.2}
          />

          {/* Follaje botánico hiperrealista */}
          <RealisticPlant position={[-0.85, -0.4, 0.6]} scale={1.2} />
          <RealisticPlant position={[0.9, -0.4, -0.5]} scale={0.95} rotation={[0, 1.8, 0]} />
        </group>
      );

    case "AQUATIC":
      return (
        <group ref={groupRef}>
          {/* Cuenco de agua cristalina reflectante */}
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
            <meshStandardMaterial
              color={isDay ? "#0284C7" : "#0C4A6E"}
              roughness={0.15}
              metalness={0.85}
              transparent
              opacity={0.92}
            />
          </mesh>

          {/* Flamenco Realista en la Laguna */}
          <WildlifeFlamingo
            position={[-0.3, -0.4, 0.2]}
            rotation={[0, 0.6, 0]}
            scale={0.0042}
            speed={0.9}
          />

          {/* Pez Realista Barramundi Nadando en Órbita */}
          <WildlifeFish
            position={[0.5, -0.45, -0.3]}
            rotation={[0, Math.PI / 2, 0]}
            scale={1.5}
            swimSpeed={1.8}
            swimRange={0.7}
          />

          {/* Pato Silvestre Flotando en el Espejo de Agua */}
          <WildlifeDuck
            position={[0.7, -0.42, 0.6]}
            rotation={[0, -1.2, 0]}
            scale={0.35}
          />
        </group>
      );

    case "SAVANNA":
      return (
        <group ref={groupRef}>
          {/* Suelo árido de sabana dorada */}
          <mesh position={[0, -0.6, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
            <meshStandardMaterial color={isDay ? "#CA8A04" : "#713F12"} roughness={0.9} />
          </mesh>

          {/* Caballo Silvestre Realista en Galope / Trote */}
          <WildlifeHorse
            position={[0, -0.4, 0]}
            rotation={[0, 0.4, 0]}
            scale={0.0035}
            speed={1.1}
          />

          {/* Vegetación xerófila en el borde */}
          <RealisticPlant
            position={[-1.2, -0.42, -0.7]}
            scale={0.75}
            rotation={[0, 0.8, 0]}
          />
        </group>
      );

    case "DESERT":
      return (
        <group ref={groupRef}>
          {/* Duna de arena cálida del desierto */}
          <mesh position={[0, -0.6, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
            <meshStandardMaterial color={isDay ? "#F59E0B" : "#B45309"} roughness={0.95} />
          </mesh>

          {/* Zorro del Desierto Realista Vigilando el Terreno */}
          <WildlifeFox
            position={[0, -0.4, 0]}
            rotation={[0, -0.5, 0]}
            scale={0.013}
            animation="Survey"
            speed={0.85}
          />

          {/* Rocas esculpidas del desierto */}
          <mesh position={[-1.1, -0.35, 0.8]} rotation={[0.2, 0.6, 0]}>
            <dodecahedronGeometry args={[0.42, 0]} />
            <meshStandardMaterial color="#78350F" roughness={0.92} flatShading />
          </mesh>
          <mesh position={[1.2, -0.38, -0.6]} rotation={[-0.2, 1.1, 0]}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial color="#92400E" roughness={0.92} flatShading />
          </mesh>
        </group>
      );

    case "FOREST":
    default:
      return (
        <group ref={groupRef}>
          {/* Suelo de bosque templado con musgo esmeralda */}
          <mesh position={[0, -0.6, 0]} receiveShadow>
            <cylinderGeometry args={[2.5, 2.7, 0.4, 32]} />
            <meshStandardMaterial color={isDay ? "#166534" : "#064E3B"} roughness={0.85} />
          </mesh>

          {/* Zorro Andino Realista en Guardia Activa */}
          <WildlifeFox
            position={[0, -0.4, 0]}
            rotation={[0, 0.35, 0]}
            scale={0.014}
            animation="Survey"
            speed={1.0}
          />

          {/* Follaje botánico real del sotobosque */}
          <RealisticPlant
            position={[-0.95, -0.4, -0.7]}
            scale={1.1}
            rotation={[0, 2.1, 0]}
          />
          <RealisticPlant
            position={[1.0, -0.4, 0.6]}
            scale={0.85}
            rotation={[0, -0.6, 0]}
          />
        </group>
      );
  }
}

export function BiomeHabitat3D({ bioma }: { bioma: BiomaType }) {
  const { isDay } = useNatureTheme();

  return (
    <div
      className="w-full h-44 rounded-xl overflow-hidden bg-gradient-to-b from-transparent to-black/10 relative"
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 2.2, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight intensity={isDay ? 1.1 : 0.45} color={isDay ? "#FEF3C7" : "#BAE6FD"} />
        <directionalLight
          position={isDay ? [4, 6, 3] : [-4, 6, -3]}
          intensity={isDay ? 2.0 : 1.0}
          color={isDay ? "#FFFBEB" : "#BAE6FD"}
          castShadow
        />

        <Suspense fallback={null}>
          <BiomeContent bioma={bioma} isDay={isDay} />
        </Suspense>

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

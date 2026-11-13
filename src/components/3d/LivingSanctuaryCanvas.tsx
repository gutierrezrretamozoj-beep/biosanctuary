"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useNatureTheme } from "@/context/NatureThemeContext";

/**
 * Astro Celestial Dinámico: Sol radiante en modo día o Luna luminosa en modo noche
 * Se desplaza en una trayectoria orbital suave usando useFrame
 */
function CelestialBody({ isDay }: { isDay: boolean }) {
  const sunRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const sunLightRef = useRef<THREE.DirectionalLight>(null);
  const moonLightRef = useRef<THREE.DirectionalLight>(null);
  const sunHaloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.25;

    // Trayectoria orbital pendular continua
    const x = Math.sin(t) * 14;
    const y = 6 + Math.cos(t * 0.5) * 3;
    const z = -12 + Math.cos(t) * 4;

    if (isDay) {
      if (sunRef.current) {
        sunRef.current.position.set(x, y, z);
      }
      if (sunLightRef.current) {
        sunLightRef.current.position.set(x, y, z);
      }
      if (sunHaloRef.current) {
        const pulse = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.08;
        sunHaloRef.current.scale.set(pulse, pulse, pulse);
      }
    } else {
      const moonX = -Math.sin(t) * 14;
      const moonY = 7 + Math.cos(t * 0.5) * 2.5;
      const moonZ = -12 - Math.cos(t) * 4;

      if (moonRef.current) {
        moonRef.current.position.set(moonX, moonY, moonZ);
      }
      if (moonLightRef.current) {
        moonLightRef.current.position.set(moonX, moonY, moonZ);
      }
    }
  });

  return (
    <>
      {isDay ? (
        <group ref={sunRef} position={[6, 8, -12]}>
          {/* Núcleo del Sol */}
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial
              color="#F59E0B"
              emissive="#FDB813"
              emissiveIntensity={2.5}
              roughness={0.2}
            />
          </mesh>
          {/* Corona / Aura solar translúcida pulsante */}
          <mesh ref={sunHaloRef}>
            <sphereGeometry args={[2.1, 32, 32]} />
            <meshBasicMaterial
              color="#FDE68A"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
            />
          </mesh>
          <directionalLight
            ref={sunLightRef}
            intensity={2.3}
            color="#FFFBEB"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />
        </group>
      ) : (
        <group ref={moonRef} position={[-6, 8, -12]}>
          {/* Esfera de la Luna con cráteres geométricos sutiles */}
          <mesh>
            <sphereGeometry args={[1.3, 32, 32]} />
            <meshStandardMaterial
              color="#E2E8F0"
              emissive="#BAE6FD"
              emissiveIntensity={0.6}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Halo lunar azul-plateado */}
          <mesh>
            <sphereGeometry args={[1.8, 32, 32]} />
            <meshBasicMaterial
              color="#93C5FD"
              transparent
              opacity={0.28}
              side={THREE.BackSide}
            />
          </mesh>
          <directionalLight
            ref={moonLightRef}
            intensity={0.9}
            color="#BAE6FD"
            castShadow
          />
        </group>
      )}
    </>
  );
}

/**
 * Terreno de colinas verdes y laguna reflectante en el claro del bosque
 */
function ForestTerrain({ isDay }: { isDay: boolean }) {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(60, 60, 36, 36);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      // Depresión en el centro para la laguna (x: [-4, 4], y: [-3, 3])
      const distFromCenter = Math.sqrt(vx * vx + vy * vy);
      let vz = Math.sin(vx * 0.2) * Math.cos(vy * 0.2) * 1.5;
      if (distFromCenter < 5) {
        vz -= (5 - distFromCenter) * 0.45;
      }
      pos.setZ(i, vz);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <group position={[0, -2, -6]} rotation={[-Math.PI / 2.3, 0, 0]}>
      {/* Suelo vegetal */}
      <mesh geometry={terrainGeo} receiveShadow>
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#064E3B"}
          roughness={0.85}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Laguna reflectante */}
      <mesh position={[0, 0, -0.4]} rotation={[0, 0, 0]}>
        <circleGeometry args={[4.2, 32]} />
        <meshStandardMaterial
          color={isDay ? "#0284C7" : "#0F172A"}
          roughness={0.15}
          metalness={0.7}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

/**
 * Árbol individual Low-Poly con copa formada por icosaedros escalonados
 */
function StylizedTree({
  position,
  scale = 1,
  colorIndex = 0,
  isDay,
}: {
  position: [number, number, number];
  scale?: number;
  colorIndex?: number;
  isDay: boolean;
}) {
  const treeRef = useRef<THREE.Group>(null);
  const foliageColorsDay = ["#059669", "#10B981", "#047857", "#16A34A", "#0D9488"];
  const foliageColorsNight = ["#064E3B", "#065F46", "#047857", "#022C22", "#0F766E"];

  const folColor = isDay
    ? foliageColorsDay[colorIndex % foliageColorsDay.length]
    : foliageColorsNight[colorIndex % foliageColorsNight.length];

  useFrame(({ clock }) => {
    if (treeRef.current) {
      // Balanceo sutil con el viento
      const sway = Math.sin(clock.getElapsedTime() * 1.4 + position[0] * 1.5) * 0.04;
      treeRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.4, 6]} />
        <meshStandardMaterial color={isDay ? "#78350F" : "#3B1E08"} roughness={0.9} />
      </mesh>

      {/* Capas de copa cónica/icosaédrica */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.1, 1.6, 6]} />
        <meshStandardMaterial color={folColor} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[0.85, 1.3, 6]} />
        <meshStandardMaterial color={folColor} roughness={0.7} flatShading />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <coneGeometry args={[0.55, 1.0, 6]} />
        <meshStandardMaterial color={folColor} roughness={0.6} flatShading />
      </mesh>
    </group>
  );
}

/**
 * Bosque circundante con distribución orgánica de árboles
 */
function ForestGrove({ isDay }: { isDay: boolean }) {
  const treePositions = useMemo(() => {
    const list: Array<{ pos: [number, number, number]; scale: number; col: number }> = [];
    const seed = [
      [-12, -2, -10], [-9, -2, -8], [-13, -1.8, -6], [-7, -2.1, -11], [-11, -2, -14],
      [11, -2, -11], [13, -2, -8], [9, -2.1, -9], [8, -2, -13], [12, -1.9, -14],
      [-5, -2.2, -13], [-2, -2.2, -15], [2, -2.2, -14], [5, -2.2, -13],
      [-15, -1.5, -4], [14, -1.6, -4], [-8, -2.2, -5], [8, -2.2, -5],
    ];

    seed.forEach((pt, idx) => {
      list.push({
        pos: pt as [number, number, number],
        scale: 0.8 + (idx % 4) * 0.18,
        col: idx,
      });
    });
    return list;
  }, []);

  return (
    <group>
      {treePositions.map((t, idx) => (
        <StylizedTree
          key={idx}
          position={t.pos}
          scale={t.scale}
          colorIndex={t.col}
          isDay={isDay}
        />
      ))}
    </group>
  );
}

/**
 * Bandada de aves low-poly planeando en círculo sobre los árboles con alas articuladas
 */
function BirdFlock({ isDay }: { isDay: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      // Vuelo circular sobre el dosel del bosque
      const angle = t * 0.4;
      groupRef.current.position.x = Math.sin(angle) * 7;
      groupRef.current.position.z = -8 + Math.cos(angle) * 4;
      groupRef.current.position.y = 4.5 + Math.sin(t * 1.2) * 0.6;
      groupRef.current.rotation.y = angle + Math.PI / 2;
    }

    const wingFlap = Math.sin(t * 7) * 0.55;
    if (leftWingRef.current) leftWingRef.current.rotation.z = wingFlap;
    if (rightWingRef.current) rightWingRef.current.rotation.z = -wingFlap;
  });

  return (
    <group ref={groupRef} scale={[0.45, 0.45, 0.45]}>
      {/* Cuerpo del ave */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.9, 4]} />
        <meshStandardMaterial color={isDay ? "#F8FAFC" : "#94A3B8"} flatShading />
      </mesh>
      {/* Ala izquierda */}
      <mesh ref={leftWingRef} position={[-0.4, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.3]} />
        <meshStandardMaterial color={isDay ? "#E2E8F0" : "#64748B"} flatShading />
      </mesh>
      {/* Ala derecha */}
      <mesh ref={rightWingRef} position={[0.4, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.3]} />
        <meshStandardMaterial color={isDay ? "#E2E8F0" : "#64748B"} flatShading />
      </mesh>
    </group>
  );
}

/**
 * Fauna silvestre low-poly descansando cerca de la laguna con respiración sutil
 */
function WildlifeCreature({ isDay }: { isDay: boolean }) {
  const creatureRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (creatureRef.current) {
      // Respiración sutil
      const breath = 1 + Math.sin(clock.getElapsedTime() * 1.8) * 0.035;
      creatureRef.current.scale.set(0.65, 0.65 * breath, 0.65);
    }
  });

  return (
    <group ref={creatureRef} position={[2.8, -1.9, -6.5]} rotation={[0, -Math.PI / 3, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.65, 0.5, 1.1]} />
        <meshStandardMaterial color={isDay ? "#B45309" : "#78350F"} roughness={0.8} flatShading />
      </mesh>
      {/* Cuello y cabeza */}
      <mesh position={[0, 0.9, 0.45]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.3, 0.6, 0.35]} />
        <meshStandardMaterial color={isDay ? "#D97706" : "#92400E"} roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 1.25, 0.6]}>
        <boxGeometry args={[0.26, 0.28, 0.45]} />
        <meshStandardMaterial color={isDay ? "#B45309" : "#78350F"} roughness={0.8} flatShading />
      </mesh>
      {/* Cornamenta estilizada */}
      <mesh position={[-0.15, 1.5, 0.55]} rotation={[0.2, 0, -0.3]}>
        <cylinderGeometry args={[0.02, 0.04, 0.4, 4]} />
        <meshStandardMaterial color="#FEF3C7" flatShading />
      </mesh>
      <mesh position={[0.15, 1.5, 0.55]} rotation={[0.2, 0, 0.3]}>
        <cylinderGeometry args={[0.02, 0.04, 0.4, 4]} />
        <meshStandardMaterial color="#FEF3C7" flatShading />
      </mesh>
      {/* Extremidades recogidas */}
      <mesh position={[-0.28, 0.1, 0.25]}>
        <boxGeometry args={[0.18, 0.25, 0.45]} />
        <meshStandardMaterial color={isDay ? "#92400E" : "#451A03"} flatShading />
      </mesh>
      <mesh position={[0.28, 0.1, 0.25]}>
        <boxGeometry args={[0.18, 0.25, 0.45]} />
        <meshStandardMaterial color={isDay ? "#92400E" : "#451A03"} flatShading />
      </mesh>
    </group>
  );
}

/**
 * Partículas atmosféricas:
 * - De día: motas doradas de polen flotando suavemente
 * - De noche: cientos de luciérnagas bioluminiscentes verde-lima (#84CC16) flotando y brillando
 */
function AtmosphericParticles({ isDay }: { isDay: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = isDay ? 120 : 260;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const ph = new Float32Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = Math.random() * 8 - 1.5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20 - 4;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [particleCount]);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Movimiento errático flotante natural
      pos[idx + 1] += Math.sin(t * 1.5 + phases[i]) * 0.006;
      pos[idx] += Math.cos(t * 0.8 + phases[i]) * 0.004;

      // Mantener dentro del volumen visible
      if (pos[idx + 1] > 8) pos[idx + 1] = -1.5;
      if (pos[idx + 1] < -1.5) pos[idx + 1] = 8;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isDay ? 0.08 : 0.14}
        color={isDay ? "#FBBF24" : "#84CC16"}
        transparent
        opacity={isDay ? 0.7 : 0.95}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Control sutil de cámara en respuesta a la posición del cursor
 */
function CameraRig() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 1.2, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.8 + pointer.y * 0.6, 0.04);
    camera.lookAt(0, 0.5, -6);
  });
  return null;
}

/**
 * LivingSanctuaryCanvas: Fondo 3D interactivo con ciclo Día (Sol) y Noche (Luna + Luciérnagas)
 */
export function LivingSanctuaryCanvas() {
  const { isDay } = useNatureTheme();

  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 2.2, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Iluminación ambiental base */}
        <ambientLight intensity={isDay ? 0.9 : 0.3} color={isDay ? "#ECFDF5" : "#064E3B"} />

        {/* Niebla de profundidad del escenario */}
        <fog attach="fog" args={[isDay ? "#D1FAE5" : "#040D09", 10, 32]} />

        {/* Estrellas en modo noche */}
        {!isDay && (
          <Stars
            radius={80}
            depth={40}
            count={2800}
            factor={4.5}
            saturation={0}
            fade
            speed={1.2}
          />
        )}

        {/* Elementos del Ecosistema Vivo */}
        <CelestialBody isDay={isDay} />
        <ForestTerrain isDay={isDay} />
        <ForestGrove isDay={isDay} />
        <BirdFlock isDay={isDay} />
        <WildlifeCreature isDay={isDay} />
        <AtmosphericParticles isDay={isDay} />
        <CameraRig />
      </Canvas>
    </div>
  );
}

export default LivingSanctuaryCanvas;

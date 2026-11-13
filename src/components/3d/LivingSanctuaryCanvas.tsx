"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useNatureTheme } from "@/context/NatureThemeContext";

/**
 * Arco orbital celestial luminoso (trayectoria del Sol y de la Luna)
 * Como se aprecia en el video de referencia
 */
function OrbitalArc({ isDay }: { isDay: boolean }) {
  const arcCurve = useMemo(() => {
    // Semicírculo en el horizonte
    const points: THREE.Vector3[] = [];
    const radius = 18;
    for (let i = 0; i <= 64; i++) {
      const theta = (i / 64) * Math.PI;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * (radius * 0.72) - 1.5;
      const z = -14;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(arcCurve, 64, 0.06, 8, false);
  }, [arcCurve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial
        color={isDay ? "#FDE047" : "#F8FAFC"}
        transparent
        opacity={isDay ? 0.85 : 0.45}
      />
    </mesh>
  );
}

/**
 * Sol Radiante (Modo Día) o Luna Luminosa (Modo Noche)
 * Se desplaza suavemente a lo largo del arco orbital
 */
function CelestialOrb({ isDay }: { isDay: boolean }) {
  const orbGroupRef = useRef<THREE.Group>(null);
  const sunHaloRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = (clock.getElapsedTime() * 0.08) % (Math.PI * 2);
    const radius = 18;

    // Desplazamiento sobre el arco
    const angle = isDay ? (t % Math.PI) : ((t + Math.PI) % Math.PI);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * (radius * 0.72) - 1.5;
    const z = -14;

    if (orbGroupRef.current) {
      orbGroupRef.current.position.set(x, Math.max(1, y), z);
    }

    if (isDay && sunHaloRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 3) * 0.08;
      sunHaloRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group ref={orbGroupRef} position={[0, 11, -14]}>
      {isDay ? (
        <>
          {/* Núcleo del Sol */}
          <mesh>
            <sphereGeometry args={[1.7, 32, 32]} />
            <meshStandardMaterial
              color="#FEF08A"
              emissive="#FACC15"
              emissiveIntensity={3.5}
              roughness={0.1}
            />
          </mesh>
          {/* Halo / Corona translúcida solar */}
          <mesh ref={sunHaloRef}>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color="#FDE047"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
            />
          </mesh>
          <directionalLight
            intensity={2.8}
            color="#FFFBEB"
            position={[0, 0, 2]}
            castShadow
          />
        </>
      ) : (
        <>
          {/* Esfera Lunar con cráteres geométricos */}
          <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial
              color="#F1F5F9"
              emissive="#E2E8F0"
              emissiveIntensity={0.8}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          {/* Halo lunar azul-plateado */}
          <mesh>
            <sphereGeometry args={[2.1, 32, 32]} />
            <meshBasicMaterial
              color="#93C5FD"
              transparent
              opacity={0.25}
              side={THREE.BackSide}
            />
          </mesh>
          <directionalLight
            intensity={1.2}
            color="#BAE6FD"
            position={[0, 0, 2]}
            castShadow
          />
        </>
      )}
    </group>
  );
}

/**
 * Río Central Sinuoso con reflejo especular de la luz
 * Como se muestra exactamente en el video
 */
function WindingRiver({ isDay }: { isDay: boolean }) {
  const riverRef = useRef<THREE.Mesh>(null);

  // Malla curva del río que serpentea desde el horizonte hacia el primer plano
  const riverGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(3.6, 26, 32, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Curvatura en S del río
      const sCurve = Math.sin((y + 13) * 0.28) * 1.6;
      pos.setX(i, pos.getX(i) + sCurve);
      // Depresión para el lecho del río
      pos.setZ(i, -0.15 + Math.sin(pos.getX(i) * 0.4) * 0.05);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (riverRef.current) {
      // Movimiento ondulante sutil del agua
      const t = clock.getElapsedTime();
      riverRef.current.position.z = Math.sin(t * 0.5) * 0.02 - 4.5;
    }
  });

  return (
    <mesh
      ref={riverRef}
      geometry={riverGeo}
      position={[0, -2.1, -4.5]}
      rotation={[-Math.PI / 2.1, 0, 0]}
    >
      <meshStandardMaterial
        color={isDay ? "#38BDF8" : "#0284C7"}
        roughness={0.12}
        metalness={0.85}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/**
 * Terreno verde de ribera con colinas a ambos lados del río
 */
function Riverbanks({ isDay }: { isDay: boolean }) {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(42, 28, 48, 48);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const riverCenter = Math.sin((y + 14) * 0.28) * 1.6;
      const distToRiver = Math.abs(x - riverCenter);

      // Colinas que se elevan a medida que nos alejamos del río
      let height = Math.pow(Math.min(distToRiver / 4, 3), 1.3) * 0.85;
      height += Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.6;

      // Suavizado junto al lecho del río
      if (distToRiver < 2.2) {
        height = -0.3;
      }
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={terrainGeo}
      position={[0, -2.15, -5]}
      rotation={[-Math.PI / 2.1, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        color={isDay ? "#22C55E" : "#065F46"}
        roughness={0.9}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

/**
 * Rocas bajas de ribera
 */
function RiverRocks({ isDay }: { isDay: boolean }) {
  const rockPositions: Array<[number, number, number, number]> = [
    [-1.8, -1.9, -1, 0.45],
    [1.7, -1.95, -2, 0.55],
    [-2.2, -1.85, -4, 0.65],
    [1.9, -1.9, -5.5, 0.5],
    [-1.4, -2.0, -7, 0.4],
    [2.3, -1.8, -9, 0.7],
    [-2.6, -1.75, -11, 0.8],
    [1.5, -1.9, -13, 0.5],
  ];

  return (
    <group>
      {rockPositions.map(([x, y, z, s], idx) => (
        <mesh key={idx} position={[x, y, z]} scale={[s, s * 0.7, s]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={isDay ? "#64748B" : "#334155"}
            roughness={0.9}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Juncos y pastizales en la orilla
 */
function RiverReeds({ isDay }: { isDay: boolean }) {
  const reedPositions: Array<[number, number, number]> = [
    [-1.4, -1.8, -1.5],
    [-1.6, -1.8, -1.8],
    [1.4, -1.85, -2.5],
    [1.5, -1.85, -2.8],
    [-1.9, -1.8, -5],
    [1.6, -1.85, -6.5],
    [-1.3, -1.9, -8],
    [1.8, -1.8, -10],
  ];

  return (
    <group>
      {reedPositions.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.02, 0.03, 0.7, 4]} />
            <meshStandardMaterial color={isDay ? "#65A30D" : "#3F6212"} flatShading />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.045, 0.045, 0.22, 4]} />
            <meshStandardMaterial color="#78350F" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Árbol caducifolio estilizado con copas redondeadas en capas
 */
function DeciduousTree({
  position,
  scale = 1,
  isDay,
}: {
  position: [number, number, number];
  scale?: number;
  isDay: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const sway = Math.sin(clock.getElapsedTime() * 1.3 + position[0]) * 0.035;
      groupRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[0.18, 0.32, 2.2, 6]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.9} />
      </mesh>
      {/* Ramas y copa esférica estilizada */}
      <mesh position={[0, 2.6, 0]}>
        <dodecahedronGeometry args={[1.35, 1]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#065F46"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[-0.7, 2.3, 0.4]}>
        <dodecahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color={isDay ? "#22C55E" : "#047857"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[0.7, 2.4, -0.3]}>
        <dodecahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#022C22"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Pino alpino en capas cónicas
 */
function PineTree({
  position,
  scale = 1,
  isDay,
}: {
  position: [number, number, number];
  scale?: number;
  isDay: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const sway = Math.sin(clock.getElapsedTime() * 1.5 + position[0]) * 0.04;
      groupRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.14, 0.22, 1.4, 5]} />
        <meshStandardMaterial color="#451A03" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[1.1, 1.5, 6]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#047857"}
          roughness={0.8}
          flatShading
        />
      </mesh>
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[0.85, 1.3, 6]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#065F46"}
          roughness={0.8}
          flatShading
        />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <coneGeometry args={[0.55, 1.0, 6]} />
        <meshStandardMaterial
          color={isDay ? "#22C55E" : "#10B981"}
          roughness={0.7}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Búho posado en una rama del bosque
 * Detalle icónico presente en el video
 */
function PerchedOwl({ isDay }: { isDay: boolean }) {
  const owlRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (owlRef.current) {
      // Giro de cabeza característico del búho
      const headTurn = Math.sin(clock.getElapsedTime() * 0.8) * 0.35;
      owlRef.current.rotation.y = headTurn - 0.4;
    }
  });

  return (
    <group ref={owlRef} position={[-3.6, 0.4, -4.5]} scale={[0.35, 0.35, 0.35]}>
      {/* Cuerpo */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.3, 0.4, 0.9, 8]} />
        <meshStandardMaterial color={isDay ? "#78350F" : "#5C2C16"} flatShading />
      </mesh>
      {/* Cabeza */}
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.4, 8, 8]} />
        <meshStandardMaterial color={isDay ? "#92400E" : "#78350F"} flatShading />
      </mesh>
      {/* Ojos grandes luminosos */}
      <mesh position={[-0.14, 1.3, 0.35]}>
        <circleGeometry args={[0.1, 8]} />
        <meshBasicMaterial color={isDay ? "#FEF08A" : "#FDE047"} />
      </mesh>
      <mesh position={[0.14, 1.3, 0.35]}>
        <circleGeometry args={[0.1, 8]} />
        <meshBasicMaterial color={isDay ? "#FEF08A" : "#FDE047"} />
      </mesh>
      {/* Pupilas */}
      <mesh position={[-0.14, 1.3, 0.36]}>
        <circleGeometry args={[0.045, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh position={[0.14, 1.3, 0.36]}>
        <circleGeometry args={[0.045, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
}

/**
 * Bosque circundante a ambos lados del río
 */
function RiversideForest({ isDay }: { isDay: boolean }) {
  return (
    <group>
      {/* Ribera izquierda */}
      <DeciduousTree position={[-4.5, -2, -3]} scale={1.1} isDay={isDay} />
      <PineTree position={[-3.6, -2, -4.5]} scale={0.95} isDay={isDay} />
      <PineTree position={[-6, -1.8, -6]} scale={1.2} isDay={isDay} />
      <DeciduousTree position={[-4.2, -1.9, -8]} scale={1.05} isDay={isDay} />
      <PineTree position={[-6.8, -1.7, -10]} scale={1.3} isDay={isDay} />
      <DeciduousTree position={[-5, -1.8, -12]} scale={1.15} isDay={isDay} />
      <PineTree position={[-7.5, -1.6, -14]} scale={1.4} isDay={isDay} />

      {/* Ribera derecha */}
      <DeciduousTree position={[4.6, -2, -3.5]} scale={1.05} isDay={isDay} />
      <PineTree position={[3.8, -2, -5.2]} scale={0.9} isDay={isDay} />
      <DeciduousTree position={[6.2, -1.8, -6.8]} scale={1.25} isDay={isDay} />
      <PineTree position={[4.4, -1.9, -8.5]} scale={1.1} isDay={isDay} />
      <PineTree position={[6.9, -1.7, -11]} scale={1.35} isDay={isDay} />
      <DeciduousTree position={[5.2, -1.8, -13]} scale={1.15} isDay={isDay} />
      <PineTree position={[7.8, -1.6, -15]} scale={1.45} isDay={isDay} />

      {/* Búho posado */}
      <PerchedOwl isDay={isDay} />
    </group>
  );
}

/**
 * Aves low-poly planeando sobre el río
 */
function FlyingBirds({ isDay }: { isDay: boolean }) {
  const birdsGroupRef = useRef<THREE.Group>(null);
  const wing1Ref = useRef<THREE.Mesh>(null);
  const wing2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (birdsGroupRef.current) {
      // Vuelo suave en arco sobre el río
      birdsGroupRef.current.position.x = Math.sin(t * 0.35) * 5;
      birdsGroupRef.current.position.y = 5.2 + Math.sin(t * 0.9) * 0.5;
      birdsGroupRef.current.position.z = -9 + Math.cos(t * 0.35) * 3;
    }

    const flap = Math.sin(t * 8) * 0.5;
    if (wing1Ref.current) wing1Ref.current.rotation.z = flap;
    if (wing2Ref.current) wing2Ref.current.rotation.z = -flap;
  });

  return (
    <group ref={birdsGroupRef} scale={[0.35, 0.35, 0.35]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.2, 0.8, 4]} />
        <meshStandardMaterial color={isDay ? "#F8FAFC" : "#94A3B8"} flatShading />
      </mesh>
      <mesh ref={wing1Ref} position={[-0.4, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.3]} />
        <meshStandardMaterial color={isDay ? "#E2E8F0" : "#64748B"} flatShading />
      </mesh>
      <mesh ref={wing2Ref} position={[0.4, 0.05, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.3]} />
        <meshStandardMaterial color={isDay ? "#E2E8F0" : "#64748B"} flatShading />
      </mesh>
    </group>
  );
}

/**
 * Luciérnagas bioluminiscentes en modo noche
 */
function Fireflies() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 180;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22;
      pos[i * 3 + 1] = Math.random() * 5.5 - 1.2;
      pos[i * 3 + 2] = -Math.random() * 16 - 1;
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(t * 1.8 + phases[i]) * 0.007;
      pos[idx] += Math.cos(t * 1.0 + phases[i]) * 0.005;

      if (pos[idx + 1] > 6) pos[idx + 1] = -1.2;
      if (pos[idx + 1] < -1.2) pos[idx + 1] = 6;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.16}
        color="#84CC16"
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Control sutil de cámara interactivo con el puntero
 */
function CameraController() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.8, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.2 + pointer.y * 0.4, 0.04);
    camera.lookAt(0, 0.8, -9);
  });
  return null;
}

export function LivingSanctuaryCanvas() {
  const { isDay } = useNatureTheme();

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [0, 2.2, 5.5], fov: 46 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={isDay ? 1.0 : 0.35} color={isDay ? "#ECFDF5" : "#064E3B"} />
        <fog attach="fog" args={[isDay ? "#A7F3D0" : "#040D09", 12, 34]} />

        {!isDay && (
          <Stars
            radius={85}
            depth={35}
            count={2600}
            factor={4.5}
            saturation={0}
            fade
            speed={1.0}
          />
        )}

        <OrbitalArc isDay={isDay} />
        <CelestialOrb isDay={isDay} />
        <WindingRiver isDay={isDay} />
        <Riverbanks isDay={isDay} />
        <RiverRocks isDay={isDay} />
        <RiverReeds isDay={isDay} />
        <RiversideForest isDay={isDay} />
        <FlyingBirds isDay={isDay} />
        {!isDay && <Fireflies />}
        <CameraController />
      </Canvas>
    </div>
  );
}

export default LivingSanctuaryCanvas;

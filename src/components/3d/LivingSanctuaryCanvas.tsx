"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useNatureTheme } from "@/context/NatureThemeContext";
import {
  WildlifeFox,
  WildlifeStork,
  WildlifeParrot,
  WildlifeFlamingo,
  WildlifeHorse,
  WildlifeDuck,
  RealisticPlant,
} from "./models";

/**
 * Generador procedimental de textura lunar realista
 * Crea los mares lunares (maria), cráteres y gradientes de albedo
 * idéntico al renderizado visto en frame_4_192.jpg
 */
function createRealisticMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Fondo base de regolito lunar gris claro perlado
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Generación de mares lunares oscuros (Oceanus Procellarum, Mare Tranquillitatis)
  const maria = [
    { x: 380, y: 220, r: 160, opacity: 0.38, color: "#64748B" },
    { x: 540, y: 200, r: 120, opacity: 0.35, color: "#475569" },
    { x: 420, y: 320, r: 140, opacity: 0.32, color: "#475569" },
    { x: 620, y: 260, r: 110, opacity: 0.30, color: "#64748B" },
    { x: 260, y: 240, r: 130, opacity: 0.36, color: "#334155" },
    { x: 490, y: 140, r: 90, opacity: 0.28, color: "#64748B" },
    { x: 700, y: 340, r: 85, opacity: 0.25, color: "#475569" },
    { x: 190, y: 300, r: 95, opacity: 0.26, color: "#334155" },
  ];

  maria.forEach(({ x, y, r, opacity, color }) => {
    const grad = ctx.createRadialGradient(x, y, 10, x, y, r);
    grad.addColorStop(0, color);
    grad.addColorStop(0.7, color);
    grad.addColorStop(1, "transparent");
    ctx.globalAlpha = opacity;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cráteres de impacto con borde iluminado y sombra central
  const craters = [
    { x: 410, y: 410, r: 32 }, // Tycho
    { x: 320, y: 210, r: 24 }, // Copernicus
    { x: 260, y: 190, r: 20 }, // Kepler
    { x: 580, y: 170, r: 18 },
    { x: 640, y: 310, r: 22 },
    { x: 480, y: 380, r: 16 },
    { x: 360, y: 150, r: 14 },
    { x: 740, y: 220, r: 20 },
  ];

  craters.forEach(({ x, y, r }) => {
    // Sombra interior
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Borde brillante
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, r, 0, Math.PI * 2);
    ctx.stroke();

    // Pico central del cráter
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  // Líneas radiales de eyección desde Tycho
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 1.5;
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
    ctx.beginPath();
    ctx.moveTo(410, 410);
    ctx.lineTo(410 + Math.cos(a) * 280, 410 + Math.sin(a) * 280);
    ctx.stroke();
  }

  ctx.globalAlpha = 1.0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * Arco orbital celestial luminoso (trayectoria solar/lunar en el firmamento)
 * Representa el ciclo horario del santuario
 */
function OrbitalArc({ isDay }: { isDay: boolean }) {
  const arcCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 21;
    for (let i = 0; i <= 80; i++) {
      const theta = (i / 80) * Math.PI;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * (radius * 0.68) - 1.2;
      const z = -15;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(arcCurve, 80, 0.055, 8, false);
  }, [arcCurve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial
        color={isDay ? "#FDE047" : "#BAE6FD"}
        transparent
        opacity={isDay ? 0.8 : 0.4}
      />
    </mesh>
  );
}

/**
 * Sol Radiante (Modo Día) o Luna Realista con Textura de Cráteres (Modo Noche)
 * Se traslada continuamente en el cielo orbital
 */
function CelestialOrb({ isDay }: { isDay: boolean }) {
  const orbGroupRef = useRef<THREE.Group>(null);
  const sunCoronaRef = useRef<THREE.Mesh>(null);
  const moonRaysRef = useRef<THREE.Group>(null);

  const moonTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createRealisticMoonTexture();
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.06;
    const radius = 21;

    // Movimiento orbital armónico
    const angle = isDay ? (t % Math.PI) : ((t + Math.PI * 0.5) % Math.PI);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * (radius * 0.68) - 1.2;
    const z = -15;

    if (orbGroupRef.current) {
      orbGroupRef.current.position.set(x, Math.max(2.5, y), z);
    }

    if (isDay && sunCoronaRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.5) * 0.06;
      sunCoronaRef.current.scale.set(pulse, pulse, pulse);
    }

    if (!isDay && moonRaysRef.current) {
      moonRaysRef.current.rotation.z = clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <group ref={orbGroupRef} position={[0, 13, -15]}>
      {isDay ? (
        <>
          {/* Núcleo Solar Radiante */}
          <mesh>
            <sphereGeometry args={[1.9, 32, 32]} />
            <meshStandardMaterial
              color="#FEF08A"
              emissive="#FACC15"
              emissiveIntensity={3.8}
              roughness={0.1}
            />
          </mesh>

          {/* Corona Solar Translúcida */}
          <mesh ref={sunCoronaRef}>
            <sphereGeometry args={[2.8, 32, 32]} />
            <meshBasicMaterial
              color="#FDE047"
              transparent
              opacity={0.32}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Halo Exterior Expandido */}
          <mesh>
            <sphereGeometry args={[4.2, 24, 24]} />
            <meshBasicMaterial
              color="#FEF9C3"
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>

          <directionalLight
            intensity={3.2}
            color="#FFFBEB"
            position={[0, 0, 3]}
            castShadow
          />
        </>
      ) : (
        <>
          {/* Esfera Lunar con Textura Fotorrealista de Cráteres */}
          <mesh rotation={[0, 0.4, 0]}>
            <sphereGeometry args={[2.0, 48, 48]} />
            <meshStandardMaterial
              map={moonTexture || undefined}
              color="#FFFFFF"
              emissive="#E2E8F0"
              emissiveIntensity={1.1}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>

          {/* Halo Atmosférico Plateado-Azul */}
          <mesh>
            <sphereGeometry args={[2.7, 32, 32]} />
            <meshBasicMaterial
              color="#BAE6FD"
              transparent
              opacity={0.28}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Rayos de Luz Lunar Volumétricos Sutiles */}
          <group ref={moonRaysRef}>
            {[0, 45, 90, 135].map((rot, idx) => (
              <mesh key={idx} rotation={[0, 0, (rot * Math.PI) / 180]}>
                <planeGeometry args={[0.3, 9]} />
                <meshBasicMaterial
                  color="#E0F2FE"
                  transparent
                  opacity={0.09}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>

          <directionalLight
            intensity={1.4}
            color="#BAE6FD"
            position={[0, 0, 3]}
            castShadow
          />
        </>
      )}
    </group>
  );
}

/**
 * Río Central Sinuoso con Dinámica de Olas y Reflejos Especulares Vivos
 * Serpentea desde el horizonte hacia el espectador tal como en el video
 */
function WindingRiver({ isDay }: { isDay: boolean }) {
  const riverMeshRef = useRef<THREE.Mesh>(null);

  // Malla de alta resolución para la superficie del agua
  const riverGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4.2, 30, 48, 80);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Curvatura elegante en S
      const sCurve = Math.sin((y + 15) * 0.24) * 1.85;
      pos.setX(i, pos.getX(i) + sCurve);
      // Suave lecho de agua
      pos.setZ(i, -0.12 + Math.sin(pos.getX(i) * 0.5) * 0.04);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Simulación de olas y ondulación fluida del agua
  useFrame(({ clock }) => {
    if (!riverMeshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = riverMeshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Simulación de ondas combinadas
      const wave =
        Math.sin(y * 1.2 + t * 2.2) * 0.035 +
        Math.cos(x * 2.0 + t * 1.6) * 0.02;
      pos.setZ(i, -0.12 + wave);
    }
    pos.needsUpdate = true;
    riverMeshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group position={[0, -2.05, -5.5]} rotation={[-Math.PI / 2.08, 0, 0]}>
      {/* Lecho arenoso bajo el agua */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[5.2, 30]} />
        <meshStandardMaterial
          color={isDay ? "#D97706" : "#451A03"}
          roughness={0.95}
        />
      </mesh>

      {/* Superficie viva del agua con alto brillo especular */}
      <mesh ref={riverMeshRef} geometry={riverGeo}>
        <meshStandardMaterial
          color={isDay ? "#38BDF8" : "#0284C7"}
          roughness={0.06}
          metalness={0.92}
          transparent
          opacity={0.94}
        />
      </mesh>
    </group>
  );
}

/**
 * Ribera y Terreno Ondulante a Ambos Lados del Río
 */
function Riverbanks({ isDay }: { isDay: boolean }) {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(46, 32, 54, 54);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const riverCenter = Math.sin((y + 15) * 0.24) * 1.85;
      const distToRiver = Math.abs(x - riverCenter);

      // Colinas orgánicas con elevación progresiva
      let height = Math.pow(Math.min(distToRiver / 3.8, 3.2), 1.35) * 0.95;
      height += Math.sin(x * 0.25) * Math.cos(y * 0.25) * 0.7;

      // Canal del río
      if (distToRiver < 2.5) {
        height = -0.32;
      }
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={terrainGeo}
      position={[0, -2.12, -6]}
      rotation={[-Math.PI / 2.08, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        color={isDay ? "#16A34A" : "#064E3B"}
        roughness={0.88}
        metalness={0.05}
        flatShading
      />
    </mesh>
  );
}

/**
 * Rocas y Cantos Rodados en la Ribera del Río
 */
function RiverRocks({ isDay }: { isDay: boolean }) {
  const rockList: Array<[number, number, number, number, number]> = [
    [-2.1, -1.85, -1.2, 0.55, 0.3],
    [2.0, -1.9, -2.2, 0.65, 0.8],
    [-2.4, -1.8, -4.2, 0.8, 1.2],
    [2.2, -1.85, -5.8, 0.6, 0.5],
    [-1.6, -1.95, -7.2, 0.45, 1.5],
    [2.5, -1.75, -9.2, 0.85, 2.1],
    [-2.8, -1.7, -11.5, 0.95, 0.7],
    [1.8, -1.88, -13.5, 0.6, 1.9],
  ];

  return (
    <group>
      {rockList.map(([x, y, z, s, rot], idx) => (
        <mesh
          key={idx}
          position={[x, y, z]}
          rotation={[0, rot, 0]}
          scale={[s, s * 0.65, s]}
        >
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={isDay ? "#64748B" : "#334155"}
            roughness={0.92}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Juncos y Pastizales Silvestres en la Orilla
 */
function RiverReeds({ isDay }: { isDay: boolean }) {
  const reedCoords: Array<[number, number, number]> = [
    [-1.5, -1.75, -1.6],
    [-1.7, -1.75, -1.9],
    [1.6, -1.8, -2.6],
    [1.7, -1.8, -2.9],
    [-2.1, -1.75, -5.2],
    [1.8, -1.8, -6.8],
    [-1.5, -1.85, -8.3],
    [2.0, -1.75, -10.4],
  ];

  return (
    <group>
      {reedCoords.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.02, 0.035, 0.8, 4]} />
            <meshStandardMaterial
              color={isDay ? "#65A30D" : "#3F6212"}
              flatShading
            />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.26, 4]} />
            <meshStandardMaterial color="#78350F" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Árbol Caducifolio Exuberante con Copas Orgánicas en Múltiples Esferas
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
  const treeRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (treeRef.current) {
      const sway = Math.sin(clock.getElapsedTime() * 1.2 + position[0]) * 0.03;
      treeRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tronco bifurcado */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 2.4, 7]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>

      {/* Clústeres de hojas en múltiples tonos de verde vivo */}
      <mesh position={[0, 2.8, 0]}>
        <dodecahedronGeometry args={[1.45, 1]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#047857"}
          roughness={0.78}
          flatShading
        />
      </mesh>
      <mesh position={[-0.8, 2.5, 0.4]}>
        <dodecahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial
          color={isDay ? "#22C55E" : "#065F46"}
          roughness={0.78}
          flatShading
        />
      </mesh>
      <mesh position={[0.75, 2.6, -0.35]}>
        <dodecahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#022C22"}
          roughness={0.78}
          flatShading
        />
      </mesh>
      <mesh position={[0, 3.4, 0.2]}>
        <dodecahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color={isDay ? "#4ADE80" : "#10B981"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Pino Alpino en Capas Cónicas de Verde Profundo
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
  const pineRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (pineRef.current) {
      const sway = Math.sin(clock.getElapsedTime() * 1.4 + position[0]) * 0.035;
      pineRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={pineRef} position={position} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[0.15, 0.24, 1.5, 6]} />
        <meshStandardMaterial color="#451A03" roughness={0.92} />
      </mesh>

      {/* Capa inferior de follaje */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.2, 1.6, 7]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#047857"}
          roughness={0.82}
          flatShading
        />
      </mesh>

      {/* Capa media */}
      <mesh position={[0, 2.8, 0]}>
        <coneGeometry args={[0.92, 1.4, 7]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#065F46"}
          roughness={0.82}
          flatShading
        />
      </mesh>

      {/* Capa superior / ápice */}
      <mesh position={[0, 3.7, 0]}>
        <coneGeometry args={[0.6, 1.1, 7]} />
        <meshStandardMaterial
          color={isDay ? "#22C55E" : "#10B981"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Búho Posado con Ojos Luminosos y Giro Realista de Cabeza
 * Reproduce el búho emblemático de frame_0_0 y frame_4_192
 */
function PerchedOwl({
  position,
  isDay,
  scale = 0.38,
}: {
  position: [number, number, number];
  isDay: boolean;
  scale?: number;
}) {
  const owlRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (headRef.current) {
      // Movimiento característico del búho: pausas y giros rápidos
      const t = clock.getElapsedTime();
      const lookCycle = Math.sin(t * 0.9);
      headRef.current.rotation.y = lookCycle > 0.5 ? 0.4 : lookCycle < -0.5 ? -0.4 : 0;
    }
  });

  return (
    <group ref={owlRef} position={position} scale={[scale, scale, scale]}>
      {/* Cuerpo y alas */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 0.95, 8]} />
        <meshStandardMaterial color={isDay ? "#78350F" : "#5C2C16"} flatShading />
      </mesh>
      {/* Pecho claro */}
      <mesh position={[0, 0.65, 0.22]}>
        <boxGeometry args={[0.35, 0.65, 0.15]} />
        <meshStandardMaterial color={isDay ? "#FEF3C7" : "#D4D4D8"} flatShading />
      </mesh>

      {/* Cabeza orientable */}
      <group ref={headRef} position={[0, 1.35, 0]}>
        <mesh>
          <sphereGeometry args={[0.42, 10, 10]} />
          <meshStandardMaterial color={isDay ? "#92400E" : "#78350F"} flatShading />
        </mesh>
        {/* Penachos de las orejas */}
        <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshStandardMaterial color="#78350F" flatShading />
        </mesh>
        <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshStandardMaterial color="#78350F" flatShading />
        </mesh>

        {/* Ojos dorados/amarillos radiantes */}
        <mesh position={[-0.15, 0.05, 0.36]}>
          <circleGeometry args={[0.11, 10]} />
          <meshBasicMaterial color={isDay ? "#FEF08A" : "#FDE047"} />
        </mesh>
        <mesh position={[0.15, 0.05, 0.36]}>
          <circleGeometry args={[0.11, 10]} />
          <meshBasicMaterial color={isDay ? "#FEF08A" : "#FDE047"} />
        </mesh>
        {/* Pupilas negras */}
        <mesh position={[-0.15, 0.05, 0.38]}>
          <circleGeometry args={[0.05, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.15, 0.05, 0.38]}>
          <circleGeometry args={[0.05, 10]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Pico */}
        <mesh position={[0, -0.08, 0.4]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.06, 0.16, 4]} />
          <meshStandardMaterial color="#D97706" flatShading />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Bosque Completo a Ambos Lados de la Ribera con Árboles y Búhos
 */
function RiversideForest({ isDay }: { isDay: boolean }) {
  return (
    <group>
      {/* Ribera izquierda */}
      <DeciduousTree position={[-4.8, -2.0, -3.2]} scale={1.15} isDay={isDay} />
      <PineTree position={[-3.8, -1.95, -4.8]} scale={1.0} isDay={isDay} />
      <PineTree position={[-6.2, -1.8, -6.5]} scale={1.25} isDay={isDay} />
      <DeciduousTree position={[-4.4, -1.85, -8.5]} scale={1.1} isDay={isDay} />
      <PineTree position={[-7.0, -1.65, -11.0]} scale={1.35} isDay={isDay} />
      <DeciduousTree position={[-5.2, -1.75, -13.2]} scale={1.2} isDay={isDay} />
      <PineTree position={[-7.8, -1.55, -15.5]} scale={1.5} isDay={isDay} />

      {/* Ribera derecha */}
      <DeciduousTree position={[4.8, -2.0, -3.8]} scale={1.1} isDay={isDay} />
      <PineTree position={[4.0, -1.95, -5.5]} scale={0.95} isDay={isDay} />
      <DeciduousTree position={[6.5, -1.75, -7.2]} scale={1.3} isDay={isDay} />
      <PineTree position={[4.6, -1.85, -9.0]} scale={1.15} isDay={isDay} />
      <PineTree position={[7.2, -1.65, -11.8]} scale={1.4} isDay={isDay} />
      <DeciduousTree position={[5.4, -1.75, -14.0]} scale={1.2} isDay={isDay} />
      <PineTree position={[8.0, -1.55, -16.0]} scale={1.55} isDay={isDay} />

      {/* Búhos en posiciones clave según el video */}
      <PerchedOwl position={[-3.8, 0.45, -4.8]} isDay={isDay} scale={0.38} />
      <PerchedOwl position={[4.0, 0.35, -5.5]} isDay={isDay} scale={0.34} />
      <PerchedOwl position={[-4.4, 0.7, -8.5]} isDay={isDay} scale={0.32} />
    </group>
  );
}

/**
 * Bandada de Aves Silvestres Realistas Volando con Aleteo Real en el Firmamento
 * Sustituye polígonos sintéticos por modelos 3D GLTF auténticos con animación morphing
 */
function RealisticFlyingFlock() {
  const flockRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.22;
    if (flockRef.current) {
      flockRef.current.position.x = Math.sin(t) * 9.5;
      flockRef.current.position.y = 5.2 + Math.sin(t * 1.8) * 0.5;
      flockRef.current.position.z = -9.0 + Math.cos(t) * 4.8;
      flockRef.current.rotation.y = Math.cos(t) * 0.45 + Math.PI / 2;
    }
  });

  return (
    <group ref={flockRef}>
      {/* Cigüeña Líder Realista */}
      <WildlifeStork position={[0, 0, 0]} scale={0.0055} speed={1.1} />
      {/* Cigüeña en Formación Izquierda */}
      <WildlifeStork position={[-1.7, -0.25, -1.1]} scale={0.0048} speed={1.05} />
      {/* Loro Tropical Guacamayo en Vuelo */}
      <WildlifeParrot position={[1.4, 0.2, -0.7]} scale={0.0065} speed={1.3} />
    </group>
  );
}

/**
 * Fauna y Flora 3D Auténtica Distribuida en el Santuario
 * Zorro andino, caballo silvestre, flamencos, patos y vegetación hiperrealista
 */
function SanctuaryWildlife() {
  return (
    <group>
      {/* Zorro en guardia (Survey) en la orilla del río */}
      <WildlifeFox
        position={[-2.8, -1.95, -2.4]}
        rotation={[0, 0.85, 0]}
        scale={0.0125}
        animation="Survey"
        speed={0.9}
      />

      {/* Caballo silvestre en trote lejano en la pradera derecha */}
      <WildlifeHorse
        position={[7.2, -1.35, -13.0]}
        rotation={[0, -1.2, 0]}
        scale={0.0032}
        speed={1.0}
      />

      {/* Flamenco en la orilla del agua con aleteo vivo */}
      <WildlifeFlamingo
        position={[1.9, -1.95, -3.2]}
        rotation={[0, -0.55, 0]}
        scale={0.0032}
        speed={0.85}
      />

      {/* Pato flotando serenamente en el espejo de agua */}
      <WildlifeDuck
        position={[-0.35, -1.94, -4.2]}
        rotation={[0, 0.35, 0]}
        scale={0.3}
      />

      {/* Plantas de follaje botánico realista junto a la ribera */}
      <RealisticPlant
        position={[-2.1, -1.86, -1.8]}
        rotation={[0, 0.3, 0]}
        scale={0.9}
      />
      <RealisticPlant
        position={[2.3, -1.84, -4.0]}
        rotation={[0, 1.2, 0]}
        scale={1.1}
      />
    </group>
  );
}

/**
 * Luciérnagas Bioluminiscentes Vivas (Modo Noche)
 * Enjambre flotante con pulsación orgánica y luz aditiva verde-lima
 */
function Fireflies() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 220;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const s1 = ((i * 9301 + 49297) % 233280) / 233280;
      const s2 = ((i * 7919 + 65537) % 233280) / 233280;
      const s3 = ((i * 3571 + 12345) % 233280) / 233280;
      const s4 = ((i * 4909 + 87654) % 233280) / 233280;
      pos[i * 3] = (s1 - 0.5) * 24;
      pos[i * 3 + 1] = s2 * 6.0 - 1.2;
      pos[i * 3 + 2] = -s3 * 18 - 1;
      ph[i] = s4 * Math.PI * 2;
    }
    return [pos, ph];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      pos[idx + 1] += Math.sin(t * 1.7 + phases[i]) * 0.008;
      pos[idx] += Math.cos(t * 0.9 + phases[i]) * 0.006;

      if (pos[idx + 1] > 6.2) pos[idx + 1] = -1.2;
      if (pos[idx + 1] < -1.2) pos[idx + 1] = 6.2;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color="#A3E635"
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Controlador de Cámara Suave Guiado por el Puntero del Ratón
 */
function CameraController() {
  useFrame(({ camera, pointer }) => {
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.75, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 2.2 + pointer.y * 0.35, 0.04);
    camera.lookAt(0, 0.7, -9.5);
  });
  return null;
}

export function LivingSanctuaryCanvas() {
  const { isDay } = useNatureTheme();
  const [isVisible, setIsVisible] = React.useState(true);
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(!document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      const handleMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
      mediaQuery.addEventListener("change", handleMotion);
      return () => {
        document.removeEventListener("visibilitychange", handleVisibility);
        mediaQuery.removeEventListener("change", handleMotion);
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      <Canvas
        shadows={!reducedMotion}
        dpr={[1, 2]}
        frameloop={isVisible ? (reducedMotion ? "demand" : "always") : "never"}
        camera={{ position: [0, 2.2, 5.8], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <ambientLight
          intensity={isDay ? 1.1 : 0.42}
          color={isDay ? "#ECFDF5" : "#064E3B"}
        />
        <fog
          attach="fog"
          args={[isDay ? "#A7F3D0" : "#040D09", 14, 36]}
        />

        {!isDay && (
          <Stars
            radius={90}
            depth={40}
            count={3200}
            factor={5.0}
            saturation={0}
            fade
            speed={0.9}
          />
        )}

        {/* Ecosistema 3D Realista de BioSanctuary OS */}
        <OrbitalArc isDay={isDay} />
        <CelestialOrb isDay={isDay} />
        <WindingRiver isDay={isDay} />
        <Riverbanks isDay={isDay} />
        <RiverRocks isDay={isDay} />
        <RiverReeds isDay={isDay} />
        <RiversideForest isDay={isDay} />

        {/* Fauna y Flora 3D Auténtica (Modelos GLTF Realistas Animados) */}
        <Suspense fallback={null}>
          <RealisticFlyingFlock />
          <SanctuaryWildlife />
        </Suspense>

        {!isDay && <Fireflies />}
        <CameraController />
      </Canvas>
    </div>
  );
}

export default LivingSanctuaryCanvas;

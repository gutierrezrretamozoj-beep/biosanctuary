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
 * Función canónica para la curvatura del río en función de Z
 * z va de +4 (primer plano) a -24 (fondo del valle)
 */
export function getRiverCenterX(z: number): number {
  return Math.sin((z + 8) * 0.16) * 1.65;
}

/**
 * Función canónica para la altura del terreno
 * Garantiza que la ribera SIEMPRE sea más alta que el agua (agua en y = -1.90)
 */
export function getTerrainHeight(x: number, z: number): number {
  const centerX = getRiverCenterX(z);
  const dist = Math.abs(x - centerX);
  const riverHalfWidth = 1.75; // Ancho del cauce: 3.5m

  // 1. Lecho del río bajo el agua (dist <= 1.75)
  if (dist <= riverHalfWidth) {
    const depthProfile = 1 - Math.pow(dist / riverHalfWidth, 2);
    // Fondo a -2.65m en el centro, subiendo a -2.15m en el borde
    return -2.65 - depthProfile * 0.25;
  }

  // 2. Ribera / Dique de contención (1.75 < dist <= 2.6)
  // Sube decididamente por encima del nivel del agua (-1.90m) hasta -1.35m
  if (dist < 2.6) {
    const t = (dist - riverHalfWidth) / (2.6 - riverHalfWidth);
    return -2.05 + t * 0.75; // Termina en -1.30m (0.60m SOBRE el agua)
  }

  // 3. Colinas laterales y laderas del bosque (dist >= 2.6)
  const hillDist = dist - 2.6;
  const baseHill = -1.30 + Math.pow(hillDist * 0.32, 1.25) * 1.5;
  const gentleNoise = Math.sin(x * 0.2) * Math.cos(z * 0.18) * 0.35;
  return Math.max(-1.30, baseHill + gentleNoise);
}

/**
 * Generador procedimental de textura lunar fotorrealista
 */
function createRealisticMoonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // Base de regolito lunar gris claro perlado
  ctx.fillStyle = "#E2E8F0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Mares lunares oscuros
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

  // Cráteres de impacto con borde iluminado
  const craters = [
    { x: 410, y: 410, r: 32 },
    { x: 320, y: 210, r: 24 },
    { x: 260, y: 190, r: 20 },
    { x: 580, y: 170, r: 18 },
    { x: 640, y: 310, r: 22 },
    { x: 480, y: 380, r: 16 },
    { x: 360, y: 150, r: 14 },
    { x: 740, y: 220, r: 20 },
  ];

  craters.forEach(({ x, y, r }) => {
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = "#1E293B";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(x, y, r * 0.2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalAlpha = 1.0;
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * 1. CÚPULA CELESTIAL PANORÁMICA (CIELO AZUL RADIANTE Y NOCHE PROFUNDA)
 * 100% azul auténtico sin tonos verdes que apaguen el firmamento
 */
function SanctuarySkyDome({ isDay }: { isDay: boolean }) {
  const skyTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (isDay) {
      // CIELO AZUL REAL RADIANTE
      grad.addColorStop(0.0, "#1E40AF"); // Azul cenital intenso
      grad.addColorStop(0.25, "#2563EB"); // Azul diurno puro
      grad.addColorStop(0.55, "#38BDF8"); // Celeste luminoso
      grad.addColorStop(0.80, "#7DD3FC"); // Azul cielo claro
      grad.addColorStop(1.0, "#BAE6FD"); // Azul neblina horizonte
    } else {
      // Selva nocturna profunda
      grad.addColorStop(0.0, "#020617"); // Negro azulado cósmico
      grad.addColorStop(0.35, "#0B132B"); // Azul noche profundo
      grad.addColorStop(0.70, "#0F172A"); // Índigo estelar
      grad.addColorStop(1.0, "#041C14"); // Horizonte nocturno
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
  }, [isDay]);

  return (
    <mesh position={[0, 4, -18]}>
      <sphereGeometry args={[46, 32, 24]} />
      <meshBasicMaterial
        map={skyTexture || undefined}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Nube Individual Puffy y Volumétrica
 */
function SingleCloud({
  initialX,
  y,
  z,
  scale,
  speed,
  isDay,
}: {
  initialX: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  isDay: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentX = useRef(initialX);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    currentX.current += speed * delta;
    if (currentX.current > 26) {
      currentX.current = -26;
    }
    groupRef.current.position.x = currentX.current;
  });

  return (
    <group
      ref={groupRef}
      position={[initialX, y, z]}
      scale={[scale, scale * 0.6, scale * 0.75]}
    >
      {/* Centro principal esponjoso */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.3, 14, 12]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#E2E8F0"}
          emissive={isDay ? "#F8FAFC" : "#334155"}
          emissiveIntensity={isDay ? 0.35 : 0.15}
          roughness={0.95}
          transparent
          opacity={isDay ? 0.96 : 0.45}
        />
      </mesh>
      {/* Lóbulo izquierdo */}
      <mesh position={[-0.95, -0.15, 0.1]}>
        <sphereGeometry args={[0.95, 12, 10]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#E2E8F0"}
          emissive={isDay ? "#F8FAFC" : "#334155"}
          emissiveIntensity={isDay ? 0.35 : 0.15}
          roughness={0.95}
          transparent
          opacity={isDay ? 0.95 : 0.45}
        />
      </mesh>
      {/* Lóbulo derecho */}
      <mesh position={[1.05, -0.1, -0.05]}>
        <sphereGeometry args={[0.9, 12, 10]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#E2E8F0"}
          emissive={isDay ? "#F8FAFC" : "#334155"}
          emissiveIntensity={isDay ? 0.35 : 0.15}
          roughness={0.95}
          transparent
          opacity={isDay ? 0.95 : 0.45}
        />
      </mesh>
      {/* Cúspide algodonosa */}
      <mesh position={[0.2, 0.55, 0.15]}>
        <sphereGeometry args={[0.8, 12, 10]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#E2E8F0"}
          emissive={isDay ? "#F8FAFC" : "#334155"}
          emissiveIntensity={isDay ? 0.4 : 0.2}
          roughness={0.95}
          transparent
          opacity={isDay ? 0.97 : 0.5}
        />
      </mesh>
      {/* Base inferior suave */}
      <mesh position={[-0.15, -0.35, 0]}>
        <sphereGeometry args={[0.9, 12, 10]} />
        <meshStandardMaterial
          color={isDay ? "#F1F5F9" : "#94A3B8"}
          emissive={isDay ? "#E2E8F0" : "#1E293B"}
          emissiveIntensity={isDay ? 0.2 : 0.1}
          roughness={0.95}
          transparent
          opacity={isDay ? 0.93 : 0.4}
        />
      </mesh>
    </group>
  );
}

/**
 * Nubes Algodonosas Flotando en el Cielo Azul
 */
function FluffyClouds({ isDay }: { isDay: boolean }) {
  const clouds = useMemo(
    () => [
      { x: -16, y: 6.4, z: -16, scale: 1.8, speed: 0.32 },
      { x: -5, y: 7.2, z: -18, scale: 2.3, speed: 0.22 },
      { x: 6, y: 6.1, z: -14, scale: 1.5, speed: 0.38 },
      { x: 16, y: 6.8, z: -17, scale: 2.0, speed: 0.28 },
      { x: -22, y: 5.6, z: -13, scale: 1.4, speed: 0.44 },
      { x: 2, y: 7.8, z: -19, scale: 2.5, speed: 0.2 },
    ],
    []
  );

  return (
    <group>
      {clouds.map((c, i) => (
        <SingleCloud
          key={i}
          initialX={c.x}
          y={c.y}
          z={c.z}
          scale={c.scale}
          speed={c.speed}
          isDay={isDay}
        />
      ))}
    </group>
  );
}

/**
 * Montañas en el Horizonte
 */
function DistantMountains({ isDay }: { isDay: boolean }) {
  const mountainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const peaks = [
      [-28, -2, -26], [-20, 4.5, -26], [-14, 0.5, -26],
      [-8, 5.2, -25], [-2, 1.8, -25], [4, 4.8, -25],
      [10, 1.2, -26], [16, 5.5, -26], [24, 0.8, -26], [30, -2, -26]
    ];
    for (let i = 0; i < peaks.length - 1; i++) {
      const p1 = peaks[i];
      const p2 = peaks[i + 1];
      vertices.push(p1[0], -2.5, p1[2]);
      vertices.push(p1[0], p1[1], p1[2]);
      vertices.push(p2[0], p2[1], p2[2]);

      vertices.push(p1[0], -2.5, p1[2]);
      vertices.push(p2[0], p2[1], p2[2]);
      vertices.push(p2[0], -2.5, p2[2]);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={mountainGeo} position={[0, 0, 0]}>
      <meshStandardMaterial
        color={isDay ? "#0284C7" : "#064E3B"}
        roughness={0.95}
        flatShading
      />
    </mesh>
  );
}

/**
 * Arco Orbital Calibrado en el Firmamento
 */
function OrbitalArc({ isDay }: { isDay: boolean }) {
  const arcCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 16.5;
    for (let i = 0; i <= 60; i++) {
      const theta = (i / 60) * Math.PI;
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * 6.6 - 0.2;
      const z = -14.0;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(arcCurve, 64, 0.055, 8, false);
  }, [arcCurve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial
        color={isDay ? "#FDE047" : "#BAE6FD"}
        transparent
        opacity={isDay ? 0.85 : 0.45}
      />
    </mesh>
  );
}

/**
 * Sol Radiante (Día) o Luna Fotorrealista (Noche)
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
    const t = clock.getElapsedTime() * 0.04;
    const radius = 16.5;

    const angle = isDay
      ? ((t % (Math.PI * 0.7)) + Math.PI * 0.15)
      : (((t + Math.PI * 0.35) % (Math.PI * 0.7)) + Math.PI * 0.15);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * 6.6 - 0.2;
    const z = -14.0;

    if (orbGroupRef.current) {
      orbGroupRef.current.position.set(x, Math.max(3.0, y), z);
    }

    if (isDay && sunCoronaRef.current) {
      const pulse = 1 + Math.sin(clock.getElapsedTime() * 2.2) * 0.06;
      sunCoronaRef.current.scale.set(pulse, pulse, pulse);
    }

    if (!isDay && moonRaysRef.current) {
      moonRaysRef.current.rotation.z = clock.getElapsedTime() * 0.015;
    }
  });

  return (
    <group ref={orbGroupRef} position={[-2.0, 6.4, -14.0]}>
      {isDay ? (
        <>
          <mesh>
            <sphereGeometry args={[1.65, 32, 32]} />
            <meshStandardMaterial
              color="#FFFBEB"
              emissive="#FACC15"
              emissiveIntensity={3.6}
              roughness={0.1}
            />
          </mesh>
          <mesh ref={sunCoronaRef}>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color="#FDE047"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[3.8, 24, 24]} />
            <meshBasicMaterial
              color="#FEF08A"
              transparent
              opacity={0.18}
              side={THREE.BackSide}
            />
          </mesh>
          <directionalLight
            intensity={2.8}
            color="#FFFBEB"
            position={[0, 4, 6]}
            castShadow
          />
        </>
      ) : (
        <>
          <mesh rotation={[0, 0.45, 0]}>
            <sphereGeometry args={[1.75, 48, 48]} />
            <meshStandardMaterial
              map={moonTexture || undefined}
              color="#FFFFFF"
              emissive="#E2E8F0"
              emissiveIntensity={1.25}
              roughness={0.85}
              metalness={0.05}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[2.6, 32, 32]} />
            <meshBasicMaterial
              color="#BAE6FD"
              transparent
              opacity={0.32}
              side={THREE.BackSide}
            />
          </mesh>
          <group ref={moonRaysRef}>
            {[0, 45, 90, 135].map((rot, idx) => (
              <mesh key={idx} rotation={[0, 0, (rot * Math.PI) / 180]}>
                <planeGeometry args={[0.35, 10]} />
                <meshBasicMaterial
                  color="#BAE6FD"
                  transparent
                  opacity={0.08}
                  blending={THREE.AdditiveBlending}
                  side={THREE.DoubleSide}
                />
              </mesh>
            ))}
          </group>
          <directionalLight
            intensity={1.5}
            color="#BAE6FD"
            position={[0, 4, 6]}
            castShadow
          />
        </>
      )}
    </group>
  );
}

/**
 * 2. EL AGUA CON LÍMITES ESTRICTOS (RÍO CONTENIDO SIN DESBORDAMIENTOS)
 * La malla existe ÚNICAMENTE dentro del canal (-1.75 a +1.75 alrededor del centro)
 */
function WindingRiver({ isDay }: { isDay: boolean }) {
  const riverMeshRef = useRef<THREE.Mesh>(null);

  // Malla generada a medida a lo largo de la curva canónica del río
  const riverGeo = useMemo(() => {
    const segmentsZ = 72;
    const segmentsX = 14;
    const minZ = 4.0;
    const maxZ = -24.0;
    const riverHalfWidth = 1.75; // Ancho total del agua = 3.5m

    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];

    for (let iz = 0; iz <= segmentsZ; iz++) {
      const tz = iz / segmentsZ;
      const z = THREE.MathUtils.lerp(minZ, maxZ, tz);
      const centerX = getRiverCenterX(z);

      for (let ix = 0; ix <= segmentsX; ix++) {
        const tx = ix / segmentsX; // 0 a 1
        const x = centerX + (tx * 2 - 1) * riverHalfWidth;
        const y = -1.90; // Nivel del espejo de agua

        positions.push(x, y, z);
        uvs.push(tx, tz);
      }
    }

    for (let iz = 0; iz < segmentsZ; iz++) {
      for (let ix = 0; ix < segmentsX; ix++) {
        const a = iz * (segmentsX + 1) + ix;
        const b = (iz + 1) * (segmentsX + 1) + ix;
        const c = (iz + 1) * (segmentsX + 1) + (ix + 1);
        const d = iz * (segmentsX + 1) + (ix + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Ondas dinámicas contenidas en el canal
  useFrame(({ clock }) => {
    if (!riverMeshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = riverMeshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave =
        Math.sin(z * 1.6 + t * 2.2) * 0.024 +
        Math.cos(x * 2.0 + t * 1.7) * 0.015;
      pos.setY(i, -1.90 + wave);
    }
    pos.needsUpdate = true;
    riverMeshRef.current.geometry.computeVertexNormals();
  });

  return (
    <mesh ref={riverMeshRef} geometry={riverGeo}>
      <meshStandardMaterial
        color={isDay ? "#38BDF8" : "#0284C7"}
        emissive={isDay ? "#0284C7" : "#0C4A6E"}
        emissiveIntensity={isDay ? 0.35 : 0.18}
        roughness={0.06}
        metalness={0.25}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

/**
 * 3. TERRENO CON RIBERAS ELEVADAS Y LECHO DE CONTENCIÓN
 * Las riberas suben a -1.30m (0.60m POR ENCIMA del agua a -1.90m), impidiendo todo desborde
 */
function Riverbanks({ isDay }: { isDay: boolean }) {
  const terrainGeo = useMemo(() => {
    const segmentsX = 64;
    const segmentsZ = 64;
    const minX = -22;
    const maxX = 22;
    const minZ = 4.0;
    const maxZ = -24.0;

    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const dayGrass = new THREE.Color("#16A34A");
    const dayShore = new THREE.Color("#D97706");
    const dayBed = new THREE.Color("#78350F");

    const nightGrass = new THREE.Color("#065F46");
    const nightShore = new THREE.Color("#451A03");
    const nightBed = new THREE.Color("#1E293B");

    const grassCol = isDay ? dayGrass : nightGrass;
    const shoreCol = isDay ? dayShore : nightShore;
    const bedCol = isDay ? dayBed : nightBed;

    for (let iz = 0; iz <= segmentsZ; iz++) {
      const tz = iz / segmentsZ;
      const z = THREE.MathUtils.lerp(minZ, maxZ, tz);
      const centerX = getRiverCenterX(z);

      for (let ix = 0; ix <= segmentsX; ix++) {
        const tx = ix / segmentsX;
        const x = THREE.MathUtils.lerp(minX, maxX, tx);
        const y = getTerrainHeight(x, z);

        positions.push(x, y, z);

        const dist = Math.abs(x - centerX);
        let col = grassCol;
        if (dist <= 1.75) {
          col = bedCol;
        } else if (dist < 2.6) {
          const t = (dist - 1.75) / (2.6 - 1.75);
          col = shoreCol.clone().lerp(grassCol, t);
        }
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let iz = 0; iz < segmentsZ; iz++) {
      for (let ix = 0; ix < segmentsX; ix++) {
        const a = iz * (segmentsX + 1) + ix;
        const b = (iz + 1) * (segmentsX + 1) + ix;
        const c = (iz + 1) * (segmentsX + 1) + (ix + 1);
        const d = iz * (segmentsX + 1) + (ix + 1);

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [isDay]);

  return (
    <mesh geometry={terrainGeo} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0.04}
        flatShading
      />
    </mesh>
  );
}

/**
 * Cantos Rodados y Rocas Limítrofes a lo Largo de las Riberas
 * Crean un margen físico nítido y natural que contiene el cauce
 */
function RiverBankStones({ isDay }: { isDay: boolean }) {
  const stones = useMemo(() => {
    const list: Array<{ x: number; y: number; z: number; s: number; r: number }> = [];
    const zSteps = [3.0, 1.0, -1.5, -4.0, -6.5, -9.0, -12.0, -15.0, -18.0, -21.0];

    zSteps.forEach((z, idx) => {
      const c = getRiverCenterX(z);
      // Piedra orilla izquierda (justo en el límite del agua)
      const lx = c - 1.85 - ((idx * 5) % 3) * 0.1;
      list.push({
        x: lx,
        y: getTerrainHeight(lx, z) + 0.12,
        z,
        s: 0.42 + ((idx * 3) % 4) * 0.12,
        r: idx * 0.8,
      });

      // Piedra orilla derecha
      const rx = c + 1.85 + ((idx * 7) % 3) * 0.1;
      list.push({
        x: rx,
        y: getTerrainHeight(rx, z) + 0.12,
        z: z + 0.6,
        s: 0.46 + ((idx * 4) % 3) * 0.12,
        r: idx * 1.3,
      });
    });
    return list;
  }, []);

  return (
    <group>
      {stones.map((st, i) => (
        <mesh
          key={i}
          position={[st.x, st.y, st.z]}
          rotation={[0, st.r, 0]}
          scale={[st.s, st.s * 0.65, st.s]}
        >
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
 * Juncos y Pastizales Silvestres en la Ribera
 */
function RiverReeds({ isDay }: { isDay: boolean }) {
  const reedCoords = useMemo(() => {
    const list: Array<[number, number, number]> = [];
    const zSteps = [2.0, -0.5, -3.5, -7.0, -11.0, -14.5];
    zSteps.forEach((z) => {
      const c = getRiverCenterX(z);
      const lx = c - 2.05;
      const rx = c + 2.05;
      list.push([lx, getTerrainHeight(lx, z), z]);
      list.push([rx, getTerrainHeight(rx, z), z + 0.4]);
    });
    return list;
  }, []);

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
 * 4. PINO ALPINO DE SILUETA LIMPIA Y DEFINIDA (SIN ENREDOS)
 * 4 capas cónicas elegantes y tronco visible
 */
function DefinedPineTree({
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
      const sway = Math.sin(clock.getElapsedTime() * 1.1 + position[0]) * 0.02;
      treeRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.16, 0.26, 1.6, 8]} />
        <meshStandardMaterial color="#451A03" roughness={0.9} />
      </mesh>

      {/* Capa 1 (Base) */}
      <mesh position={[0, 1.7, 0]}>
        <coneGeometry args={[1.3, 1.5, 8]} />
        <meshStandardMaterial
          color={isDay ? "#14532D" : "#022C22"}
          roughness={0.7}
          flatShading
        />
      </mesh>
      {/* Capa 2 */}
      <mesh position={[0, 2.65, 0]}>
        <coneGeometry args={[1.05, 1.35, 8]} />
        <meshStandardMaterial
          color={isDay ? "#166534" : "#064E3B"}
          roughness={0.7}
          flatShading
        />
      </mesh>
      {/* Capa 3 */}
      <mesh position={[0, 3.5, 0]}>
        <coneGeometry args={[0.78, 1.15, 8]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#047857"}
          roughness={0.7}
          flatShading
        />
      </mesh>
      {/* Capa 4 (Cúspide) */}
      <mesh position={[0, 4.25, 0]}>
        <coneGeometry args={[0.48, 0.9, 8]} />
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
 * 5. ÁRBOL FRONDOSO ESTILIZADO DE COPA LIMPIA Y REDONDEADA
 */
function DefinedBroadleafTree({
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
      const sway = Math.sin(clock.getElapsedTime() * 0.95 + position[0]) * 0.02;
      treeRef.current.rotation.z = sway;
    }
  });

  return (
    <group ref={treeRef} position={position} scale={[scale, scale, scale]}>
      {/* Tronco principal */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.2, 0.34, 2.0, 8]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>
      {/* Rama lateral izquierda */}
      <mesh position={[-0.35, 1.8, 0.1]} rotation={[0, 0, -0.45]}>
        <cylinderGeometry args={[0.1, 0.15, 0.9, 6]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>
      {/* Rama lateral derecha */}
      <mesh position={[0.35, 1.9, -0.1]} rotation={[0, 0, 0.4]}>
        <cylinderGeometry args={[0.1, 0.15, 0.85, 6]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>

      {/* Clústeres de follaje esférico suave */}
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[1.25, 12, 10]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#065F46"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[-0.75, 2.5, 0.2]}>
        <sphereGeometry args={[0.9, 10, 8]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#047857"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[0.75, 2.55, -0.2]}>
        <sphereGeometry args={[0.85, 10, 8]} />
        <meshStandardMaterial
          color={isDay ? "#22C55E" : "#059669"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[0.1, 3.5, 0.1]}>
        <sphereGeometry args={[0.7, 10, 8]} />
        <meshStandardMaterial
          color={isDay ? "#4ADE80" : "#10B981"}
          roughness={0.72}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Árbol Centinela con Rama Sobresaliente hacia el Río
 */
function HeroOverhangingTree({
  position,
  isDay,
}: {
  position: [number, number, number];
  isDay: boolean;
}) {
  return (
    <group position={position}>
      {/* Tronco robusto */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.26, 0.42, 2.4, 8]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>
      {/* Rama horizontal larga que se extiende sobre la orilla izquierda */}
      <mesh position={[0.65, 1.9, 0.15]} rotation={[0, 0, -1.15]}>
        <cylinderGeometry args={[0.14, 0.22, 1.7, 7]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>
      {/* Copa del árbol */}
      <mesh position={[0, 3.0, 0]}>
        <sphereGeometry args={[1.4, 12, 10]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#047857"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[-0.6, 2.7, 0.3]}>
        <sphereGeometry args={[0.95, 10, 8]} />
        <meshStandardMaterial
          color={isDay ? "#22C55E" : "#065F46"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Búho Guardián Posado con Giro de Cabeza y Ojos Dorados
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
        {/* Penachos */}
        <mesh position={[-0.2, 0.4, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshStandardMaterial color="#78350F" flatShading />
        </mesh>
        <mesh position={[0.2, 0.4, 0]} rotation={[0, 0, 0.3]}>
          <coneGeometry args={[0.08, 0.25, 4]} />
          <meshStandardMaterial color="#78350F" flatShading />
        </mesh>

        {/* Ojos dorados radiantes */}
        <mesh position={[-0.15, 0.05, 0.36]}>
          <circleGeometry args={[0.11, 10]} />
          <meshBasicMaterial color={isDay ? "#FEF08A" : "#FDE047"} />
        </mesh>
        <mesh position={[0.15, 0.05, 0.36]}>
          <circleGeometry args={[0.11, 10]} />
          <meshBasicMaterial color={isDay ? "#FEF08A" : "#FDE047"} />
        </mesh>
        {/* Pupilas */}
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
 * 6. BOSQUE ESTRUCTURADO Y DEFINIDO A AMBOS LADOS DEL RÍO
 * Distribución ordenada sobre las laderas con anclaje al suelo y valle despejado
 */
function RiversideForest({ isDay }: { isDay: boolean }) {
  const leftTrees = useMemo(
    () => [
      { x: -5.0, z: -5.5, s: 1.15, type: "pine" },
      { x: -6.5, z: -7.6, s: 1.3, type: "broadleaf" },
      { x: -4.8, z: -10.0, s: 1.25, type: "pine" },
      { x: -7.2, z: -12.4, s: 1.45, type: "broadleaf" },
      { x: -5.6, z: -15.0, s: 1.4, type: "pine" },
      { x: -8.2, z: -17.8, s: 1.65, type: "pine" },
    ],
    []
  );

  const rightTrees = useMemo(
    () => [
      { x: 4.6, z: -3.8, s: 1.1, type: "broadleaf" },
      { x: 5.8, z: -6.2, s: 1.2, type: "pine" },
      { x: 4.8, z: -8.8, s: 1.25, type: "broadleaf" },
      { x: 6.6, z: -11.5, s: 1.4, type: "pine" },
      { x: 5.4, z: -14.2, s: 1.35, type: "broadleaf" },
      { x: 7.8, z: -17.0, s: 1.6, type: "pine" },
    ],
    []
  );

  const heroX = -3.8;
  const heroZ = -3.2;
  const heroY = getTerrainHeight(heroX, heroZ);

  return (
    <group>
      {/* Árbol centinela en primer plano con el búho */}
      <HeroOverhangingTree position={[heroX, heroY, heroZ]} isDay={isDay} />
      <PerchedOwl
        position={[heroX + 1.15, heroY + 2.35, heroZ + 0.15]}
        isDay={isDay}
        scale={0.42}
      />

      {/* Ladera izquierda */}
      {leftTrees.map((t, i) => {
        const y = getTerrainHeight(t.x, t.z);
        return t.type === "pine" ? (
          <DefinedPineTree
            key={`l-${i}`}
            position={[t.x, y, t.z]}
            scale={t.s}
            isDay={isDay}
          />
        ) : (
          <DefinedBroadleafTree
            key={`l-${i}`}
            position={[t.x, y, t.z]}
            scale={t.s}
            isDay={isDay}
          />
        );
      })}

      {/* Ladera derecha */}
      {rightTrees.map((t, i) => {
        const y = getTerrainHeight(t.x, t.z);
        return t.type === "pine" ? (
          <DefinedPineTree
            key={`r-${i}`}
            position={[t.x, y, t.z]}
            scale={t.s}
            isDay={isDay}
          />
        ) : (
          <DefinedBroadleafTree
            key={`r-${i}`}
            position={[t.x, y, t.z]}
            scale={t.s}
            isDay={isDay}
          />
        );
      })}
    </group>
  );
}

/**
 * Bandada de Aves Silvestres en el Cielo
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
      <WildlifeStork position={[0, 0, 0]} scale={0.0055} speed={1.1} />
      <WildlifeStork position={[-1.7, -0.25, -1.1]} scale={0.0048} speed={1.05} />
      <WildlifeParrot position={[1.4, 0.2, -0.7]} scale={0.0065} speed={1.3} />
    </group>
  );
}

/**
 * Fauna y Flora 3D Auténtica
 */
function SanctuaryWildlife() {
  const foxX = -2.6;
  const foxZ = -2.4;
  const foxY = getTerrainHeight(foxX, foxZ);

  const horseX = 7.0;
  const horseZ = -13.0;
  const horseY = getTerrainHeight(horseX, horseZ);

  const duckX = -0.25;
  const duckZ = -4.2;

  const flamingoX = 1.35;
  const flamingoZ = -3.2;

  return (
    <group>
      {/* Zorro en guardia sobre la orilla izquierda */}
      <WildlifeFox
        position={[foxX, foxY, foxZ]}
        rotation={[0, 0.85, 0]}
        scale={0.0125}
        animation="Survey"
        speed={0.9}
      />

      {/* Caballo silvestre en la colina derecha */}
      <WildlifeHorse
        position={[horseX, horseY, horseZ]}
        rotation={[0, -1.2, 0]}
        scale={0.0032}
        speed={1.0}
      />

      {/* Flamenco en la ribera del agua */}
      <WildlifeFlamingo
        position={[flamingoX, -1.90, flamingoZ]}
        rotation={[0, -0.55, 0]}
        scale={0.0032}
        speed={0.85}
      />

      {/* Pato navegando en el agua */}
      <WildlifeDuck
        position={[duckX, -1.90, duckZ]}
        rotation={[0, 0.35, 0]}
        scale={0.3}
      />

      {/* Plantas botánicas en la orilla */}
      <RealisticPlant
        position={[-2.1, getTerrainHeight(-2.1, -1.8), -1.8]}
        rotation={[0, 0.3, 0]}
        scale={0.9}
      />
      <RealisticPlant
        position={[2.2, getTerrainHeight(2.2, -4.0), -4.0]}
        rotation={[0, 1.2, 0]}
        scale={1.1}
      />
    </group>
  );
}

/**
 * Luciérnagas en Modo Noche
 */
function Fireflies() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 240;

  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const s1 = ((i * 9301 + 49297) % 233280) / 233280;
      const s2 = ((i * 7919 + 65537) % 233280) / 233280;
      const s3 = ((i * 3571 + 12345) % 233280) / 233280;
      const s4 = ((i * 4909 + 87654) % 233280) / 233280;
      pos[i * 3] = (s1 - 0.5) * 26;
      pos[i * 3 + 1] = s2 * 6.2 - 1.2;
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
        size={0.19}
        color="#A3E635"
        transparent
        opacity={0.95}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/**
 * Controlador de Cámara Suave Guiado por el Ratón
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
        {/* Color de fondo del Canvas: Azul cielo luminoso de día / Noche cósmica */}
        <color attach="background" args={[isDay ? "#38BDF8" : "#020617"]} />

        {/* Iluminación Ambiental */}
        <ambientLight
          intensity={isDay ? 1.35 : 0.45}
          color={isDay ? "#BAE6FD" : "#064E3B"}
        />

        {/* Niebla Atmosférica Azul Suave */}
        <fog
          attach="fog"
          args={[isDay ? "#7DD3FC" : "#020617", 18, 55]}
        />

        {/* Estrellas en Modo Oscuro */}
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

        {/* 1. EL CIELO (Cúpula Celestial en Azul Puro) */}
        <SanctuarySkyDome isDay={isDay} />

        {/* Nubes Esponjosas en el Cielo */}
        <FluffyClouds isDay={isDay} />

        {/* Montañas en el horizonte */}
        <DistantMountains isDay={isDay} />

        {/* 2. EL SOL EN MODO CLARO / LA LUNA EN MODO OSCURO */}
        <OrbitalArc isDay={isDay} />
        <CelestialOrb isDay={isDay} />

        {/* 3. EL AGUA (Río con límites físicos estrictos dentro de su cauce) */}
        <WindingRiver isDay={isDay} />

        {/* 4. TERRENO Y BORDES DE CONTENCIÓN */}
        <Riverbanks isDay={isDay} />
        <RiverBankStones isDay={isDay} />
        <RiverReeds isDay={isDay} />

        {/* 5. BOSQUE ESTRUCTURADO Y DEFINIDO (Siluetas limpias, sin enredos) */}
        <RiversideForest isDay={isDay} />

        {/* 6. FAUNA Y FLORA 3D AUTÉNTICA */}
        <Suspense fallback={null}>
          <RealisticFlyingFlock />
          <SanctuaryWildlife />
        </Suspense>

        {/* Luciérnagas en Modo Noche */}
        {!isDay && <Fireflies />}

        {/* Movimiento Suave de Cámara con el Ratón */}
        <CameraController />
      </Canvas>
    </div>
  );
}

export default LivingSanctuaryCanvas;

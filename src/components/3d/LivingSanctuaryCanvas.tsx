"use client";

import React, { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { useNatureTheme } from "@/context/NatureThemeContext";
import {
  WildlifeFox,
  WildlifeHorse,
  WildlifeDuck,
} from "./models";

/**
 * Curvatura canónica del río (exacta a reference_frame.jpg)
 * Nace abajo a la izquierda y serpentea suavemente hacia el fondo central
 */
export function getRiverCenterX(z: number): number {
  return Math.sin((z + 5) * 0.16) * 1.45 - 0.25;
}

/**
 * Función canónica para la elevación del terreno
 * Genera el valle suave, el cauce excavado y las laderas laterales
 */
export function getTerrainHeight(x: number, z: number): number {
  const centerX = getRiverCenterX(z);
  const dist = Math.abs(x - centerX);
  const riverHalfWidth = 1.35; // Ancho del agua: ~2.7m (proporción exacta del video)

  // 1. Lecho del río bajo el agua (nivel del agua en y = -1.90)
  if (dist <= riverHalfWidth) {
    const depth = 1 - Math.pow(dist / riverHalfWidth, 2);
    return -2.45 - depth * 0.35; // Entre -2.45 y -2.80m
  }

  // 2. Ribera arenosa que contiene el agua (de 1.35 a 2.1m)
  if (dist < 2.1) {
    const t = (dist - riverHalfWidth) / (2.1 - riverHalfWidth);
    return -2.05 + t * 0.55; // Sube de -2.05 a -1.50m (0.40m sobre el agua)
  }

  // 3. Pradera y laderas que suben suavemente a los lados
  const hillDist = dist - 2.1;
  const baseHill = -1.50 + Math.pow(hillDist * 0.3, 1.22) * 1.35;
  const organicNoise = Math.sin(x * 0.22) * Math.cos(z * 0.18) * 0.25;
  return Math.max(-1.50, baseHill + organicNoise);
}

/**
 * Cúpula Celestial Atmosférica (Exacta a la iluminación cálida de reference_frame.jpg)
 * En modo diurno: Degradado suave desde azul cielo radiante cenital hasta bruma turquesa/cálida en el horizonte
 */
function AtmosphericSkyDome({ isDay }: { isDay: boolean }) {
  const skyTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    if (isDay) {
      // Modo Día: Paleta luminosa de reference_frame.jpg
      grad.addColorStop(0.0, "#2563EB"); // Azul puro cenital
      grad.addColorStop(0.28, "#38BDF8"); // Celeste luminoso
      grad.addColorStop(0.58, "#67E8F9"); // Turquesa diurno suave
      grad.addColorStop(0.85, "#A7F3D0"); // Bruma cálida del valle
      grad.addColorStop(1.0, "#D1FAE5"); // Resplandor dorado solar en el horizonte
    } else {
      // Modo Noche: Selva nocturna profunda y cielo cósmico
      grad.addColorStop(0.0, "#020617");
      grad.addColorStop(0.4, "#0B1528");
      grad.addColorStop(0.75, "#0F281E");
      grad.addColorStop(1.0, "#051D14");
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
  }, [isDay]);

  return (
    <mesh position={[0, 4, -18]}>
      <sphereGeometry args={[52, 32, 24]} />
      <meshBasicMaterial
        map={skyTexture || undefined}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Nubes Sutiles y Esponjosas en el Firmamento Lejano
 * Muy discretas, suaves y altas, exactamente como en paisajes de arte estilizado
 */
function SubtleDriftingClouds({ isDay }: { isDay: boolean }) {
  const clouds = useMemo(
    () => [
      { x: -14, y: 7.2, z: -17, s: 1.6, sp: 0.25 },
      { x: 3, y: 8.0, z: -19, s: 2.1, sp: 0.18 },
      { x: 15, y: 7.5, z: -16, s: 1.5, sp: 0.28 },
      { x: -22, y: 6.8, z: -15, s: 1.3, sp: 0.22 },
    ],
    []
  );

  return (
    <group>
      {clouds.map((c, idx) => (
        <SingleWispyCloud
          key={idx}
          initX={c.x}
          y={c.y}
          z={c.z}
          scale={c.s}
          speed={c.sp}
          isDay={isDay}
        />
      ))}
    </group>
  );
}

function SingleWispyCloud({
  initX,
  y,
  z,
  scale,
  speed,
  isDay,
}: {
  initX: number;
  y: number;
  z: number;
  scale: number;
  speed: number;
  isDay: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const posX = useRef(initX);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    posX.current += speed * delta;
    if (posX.current > 28) posX.current = -28;
    groupRef.current.position.x = posX.current;
  });

  return (
    <group ref={groupRef} position={[initX, y, z]} scale={[scale, scale * 0.45, scale * 0.6]}>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.2, 14, 10]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#CBD5E1"}
          emissive={isDay ? "#FEF08A" : "#334155"}
          emissiveIntensity={isDay ? 0.25 : 0.1}
          roughness={0.9}
          transparent
          opacity={isDay ? 0.85 : 0.35}
        />
      </mesh>
      <mesh position={[-0.8, -0.1, 0]}>
        <sphereGeometry args={[0.85, 12, 8]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#CBD5E1"}
          emissive={isDay ? "#FEF08A" : "#334155"}
          emissiveIntensity={isDay ? 0.2 : 0.1}
          roughness={0.9}
          transparent
          opacity={isDay ? 0.8 : 0.3}
        />
      </mesh>
      <mesh position={[0.8, -0.05, 0]}>
        <sphereGeometry args={[0.85, 12, 8]} />
        <meshStandardMaterial
          color={isDay ? "#FFFFFF" : "#CBD5E1"}
          emissive={isDay ? "#FEF08A" : "#334155"}
          emissiveIntensity={isDay ? 0.2 : 0.1}
          roughness={0.9}
          transparent
          opacity={isDay ? 0.8 : 0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * Colinas Suaves en el Horizonte
 */
function HorizonHills({ isDay }: { isDay: boolean }) {
  const hillGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts: number[] = [];
    const pts = [
      [-26, -2, -22], [-18, 3.2, -22], [-11, 1.4, -22],
      [-4, 3.8, -21], [3, 2.0, -21], [10, 3.6, -22],
      [18, 1.8, -22], [26, -2, -22]
    ];
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i];
      const p2 = pts[i + 1];
      verts.push(p1[0], -2.5, p1[2]);
      verts.push(p1[0], p1[1], p1[2]);
      verts.push(p2[0], p2[1], p2[2]);

      verts.push(p1[0], -2.5, p1[2]);
      verts.push(p2[0], p2[1], p2[2]);
      verts.push(p2[0], -2.5, p2[2]);
    }
    geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={hillGeo} position={[0, -0.5, 0]}>
      <meshStandardMaterial
        color={isDay ? "#6BB284" : "#0A3B2A"}
        roughness={0.92}
        flatShading
      />
    </mesh>
  );
}

/**
 * Arco Orbital Dorado Radiante (Idéntico a reference_frame.jpg)
 * Curva luminosa que cruza el cielo desde la izquierda hasta el horizonte derecho
 */
function GoldenOrbitalArc({ isDay }: { isDay: boolean }) {
  const arcCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    // Arco orbital calibrado exactamente según la captura de referencia
    const startX = -7.5;
    const endX = 7.5;
    const count = 50;
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const x = THREE.MathUtils.lerp(startX, endX, t);
      // Arco parabólico suave con cúspide a y = 5.2
      const norm = (x - startX) / (endX - startX); // 0 a 1
      const y = Math.sin(norm * Math.PI) * 4.9 + 0.6;
      const z = -10.5;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  const tubeGeo = useMemo(() => {
    return new THREE.TubeGeometry(arcCurve, 48, 0.042, 6, false);
  }, [arcCurve]);

  return (
    <mesh geometry={tubeGeo}>
      <meshBasicMaterial
        color={isDay ? "#FEF08A" : "#BAE6FD"}
        transparent
        opacity={isDay ? 0.88 : 0.45}
      />
    </mesh>
  );
}

/**
 * Sol Radiante en la Posición Exacta de reference_frame.jpg
 * Disco incandescente cálido con halo suave sobre el arco orbital
 */
function RadiantSunOrMoon({ isDay }: { isDay: boolean }) {
  const coronaRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (coronaRef.current) {
      const p = 1 + Math.sin(clock.getElapsedTime() * 2.0) * 0.05;
      coronaRef.current.scale.set(p, p, p);
    }
  });

  // Posición fija exacta de la captura: x = -2.2, y = 4.6, z = -10.5
  return (
    <group position={[-2.2, 4.6, -10.5]}>
      {isDay ? (
        <>
          {/* Núcleo Solar */}
          <mesh>
            <sphereGeometry args={[1.35, 32, 32]} />
            <meshStandardMaterial
              color="#FFFFF0"
              emissive="#FEF08A"
              emissiveIntensity={3.5}
              roughness={0.1}
            />
          </mesh>
          {/* Corona Solar Suave */}
          <mesh ref={coronaRef}>
            <sphereGeometry args={[2.0, 24, 24]} />
            <meshBasicMaterial
              color="#FDE047"
              transparent
              opacity={0.32}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Halo Exterior Difuso */}
          <mesh>
            <sphereGeometry args={[3.2, 24, 24]} />
            <meshBasicMaterial
              color="#FEF08A"
              transparent
              opacity={0.15}
              side={THREE.BackSide}
            />
          </mesh>
          {/* Luz Solar Cálida hacia el Río y el Bosque */}
          <directionalLight
            intensity={2.6}
            color="#FFFBEB"
            position={[-1, 6, 8]}
            castShadow
          />
        </>
      ) : (
        <>
          {/* Luna Llena Plateada */}
          <mesh>
            <sphereGeometry args={[1.35, 32, 32]} />
            <meshStandardMaterial
              color="#F8FAFC"
              emissive="#E2E8F0"
              emissiveIntensity={1.4}
              roughness={0.5}
            />
          </mesh>
          <mesh>
            <sphereGeometry args={[2.1, 24, 24]} />
            <meshBasicMaterial
              color="#BAE6FD"
              transparent
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
          <directionalLight
            intensity={1.4}
            color="#BAE6FD"
            position={[-1, 6, 8]}
            castShadow
          />
        </>
      )}
    </group>
  );
}

/**
 * Bandada de Aves Volando junto al Sol (Idéntica a reference_frame.jpg)
 */
function FlightOfBirds() {
  const birds = useMemo(() => {
    return [
      { x: 0.2, y: 4.1, z: -10.0, s: 0.12, rot: 0.2 },
      { x: 0.8, y: 3.8, z: -10.2, s: 0.10, rot: 0.15 },
      { x: 1.4, y: 4.3, z: -10.4, s: 0.11, rot: 0.22 },
      { x: 2.1, y: 3.9, z: -10.3, s: 0.09, rot: 0.18 },
      { x: 2.7, y: 4.2, z: -10.5, s: 0.10, rot: 0.25 },
      { x: 3.4, y: 3.7, z: -10.2, s: 0.08, rot: 0.12 },
      { x: 4.1, y: 4.0, z: -10.6, s: 0.09, rot: 0.2 },
    ];
  }, []);

  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime() * 0.15;
      groupRef.current.position.y = Math.sin(t) * 0.25;
      groupRef.current.position.x = Math.cos(t * 0.8) * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      {birds.map((b, i) => (
        <group key={i} position={[b.x, b.y, b.z]} rotation={[0, 0, b.rot]} scale={[b.s, b.s, b.s]}>
          {/* Ala izquierda */}
          <mesh position={[-0.8, 0.4, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[1.4, 0.1, 0.35]} />
            <meshBasicMaterial color="#1E293B" />
          </mesh>
          {/* Ala derecha */}
          <mesh position={[0.8, 0.4, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[1.4, 0.1, 0.35]} />
            <meshBasicMaterial color="#1E293B" />
          </mesh>
          {/* Cuerpo */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.2, 0.8]} />
            <meshBasicMaterial color="#0F172A" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Río Central con Destello Solar Especular (Idéntico a reference_frame.jpg)
 * Agua cristalina color turquesa suave con reflejo dorado brillante
 */
function RiverWithSpecularSunReflection({ isDay }: { isDay: boolean }) {
  const riverMeshRef = useRef<THREE.Mesh>(null);

  const riverGeo = useMemo(() => {
    const segZ = 64;
    const segX = 12;
    const minZ = 6.0;
    const maxZ = -22.0;
    const halfW = 1.35; // Proporción exacta: cauce contenido

    const geo = new THREE.BufferGeometry();
    const pos: number[] = [];
    const uvs: number[] = [];
    const idx: number[] = [];

    for (let iz = 0; iz <= segZ; iz++) {
      const tz = iz / segZ;
      const z = THREE.MathUtils.lerp(minZ, maxZ, tz);
      const cx = getRiverCenterX(z);

      for (let ix = 0; ix <= segX; ix++) {
        const tx = ix / segX;
        const x = cx + (tx * 2 - 1) * halfW;
        const y = -1.90; // Espejo de agua

        pos.push(x, y, z);
        uvs.push(tx, tz);
      }
    }

    for (let iz = 0; iz < segZ; iz++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iz * (segX + 1) + ix;
        const b = (iz + 1) * (segX + 1) + ix;
        const c = (iz + 1) * (segX + 1) + (ix + 1);
        const d = iz * (segX + 1) + (ix + 1);

        idx.push(a, b, d);
        idx.push(b, c, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }, []);

  useFrame(({ clock }) => {
    if (!riverMeshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = riverMeshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const wave =
        Math.sin(z * 1.5 + t * 2.0) * 0.02 +
        Math.cos(x * 2.2 + t * 1.6) * 0.012;
      pos.setY(i, -1.90 + wave);
    }
    pos.needsUpdate = true;
    riverMeshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group>
      {/* Agua cristalina con destello solar especular */}
      <mesh ref={riverMeshRef} geometry={riverGeo}>
        <meshStandardMaterial
          color={isDay ? "#5BA8C4" : "#0284C7"}
          emissive={isDay ? "#FEF08A" : "#0C4A6E"}
          emissiveIntensity={isDay ? 0.32 : 0.15}
          roughness={0.12}
          metalness={0.18}
          transparent
          opacity={0.92}
        />
      </mesh>
    </group>
  );
}

/**
 * Terreno con Riberas Arenosas y Colinas Verdes (Idéntico a reference_frame.jpg)
 */
function SanctuaryTerrain({ isDay }: { isDay: boolean }) {
  const terrainGeo = useMemo(() => {
    const segX = 64;
    const segZ = 64;
    const minX = -20;
    const maxX = 20;
    const minZ = 6.0;
    const maxZ = -22.0;

    const geo = new THREE.BufferGeometry();
    const pos: number[] = [];
    const colors: number[] = [];
    const idx: number[] = [];

    // Colores de reference_frame.jpg
    const dayGrass = new THREE.Color("#5EA86B"); // Verde pradera cálido iluminado
    const dayShore = new THREE.Color("#C89B6D"); // Ribera de arcilla/arena tostada
    const dayBed = new THREE.Color("#85522E");   // Lecho profundo

    const nightGrass = new THREE.Color("#0B4731");
    const nightShore = new THREE.Color("#452A18");
    const nightBed = new THREE.Color("#1B2A22");

    const grassCol = isDay ? dayGrass : nightGrass;
    const shoreCol = isDay ? dayShore : nightShore;
    const bedCol = isDay ? dayBed : nightBed;

    for (let iz = 0; iz <= segZ; iz++) {
      const tz = iz / segZ;
      const z = THREE.MathUtils.lerp(minZ, maxZ, tz);
      const cx = getRiverCenterX(z);

      for (let ix = 0; ix <= segX; ix++) {
        const tx = ix / segX;
        const x = THREE.MathUtils.lerp(minX, maxX, tx);
        const y = getTerrainHeight(x, z);

        pos.push(x, y, z);

        const dist = Math.abs(x - cx);
        let col = grassCol;
        if (dist <= 1.35) {
          col = bedCol;
        } else if (dist < 2.2) {
          // Margen arenoso nítido de la orilla
          const t = (dist - 1.35) / (2.2 - 1.35);
          col = shoreCol.clone().lerp(grassCol, t);
        }
        colors.push(col.r, col.g, col.b);
      }
    }

    for (let iz = 0; iz < segZ; iz++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iz * (segX + 1) + ix;
        const b = (iz + 1) * (segX + 1) + ix;
        const c = (iz + 1) * (segX + 1) + (ix + 1);
        const d = iz * (segX + 1) + (ix + 1);

        idx.push(a, b, d);
        idx.push(b, c, d);
      }
    }

    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }, [isDay]);

  return (
    <mesh geometry={terrainGeo} receiveShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.88}
        metalness={0.02}
        flatShading
      />
    </mesh>
  );
}

/**
 * Rocas Poligonales Grises a lo largo del Río y la Ribera (Idénticas a reference_frame.jpg)
 */
function RiverRocksAndStones({ isDay }: { isDay: boolean }) {
  const rockPositions = useMemo(() => {
    return [
      // Rocas en primer plano
      { x: -1.8, y: -1.78, z: 2.2, s: 0.65, r: 0.4 },
      { x: 1.6, y: -1.82, z: 1.8, s: 0.75, r: 1.2 },
      { x: -1.4, y: -1.85, z: 0.5, s: 0.55, r: 0.8 },
      { x: 1.8, y: -1.75, z: -1.5, s: 0.85, r: 2.1 },
      // Rocas en el recodo del río
      { x: -2.2, y: -1.78, z: -3.8, s: 0.95, r: 1.5 },
      { x: 0.9, y: -1.88, z: -4.5, s: 0.5, r: 0.3 },
      { x: -1.6, y: -1.82, z: -7.2, s: 0.7, r: 2.5 },
      { x: 1.7, y: -1.75, z: -9.5, s: 0.9, r: 0.9 },
      // Rocas en la pradera
      { x: 3.8, y: -1.35, z: -2.2, s: 0.8, r: 1.8 },
      { x: -3.5, y: -1.30, z: -1.0, s: 0.75, r: 0.5 },
    ];
  }, []);

  return (
    <group>
      {rockPositions.map((rk, idx) => (
        <mesh
          key={idx}
          position={[rk.x, rk.y, rk.z]}
          rotation={[0.2, rk.r, 0.1]}
          scale={[rk.s, rk.s * 0.7, rk.s * 0.9]}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={isDay ? "#7A8894" : "#3B4752"}
            roughness={0.92}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Matas y Arbustos Bajos Poligonales en la Pradera (Idénticos a reference_frame.jpg)
 */
function MeadowBushes({ isDay }: { isDay: boolean }) {
  const bushes = useMemo(() => {
    return [
      { x: -3.2, z: 1.5, s: 0.65 },
      { x: 3.4, z: 1.0, s: 0.7 },
      { x: -2.8, z: -0.8, s: 0.55 },
      { x: 2.5, z: -2.8, s: 0.6 },
      { x: 3.6, z: -5.2, s: 0.75 },
      { x: -3.6, z: -6.0, s: 0.7 },
      { x: 2.2, z: -8.0, s: 0.65 },
    ];
  }, []);

  return (
    <group>
      {bushes.map((b, idx) => {
        const y = getTerrainHeight(b.x, b.z) + 0.2;
        return (
          <mesh
            key={idx}
            position={[b.x, y, b.z]}
            scale={[b.s, b.s * 0.6, b.s]}
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={isDay ? "#4A8A5A" : "#1B5232"}
              roughness={0.8}
              flatShading
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * Juncos Silvestres con Punta Marrón en la Orilla
 */
function ShorelineReeds({ isDay }: { isDay: boolean }) {
  const reeds = useMemo(() => {
    return [
      [-1.5, -1.82, 1.2],
      [1.5, -1.80, 0.4],
      [-1.8, -1.78, -2.2],
      [1.6, -1.80, -4.0],
      [-1.5, -1.82, -6.5],
      [1.4, -1.80, -8.8],
    ] as Array<[number, number, number]>;
  }, []);

  return (
    <group>
      {reeds.map(([x, y, z], idx) => (
        <group key={idx} position={[x, y, z]}>
          <mesh position={[0, 0.35, 0]}>
            <cylinderGeometry args={[0.02, 0.035, 0.7, 4]} />
            <meshStandardMaterial color={isDay ? "#65A30D" : "#365314"} flatShading />
          </mesh>
          <mesh position={[0, 0.75, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.22, 4]} />
            <meshStandardMaterial color="#78350F" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Pino Estilizado Limpio de 3-4 Capas (Exacto a reference_frame.jpg)
 */
function LowPolyPine({
  position,
  scale = 1,
  isDay,
}: {
  position: [number, number, number];
  scale?: number;
  isDay: boolean;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.16, 0.24, 1.3, 7]} />
        <meshStandardMaterial color="#4A2511" roughness={0.9} />
      </mesh>
      {/* Capa 1 */}
      <mesh position={[0, 1.45, 0]}>
        <coneGeometry args={[1.2, 1.35, 7]} />
        <meshStandardMaterial
          color={isDay ? "#1A522C" : "#072E16"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      {/* Capa 2 */}
      <mesh position={[0, 2.3, 0]}>
        <coneGeometry args={[0.95, 1.25, 7]} />
        <meshStandardMaterial
          color={isDay ? "#226338" : "#0A3B1E"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      {/* Capa 3 */}
      <mesh position={[0, 3.1, 0]}>
        <coneGeometry args={[0.68, 1.1, 7]} />
        <meshStandardMaterial
          color={isDay ? "#2A7844" : "#0E4A26"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Árbol Frondoso Estilizado de Copa Poligonal (Exacto a reference_frame.jpg)
 */
function LowPolyBroadleaf({
  position,
  scale = 1,
  isDay,
}: {
  position: [number, number, number];
  scale?: number;
  isDay: boolean;
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Tronco */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.22, 0.35, 2.0, 7]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.9} />
      </mesh>
      {/* Copa central */}
      <mesh position={[0, 2.7, 0]}>
        <dodecahedronGeometry args={[1.35, 0]} />
        <meshStandardMaterial
          color={isDay ? "#3B7A4A" : "#134224"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      {/* Copa lateral */}
      <mesh position={[-0.6, 2.3, 0.2]}>
        <dodecahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial
          color={isDay ? "#458C55" : "#18522C"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[0.65, 2.4, -0.2]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color={isDay ? "#4E9E61" : "#1E6135"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Árbol del Búho (Orilla Izquierda de reference_frame.jpg)
 * Árbol frondoso con rama horizontal sobre la que descansa el búho centinela
 */
function OwlHeroTree({
  position,
  isDay,
}: {
  position: [number, number, number];
  isDay: boolean;
}) {
  return (
    <group position={position}>
      {/* Tronco */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.28, 0.44, 2.6, 7]} />
        <meshStandardMaterial color="#4A2511" roughness={0.9} />
      </mesh>
      {/* Rama horizontal donde reposa el búho */}
      <mesh position={[0.75, 2.0, 0.1]} rotation={[0, 0, -1.2]}>
        <cylinderGeometry args={[0.13, 0.2, 1.7, 6]} />
        <meshStandardMaterial color="#4A2511" roughness={0.9} />
      </mesh>
      {/* Copas de follaje */}
      <mesh position={[0, 3.2, 0]}>
        <dodecahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color={isDay ? "#3B7A4A" : "#134224"}
          roughness={0.75}
          flatShading
        />
      </mesh>
      <mesh position={[-0.7, 2.9, 0.3]}>
        <dodecahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={isDay ? "#458C55" : "#18522C"}
          roughness={0.75}
          flatShading
        />
      </mesh>
    </group>
  );
}

/**
 * Búho Centinela Posado en la Rama Izquierda (Idéntico a reference_frame.jpg)
 */
function PerchedOwl({
  position,
  isDay,
}: {
  position: [number, number, number];
  isDay: boolean;
}) {
  const headRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (headRef.current) {
      const t = clock.getElapsedTime();
      const lookCycle = Math.sin(t * 0.8);
      headRef.current.rotation.y = lookCycle > 0.4 ? 0.35 : lookCycle < -0.4 ? -0.35 : 0;
    }
  });

  return (
    <group position={position} scale={[0.38, 0.38, 0.38]}>
      {/* Cuerpo */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.32, 0.42, 0.95, 7]} />
        <meshStandardMaterial color={isDay ? "#78350F" : "#5C2C16"} flatShading />
      </mesh>
      {/* Pecho claro */}
      <mesh position={[0, 0.65, 0.22]}>
        <boxGeometry args={[0.32, 0.62, 0.12]} />
        <meshStandardMaterial color={isDay ? "#FEF3C7" : "#CBD5E1"} flatShading />
      </mesh>
      {/* Cabeza con ojos */}
      <group ref={headRef} position={[0, 1.32, 0]}>
        <mesh>
          <sphereGeometry args={[0.38, 8, 8]} />
          <meshStandardMaterial color={isDay ? "#92400E" : "#78350F"} flatShading />
        </mesh>
        {/* Ojos dorados radiantes */}
        <mesh position={[-0.14, 0.05, 0.34]}>
          <circleGeometry args={[0.1, 8]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
        <mesh position={[0.14, 0.05, 0.34]}>
          <circleGeometry args={[0.1, 8]} />
          <meshBasicMaterial color="#FEF08A" />
        </mesh>
        <mesh position={[-0.14, 0.05, 0.35]}>
          <circleGeometry args={[0.045, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.14, 0.05, 0.35]}>
          <circleGeometry args={[0.045, 8]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        {/* Pico */}
        <mesh position={[0, -0.07, 0.38]} rotation={[0.4, 0, 0]}>
          <coneGeometry args={[0.05, 0.15, 4]} />
          <meshStandardMaterial color="#D97706" flatShading />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Bosque Completo Distribuido en Laderas (Composición Exacta de reference_frame.jpg)
 */
function ValleyForest({ isDay }: { isDay: boolean }) {
  // Posiciones de los árboles izquierdo y derecho
  const leftTrees = useMemo(
    () => [
      { x: -5.0, z: -4.0, s: 1.15, type: "pine" },
      { x: -6.2, z: -6.5, s: 1.3, type: "broadleaf" },
      { x: -4.6, z: -8.8, s: 1.25, type: "pine" },
      { x: -7.0, z: -11.5, s: 1.4, type: "broadleaf" },
      { x: -5.5, z: -14.2, s: 1.35, type: "pine" },
      { x: -8.0, z: -17.0, s: 1.6, type: "pine" },
    ],
    []
  );

  const rightTrees = useMemo(
    () => [
      { x: 4.5, z: -1.2, s: 1.15, type: "broadleaf" },
      { x: 3.8, z: -3.8, s: 1.1, type: "pine" },
      { x: 5.4, z: -6.2, s: 1.25, type: "broadleaf" },
      { x: 4.4, z: -9.0, s: 1.3, type: "pine" },
      { x: 6.5, z: -11.8, s: 1.4, type: "broadleaf" },
      { x: 5.2, z: -14.5, s: 1.35, type: "pine" },
      { x: 7.5, z: -17.2, s: 1.6, type: "pine" },
    ],
    []
  );

  // Árbol del búho
  const owlTreeX = -4.0;
  const owlTreeZ = -1.6;
  const owlTreeY = getTerrainHeight(owlTreeX, owlTreeZ);

  return (
    <group>
      {/* Árbol del Búho en la orilla izquierda */}
      <OwlHeroTree position={[owlTreeX, owlTreeY, owlTreeZ]} isDay={isDay} />
      <PerchedOwl position={[owlTreeX + 1.25, owlTreeY + 2.5, owlTreeZ + 0.1]} isDay={isDay} />

      {/* Árboles en la ladera izquierda */}
      {leftTrees.map((t, idx) => {
        const y = getTerrainHeight(t.x, t.z);
        return t.type === "pine" ? (
          <LowPolyPine key={`lt-${idx}`} position={[t.x, y, t.z]} scale={t.s} isDay={isDay} />
        ) : (
          <LowPolyBroadleaf key={`lt-${idx}`} position={[t.x, y, t.z]} scale={t.s} isDay={isDay} />
        );
      })}

      {/* Árboles en la ladera derecha */}
      {rightTrees.map((t, idx) => {
        const y = getTerrainHeight(t.x, t.z);
        return t.type === "pine" ? (
          <LowPolyPine key={`rt-${idx}`} position={[t.x, y, t.z]} scale={t.s} isDay={isDay} />
        ) : (
          <LowPolyBroadleaf key={`rt-${idx}`} position={[t.x, y, t.z]} scale={t.s} isDay={isDay} />
        );
      })}
    </group>
  );
}

/**
 * Fauna 3D Discreta en el Valle
 */
function WildlifeInValley() {
  return (
    <group>
      <WildlifeFox
        position={[-3.2, getTerrainHeight(-3.2, 0.5), 0.5]}
        rotation={[0, 0.9, 0]}
        scale={0.012}
        animation="Survey"
        speed={0.85}
      />
      <WildlifeDuck
        position={[-0.3, -1.90, -2.5]}
        rotation={[0, 0.4, 0]}
        scale={0.28}
      />
      <WildlifeHorse
        position={[6.8, getTerrainHeight(6.8, -12.5), -12.5]}
        rotation={[0, -1.1, 0]}
        scale={0.003}
        speed={1.0}
      />
    </group>
  );
}

/**
 * Controlador de Cámara Suave y Panorámica (Ángulo Elevado de reference_frame.jpg)
 */
function CameraController() {
  useFrame(({ camera, pointer }) => {
    // Cámara elevada y retirada para obtener la panorámica perfecta del valle
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.45, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 3.6 + pointer.y * 0.25, 0.04);
    camera.lookAt(0, 0.35, -4.5);
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
        camera={{ position: [0, 3.6, 9.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        {/* Fondo del Canvas */}
        <color attach="background" args={[isDay ? "#A7F3D0" : "#020617"]} />

        {/* Iluminación Ambiental */}
        <ambientLight
          intensity={isDay ? 1.45 : 0.45}
          color={isDay ? "#ECFDF5" : "#0A3B2A"}
        />

        {/* Niebla Atmosférica Suave */}
        <fog
          attach="fog"
          args={[isDay ? "#C8EFE2" : "#020617", 16, 52]}
        />

        {/* Estrellas en Modo Noche */}
        {!isDay && (
          <Stars
            radius={90}
            depth={40}
            count={2800}
            factor={4.5}
            saturation={0}
            fade
            speed={0.8}
          />
        )}

        {/* 1. CÚPULA CELESTIAL Y NUBES SUTILES */}
        <AtmosphericSkyDome isDay={isDay} />
        <SubtleDriftingClouds isDay={isDay} />
        <HorizonHills isDay={isDay} />

        {/* 2. SOL / LUNA, ARCO ORBITAL DORADO Y AVES EN VUELO */}
        <GoldenOrbitalArc isDay={isDay} />
        <RadiantSunOrMoon isDay={isDay} />
        <FlightOfBirds />

        {/* 3. RÍO CON DESTELLO SOLAR ESPECULAR */}
        <RiverWithSpecularSunReflection isDay={isDay} />

        {/* 4. TERRENO, ROCAS, ARBUSTOS Y JUNCOS */}
        <SanctuaryTerrain isDay={isDay} />
        <RiverRocksAndStones isDay={isDay} />
        <MeadowBushes isDay={isDay} />
        <ShorelineReeds isDay={isDay} />

        {/* 5. BOSQUE EN LADERAS CON EL BÚHO CENTINELA */}
        <ValleyForest isDay={isDay} />

        {/* 6. FAUNA DISCRETA */}
        <Suspense fallback={null}>
          <WildlifeInValley />
        </Suspense>

        {/* Control suave de cámara */}
        <CameraController />
      </Canvas>
    </div>
  );
}

export default LivingSanctuaryCanvas;

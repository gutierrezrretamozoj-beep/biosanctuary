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
 * Generador procedimental de textura lunar fotorrealista
 * Crea los mares lunares (maria), cráteres y gradientes de regolito
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
 * Cúpula Celestial Panorámica (El Cielo en Modo Claro y Modo Oscuro)
 * Proyecta el degradado celeste diurno o nocturno en 360 grados
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
      // Modo Claro: Desde celeste brillante cenital hasta verde menta luminoso en el horizonte
      grad.addColorStop(0.0, "#38BDF8"); // Azul cielo cenital
      grad.addColorStop(0.35, "#7DD3FC"); // Celeste diurno suave
      grad.addColorStop(0.68, "#BAF7D0"); // Verde menta horizonte
      grad.addColorStop(1.0, "#ECFDF5"); // Bruma luminosa del valle
    } else {
      // Modo Oscuro: Selva nocturna profunda
      grad.addColorStop(0.0, "#010704"); // Negro cósmico
      grad.addColorStop(0.40, "#03150E"); // Azul noche esmeralda
      grad.addColorStop(0.75, "#062A1B"); // Selva profunda
      grad.addColorStop(1.0, "#093B26"); // Horizonte nocturno
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, [isDay]);

  return (
    <mesh position={[0, 4, -18]}>
      <sphereGeometry args={[42, 32, 24]} />
      <meshBasicMaterial
        map={skyTexture || undefined}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Siluetas de Montañas Lejanas en el Horizonte
 */
function DistantMountains({ isDay }: { isDay: boolean }) {
  const mountainGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices: number[] = [];
    // Cordillera de picos poligonales
    const peaks = [
      [-28, -2, -26], [-20, 4.5, -26], [-14, 0.5, -26],
      [-8, 5.2, -25], [-2, 1.8, -25], [4, 4.8, -25],
      [10, 1.2, -26], [16, 5.5, -26], [24, 0.8, -26], [30, -2, -26]
    ];
    for (let i = 0; i < peaks.length - 1; i++) {
      const p1 = peaks[i];
      const p2 = peaks[i + 1];
      // Triángulo 1
      vertices.push(p1[0], -2.5, p1[2]);
      vertices.push(p1[0], p1[1], p1[2]);
      vertices.push(p2[0], p2[1], p2[2]);
      // Triángulo 2
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
        color={isDay ? "#6EE7B7" : "#064E3B"}
        roughness={0.95}
        flatShading
      />
    </mesh>
  );
}

/**
 * Arco Orbital Luminoso Calibrado en el Firmamento
 * Curva visible a la perfección justo debajo del header
 */
function OrbitalArc({ isDay }: { isDay: boolean }) {
  const arcCurve = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 16.5;
    for (let i = 0; i <= 60; i++) {
      const theta = (i / 60) * Math.PI;
      const x = Math.cos(theta) * radius;
      // Apex a y ≈ 6.5 para que quede 100% visible en el tercio superior de la pantalla
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
 * Sol Radiante (Modo Día) o Luna Fotorrealista (Modo Noche)
 * Posicionados y animados exactamente a la altura visible del video
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

    // Posición armónica en el firmamento
    const angle = isDay ? ((t % (Math.PI * 0.7)) + Math.PI * 0.15) : (((t + Math.PI * 0.35) % (Math.PI * 0.7)) + Math.PI * 0.15);
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
          {/* Núcleo Solar Radiante */}
          <mesh>
            <sphereGeometry args={[1.65, 32, 32]} />
            <meshStandardMaterial
              color="#FFFBEB"
              emissive="#FACC15"
              emissiveIntensity={3.6}
              roughness={0.1}
            />
          </mesh>

          {/* Corona Solar Translúcida */}
          <mesh ref={sunCoronaRef}>
            <sphereGeometry args={[2.5, 32, 32]} />
            <meshBasicMaterial
              color="#FDE047"
              transparent
              opacity={0.35}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Halo Exterior Expandido */}
          <mesh>
            <sphereGeometry args={[3.8, 24, 24]} />
            <meshBasicMaterial
              color="#FEF08A"
              transparent
              opacity={0.18}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Luz Solar Cálida Directa hacia el Valle y Río */}
          <directionalLight
            intensity={2.8}
            color="#FFFBEB"
            position={[0, 4, 6]}
            castShadow
          />
        </>
      ) : (
        <>
          {/* Esfera Lunar con Textura Fotorrealista de Cráteres */}
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

          {/* Halo Lunar Azul Plateado */}
          <mesh>
            <sphereGeometry args={[2.6, 32, 32]} />
            <meshBasicMaterial
              color="#BAE6FD"
              transparent
              opacity={0.32}
              side={THREE.BackSide}
            />
          </mesh>

          {/* Rayos Volumétricos de Luz Lunar hacia el Río */}
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

          {/* Luz Lunar Fría hacia el Agua */}
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
 * Río Central Sinuoso con Agua Cristalina, Ondas Vivas y Destello Especular
 */
function WindingRiver({ isDay }: { isDay: boolean }) {
  const riverMeshRef = useRef<THREE.Mesh>(null);

  // Malla de alta resolución orientada horizontalmente
  const riverGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(6.2, 38, 54, 90);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      // Curvatura elegante en S idéntica a frame_0000
      const sCurve = Math.sin((y + 18) * 0.22) * 2.2;
      pos.setX(i, pos.getX(i) + sCurve);
      pos.setZ(i, 0);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Simulación dinámica de olas sobre la superficie
  useFrame(({ clock }) => {
    if (!riverMeshRef.current) return;
    const t = clock.getElapsedTime();
    const pos = riverMeshRef.current.geometry.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const wave =
        Math.sin(y * 1.4 + t * 2.0) * 0.038 +
        Math.cos(x * 1.8 + t * 1.5) * 0.022;
      pos.setZ(i, wave);
    }
    pos.needsUpdate = true;
    riverMeshRef.current.geometry.computeVertexNormals();
  });

  return (
    <group position={[0, -1.92, -6.5]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Lecho arenoso debajo del agua */}
      <mesh position={[0, 0, -0.15]}>
        <planeGeometry args={[7.2, 38]} />
        <meshStandardMaterial
          color={isDay ? "#D97706" : "#451A03"}
          roughness={0.95}
        />
      </mesh>

      {/* Superficie Viva del Agua Cristalina */}
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
    </group>
  );
}

/**
 * Ribera y Colinas Onduladas a Ambos Lados del Río (Estructura del Terreno)
 */
function Riverbanks({ isDay }: { isDay: boolean }) {
  const terrainGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(48, 38, 64, 64);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const riverCenter = Math.sin((y + 18) * 0.22) * 2.2;
      const distToRiver = Math.abs(x - riverCenter);

      // Valle suave en el río y colinas progresivas a los lados
      let height = 0;
      if (distToRiver < 3.2) {
        // Lecho del río debajo de la superficie del agua
        height = -0.35;
      } else {
        // Pendiente suave que se eleva formando colinas
        const hillSlope = Math.min((distToRiver - 3.2) / 3.5, 3.2);
        height = Math.pow(hillSlope, 1.35) * 1.1;
        // Ondulaciones orgánicas
        height += Math.sin(x * 0.22) * Math.cos(y * 0.22) * 0.75;
      }
      pos.setZ(i, height);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh
      geometry={terrainGeo}
      position={[0, -2.0, -7]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <meshStandardMaterial
        color={isDay ? "#22C55E" : "#064E3B"}
        roughness={0.88}
        metalness={0.04}
        flatShading
      />
    </mesh>
  );
}

/**
 * Rocas y Cantos Rodados en la Ribera
 */
function RiverRocks({ isDay }: { isDay: boolean }) {
  const rockList: Array<[number, number, number, number, number]> = [
    [-2.3, -1.82, -1.4, 0.65, 0.3],
    [2.2, -1.85, -2.4, 0.75, 0.8],
    [-2.6, -1.78, -4.4, 0.85, 1.2],
    [2.4, -1.82, -6.0, 0.7, 0.5],
    [-1.8, -1.9, -7.5, 0.55, 1.5],
    [2.7, -1.75, -9.5, 0.95, 2.1],
    [-3.0, -1.68, -11.8, 1.05, 0.7],
    [2.0, -1.85, -13.8, 0.75, 1.9],
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
    [-1.6, -1.75, -1.8],
    [-1.8, -1.75, -2.1],
    [1.7, -1.8, -2.8],
    [1.8, -1.8, -3.1],
    [-2.2, -1.75, -5.4],
    [1.9, -1.8, -7.0],
    [-1.6, -1.85, -8.5],
    [2.1, -1.75, -10.6],
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
      {/* Tronco */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 2.4, 7]} />
        <meshStandardMaterial color="#5C2C16" roughness={0.92} />
      </mesh>

      {/* Clústeres de follaje esférico en verde vivo */}
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

      {/* Capas cónicas de follaje */}
      <mesh position={[0, 1.8, 0]}>
        <coneGeometry args={[1.2, 1.6, 7]} />
        <meshStandardMaterial
          color={isDay ? "#15803D" : "#047857"}
          roughness={0.82}
          flatShading
        />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <coneGeometry args={[0.92, 1.4, 7]} />
        <meshStandardMaterial
          color={isDay ? "#16A34A" : "#065F46"}
          roughness={0.82}
          flatShading
        />
      </mesh>
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
 * Reproduce exactamente el búho de frame_0000 sobre la rama izquierda
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

        {/* Ojos dorados/amarillos radiantes */}
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
 * Bosque Completo a Ambos Lados de la Ribera con Mayor Forma, Densidad y Perspectiva
 */
function RiversideForest({ isDay }: { isDay: boolean }) {
  return (
    <group>
      {/* Ribera izquierda - Primer plano con rama saliente y el Búho emblemático */}
      <DeciduousTree position={[-3.6, -1.9, -3.2]} scale={1.25} isDay={isDay} />
      <PerchedOwl position={[-3.0, 0.25, -3.0]} isDay={isDay} scale={0.42} />

      {/* Ribera izquierda - Bosque denso en capas ascendentes */}
      <PineTree position={[-4.5, -1.8, -4.8]} scale={1.1} isDay={isDay} />
      <DeciduousTree position={[-5.8, -1.6, -6.5]} scale={1.35} isDay={isDay} />
      <PineTree position={[-4.2, -1.75, -8.2]} scale={1.2} isDay={isDay} />
      <DeciduousTree position={[-6.8, -1.5, -10.5]} scale={1.45} isDay={isDay} />
      <PineTree position={[-5.2, -1.6, -12.8]} scale={1.35} isDay={isDay} />
      <PineTree position={[-7.5, -1.4, -15.5]} scale={1.65} isDay={isDay} />

      {/* Ribera derecha - Enmarque del valle */}
      <DeciduousTree position={[4.6, -1.85, -3.6]} scale={1.2} isDay={isDay} />
      <PineTree position={[3.8, -1.85, -5.2]} scale={1.05} isDay={isDay} />
      <DeciduousTree position={[6.2, -1.65, -7.0]} scale={1.3} isDay={isDay} />
      <PineTree position={[4.5, -1.75, -9.0]} scale={1.25} isDay={isDay} />
      <DeciduousTree position={[7.0, -1.5, -11.5]} scale={1.45} isDay={isDay} />
      <PineTree position={[5.2, -1.6, -13.5]} scale={1.35} isDay={isDay} />
      <PineTree position={[7.8, -1.4, -16.0]} scale={1.65} isDay={isDay} />
    </group>
  );
}

/**
 * Bandada de Aves Silvestres Volando en el Firmamento
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
 * Fauna y Flora 3D Auténtica Distribuida en el Santuario
 */
function SanctuaryWildlife() {
  return (
    <group>
      {/* Zorro en guardia en la orilla del río */}
      <WildlifeFox
        position={[-2.8, -1.95, -2.4]}
        rotation={[0, 0.85, 0]}
        scale={0.0125}
        animation="Survey"
        speed={0.9}
      />

      {/* Caballo silvestre en la colina lejana derecha */}
      <WildlifeHorse
        position={[7.2, -1.35, -13.0]}
        rotation={[0, -1.2, 0]}
        scale={0.0032}
        speed={1.0}
      />

      {/* Flamenco en la orilla del agua */}
      <WildlifeFlamingo
        position={[1.9, -1.95, -3.2]}
        rotation={[0, -0.55, 0]}
        scale={0.0032}
        speed={0.85}
      />

      {/* Pato flotando en el agua */}
      <WildlifeDuck
        position={[-0.35, -1.94, -4.2]}
        rotation={[0, 0.35, 0]}
        scale={0.3}
      />

      {/* Plantas botánicas junto a la ribera */}
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
        {/* Color de fondo del Canvas */}
        <color attach="background" args={[isDay ? "#ECFDF5" : "#020B07"]} />

        {/* Iluminación Ambiental */}
        <ambientLight
          intensity={isDay ? 1.25 : 0.45}
          color={isDay ? "#ECFDF5" : "#064E3B"}
        />

        {/* Niebla Atmosférica Suave */}
        <fog
          attach="fog"
          args={[isDay ? "#BAF7D0" : "#020B07", 12, 42]}
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

        {/* 1. EL CIELO (Cúpula Celestial en degradado) */}
        <SanctuarySkyDome isDay={isDay} />

        {/* Montañas en el horizonte */}
        <DistantMountains isDay={isDay} />

        {/* 2. EL SOL EN MODO CLARO / LA LUNA EN MODO OSCURO CON ARCO ORBITAL */}
        <OrbitalArc isDay={isDay} />
        <CelestialOrb isDay={isDay} />

        {/* 3. EL AGUA (Río central sinuoso con reflejos y ondas vivas) */}
        <WindingRiver isDay={isDay} />

        {/* 4. FORMA DEL BOSQUE (Colinas, árboles densos, búho, rocas y juncos) */}
        <Riverbanks isDay={isDay} />
        <RiverRocks isDay={isDay} />
        <RiverReeds isDay={isDay} />
        <RiversideForest isDay={isDay} />

        {/* Fauna y Flora 3D Auténtica (Modelos GLTF Realistas) */}
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

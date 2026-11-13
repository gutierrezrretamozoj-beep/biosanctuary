"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface RealisticPlantProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  sway?: boolean;
}

export function RealisticPlant({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.0,
  sway = true,
}: RealisticPlantProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/plant.glb");

  const clonedScene = useMemo(() => {
    const c = clone(scene);
    c.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return c;
  }, [scene]);

  useFrame(({ clock }) => {
    if (sway && groupRef.current) {
      const t = clock.getElapsedTime() * 1.2 + position[0];
      groupRef.current.rotation.z = rotation[2] + Math.sin(t) * 0.025;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={[scale, scale, scale]}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/plant.glb");

export default RealisticPlant;

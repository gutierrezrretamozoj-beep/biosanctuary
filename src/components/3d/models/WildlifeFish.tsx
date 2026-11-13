"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface WildlifeFishProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  swimSpeed?: number;
  swimRange?: number;
}

export function WildlifeFish({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1.4,
  swimSpeed = 1.5,
  swimRange = 0.6,
}: WildlifeFishProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/fish.glb");

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
    if (groupRef.current) {
      const t = clock.getElapsedTime() * swimSpeed;
      // Ondulación natural de nado
      groupRef.current.position.x = position[0] + Math.sin(t) * swimRange;
      groupRef.current.position.z = position[2] + Math.cos(t) * (swimRange * 0.7);
      groupRef.current.rotation.y = rotation[1] + Math.sin(t * 1.5) * 0.15;
      groupRef.current.rotation.z = Math.cos(t * 2) * 0.05;
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

useGLTF.preload("/models/fish.glb");

export default WildlifeFish;

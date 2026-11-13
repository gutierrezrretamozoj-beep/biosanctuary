"use client";

import React, { useRef, useMemo } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface WildlifeDuckProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  bobbing?: boolean;
}

export function WildlifeDuck({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.45,
  bobbing = true,
}: WildlifeDuckProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/models/duck.glb");

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
    if (bobbing && groupRef.current) {
      const t = clock.getElapsedTime() * 2.0 + position[0];
      groupRef.current.position.y = position[1] + Math.sin(t) * 0.025;
      groupRef.current.rotation.x = rotation[0] + Math.sin(t * 1.5) * 0.03;
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

useGLTF.preload("/models/duck.glb");

export default WildlifeDuck;

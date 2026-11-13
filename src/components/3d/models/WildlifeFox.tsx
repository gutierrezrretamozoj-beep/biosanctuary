"use client";

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface WildlifeFoxProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  animation?: "Survey" | "Walk" | "Run";
  speed?: number;
}

export function WildlifeFox({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.015,
  animation = "Survey",
  speed = 1.0,
}: WildlifeFoxProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/fox.glb");

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

  const { actions } = useAnimations(animations, groupRef);

  useEffect(() => {
    const currentAction = actions[animation] || actions["Survey"] || Object.values(actions)[0];
    if (currentAction) {
      currentAction.reset().setEffectiveTimeScale(speed).fadeIn(0.4).play();
    }
    return () => {
      currentAction?.fadeOut(0.4);
    };
  }, [actions, animation, speed]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/fox.glb");

export default WildlifeFox;

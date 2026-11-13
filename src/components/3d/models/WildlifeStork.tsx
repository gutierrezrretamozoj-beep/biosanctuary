"use client";

import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useGLTF, useAnimations } from "@react-three/drei";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface WildlifeStorkProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  speed?: number;
}

export function WildlifeStork({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 0.0055,
  speed = 1.0,
}: WildlifeStorkProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/models/stork.glb");

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
    const currentAction = actions["storkFly_B_"] || Object.values(actions)[0];
    if (currentAction) {
      currentAction.reset().setEffectiveTimeScale(speed).fadeIn(0.3).play();
    }
    return () => {
      currentAction?.fadeOut(0.3);
    };
  }, [actions, speed]);

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/models/stork.glb");

export default WildlifeStork;

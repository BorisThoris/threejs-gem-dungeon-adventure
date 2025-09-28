import React from "react";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface TorchProps {
  position?: [number, number, number];
  color?: string;
  intensity?: number;
  flicker?: boolean;
  scale?: number;
}

const Torch: React.FC<TorchProps> = ({
  position = [0, 0, 0],
  color = "#ff6b35",
  intensity = 2,
  flicker = true,
  scale = 1,
}) => {
  const torchRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (flicker && lightRef.current) {
      // Flickering effect
      const flickerIntensity =
        intensity + Math.sin(state.clock.elapsedTime * 10) * 0.3;
      lightRef.current.intensity = Math.max(0.1, flickerIntensity);
    }
  });

  return (
    <group ref={torchRef} position={position} scale={scale}>
      {/* Torch pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Torch head */}
      <mesh position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.15, 8, 6]} />
        <meshLambertMaterial
          color="#ff6b35"
          emissive="#ff4500"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Flame */}
      <mesh position={[0, 1.3, 0]}>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshLambertMaterial color="#ffaa00" transparent opacity={0.8} />
      </mesh>

      {/* Point light for illumination */}
      <pointLight
        ref={lightRef}
        position={[0, 1.2, 0]}
        color={color}
        intensity={intensity}
        distance={8}
        decay={2}
        castShadow
      />
    </group>
  );
};

export default Torch;

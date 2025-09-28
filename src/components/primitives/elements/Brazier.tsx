import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export interface BrazierProps {
  position?: [number, number, number];
  color?: string;
  scale?: number;
  isLit?: boolean;
  flameColor?: string;
  intensity?: number;
}

const Brazier: React.FC<BrazierProps> = ({
  position = [0, 0, 0],
  color = "#8B4513",
  scale = 1,
  isLit = true,
  flameColor = "#ff6b35",
  intensity = 2,
}) => {
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (isLit && flameRef.current) {
      // Flickering flame animation
      const flicker = Math.sin(state.clock.elapsedTime * 8) * 0.1 + 0.9;
      flameRef.current.scale.setScalar(flicker);

      // Swaying motion
      const sway = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      flameRef.current.rotation.z = sway;
    }

    if (isLit && lightRef.current) {
      // Flickering light intensity
      const flickerIntensity =
        intensity + Math.sin(state.clock.elapsedTime * 10) * 0.5;
      lightRef.current.intensity = Math.max(0.1, flickerIntensity);
    }
  });

  return (
    <RigidBody position={position} scale={scale} type="fixed" colliders="hull">
      <group>
        {/* Brazier base */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.4, 0.5, 0.6, 12]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Brazier bowl */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.35, 0.4, 0.2, 12]} />
          <meshLambertMaterial color="#2C2C2C" />
        </mesh>

        {/* Brazier legs */}
        <mesh position={[-0.3, 0.15, -0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.3, 0.15, -0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[-0.3, 0.15, 0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.3, 0.15, 0.3]}>
          <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Flame */}
        {isLit && (
          <group ref={flameRef} position={[0, 1, 0]}>
            <mesh>
              <sphereGeometry args={[0.15, 8, 6]} />
              <meshLambertMaterial
                color={flameColor}
                emissive={flameColor}
                emissiveIntensity={0.5}
                transparent
                opacity={0.8}
              />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.1, 0.4, 6]} />
              <meshLambertMaterial color="#ffaa00" transparent opacity={0.7} />
            </mesh>
          </group>
        )}

        {/* Point light for illumination */}
        {isLit && (
          <pointLight
            ref={lightRef}
            position={[0, 1, 0]}
            color={flameColor}
            intensity={intensity}
            distance={10}
            decay={2}
            castShadow
          />
        )}
      </group>
    </RigidBody>
  );
};

export default Brazier;

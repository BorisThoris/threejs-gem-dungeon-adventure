import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface CandleProps {
  position?: [number, number, number];
  color?: string;
  scale?: number;
  isLit?: boolean;
  flameColor?: string;
  intensity?: number;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

const Candle: React.FC<CandleProps> = ({
  position = [0, 0, 0],
  color = "#8B4513",
  scale = 1,
  isLit = true,
  flameColor = "#ff6b35",
  intensity = 1.5,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const flameRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const candleRef = useRef<THREE.Group>(null);

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
      // More realistic flickering light intensity
      const flickerIntensity =
        intensity +
        Math.sin(state.clock.elapsedTime * 12) * 0.3 +
        Math.sin(state.clock.elapsedTime * 19) * 0.2 +
        Math.sin(state.clock.elapsedTime * 6) * 0.1;
      lightRef.current.intensity = Math.max(0.1, flickerIntensity);
    }
  });

  return (
    <group ref={candleRef} position={position} scale={scale}>
      {/* Candle base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 12]} />
        <meshLambertMaterial color={color} />
      </mesh>

      {/* Candle wax */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.3, 12]} />
        <meshLambertMaterial color="#F5F5DC" />
      </mesh>

      {/* Wick */}
      <mesh position={[0, 0.7, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 8]} />
        <meshLambertMaterial color="#2C2C2C" />
      </mesh>

      {/* Multi-layer flame for better glow */}
      {isLit && (
        <group ref={flameRef} position={[0, 0.8, 0]}>
          {/* Inner flame */}
          <mesh>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshLambertMaterial
              color="#ffaa00"
              emissive="#ffaa00"
              emissiveIntensity={0.9}
              transparent
              opacity={0.95}
            />
          </mesh>

          {/* Middle flame */}
          <mesh position={[0, 0.1, 0]}>
            <coneGeometry args={[0.06, 0.2, 6]} />
            <meshLambertMaterial
              color={flameColor}
              emissive={flameColor}
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Outer flame */}
          <mesh position={[0, 0.15, 0]}>
            <coneGeometry args={[0.08, 0.25, 6]} />
            <meshLambertMaterial
              color="#ff6600"
              emissive="#ff6600"
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Flame glow effect */}
          <mesh position={[0, 0.2, 0]}>
            <coneGeometry args={[0.1, 0.3, 6]} />
            <meshLambertMaterial color="#ff4400" transparent opacity={0.3} />
          </mesh>
        </group>
      )}

      {/* Point light for illumination */}
      {isLit && (
        <pointLight
          ref={lightRef}
          position={[0, 0.8, 0]}
          color={flameColor}
          intensity={intensity}
          distance={6}
          decay={2}
          castShadow
        />
      )}

      {/* Clickable area */}
      <mesh
        position={[0, 0.5, 0]}
        onClick={onClick}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
      >
        <cylinderGeometry args={[0.2, 0.2, 0.8, 12]} />
        <meshLambertMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Candle;


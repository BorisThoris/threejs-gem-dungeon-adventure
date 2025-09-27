import React from "react";
import { RigidBody } from "@react-three/rapier";
import { Box } from "@react-three/drei";
import * as THREE from "three";

/**
 * @emoji 🔲
 * @description Floor tiles with various materials and patterns
 */

export interface TileProps {
  position: [number, number, number];
  size?: number;
  height?: number;
  color?: string;
  material?: "stone" | "marble" | "wood" | "metal" | "brick" | "carpet";
  pattern?: "smooth" | "rough" | "tiled" | "cracked" | "polished";
  rotation?: [number, number, number];
  isCollidable?: boolean;
  opacity?: number;
  emissive?: boolean;
  emissiveColor?: string;
  emissiveIntensity?: number;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

const Tile: React.FC<TileProps> = ({
  position,
  size = 1,
  height = 0.1,
  color = "#4a4a4a",
  material = "stone",
  pattern = "smooth",
  rotation = [0, 0, 0],
  isCollidable = true,
  opacity = 1,
  emissive = false,
  emissiveColor = "#ffffff",
  emissiveIntensity = 0.1,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  // Material configurations
  const getMaterialProps = () => {
    const baseProps = {
      color,
      transparent: opacity < 1,
      opacity,
      emissive: emissive ? emissiveColor : "#000000",
      emissiveIntensity: emissive ? emissiveIntensity : 0,
    };

    switch (material) {
      case "stone":
        return {
          ...baseProps,
          roughness:
            pattern === "rough" ? 0.9 : pattern === "polished" ? 0.1 : 0.6,
          metalness: 0.1,
        };
      case "marble":
        return {
          ...baseProps,
          roughness: 0.1,
          metalness: 0.05,
        };
      case "wood":
        return {
          ...baseProps,
          roughness: pattern === "rough" ? 0.8 : 0.4,
          metalness: 0.0,
        };
      case "metal":
        return {
          ...baseProps,
          roughness: pattern === "rough" ? 0.7 : 0.2,
          metalness: 0.8,
        };
      case "brick":
        return {
          ...baseProps,
          roughness: 0.8,
          metalness: 0.0,
        };
      case "carpet":
        return {
          ...baseProps,
          roughness: 0.9,
          metalness: 0.0,
        };
      default:
        return baseProps;
    }
  };

  // Pattern variations
  const getPatternGeometry = () => {
    switch (pattern) {
      case "tiled":
        // Create a grid pattern effect
        return (
          <Box args={[size * 0.9, height, size * 0.9]}>
            <meshStandardMaterial {...getMaterialProps()} />
          </Box>
        );
      case "cracked":
        // Add some visual variation for cracked tiles
        return (
          <Box args={[size * 0.95, height, size * 0.95]}>
            <meshStandardMaterial {...getMaterialProps()} />
          </Box>
        );
      default:
        return (
          <Box args={[size, height, size]}>
            <meshStandardMaterial {...getMaterialProps()} />
          </Box>
        );
    }
  };

  const tileContent = (
    <group position={position} rotation={rotation}>
      {getPatternGeometry()}

      {/* Pattern details for specific materials */}
      {material === "brick" && pattern === "tiled" && (
        <group>
          {/* Brick lines */}
          <Box args={[size, 0.01, 0.02]} position={[0, height + 0.01, 0]}>
            <meshStandardMaterial color="#000000" transparent opacity={0.3} />
          </Box>
          <Box args={[0.02, 0.01, size]} position={[0, height + 0.01, 0]}>
            <meshStandardMaterial color="#000000" transparent opacity={0.3} />
          </Box>
        </group>
      )}

      {material === "wood" && pattern === "tiled" && (
        <group>
          {/* Wood grain lines */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={i}
              args={[size, 0.005, 0.01]}
              position={[0, height + 0.01, (i - 1) * size * 0.3]}
            >
              <meshStandardMaterial color="#654321" transparent opacity={0.2} />
            </Box>
          ))}
        </group>
      )}
    </group>
  );

  if (isCollidable) {
    return (
      <RigidBody type="fixed" position={position}>
        <mesh
          rotation={rotation}
          onClick={onClick}
          onPointerOver={onPointerOver}
          onPointerOut={onPointerOut}
        >
          {tileContent}
        </mesh>
      </RigidBody>
    );
  }

  return (
    <mesh
      position={position}
      rotation={rotation}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {tileContent}
    </mesh>
  );
};

export default Tile;

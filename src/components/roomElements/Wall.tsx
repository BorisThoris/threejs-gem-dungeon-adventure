import React from "react";
import { RigidBody } from "@react-three/rapier";
import { Box } from "@react-three/drei";
import * as THREE from "three";

export interface WallProps {
  position: [number, number, number];
  width?: number;
  height?: number;
  depth?: number;
  material?: "stone" | "brick" | "wood" | "plaster" | "metal" | "concrete";
  texture?: "smooth" | "rough" | "weathered" | "cracked" | "painted";
  color?: string;
  rotation?: [number, number, number];
  isCollidable?: boolean;
  hasWindows?: boolean;
  windowCount?: number;
  hasDoors?: boolean;
  doorWidth?: number;
  opacity?: number;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

const Wall: React.FC<WallProps> = ({
  position,
  width = 8,
  height = 4,
  depth = 0.5,
  material = "stone",
  texture = "smooth",
  color,
  rotation = [0, 0, 0],
  isCollidable = true,
  hasWindows = false,
  windowCount = 1,
  hasDoors = false,
  doorWidth = 1.5,
  opacity = 1,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  // Material color configurations
  const getMaterialColor = () => {
    if (color) return color;

    switch (material) {
      case "stone":
        return texture === "weathered" ? "#8B7355" : "#A0A0A0";
      case "brick":
        return texture === "weathered" ? "#8B4513" : "#CD5C5C";
      case "wood":
        return texture === "weathered" ? "#8B7355" : "#D2B48C";
      case "plaster":
        return texture === "painted" ? "#F5F5DC" : "#F0F0F0";
      case "metal":
        return "#C0C0C0";
      case "concrete":
        return "#D3D3D3";
      default:
        return "#A0A0A0";
    }
  };

  // Material properties
  const getMaterialProps = () => {
    const baseColor = getMaterialColor();

    return {
      color: baseColor,
      transparent: opacity < 1,
      opacity,
      roughness: texture === "rough" ? 0.9 : texture === "smooth" ? 0.3 : 0.6,
      metalness: material === "metal" ? 0.8 : 0.1,
    };
  };

  // Calculate window positions
  const getWindowPositions = () => {
    if (!hasWindows || windowCount <= 0) return [];

    const positions = [];
    const windowSpacing = width / (windowCount + 1);

    for (let i = 0; i < windowCount; i++) {
      const x = (i + 1) * windowSpacing - width / 2;
      positions.push(x);
    }

    return positions;
  };

  // Calculate door position (center by default)
  const getDoorPosition = () => {
    return hasDoors ? 0 : null;
  };

  const wallContent = (
    <group position={position} rotation={rotation}>
      {/* Main wall body */}
      <Box args={[width, height, depth]}>
        <meshStandardMaterial {...getMaterialProps()} />
      </Box>

      {/* Material-specific details */}
      {material === "brick" && (
        <group>
          {/* Brick pattern */}
          {Array.from({ length: Math.floor(height * 2) }).map((_, row) => {
            const offset = row % 2 === 0 ? 0 : 0.5;
            return Array.from({ length: Math.floor(width * 2) }).map(
              (_, col) => (
                <Box
                  key={`brick-${row}-${col}`}
                  args={[0.45, 0.2, 0.01]}
                  position={[
                    (col + offset) * 0.5 - width / 2,
                    row * 0.25 - height / 2 + 0.1,
                    depth / 2 + 0.01,
                  ]}
                >
                  <meshStandardMaterial
                    color="#000000"
                    transparent
                    opacity={0.1}
                  />
                </Box>
              )
            );
          })}
        </group>
      )}

      {material === "wood" && (
        <group>
          {/* Wood planks */}
          {Array.from({ length: Math.floor(height * 2) }).map((_, i) => (
            <Box
              key={`plank-${i}`}
              args={[width * 0.98, 0.45, 0.01]}
              position={[0, i * 0.5 - height / 2 + 0.25, depth / 2 + 0.01]}
            >
              <meshStandardMaterial color="#654321" transparent opacity={0.2} />
            </Box>
          ))}
        </group>
      )}

      {/* Windows */}
      {hasWindows &&
        getWindowPositions().map((x, i) => (
          <group key={`window-${i}`}>
            {/* Window frame */}
            <Box args={[1.2, 1.5, 0.1]} position={[x, 0.5, depth / 2 + 0.05]}>
              <meshStandardMaterial color="#8B4513" />
            </Box>
            {/* Window glass */}
            <Box args={[1.0, 1.3, 0.02]} position={[x, 0.5, depth / 2 + 0.1]}>
              <meshStandardMaterial color="#87CEEB" transparent opacity={0.7} />
            </Box>
          </group>
        ))}

      {/* Door */}
      {hasDoors && (
        <group>
          {/* Door frame */}
          <Box
            args={[doorWidth + 0.2, height, 0.1]}
            position={[0, 0, depth / 2 + 0.05]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Box>
          {/* Door */}
          <Box
            args={[doorWidth, height - 0.2, 0.05]}
            position={[0, -0.1, depth / 2 + 0.1]}
          >
            <meshStandardMaterial color="#654321" />
          </Box>
        </group>
      )}

      {/* Cracks for weathered walls */}
      {texture === "cracked" && (
        <group>
          {Array.from({ length: 3 }).map((_, i) => (
            <Box
              key={`crack-${i}`}
              args={[0.02, height * (0.3 + Math.random() * 0.4), 0.01]}
              position={[
                (Math.random() - 0.5) * width * 0.8,
                (Math.random() - 0.5) * height * 0.5,
                depth / 2 + 0.01,
              ]}
            >
              <meshStandardMaterial color="#000000" transparent opacity={0.3} />
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
          {wallContent}
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
      {wallContent}
    </mesh>
  );
};

export default Wall;


import React from "react";
import { RigidBody } from "@react-three/rapier";

type ShapeType =
  | "square"
  | "circle"
  | "triangle"
  | "hexagon"
  | "octagon"
  | "diamond";

interface ShapedShellProps {
  size: number;
  shape?: ShapeType;
  colorFloor?: string;
  colorWall?: string;
}

const ShapedShell: React.FC<ShapedShellProps> = ({
  size,
  shape = "square",
  colorFloor = "#4a4a4a",
  colorWall = "#8B4513",
}) => {
  if (shape === "circle") {
    const radius = size * 0.48;
    return (
      <group>
        {/* Floor (square collider for stability) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, -0.5, 0]} receiveShadow>
            <boxGeometry args={[size, 1, size]} />
            <meshLambertMaterial color={colorFloor} />
          </mesh>
        </RigidBody>
        {/* Visual circular top */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry args={[radius, radius, 0.1, 48]} />
          <meshStandardMaterial color={colorFloor} />
        </mesh>
        {/* Ring wall */}
        <mesh position={[0, 2, 0]} castShadow>
          <torusGeometry args={[radius, 0.4, 12, 96]} />
          <meshStandardMaterial color={colorWall} />
        </mesh>
      </group>
    );
  }

  // Polygonal shells approximated via segmented walls
  if (
    shape === "hexagon" ||
    shape === "octagon" ||
    shape === "diamond" ||
    shape === "triangle"
  ) {
    const sides =
      shape === "hexagon"
        ? 6
        : shape === "octagon"
        ? 8
        : shape === "triangle"
        ? 3
        : 4;
    const radius = size * 0.5;
    const wallLen = ((2 * Math.PI * radius) / sides) * 0.9;

    return (
      <group>
        {/* Floor collider */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, -0.5, 0]} receiveShadow>
            <boxGeometry args={[size, 1, size]} />
            <meshLambertMaterial color={colorFloor} />
          </mesh>
        </RigidBody>
        {/* Visual center plate */}
        <mesh position={[0, 0, 0]} receiveShadow>
          <cylinderGeometry
            args={[radius * 0.95, radius * 0.95, 0.1, Math.max(12, sides * 6)]}
          />
          <meshStandardMaterial color={colorFloor} />
        </mesh>

        {/* Segmented walls */}
        <RigidBody type="fixed" colliders="cuboid">
          {Array.from({ length: sides }).map((_, i) => {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const rotY = angle + Math.PI / 2;
            return (
              <mesh
                key={i}
                position={[x, 2, z]}
                rotation={[0, rotY, 0]}
                receiveShadow
              >
                <boxGeometry args={[wallLen, 4, 0.5]} />
                <meshLambertMaterial color={colorWall} />
              </mesh>
            );
          })}
        </RigidBody>
      </group>
    );
  }

  // Default: square room
  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[size, 1, size]} />
          <meshLambertMaterial color={colorFloor} />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* North */}
        <mesh position={[0, 2, -size / 2]} receiveShadow>
          <boxGeometry args={[size, 4, 0.5]} />
          <meshLambertMaterial color={colorWall} />
        </mesh>
        {/* South */}
        <mesh position={[0, 2, size / 2]} receiveShadow>
          <boxGeometry args={[size, 4, 0.5]} />
          <meshLambertMaterial color={colorWall} />
        </mesh>
        {/* East */}
        <mesh position={[size / 2, 2, 0]} receiveShadow>
          <boxGeometry args={[0.5, 4, size]} />
          <meshLambertMaterial color={colorWall} />
        </mesh>
        {/* West */}
        <mesh position={[-size / 2, 2, 0]} receiveShadow>
          <boxGeometry args={[0.5, 4, size]} />
          <meshLambertMaterial color={colorWall} />
        </mesh>
      </RigidBody>
    </group>
  );
};

export default ShapedShell;

import React, { useCallback } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import * as THREE from "three";

interface SimpleDoorProps {
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  onDoorClick: () => void;
  showLabel?: boolean;
  direction?: "north" | "south" | "east" | "west";
}

const SimpleDoor: React.FC<SimpleDoorProps> = React.memo(
  ({
    position,
    rotation,
    targetRoomId,
    onDoorClick,
    showLabel = true,
    direction,
  }) => {
    const handleClick = useCallback(
      (e: any) => {
        e.stopPropagation();
        // SimpleDoor clicked
        onDoorClick();
      },
      [targetRoomId, onDoorClick]
    );

    const handlePointerOver = useCallback((e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    }, []);

    const handlePointerOut = useCallback((e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "default";
    }, []);

    // Generate door label
    const doorLabel =
      showLabel && direction
        ? (() => {
            const directionNames = {
              north: "North",
              south: "South",
              east: "East",
              west: "West",
            };

            const targetRoomName = targetRoomId
              .replace(/^room_/, "")
              .replace(/_/g, " ");

            return `🚪 ${directionNames[direction]}\n→ ${targetRoomName}`;
          })()
        : "";

    return (
      <group position={position} rotation={rotation}>
        {/* Simple door frame */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>

        {/* Clickable area */}
        <RigidBody type="fixed" sensor>
          <mesh
            position={[0, 1.5, 0.1]}
            onPointerDown={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[2.2, 3.2, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </RigidBody>

        {/* Door label */}
        {doorLabel && (
          <group position={[0, 2.5, 0]}>
            <Text
              position={[0, 0, 0.8]}
              fontSize={0.25}
              color="#FFFF00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.03}
              outlineColor="#000000"
              maxWidth={5}
            >
              {doorLabel}
            </Text>
            {/* Background panel for better readability */}
            <mesh position={[0, 0, 0.7]}>
              <planeGeometry args={[3, 1]} />
              <meshBasicMaterial
                color="#000000"
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Directional arrow indicator */}
            <mesh position={[0, 0, 0.9]}>
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshBasicMaterial color="#FFFF00" />
            </mesh>
          </group>
        )}
      </group>
    );
  }
);

SimpleDoor.displayName = "SimpleDoor";

export default SimpleDoor;

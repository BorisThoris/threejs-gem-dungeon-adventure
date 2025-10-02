import React, { useRef, useState, useCallback, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export interface EnhancedDoorProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  direction: "north" | "south" | "east" | "west";
  isLocked?: boolean;
  keyRequired?: string;
  onDoorClick: (doorId: string, targetRoomId: string) => void;
  onDoorHover?: (doorId: string, isHovered: boolean) => void;
  playerPosition?: [number, number, number];
  interactionDistance?: number;
  showLabel?: boolean;
  labelText?: string;
}

const EnhancedDoor: React.FC<EnhancedDoorProps> = React.memo(
  ({
    id,
    position,
    rotation,
    targetRoomId,
    direction,
    isLocked = false,
    keyRequired,
    onDoorClick,
    onDoorHover,
    playerPosition = [0, 0, 0],
    interactionDistance = 3,
    showLabel = true,
    labelText,
  }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isNearby, setIsNearby] = useState(false);
    const [canInteract, setCanInteract] = useState(false);
    const hoverTimeRef = useRef(0);

    // Calculate door appearance based on state
    const doorAppearance = useMemo(() => {
      if (isLocked) {
        return {
          color: "#8B4513",
          opacity: 0.7,
          emissive: "#4A2C17",
        };
      }

      if (isHovered) {
        return {
          color: "#8B7355",
          opacity: 0.9,
          emissive: "#5D4E37",
        };
      }

      if (isNearby) {
        return {
          color: "#654321",
          opacity: 0.95,
          emissive: "#3D2F1F",
        };
      }

      return {
        color: "#654321",
        opacity: 1.0,
        emissive: "#2D1F0F",
      };
    }, [isLocked, isHovered, isNearby]);

    // Calculate door label
    const doorLabel = useMemo(() => {
      if (!showLabel) return "";

      if (labelText) return labelText;

      if (isLocked) return `🔒 Locked (${keyRequired})`;

      const directionNames = {
        north: "North",
        south: "South",
        east: "East",
        west: "West",
      };

      return `🚪 ${directionNames[direction]} Door`;
    }, [showLabel, labelText, isLocked, keyRequired, direction]);

    // Check if player is nearby
    const checkPlayerProximity = useCallback(() => {
      const doorPosition = new THREE.Vector3(...position);
      const playerPos = new THREE.Vector3(...playerPosition);
      const distance = doorPosition.distanceTo(playerPos);

      const nearby = distance <= interactionDistance;
      const canInteractNow = nearby && !isLocked;

      if (nearby !== isNearby) {
        setIsNearby(nearby);
      }

      if (canInteractNow !== canInteract) {
        setCanInteract(canInteractNow);
      }
    }, [
      position,
      playerPosition,
      interactionDistance,
      isLocked,
      isNearby,
      canInteract,
    ]);

    // Handle door click
    const handleClick = useCallback(
      (event: any) => {
        event.stopPropagation();

        if (isLocked) {
          console.log(`Door ${id} is locked, requires key: ${keyRequired}`);
          return;
        }

        console.log(`Door clicked: ${id} -> ${targetRoomId}`);
        onDoorClick(id, targetRoomId);
      },
      [id, targetRoomId, isLocked, keyRequired, onDoorClick]
    );

    // Handle door hover
    const handlePointerOver = useCallback(
      (event: any) => {
        event.stopPropagation();
        setIsHovered(true);
        onDoorHover?.(id, true);

        if (canInteract) {
          document.body.style.cursor = "pointer";
        }
      },
      [id, canInteract, onDoorHover]
    );

    const handlePointerOut = useCallback(
      (event: any) => {
        event.stopPropagation();
        setIsHovered(false);
        onDoorHover?.(id, false);
        document.body.style.cursor = "default";
      },
      [id, onDoorHover]
    );

    // Update proximity check
    useFrame(() => {
      checkPlayerProximity();
    });

    // Keyboard interaction
    React.useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "E" && canInteract && isNearby) {
          handleClick(event);
        }
      };

      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }, [canInteract, isNearby, handleClick]);

    return (
      <group position={position} rotation={rotation}>
        {/* Door frame */}
        <mesh ref={meshRef} castShadow>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshLambertMaterial
            color={doorAppearance.color}
            transparent
            opacity={doorAppearance.opacity}
            emissive={doorAppearance.emissive}
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>

        {/* Door outline for better visibility */}
        <mesh position={[0, 0, 0.11]}>
          <boxGeometry args={[2.1, 3.1, 0.02]} />
          <meshLambertMaterial color="#333333" />
        </mesh>

        {/* Door handle */}
        <mesh position={[0.7, 0, 0.15]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshLambertMaterial
            color={isLocked ? "#8B4513" : "#FFD700"}
            emissive={isLocked ? "#4A2C17" : "#FFA500"}
          />
        </mesh>

        {/* Lock indicator */}
        {isLocked && (
          <mesh position={[-0.7, 0, 0.15]}>
            <boxGeometry args={[0.15, 0.2, 0.05]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        )}

        {/* Interaction area (invisible) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh
            position={[0, 0, 0]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[2.5, 3.5, 0.5]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </RigidBody>

        {/* Door label */}
        {showLabel && doorLabel && (
          <group position={[0, 2, 0]}>
            <Text
              position={[0, 0, 0.5]}
              fontSize={0.3}
              color={isLocked ? "#FF6B6B" : canInteract ? "#00FF00" : "#FFFFFF"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
              maxWidth={4}
            >
              {doorLabel}
            </Text>
          </group>
        )}

        {/* Proximity indicator */}
        {isNearby && !isLocked && (
          <group position={[0, -1.5, 0]}>
            <mesh>
              <ringGeometry args={[1, 1.2, 16]} />
              <meshBasicMaterial
                color="#00FF00"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Interaction prompt */}
        {canInteract && (
          <group position={[0, -2, 0]}>
            <Text
              position={[0, 0, 0.5]}
              fontSize={0.25}
              color="#00FF00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              Press E to enter
            </Text>
          </group>
        )}
      </group>
    );
  }
);

EnhancedDoor.displayName = "EnhancedDoor";

export default EnhancedDoor;

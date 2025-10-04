import React, { useCallback } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export type DoorState = "open" | "closed" | "locked" | "broken";
export type DoorType = "standard" | "locked" | "puzzle" | "one_way" | "secret";

interface DoorProps {
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  onDoorClick: () => void;
  showLabel?: boolean;
  direction?: "north" | "south" | "east" | "west";

  // Enhanced features
  state?: DoorState;
  type?: DoorType;
  isLocked?: boolean;
  requiredKey?: string;
  animationSpeed?: number;
  glowEffect?: boolean;
  onStateChange?: (newState: DoorState) => void;
}

const Door: React.FC<DoorProps> = React.memo(
  ({
    position,
    rotation,
    targetRoomId,
    onDoorClick,
    showLabel = true,
    direction,
    state = "closed",
    type = "standard",
    isLocked = false,
    requiredKey,
    animationSpeed = 1,
    glowEffect = false,
    onStateChange,
  }) => {
    // Door state logic
    const canInteract = state !== "locked" && state !== "broken";
    const currentState = isLocked ? "locked" : state;

    // Get door colors based on state and type
    const getDoorColor = () => {
      switch (currentState) {
        case "open":
          return "#90EE90"; // Light green
        case "closed":
          return "#8B4513"; // Brown
        case "locked":
          return "#B22222"; // Fire brick
        case "broken":
          return "#696969"; // Dim gray
        default:
          return "#8B4513";
      }
    };

    const getDoorMaterial = () => {
      const color = getDoorColor();
      return {
        color,
        metalness: type === "secret" ? 0.9 : 0.3,
        roughness: type === "secret" ? 0.1 : 0.7,
        emissive: glowEffect
          ? new THREE.Color(color).multiplyScalar(0.2)
          : new THREE.Color(0x000000),
      };
    };

    const handleClick = useCallback(
      (e: any) => {
        e.stopPropagation();

        if (!canInteract) {
          // Handle locked/broken door interaction
          console.log(`Door is ${currentState} - cannot interact`);
          return;
        }

        // Handle door state change
        if (onStateChange && state === "closed") {
          onStateChange("open");
        }

        onDoorClick();
      },
      [onDoorClick, canInteract, currentState, onStateChange, state]
    );

    const handlePointerOver = useCallback(
      (e: any) => {
        e.stopPropagation();
        document.body.style.cursor = canInteract ? "pointer" : "not-allowed";
      },
      [canInteract]
    );

    const handlePointerOut = useCallback((e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "default";
    }, []);

    // Generate enhanced door label with state info
    const doorLabel = showLabel
      ? (() => {
          const targetRoomName = targetRoomId
            .replace(/^room_/, "")
            .replace(/_/g, " ");

          const stateIcon =
            {
              open: "🟢",
              closed: "🟤",
              locked: "🔒",
              broken: "🔴",
            }[currentState] || "🚪";

          const typeIcon =
            {
              standard: "",
              locked: "🔐",
              puzzle: "🧩",
              one_way: "➡️",
              secret: "👻",
            }[type] || "";

          return `${stateIcon} ${typeIcon} ${targetRoomName}`.trim();
        })()
      : "";

    return (
      <group position={position} rotation={rotation}>
        {/* Enhanced door frame */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshStandardMaterial {...getDoorMaterial()} />
        </mesh>

        {/* Door panel with state-based styling */}
        <mesh position={[0, 1.5, 0.1]} castShadow>
          <boxGeometry args={[1.8, 2.8, 0.05]} />
          <meshStandardMaterial {...getDoorMaterial()} />
        </mesh>

        {/* Lock indicator */}
        {currentState === "locked" && (
          <mesh position={[0.6, 1.5, 0.15]}>
            <boxGeometry args={[0.2, 0.3, 0.1]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        )}

        {/* Broken door indicator */}
        {currentState === "broken" && (
          <mesh position={[0, 1.5, 0.12]}>
            <boxGeometry args={[0.1, 2.8, 0.02]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
        )}

        {/* Secret door glow effect */}
        {type === "secret" && glowEffect && (
          <mesh position={[0, 1.5, 0.2]}>
            <planeGeometry args={[2.2, 3.2]} />
            <meshBasicMaterial
              color="#00FFFF"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

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

Door.displayName = "Door";

export default Door;

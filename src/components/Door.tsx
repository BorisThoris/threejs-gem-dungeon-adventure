import React from "react";
import { RigidBody } from "@react-three/rapier";
import useRoomManagerStore from "../store/roomManagerStore";
import useMapStore from "../store/mapStore";

interface DoorProps {
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  direction: "north" | "south" | "east" | "west";
  isLocked?: boolean;
  keyRequired?: boolean;
  keyId?: string;
  onDoorClick?: (targetRoomId: string, direction: string) => void;
}

const Door: React.FC<DoorProps> = ({
  position,
  rotation,
  targetRoomId,
  direction,
  isLocked = false,
  keyRequired = false,
  keyId,
  onDoorClick,
}) => {
  const { startTransition } = useRoomManagerStore();
  const { currentRoomId } = useMapStore();

  const handleDoorClick = () => {
    if (!currentRoomId) return;

    console.log(
      `Door clicked: ${currentRoomId} -> ${targetRoomId} (${direction})`
    );

    if (onDoorClick) {
      onDoorClick(targetRoomId, direction);
    } else {
      // Default behavior: start room transition
      startTransition(currentRoomId, targetRoomId, direction);
    }
  };

  const doorColor = isLocked ? "#8B4513" : "#654321";
  const doorOpacity = isLocked ? 0.8 : 1.0;

  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[0.2, 3, 0.1]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      </RigidBody>

      {/* Door panels */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          position={[0, 1.5, 0.05]}
          castShadow
          onClick={handleDoorClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[1.8, 2.8, 0.1]} />
          <meshLambertMaterial
            color={doorColor}
            transparent
            opacity={doorOpacity}
          />
        </mesh>
      </RigidBody>

      {/* Door handle */}
      <mesh position={[0.6, 1.5, 0.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>

      {/* Lock indicator */}
      {isLocked && (
        <mesh position={[-0.6, 1.5, 0.1]}>
          <boxGeometry args={[0.1, 0.1, 0.05]} />
          <meshLambertMaterial color="#FF0000" />
        </mesh>
      )}

      {/* Direction indicator */}
      <mesh position={[0, 2.2, 0.1]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>

      {/* Direction text (simplified as geometry) */}
      <mesh position={[0, 2.2, 0.11]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>
    </group>
  );
};

export default Door;

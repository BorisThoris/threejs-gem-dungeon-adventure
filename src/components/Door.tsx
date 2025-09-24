import React, { useState, useEffect, useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import useGameStore from "../store/gameStore";

interface DoorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  keyRequired?: boolean;
  keyId?: string; // Specific key ID if needed
  isLocked?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const Door: React.FC<DoorProps> = ({
  position,
  rotation = [0, 0, 0],
  keyRequired = false,
  keyId,
  isLocked = false,
  onOpen,
  onClose: _onClose,
}) => {
  const { playerStats, inventory } = useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Check if player can open the door
  useEffect(() => {
    if (keyRequired && keyId) {
      const hasKey =
        playerStats.keys > 0 ||
        inventory?.some((item: any) => item.id === keyId);
      setCanOpen(hasKey && !isLocked);
    } else {
      setCanOpen(!isLocked);
    }
  }, [playerStats.keys, inventory, keyRequired, keyId, isLocked]);

  // Create a stable reference for inventory check
  const hasKeyItem = useMemo(() => {
    return inventory?.some((item: any) => item.id === keyId) || false;
  }, [inventory, keyId]);

  const handleOpenDoor = () => {
    if (!canOpen || isOpen) return;

    if (keyRequired && keyId) {
      // Use a key
      if (playerStats.keys > 0) {
        // This will be handled by the parent component
        console.log("Using key from player stats");
      } else if (hasKeyItem) {
        // This will be handled by the parent component
        console.log("Using key item:", keyId);
      }
    }

    setIsOpen(true);
    onOpen?.();
  };

  if (isOpen) return null; // Don't render if open

  return (
    <group position={position} rotation={rotation}>
      {/* Door Frame */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.2, 3, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>
      </RigidBody>

      {/* Door Panel - Clickable */}
      <RigidBody
        type="fixed"
        colliders="trimesh"
        position={isOpen ? [1, 0, 0] : [0, 0, 0]}
        rotation={isOpen ? [0, -Math.PI / 2, 0] : [0, 0, 0]}
      >
        <mesh
          onClick={handleOpenDoor}
          onPointerOver={() => setIsHovered(true)}
          onPointerOut={() => setIsHovered(false)}
        >
          <boxGeometry args={[2, 3, 0.1]} />
          <meshLambertMaterial
            color={
              isLocked
                ? "#666666"
                : canOpen
                ? isHovered
                  ? "#A0522D"
                  : "#8B4513"
                : "#4B0000"
            }
          />
        </mesh>
      </RigidBody>

      {/* Interaction Prompt */}
      {isHovered && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          {isLocked
            ? "DOOR LOCKED"
            : keyRequired
            ? canOpen
              ? "Click to unlock"
              : "Key required"
            : "Click to open"}
        </Text>
      )}

      {/* Visual indicator when hovered */}
      {isHovered && canOpen && (
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[2.2, 3.2, 0.05]} />
          <meshBasicMaterial color="#00FF00" transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default Door;

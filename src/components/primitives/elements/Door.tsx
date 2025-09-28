import React, { useState } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";

export interface DoorProps {
  position?: [number, number, number];
  color?: string;
  scale?: number;
  isOpen?: boolean;
  isLocked?: boolean;
  keyRequired?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onUnlock?: (key: string) => boolean;
}

const Door: React.FC<DoorProps> = ({
  position = [0, 0, 0],
  color = "#8B4513",
  scale = 1,
  isOpen = false,
  isLocked = false,
  keyRequired = "iron_key",
  onOpen,
  onClose,
  onUnlock,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isLocked) {
      // Try to unlock with key
      if (onUnlock) {
        const unlocked = onUnlock(keyRequired);
        if (unlocked && onOpen) {
          onOpen();
        }
      }
    } else {
      // Open/close door
      if (isOpen && onClose) {
        onClose();
      } else if (!isOpen && onOpen) {
        onOpen();
      }
    }
  };

  return (
    <RigidBody
      position={position}
      scale={scale}
      type="fixed"
      colliders={isOpen ? false : "hull"}
    >
      <group
        onClick={handleClick}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        {/* Door frame */}
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[0.2, 3, 0.1]} />
          <meshLambertMaterial color="#654321" />
        </mesh>

        {/* Left door panel */}
        <mesh
          position={[-0.4, 1.5, 0]}
          rotation={[0, isOpen ? -Math.PI / 2 : 0, 0]}
        >
          <boxGeometry args={[0.8, 3, 0.1]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Right door panel */}
        <mesh
          position={[0.4, 1.5, 0]}
          rotation={[0, isOpen ? Math.PI / 2 : 0, 0]}
        >
          <boxGeometry args={[0.8, 3, 0.1]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Door handle */}
        <mesh position={[0.3, 1.5, 0.05]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshLambertMaterial color="#C0C0C0" />
        </mesh>

        {/* Lock indicator */}
        {isLocked && (
          <mesh position={[0, 1.5, 0.05]}>
            <boxGeometry args={[0.1, 0.1, 0.05]} />
            <meshLambertMaterial color="#FF0000" />
          </mesh>
        )}

        {/* Hover text */}
        {isHovered && (
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {isLocked
              ? `Locked (${keyRequired})`
              : isOpen
              ? "Close Door"
              : "Open Door"}
          </Text>
        )}
      </group>
    </RigidBody>
  );
};

export default Door;

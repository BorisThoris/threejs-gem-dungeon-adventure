import React, { useState, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import useRoomManagerStore from "../store/roomManagerStore";
import useMapStore from "../store/mapStore";
import { loadTextureFromImage } from "../utils/textureUtils";
import * as THREE from "three";

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

    // Dispatch click event for testing
    window.dispatchEvent(
      new CustomEvent("doorClick", {
        detail: { direction, targetRoomId, currentRoomId },
      })
    );

    if (onDoorClick) {
      onDoorClick(targetRoomId, direction);
    } else {
      // Default behavior: start room transition
      startTransition(currentRoomId, targetRoomId, direction);
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const [doorTexture, setDoorTexture] = useState<THREE.Texture | null>(null);

  // Load door texture
  useEffect(() => {
    const loadDoorTexture = async () => {
      try {
        const texture = await loadTextureFromImage("wood");
        // Set texture repeat for better tiling
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1); // Single repeat for doors
        texture.needsUpdate = true;
        setDoorTexture(texture);
      } catch (error) {
        console.error("Failed to load door texture:", error);
      }
    };

    loadDoorTexture();
  }, []);

  const doorColor = isLocked ? "#8B4513" : isHovered ? "#8B7355" : "#654321";
  const doorOpacity = isLocked ? 0.8 : isHovered ? 0.9 : 1.0;

  return (
    <group position={position} rotation={rotation}>
      {/* Door frame */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[0.2, 5, 0.1]} />
          <meshLambertMaterial
            color="#8B4513"
            map={doorTexture}
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>
      </RigidBody>

      {/* Door panels - positioned at floor level */}
      <mesh
        position={[0, 2.4, 0.05]}
        castShadow
        onClick={handleDoorClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[2.8, 4.8, 0.1]} />
        <meshLambertMaterial
          color={doorColor}
          transparent
          opacity={doorOpacity}
          map={doorTexture}
          roughness={0.7}
          metalness={0.0}
        />
      </mesh>

      {/* Invisible clickable area - larger for easier clicking */}
      <mesh
        position={[0, 2.4, 0.1]}
        onClick={handleDoorClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setIsHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[3.5, 5, 0.2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Physical collision for door */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh position={[0, 2.4, 0.05]} castShadow>
          <boxGeometry args={[2.8, 4.8, 0.1]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </RigidBody>

      {/* Door handle */}
      <mesh position={[0.6, 2.4, 0.1]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshLambertMaterial color="#FFD700" />
      </mesh>

      {/* Lock indicator */}
      {isLocked && (
        <mesh position={[-0.6, 2.4, 0.1]}>
          <boxGeometry args={[0.1, 0.1, 0.05]} />
          <meshLambertMaterial color="#FF0000" />
        </mesh>
      )}

      {/* Direction indicator */}
      <mesh position={[0, 3.1, 0.1]}>
        <planeGeometry args={[0.5, 0.2]} />
        <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>

      {/* Direction text (simplified as geometry) */}
      <mesh position={[0, 2.1, 0.11]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.9} />
      </mesh>

      {/* Click instruction */}
      {isHovered && (
        <mesh position={[0, 2.4, 0.15]}>
          <planeGeometry args={[1, 0.3]} />
          <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

export default Door;

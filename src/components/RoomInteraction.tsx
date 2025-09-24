import React, { useState, useEffect, useCallback } from "react";
import { Text } from "@react-three/drei";
import useGameStore from "../store/gameStore";
import type { Room } from "../types/map";

interface RoomInteractionProps {
  room: Room;
  playerPosition: [number, number, number];
  onInteraction: (type: string, roomId: string) => void;
}

const RoomInteraction: React.FC<RoomInteractionProps> = ({
  room,
  playerPosition: _playerPosition,
  onInteraction,
}) => {
  useGameStore();
  const [isNearby, setIsNearby] = useState(false);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(
    null
  );
  const [isHovered, setIsHovered] = useState(false);

  // Check if player is close enough to interact
  useEffect(() => {
    const distance = Math.sqrt(
      Math.pow(_playerPosition[0] - (room.position as any)[0], 2) +
        Math.pow(_playerPosition[2] - (room.position as any)[2], 2)
    );

    // Define a proximity threshold
    const proximityThreshold = 5; // Adjust as needed

    if (distance < proximityThreshold) {
      setIsNearby(true);
      // Set interaction prompt based on room type
      if (room.type === "puzzle" && (room as any).puzzle) {
        setInteractionPrompt("Click to solve puzzle");
      } else if (
        room.type === "treasure" &&
        room.specialProperties?.isOpened === false
      ) {
        setInteractionPrompt("Click to open chest");
      } else if (room.type === "shop") {
        setInteractionPrompt("Click to browse shop");
      } else if (room.type === "library") {
        setInteractionPrompt("Click to read books");
      } else if (room.type === "devil-room" || room.type === "angel-room") {
        setInteractionPrompt("Click to interact with altar");
      } else if (room.type === "boss") {
        setInteractionPrompt("Click to challenge boss");
      } else if (room.type === "secret") {
        setInteractionPrompt("Click to discover secret");
      } else {
        setInteractionPrompt(null);
      }
    } else {
      setIsNearby(false);
      setInteractionPrompt(null);
    }
  }, [_playerPosition, room]);

  // Handle interaction based on room type
  const handleInteraction = useCallback(() => {
    if (!isNearby) return;

    switch (room.type) {
      case "puzzle":
        onInteraction("puzzle", room.id);
        break;
      case "treasure":
        onInteraction("treasure", room.id);
        break;
      case "shop":
        onInteraction("shop", room.id);
        break;
      case "library":
        onInteraction("library", room.id);
        break;
      case "devil-room":
      case "angel-room":
        onInteraction("altar", room.id);
        break;
      case "boss":
        onInteraction("boss", room.id);
        break;
      case "secret":
        onInteraction("secret", room.id);
        break;
    }
  }, [isNearby, room.type, room.id, onInteraction]);

  if (!isNearby || !interactionPrompt) return null;

  return (
    <group
      position={[
        (room.position as any)[0],
        (room.position as any)[1] + 3,
        (room.position as any)[2],
      ]}
    >
      {/* Interaction Prompt - Clickable */}
      <mesh
        onClick={handleInteraction}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
      >
        <boxGeometry args={[4, 1, 0.1]} />
        <meshBasicMaterial
          color={isHovered ? "#00FF00" : "#000000"}
          transparent
          opacity={isHovered ? 0.8 : 0.5}
        />
      </mesh>

      <Text
        position={[0, 0, 0.1]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {interactionPrompt}
      </Text>

      {/* Visual indicator (e.g., pulsing circle) */}
      <mesh position={[0, -1, 0]}>
        <boxGeometry args={[0.6, 0.05, 0.6]} />
        <meshBasicMaterial
          color="#00FF00"
          transparent
          opacity={0.3 + Math.sin(Date.now() * 0.005) * 0.3}
        />
      </mesh>
    </group>
  );
};

export default RoomInteraction;

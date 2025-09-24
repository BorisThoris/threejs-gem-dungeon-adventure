import React, { useState, useEffect, useCallback } from "react";
import { Text } from "@react-three/drei";
import useGameStore from "../store/gameStore";
import RoomActionCards from "./RoomActionCards";
import { useRoomActions } from "../hooks/useRoomActions";
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

  // Map room types to action card room types
  const getRoomTypeForActions = (roomType: string) => {
    switch (roomType) {
      case "boss":
        return "boss";
      case "meditation":
        return "meditation";
      case "bench-press":
        return "benchpress";
      case "library":
        return "library";
      case "shop":
        return "shop";
      case "treasure":
        return "treasure";
      case "challenge":
        return "challenge";
      case "puzzle":
        return "puzzle";
      default:
        return null;
    }
  };

  const actionRoomType = getRoomTypeForActions(room.type);
  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: actionRoomType || "meditation", // fallback to meditation
    onPuzzleStart: () => onInteraction("puzzle", room.id),
    onShopOpen: () => onInteraction("shop", room.id),
    onChallengeStart: () => onInteraction("challenge", room.id),
    onTreasureOpen: () => onInteraction("treasure", room.id),
    onArenaFight: () => onInteraction("arena", room.id),
    onBossFight: () => onInteraction("boss", room.id),
  });

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
        setInteractionPrompt("Click to see puzzle options");
      } else if (
        room.type === "treasure" &&
        room.specialProperties?.isOpened === false
      ) {
        setInteractionPrompt("Click to see treasure options");
      } else if (room.type === "shop") {
        setInteractionPrompt("Click to see shop options");
      } else if (room.type === "library") {
        setInteractionPrompt("Click to see study options");
      } else if (room.type === "meditation") {
        setInteractionPrompt("Click to see meditation options");
      } else if (room.type === "bench-press") {
        setInteractionPrompt("Click to see training options");
      } else if (room.type === "devil-room" || room.type === "angel-room") {
        setInteractionPrompt("Click to interact with altar");
      } else if (room.type === "boss") {
        setInteractionPrompt("Click to see boss options");
      } else if (room.type === "challenge") {
        setInteractionPrompt("Click to see challenge options");
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

  // Handle interaction - show action cards instead of direct interaction
  const handleInteraction = useCallback(() => {
    if (!isNearby || !actionRoomType) return;

    // Show action cards for rooms that support them
    showCards();
  }, [isNearby, actionRoomType, showCards]);

  if (!isNearby || !interactionPrompt) return null;

  return (
    <>
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

      {/* Action Cards - Only show if room supports them */}
      {actionRoomType && (
        <RoomActionCards
          cards={cards}
          isVisible={isVisible}
          onCardClick={(card) => {
            console.log(`Card clicked: ${card.id} in room ${room.id}`);
            hideCards();
          }}
        />
      )}
    </>
  );
};

export default RoomInteraction;

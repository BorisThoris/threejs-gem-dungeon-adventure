import React, { useState, useEffect } from "react";
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
  // Game store functions handled through card system
  const [isNearby, setIsNearby] = useState(false);

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
  const { cards, isVisible, hideCards } = useRoomActions({
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
      Math.pow(
        _playerPosition[0] -
          (room.position as unknown as [number, number, number])[0],
        2
      ) +
        Math.pow(
          _playerPosition[2] -
            (room.position as unknown as [number, number, number])[2],
          2
        )
    );

    // Define a proximity threshold
    const proximityThreshold = 5; // Adjust as needed

    if (distance < proximityThreshold) {
      setIsNearby(true);
    } else {
      setIsNearby(false);
    }
  }, [_playerPosition, room]);

  // All interactions now go through the card system automatically
  // No more direct clickable interactions - cards handle everything

  if (!isNearby || !actionRoomType) return null;

  return (
    <>
      <group
        position={[
          (room.position as unknown as [number, number, number])[0],
          (room.position as unknown as [number, number, number])[1] + 3,
          (room.position as unknown as [number, number, number])[2],
        ]}
      >
        {/* Visual indicator only - no longer clickable */}
        <mesh position={[0, -1, 0]}>
          <boxGeometry args={[0.6, 0.05, 0.6]} />
          <meshBasicMaterial
            color="#00FF00"
            transparent
            opacity={0.3 + Math.sin(Date.now() * 0.005) * 0.3}
          />
        </mesh>
      </group>

      {/* Action Cards - Automatically shown when near room */}
      {actionRoomType && (
        <RoomActionCards
          cards={cards}
          isVisible={isVisible}
          onCardClick={(card) => {
            console.log(`Card clicked: ${card.id} in room ${room.id}`);
            // Handle the actual interaction through the card
            onInteraction(card.id, room.id);
            hideCards();
          }}
        />
      )}
    </>
  );
};

export default RoomInteraction;

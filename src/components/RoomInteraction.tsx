import React from "react";
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

  // Cards are now shown based on room loading, not proximity
  if (!actionRoomType) return null;

  return (
    <>
      {/* Action Cards - Shown when room is loaded */}
      {actionRoomType && (
        <RoomActionCards
          cards={cards}
          isVisible={isVisible}
          onCardClick={(card) => {
            // Card clicked
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

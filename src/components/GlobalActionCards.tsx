import React, { useEffect, useState } from "react";
import useMapStore from "../store/mapStore";
import useGameStore from "../store/gameStore";
import RoomActionCards from "./RoomActionCards";
import { useRoomActions } from "../hooks/useRoomActions";

const GlobalActionCards: React.FC = () => {
  const { currentMap, currentRoomId } = useMapStore();
  const { gamePhase } = useGameStore();
  const [showCards, setShowCards] = useState(false);

  // Get current room
  const currentRoom = currentMap?.rooms.find(
    (room) => room.id === currentRoomId
  );

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
      case "arena":
        return "arena";
      case "start":
        return "start";
      case "end":
        return "end";
      case "normal":
        return "normal";
      case "enemy":
        return "enemy";
      case "secret":
        return "secret";
      case "memory-chamber":
        return "memory-chamber";
      case "trap":
        return "trap";
      case "cursed-room":
        return "cursed-room";
      case "devil-room":
        return "devil-room";
      case "angel-room":
        return "angel-room";
      case "coffee":
        return "coffee";
      case "library-upgrade":
        return "library-upgrade";
      case "portal":
        return "portal";
      case "laboratory":
        return "laboratory";
      case "observatory":
        return "observatory";
      case "vault":
        return "vault";
      case "shrine":
        return "shrine";
      default:
        return null;
    }
  };

  const actionRoomType = currentRoom
    ? getRoomTypeForActions(currentRoom.type)
    : null;

  const {
    cards,
    isVisible,
    showCards: showActionCards,
    hideCards,
  } = useRoomActions({
    roomType: actionRoomType || "meditation", // fallback to meditation
    onPuzzleStart: () => console.log("Puzzle started!"),
    onShopOpen: () => console.log("Shop opened!"),
    onChallengeStart: () => console.log("Challenge started!"),
    onTreasureOpen: () => console.log("Treasure opened!"),
    onArenaFight: () => console.log("Arena fight started!"),
    onBossFight: () => console.log("Boss fight started!"),
  });

  // Show cards when entering a room with actions
  useEffect(() => {
    if (currentRoom && actionRoomType && gamePhase === "exploration") {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        showActionCards();
      }, 500);

      return () => clearTimeout(timer);
    } else {
      hideCards();
    }
  }, [currentRoom, actionRoomType, gamePhase, showActionCards, hideCards]);

  // Don't show cards if no room or no action room type
  if (!currentRoom || !actionRoomType) {
    return null;
  }

  return (
    <RoomActionCards
      cards={cards}
      isVisible={isVisible}
      onCardClick={(card) => {
        console.log(`Card clicked: ${card.id} in room ${currentRoom.id}`);
        // Handle card actions here
        hideCards();
      }}
    />
  );
};

export default GlobalActionCards;

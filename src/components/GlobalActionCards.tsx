import React, { useEffect, useState, useMemo, useCallback } from "react";
import useMapStore from "../store/mapStore";
import useGameStore from "../store/gameStore";
import RoomActionCards from "./RoomActionCards";
import { useRoomActions } from "../hooks/useRoomActions";

const GlobalActionCards: React.FC = () => {
  const { currentMap, currentRoomId } = useMapStore();
  const { gamePhase } = useGameStore();
  const [showCards, setShowCards] = useState(false);
  const lastRoomId = React.useRef<string | null>(null);

  // Memoize current room to prevent unnecessary re-calculations
  const currentRoom = useMemo(() => {
    return currentMap?.rooms.find((room) => room.id === currentRoomId);
  }, [currentMap, currentRoomId]);

  // Memoize room type mapping to prevent re-creation on every render
  const getRoomTypeForActions = useCallback((roomType: string) => {
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
  }, []);

  // Memoize action room type to prevent unnecessary recalculations
  const actionRoomType = useMemo(() => {
    return currentRoom ? getRoomTypeForActions(currentRoom.type) : null;
  }, [currentRoom, getRoomTypeForActions]);

  // Memoize callbacks to prevent unnecessary re-renders
  const callbacks = useMemo(
    () => ({
      onPuzzleStart: () => {
        /* Puzzle started! */
      },
      onShopOpen: () => {
        /* Shop opened! */
      },
      onChallengeStart: () => {
        /* Challenge started! */
      },
      onTreasureOpen: () => {
        /* Treasure opened! */
      },
      onArenaFight: () => {
        /* Arena fight started! */
      },
      onBossFight: () => {
        /* Boss fight started! */
      },
    }),
    []
  );

  const {
    cards,
    isVisible,
    showCards: showActionCards,
    hideCards,
  } = useRoomActions({
    roomType: actionRoomType || "meditation", // fallback to meditation
    ...callbacks,
  });

  // Optimized effect with proper dependency management
  useEffect(() => {
    // Only update if room actually changed
    if (currentRoomId !== lastRoomId.current) {
      lastRoomId.current = currentRoomId;

      if (currentRoom && actionRoomType && gamePhase === "exploration") {
        // Use requestAnimationFrame for smoother transitions
        const frameId = requestAnimationFrame(() => {
          const timer = setTimeout(() => {
            showActionCards();
          }, 300); // Reduced delay for better responsiveness

          return () => clearTimeout(timer);
        });

        return () => {
          cancelAnimationFrame(frameId);
        };
      } else {
        hideCards();
      }
    }
  }, [
    currentRoomId,
    currentRoom,
    actionRoomType,
    gamePhase,
    showActionCards,
    hideCards,
  ]);

  // Don't show cards if no room or no action room type
  if (!currentRoom || !actionRoomType) {
    return null;
  }

  return (
    <RoomActionCards
      cards={cards}
      isVisible={isVisible}
      onCardClick={(card) => {
        // Card clicked
        // Handle card actions here
        hideCards();
      }}
    />
  );
};

export default GlobalActionCards;

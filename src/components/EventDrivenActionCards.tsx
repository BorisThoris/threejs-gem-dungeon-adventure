import React, { useState, useEffect, useMemo, useCallback } from "react";
import { gameEvents, GAME_EVENTS } from "../utils/gameEvents";
import { useGameState } from "../hooks/useGameState";
import RoomActionCards from "./RoomActionCards";
import { useRoomActions } from "../hooks/useRoomActions";

// Room type mapping
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

const EventDrivenActionCards: React.FC = () => {
  const { getState } = useGameState();
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

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

  // Get action room type
  const actionRoomType = useMemo(() => {
    return currentRoom ? getRoomTypeForActions(currentRoom.type) : null;
  }, [currentRoom]);

  // Get room actions
  const {
    cards,
    isVisible: cardsVisible,
    showCards: showActionCards,
    hideCards,
  } = useRoomActions({
    roomType: actionRoomType || "meditation",
    ...callbacks,
  });

  // Listen to room enter/exit events
  useEffect(() => {
    const unsubscribeRoomEnter = gameEvents.on(
      GAME_EVENTS.ROOM_ENTER,
      (room) => {
        // Room entered via event
        setCurrentRoom(room);

        // Show cards after a short delay
        setTimeout(() => {
          showActionCards();
          setIsVisible(true);
        }, 300);
      }
    );

    const unsubscribeRoomExit = gameEvents.on(GAME_EVENTS.ROOM_EXIT, (room) => {
      // Room exited via event
      setCurrentRoom(null);
      hideCards();
      setIsVisible(false);
    });

    const unsubscribeGamePhase = gameEvents.on(
      GAME_EVENTS.GAME_PHASE_CHANGE,
      (phase) => {
        // Game phase changed via event
      }
    );

    return () => {
      unsubscribeRoomEnter();
      unsubscribeRoomExit();
      unsubscribeGamePhase();
    };
  }, [showActionCards, hideCards]);

  // Don't show cards if no room or no action room type
  if (!currentRoom || !actionRoomType) {
    return null;
  }

  return (
    <RoomActionCards
      cards={cards}
      isVisible={isVisible && cardsVisible}
      onCardClick={(card) => {
        // Card clicked
        hideCards();
        setIsVisible(false);
      }}
    />
  );
};

export default EventDrivenActionCards;

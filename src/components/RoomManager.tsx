import React, { useState, useRef, useEffect } from "react";
import useMapStore from "../store/mapStore";
import { useGameState } from "../hooks/useGameState";
import { gameEvents, GAME_EVENTS } from "../utils/gameEvents";
import SingleRoom from "./SingleRoom";
import RoomTransition from "./RoomTransition";
import { roomDetectionManager } from "../utils/roomDetectionManager";

interface RoomManagerProps {
  onRoomChange?: (roomId: string) => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({ onRoomChange }) => {
  const { currentMap } = useMapStore();
  const { updateRoom } = useGameState();
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingRoomId, setPendingRoomId] = useState<string | null>(null);
  const playerPositionRef = useRef<[number, number, number]>([0, 5, 0]);

  // Initialize with start room
  useEffect(() => {
    if (currentMap && !currentRoomId) {
      const startRoom = currentMap.rooms.find((room) => room.type === "start");
      if (startRoom) {
        setCurrentRoomId(startRoom.id);
        console.log(`RoomManager: Initialized with start room ${startRoom.id}`);
      }
    }
  }, [currentMap, currentRoomId]);

  // Handle room transitions
  const handleRoomChange = (newRoomId: string) => {
    console.log(`RoomManager: handleRoomChange called with ${newRoomId}`);
    console.log(
      `RoomManager: Current state - isTransitioning: ${isTransitioning}, currentRoomId: ${currentRoomId}`
    );

    // Validate roomId
    if (!newRoomId || typeof newRoomId !== "string") {
      console.warn(`RoomManager: Invalid roomId received:`, newRoomId);
      return;
    }

    // If we're stuck in transitioning state, force reset it
    if (isTransitioning && !pendingRoomId) {
      console.log(`RoomManager: Force resetting stuck transition state`);
      setIsTransitioning(false);
    }

    if (isTransitioning || newRoomId === currentRoomId) {
      console.log(
        `RoomManager: Skipping room change - isTransitioning: ${isTransitioning}, same room: ${
          newRoomId === currentRoomId
        }`
      );
      return;
    }

    console.log(
      `RoomManager: Transitioning from ${currentRoomId} to ${newRoomId}`
    );

    setIsTransitioning(true);
    setPendingRoomId(newRoomId);

    // Update global room state
    roomDetectionManager.setCurrentRoom(newRoomId);
    updateRoom(newRoomId);
  };

  // Complete room transition
  const handleTransitionComplete = () => {
    console.log(
      `RoomManager: handleTransitionComplete called with pendingRoomId: ${pendingRoomId}`
    );
    if (pendingRoomId) {
      console.log(
        `RoomManager: Completing transition to room ${pendingRoomId}`
      );
      setCurrentRoomId(pendingRoomId);
      setPendingRoomId(null);
      setIsTransitioning(false);

      // Position player in front of door (center of room)
      playerPositionRef.current = [0, 5, 0];

      console.log(`RoomManager: Transition completed to room ${pendingRoomId}`);
      onRoomChange?.(pendingRoomId);
    } else {
      console.log(
        `RoomManager: No pending room ID, cannot complete transition`
      );
    }
  };

  // Fallback: Force complete transition if it gets stuck
  useEffect(() => {
    if (isTransitioning) {
      console.log(`RoomManager: Transition started, setting fallback timer`);
      const fallbackTimer = setTimeout(() => {
        console.log(
          `RoomManager: Fallback timer triggered - forcing transition completion`
        );
        if (isTransitioning && pendingRoomId) {
          console.log(
            `RoomManager: Forcing completion to room ${pendingRoomId}`
          );
          handleTransitionComplete();
        } else if (isTransitioning) {
          // If we're stuck in transitioning but no pending room, force reset
          console.log(`RoomManager: Forcing reset of stuck transition state`);
          setIsTransitioning(false);
          setPendingRoomId(null);
        }
      }, 1000); // Reduced to 1 second for faster recovery

      return () => {
        console.log(`RoomManager: Cleaning up fallback timer`);
        clearTimeout(fallbackTimer);
      };
    }
  }, [isTransitioning, pendingRoomId]);

  // Listen for room change events from doors
  useEffect(() => {
    const handleRoomEnter = (roomOrId: any) => {
      // Handle both room objects and roomId strings
      const roomId = typeof roomOrId === "string" ? roomOrId : roomOrId?.id;

      if (roomId && roomId !== currentRoomId) {
        console.log(
          `RoomManager: handleRoomEnter received:`,
          roomOrId,
          "extracted roomId:",
          roomId
        );
        handleRoomChange(roomId);
      } else if (!roomId) {
        console.warn(
          `RoomManager: handleRoomEnter received invalid data:`,
          roomOrId
        );
      }
    };

    gameEvents.on(GAME_EVENTS.ROOM_ENTER, handleRoomEnter);

    return () => {
      // Cleanup handled by gameEvents automatically
    };
  }, [currentRoomId]);

  // Manual reset function for stuck transitions (R key)
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r" && isTransitioning) {
        console.log(`RoomManager: Manual reset triggered by R key`);
        setIsTransitioning(false);
        setPendingRoomId(null);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [isTransitioning]);

  if (!currentMap || !currentRoomId) {
    return null;
  }

  return (
    <>
      {/* Current Room - Only render when not transitioning */}
      {!isTransitioning && (
        <SingleRoom
          key={currentRoomId} // Force remount when room changes
          currentRoomId={currentRoomId}
          onRoomChange={handleRoomChange}
        />
      )}

      {/* Room Transition Overlay */}
      <RoomTransition
        isTransitioning={isTransitioning}
        onTransitionComplete={handleTransitionComplete}
        duration={800}
      />
    </>
  );
};

export default RoomManager;

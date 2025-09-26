import React, { useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGameState } from "../hooks/useGameState";
import useMapStore from "../store/mapStore";
import { playerRoomDetection } from "../utils/playerRoomDetection";
import { gameEvents, GAME_EVENTS } from "../utils/gameEvents";

interface PlayerRoomManagerProps {
  onRoomEnter?: (roomId: string) => void;
  onRoomExit?: (roomId: string) => void;
}

const PlayerRoomManager: React.FC<PlayerRoomManagerProps> = ({
  onRoomEnter,
  onRoomExit,
}) => {
  const { updateRoom, updateGamePhase } = useGameState();
  const { currentMap } = useMapStore();
  const { camera } = useThree();

  const lastDetectedRoomId = React.useRef<string | null>(null);
  const lastUpdateTime = React.useRef(0);

  // Initialize room bounds when map changes
  useEffect(() => {
    if (currentMap?.rooms) {
      playerRoomDetection.initializeRoomBounds(currentMap.rooms);
      // console.log("PlayerRoomManager: Initialized room bounds for map");
    }
  }, [currentMap]);

  // Throttled room detection
  const detectRoom = useCallback(
    (playerPosition: { x: number; y: number; z: number }) => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 100) return; // Throttle to 10fps max
      lastUpdateTime.current = now;

      const detectedRoomId =
        playerRoomDetection.detectCurrentRoom(playerPosition);

      // Only trigger events when room actually changes
      if (detectedRoomId !== lastDetectedRoomId.current) {
        const previousRoomId = lastDetectedRoomId.current;
        lastDetectedRoomId.current = detectedRoomId;

        // Update game state
        updateRoom(detectedRoomId);

        if (detectedRoomId) {
          // Player entered a room
          const room = currentMap?.rooms.find((r) => r.id === detectedRoomId);
          if (room) {
            // Set game phase based on room type
            if (room.type === "boss") {
              updateGamePhase("boss");
            } else if (room.type === "puzzle") {
              updateGamePhase("puzzle");
            } else {
              updateGamePhase("exploration");
            }

            // Emit events
            gameEvents.emit(GAME_EVENTS.ROOM_ENTER, room);
            onRoomEnter?.(detectedRoomId);

            // console.log(`PlayerRoomManager: Entered room ${detectedRoomId} (${room.type})`);
          }
        } else if (previousRoomId) {
          // Player exited a room
          const previousRoom = currentMap?.rooms.find(
            (r) => r.id === previousRoomId
          );
          if (previousRoom) {
            gameEvents.emit(GAME_EVENTS.ROOM_EXIT, previousRoom);
            onRoomExit?.(previousRoomId);

            // console.log(`PlayerRoomManager: Exited room ${previousRoomId}`);
          }

          updateGamePhase("exploration");
        }
      }
    },
    [currentMap, updateRoom, updateGamePhase, onRoomEnter, onRoomExit]
  );

  // Main detection loop
  useFrame(() => {
    if (!playerRoomDetection.isDetectionEnabled()) return;

    const playerPosition = {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    };

    detectRoom(playerPosition);
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      playerRoomDetection.clearCurrentRoom();
      // console.log("PlayerRoomManager: Cleaned up room detection");
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PlayerRoomManager;

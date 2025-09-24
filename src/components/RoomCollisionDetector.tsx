import React, { useRef, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useGameState } from "../hooks/useGameState";
import { gameEvents, GAME_EVENTS } from "../utils/gameEvents";
import type { Room } from "../types/map";

interface RoomCollisionDetectorProps {
  room: Room;
  onRoomEnter?: (room: Room) => void;
  onRoomExit?: (room: Room) => void;
}

const RoomCollisionDetector: React.FC<RoomCollisionDetectorProps> = ({
  room,
  onRoomEnter,
  onRoomExit,
}) => {
  const { updateRoom, updateGamePhase } = useGameState();
  const isPlayerInRoom = useRef(false);
  const lastUpdateTime = useRef(0);
  const { camera } = useThree();

  // Throttle collision detection to prevent excessive calculations
  const checkCollision = useCallback(
    (isInRoom: boolean) => {
      const now = Date.now();
      if (now - lastUpdateTime.current < 100) return; // Throttle to 10fps max
      lastUpdateTime.current = now;

      if (isInRoom && !isPlayerInRoom.current) {
        // Player entered the room
        isPlayerInRoom.current = true;

        // Update game state without triggering React re-renders
        updateRoom(room.id);

        // Set game phase based on room type
        if (room.type === "boss") {
          updateGamePhase("boss");
        } else if (room.type === "puzzle") {
          updateGamePhase("puzzle");
        } else {
          updateGamePhase("exploration");
        }

        // Emit events for UI components
        gameEvents.emit(GAME_EVENTS.ROOM_ENTER, room);
        onRoomEnter?.(room);
      } else if (!isInRoom && isPlayerInRoom.current) {
        // Player exited the room
        isPlayerInRoom.current = false;

        // Update game state
        updateRoom(null);
        updateGamePhase("exploration");

        // Emit events for UI components
        gameEvents.emit(GAME_EVENTS.ROOM_EXIT, room);
        onRoomExit?.(room);
      }
    },
    [room, updateRoom, updateGamePhase, onRoomEnter, onRoomExit]
  );

  // Optimized collision detection - no state updates in useFrame
  useFrame(() => {
    // Get player position from camera
    const playerPosition = camera.position;
    const roomPosition = room.position;

    const distance = Math.sqrt(
      Math.pow(playerPosition.x - roomPosition.x, 2) +
        Math.pow(playerPosition.z - roomPosition.z, 2)
    );

    const roomSize = room.size || 8;
    const isInRoom = distance < roomSize / 2;

    checkCollision(isInRoom);
  });

  return (
    <RigidBody type="fixed" sensor>
      <mesh
        position={[room.position.x, 0, room.position.z]}
        visible={false} // Invisible collision box
      >
        <boxGeometry args={[room.size || 8, 4, room.size || 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  );
};

export default RoomCollisionDetector;

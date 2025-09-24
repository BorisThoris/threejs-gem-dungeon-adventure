import React, { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import useMapStore from "../store/mapStore";
import useGameStore from "../store/gameStore";
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
  const { setCurrentRoom, currentRoomId } = useMapStore();
  const { setGamePhase } = useGameStore();
  const isPlayerInRoom = useRef(false);
  const hasEntered = useRef(false);
  const { camera } = useThree();

  // Check if player is in this room
  useFrame(() => {
    // Get player position from camera (assuming the camera follows the player)
    const playerPosition = camera.position;
    const roomPosition = room.position;

    const distance = Math.sqrt(
      Math.pow(playerPosition.x - roomPosition.x, 2) +
        Math.pow(playerPosition.z - roomPosition.z, 2)
    );

    const roomSize = room.size || 8;
    const isInRoom = distance < roomSize / 2;

    if (isInRoom && !isPlayerInRoom.current) {
      // Player entered the room
      isPlayerInRoom.current = true;
      hasEntered.current = true;
      setCurrentRoom(room.id);
      onRoomEnter?.(room);

      // Set game phase based on room type
      if (room.type === "boss") {
        setGamePhase("boss");
      } else if (room.type === "puzzle") {
        setGamePhase("puzzle");
      } else {
        setGamePhase("exploration");
      }
    } else if (!isInRoom && isPlayerInRoom.current) {
      // Player exited the room
      isPlayerInRoom.current = false;
      onRoomExit?.(room);

      // Reset game phase to exploration when leaving
      setGamePhase("exploration");
    }
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

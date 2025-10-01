import React, { useEffect } from "react";
import * as THREE from "three";
import useRoomManagerStore from "../store/roomManagerStore";
import useMapStore from "../store/mapStore";
import usePlayerMovementStore from "../store/playerMovementStore";
import RoomInstanceRenderer from "./RoomInstanceRenderer";
import Door from "./Door";
import RoomTransitionEffect from "./RoomTransitionEffect";

interface RoomInstanceManagerProps {
  playerPosition?: [number, number, number];
  onInteraction?: (interactionType: string, roomId: string) => void;
}

const RoomInstanceManager: React.FC<RoomInstanceManagerProps> = ({
  playerPosition = [0, 0, 0],
  onInteraction,
}) => {
  const { currentRoomId, roomInstances, loadRoom, setActiveRoom, isLoading } =
    useRoomManagerStore();

  const { currentMap, generateMap } = useMapStore();
  const { isTransitioning, transitionProgress, fromRoomId, toRoomId } =
    usePlayerMovementStore();

  // Initialize map and load start room
  useEffect(() => {
    const initializeGame = async () => {
      if (!currentMap) {
        generateMap();
        return;
      }

      if (!currentRoomId) {
        await loadRoom(currentMap.startRoomId);
        setActiveRoom(currentMap.startRoomId);

        // Spawn player in the start room
        const startRoom = currentMap.rooms.find(
          (r) => r.id === currentMap.startRoomId
        );
        if (startRoom) {
          const roomSize = startRoom.size || 10;
          // Spawn player in center of room, slightly above floor
          const spawnPosition = new THREE.Vector3(0, 0.5, 0);
          const spawnRotation = new THREE.Euler(0, 0, 0); // Face forward

          // Add a small delay to ensure room is fully loaded
          setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("playerTeleport", {
                detail: {
                  position: spawnPosition.toArray(),
                  rotation: spawnRotation.toArray(),
                },
              })
            );
          }, 100);
        }
      }
    };

    initializeGame();
  }, [currentMap, currentRoomId, generateMap, loadRoom, setActiveRoom]);

  // Get current room instance
  const currentRoomInstance = currentRoomId
    ? roomInstances.get(currentRoomId)
    : null;
  const currentRoom = currentRoomInstance?.room;

  if (!currentMap || !currentRoom) {
    return null;
  }

  // Get connected rooms for door generation - only include rooms that exist in the map
  const connectedRooms = currentRoom.connections
    .map((connectionId) => currentMap.rooms.find((r) => r.id === connectionId))
    .filter((room) => {
      // Ensure room exists and is valid
      if (!room) return false;

      // Check if room is within reasonable bounds (not too far away)
      const maxDistance = 50; // Maximum distance for valid connections
      const distance = Math.sqrt(
        Math.pow(room.position.x - currentRoom.position.x, 2) +
          Math.pow(room.position.z - currentRoom.position.z, 2)
      );

      return distance <= maxDistance;
    });

  // Calculate door positions based on room connections (room at origin)
  const getDoorPosition = (room: any, targetRoom: any, direction: string) => {
    const roomSize = room.size || 10;

    switch (direction) {
      case "north":
        return {
          position: [0, 0, -roomSize / 2] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };
      case "south":
        return {
          position: [0, 0, roomSize / 2] as [number, number, number],
          rotation: [0, Math.PI, 0] as [number, number, number],
        };
      case "east":
        return {
          position: [roomSize / 2, 0, 0] as [number, number, number],
          rotation: [0, Math.PI / 2, 0] as [number, number, number],
        };
      case "west":
        return {
          position: [-roomSize / 2, 0, 0] as [number, number, number],
          rotation: [0, -Math.PI / 2, 0] as [number, number, number],
        };
      default:
        return {
          position: [0, 0, roomSize / 2] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
        };
    }
  };

  // Determine door direction based on room positions
  const getDoorDirection = (
    currentRoom: any,
    targetRoom: any
  ): "north" | "south" | "east" | "west" => {
    const dx = targetRoom.position.x - currentRoom.position.x;
    const dz = targetRoom.position.z - currentRoom.position.z;
    const roomSize = currentRoom.size || 10;

    // Check if rooms are adjacent
    if (Math.abs(dx) === roomSize && Math.abs(dz) === 0) {
      return dx > 0 ? "east" : "west";
    }
    if (Math.abs(dz) === roomSize && Math.abs(dx) === 0) {
      return dz > 0 ? "south" : "north";
    }

    // Fallback to south if not adjacent
    return "south";
  };

  return (
    <group>
      {/* Render current room */}
      <RoomInstanceRenderer
        playerPosition={playerPosition}
        onInteraction={onInteraction}
      />

      {/* Render doors for connected rooms */}
      {connectedRooms.map((targetRoom) => {
        if (!targetRoom) return null;

        const direction = getDoorDirection(currentRoom, targetRoom);
        const doorPos = getDoorPosition(currentRoom, targetRoom, direction);

        // Validate that the target room exists and is accessible
        const targetRoomExists = currentMap.rooms.some(
          (room) => room.id === targetRoom.id
        );
        if (!targetRoomExists) {
          console.warn(
            `Door target room ${targetRoom.id} does not exist in map`
          );
          return null;
        }

        // Check if door should be locked
        const isLocked = targetRoom.isLocked || false;
        const keyRequired = targetRoom.requiredItem ? true : false;

        return (
          <Door
            key={`door-${targetRoom.id}`}
            position={doorPos.position}
            rotation={doorPos.rotation}
            targetRoomId={targetRoom.id}
            direction={direction}
            isLocked={isLocked}
            keyRequired={keyRequired}
            keyId={targetRoom.requiredItem}
          />
        );
      })}

      {/* Room Transition Effect */}
      <RoomTransitionEffect
        isTransitioning={isTransitioning}
        fromRoomId={fromRoomId}
        toRoomId={toRoomId}
        progress={transitionProgress}
      />
    </group>
  );
};

export default RoomInstanceManager;

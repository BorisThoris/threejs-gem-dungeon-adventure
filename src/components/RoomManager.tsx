import React, { memo, useEffect } from "react";
import {
  useRoomStore,
  getCurrentRoom,
  getConnectedRooms,
} from "../store/roomStore";
import { useDoorProgressionStore } from "../store/doorProgressionStore";
import Door from "./Door";
import DoorDebugger from "./DoorDebugger";
import { ROOM_DEFINITIONS } from "../data/roomDefinitions";
import { getAllOptimalDoorPositions } from "../utils/smartDoorPositioning";

interface RoomManagerProps {
  onRoomChange?: (roomId: string) => void;
}

const RoomManager: React.FC<RoomManagerProps> = memo(({ onRoomChange }) => {
  const {
    currentRoomId,
    isTransitioning,
    transitionProgress,
    handleDoorClick,
  } = useRoomStore();

  const { isDoorUnlocked, getDoorState, getDoorType, unlockDoor } =
    useDoorProgressionStore();

  const currentRoom = getCurrentRoom();
  const connectedRooms = getConnectedRooms(currentRoomId);

  // Initialize rooms from definitions
  useEffect(() => {
    const { addRoom } = useRoomStore.getState();

    Object.values(ROOM_DEFINITIONS).forEach((roomDef) => {
      addRoom({
        id: roomDef.id,
        name: roomDef.name,
        position: { x: 0, z: 0 }, // Default position
        connections: roomDef.doors,
        spawnPosition: roomDef.spawnPosition,
      });
    });
  }, []);

  // Handle room changes
  useEffect(() => {
    if (onRoomChange) {
      onRoomChange(currentRoomId);
    }
  }, [currentRoomId, onRoomChange]);

  // Calculate door positions
  const getDoorPosition = (targetRoomId: string) => {
    const roomSize = 10; // Default room size
    const entranceDistance = 1;

    // Simple positioning - doors on walls
    const doorPositions = {
      north: {
        pos: [0, 0.5, roomSize / 2] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
      },
      south: {
        pos: [0, 0.5, -roomSize / 2] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
      },
      east: {
        pos: [roomSize / 2, 0.5, 0] as [number, number, number],
        rot: [0, -Math.PI / 2, 0] as [number, number, number],
      },
      west: {
        pos: [-roomSize / 2, 0.5, 0] as [number, number, number],
        rot: [0, Math.PI / 2, 0] as [number, number, number],
      },
    };

    // For now, just use north wall for all doors
    return doorPositions.north;
  };

  if (isTransitioning) {
    return (
      <group>
        {/* Loading screen during transition */}
        <mesh position={[0, 2, 0]}>
          <planeGeometry args={[8, 4]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0, 2, 0.1]}>
          <planeGeometry args={[6, 2]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    );
  }

  if (!currentRoom) {
    return null;
  }

  // Get the current room component
  const CurrentRoomComponent =
    currentRoomId && ROOM_DEFINITIONS[currentRoomId]
      ? ROOM_DEFINITIONS[currentRoomId].component
      : null;

  return (
    <group>
      {/* Render current room content */}
      {CurrentRoomComponent && <CurrentRoomComponent />}

      {/* Render doors for connected rooms */}
      {connectedRooms.map((room) => {
        if (!room) return null;

        const doorPosition = getDoorPosition(room.id);
        const doorId = `door-${currentRoomId}-${room.id}`;
        const isUnlocked = isDoorUnlocked(doorId);
        const doorState = getDoorState(doorId);
        const doorType = getDoorType(doorId);

        return (
          <Door
            key={doorId}
            position={doorPosition.pos}
            rotation={doorPosition.rot}
            targetRoomId={room.id}
            showLabel={true}
            state={doorState}
            type={doorType}
            isLocked={!isUnlocked}
            glowEffect={doorType === "secret"}
            onDoorClick={() => {
              if (isUnlocked) {
                handleDoorClick(room.id);
              } else {
                // Try to unlock door
                unlockDoor(doorId, currentRoomId, "manual");
              }
            }}
            onStateChange={(newState) => {
              useDoorProgressionStore.getState().setDoorState(doorId, newState);
            }}
          />
        );
      })}

      {/* Door Debugger */}
      <DoorDebugger showDebugger={import.meta.env.DEV} />
    </group>
  );
});

RoomManager.displayName = "RoomManager";

export default RoomManager;

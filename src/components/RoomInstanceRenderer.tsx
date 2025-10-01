import React from "react";
import useRoomManagerStore from "../store/roomManagerStore";
import Room from "./Room";

interface RoomInstanceRendererProps {
  playerPosition?: [number, number, number];
  onInteraction?: (interactionType: string, roomId: string) => void;
}

const RoomInstanceRenderer: React.FC<RoomInstanceRendererProps> = ({
  playerPosition = [0, 0, 0],
  onInteraction,
}) => {
  const { currentRoomId, roomInstances } = useRoomManagerStore();

  // Get current room instance
  const currentRoomInstance = currentRoomId
    ? roomInstances.get(currentRoomId)
    : null;
  const currentRoom = currentRoomInstance?.room;

  // No room loaded or room not loaded yet - return null (instant transitions)
  if (!currentRoomInstance || !currentRoom || !currentRoomInstance.isLoaded) {
    return null;
  }

  // Render the current room at origin (room-instance mode)
  const roomAtOrigin = {
    ...currentRoom,
    position: { x: 0, y: 0, z: 0 }, // Always render at origin in room-instance mode
  };

  return (
    <group>
      <Room
        room={roomAtOrigin}
        isCurrent={true}
        isVisited={true}
        connectedRooms={[]} // We'll handle connections differently in room-instance mode
        playerPosition={playerPosition}
        onInteraction={onInteraction}
      />
    </group>
  );
};

export default RoomInstanceRenderer;

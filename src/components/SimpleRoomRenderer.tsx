import React, { memo } from "react";
import { useConsolidatedGameStore } from "../store/consolidatedGameStore";
import { ROOM_DEFINITIONS } from "../data/roomDefinitions";

const SimpleRoomRenderer: React.FC = memo(() => {
  const { currentRoomId } = useConsolidatedGameStore();

  const currentRoom = ROOM_DEFINITIONS[currentRoomId];

  if (!currentRoom) {
    // Room not found
    return null;
  }

  const RoomComponent = currentRoom.component;

  return <RoomComponent />;
});

SimpleRoomRenderer.displayName = "SimpleRoomRenderer";

export default SimpleRoomRenderer;

import React, { memo } from "react";
import { useCurrentRoomId } from "../store/roomStore";
import { ROOM_DEFINITIONS } from "../data/roomDefinitions";

const SimpleRoomRenderer: React.FC = memo(() => {
  const currentRoomId = useCurrentRoomId();

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

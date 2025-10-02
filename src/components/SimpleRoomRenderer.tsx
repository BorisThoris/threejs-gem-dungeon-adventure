import React from "react";
import { useRoomContext, ROOM_DEFINITIONS } from "../contexts/RoomContext";

const SimpleRoomRenderer: React.FC = () => {
  const { currentRoomId } = useRoomContext();

  const currentRoom = ROOM_DEFINITIONS[currentRoomId];

  if (!currentRoom) {
    // Room not found
    return null;
  }

  const RoomComponent = currentRoom.component;

  return <RoomComponent />;
};

export default SimpleRoomRenderer;

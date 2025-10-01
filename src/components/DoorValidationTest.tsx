import React from "react";
import useRoomManagerStore from "../store/roomManagerStore";
import useMapStore from "../store/mapStore";

const DoorValidationTest: React.FC = () => {
  const { currentRoomId } = useRoomManagerStore();
  const { currentMap } = useMapStore();

  const currentRoom = currentMap?.rooms.find((r) => r.id === currentRoomId);

  if (!currentRoom || !currentMap) {
    return null;
  }

  // Validate connected rooms
  const connectedRooms = currentRoom.connections
    .map((connectionId) => currentMap.rooms.find((r) => r.id === connectionId))
    .filter((room) => {
      if (!room) return false;

      // Check if room is within reasonable bounds
      const maxDistance = 50;
      const distance = Math.sqrt(
        Math.pow(room.position.x - currentRoom.position.x, 2) +
          Math.pow(room.position.z - currentRoom.position.z, 2)
      );

      return distance <= maxDistance;
    });

  const invalidConnections = currentRoom.connections.filter(
    (connectionId) => !currentMap.rooms.some((room) => room.id === connectionId)
  );

  return (
    <div
      style={{
        position: "fixed",
        top: "460px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        fontFamily: "monospace",
        fontSize: "12px",
      }}
    >
      <div>
        <strong>Door Validation Test</strong>
      </div>
      <div>Current Room: {currentRoomId}</div>
      <div>Total Connections: {currentRoom.connections.length}</div>
      <div>Valid Doors: {connectedRooms.length}</div>
      <div>Invalid Connections: {invalidConnections.length}</div>
      {invalidConnections.length > 0 && (
        <div style={{ color: "#F44336" }}>
          Invalid: {invalidConnections.join(", ")}
        </div>
      )}
      <div style={{ color: connectedRooms.length > 0 ? "#4CAF50" : "#FFA500" }}>
        Status:{" "}
        {connectedRooms.length > 0 ? "✅ Valid Doors" : "⚠️ No Valid Doors"}
      </div>
    </div>
  );
};

export default DoorValidationTest;

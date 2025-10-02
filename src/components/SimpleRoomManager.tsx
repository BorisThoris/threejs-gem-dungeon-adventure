import React from "react";
import { useRoomContext } from "../contexts/RoomContext";
import SimpleRoomRenderer from "./SimpleRoomRenderer";
import SimpleDoor from "./SimpleDoor";
import DebugSign from "./DebugSign";
import { ROOM_DEFINITIONS } from "../contexts/RoomContext";

const SimpleRoomManager: React.FC = () => {
  const { currentRoomId, getAllConnectedRooms } = useRoomContext();

  const currentRoom = ROOM_DEFINITIONS[currentRoomId];
  const availableDoors = getAllConnectedRooms();

  // Debug: Room connections

  if (!currentRoom) {
    return null;
  }

  // Define door positions for each room (properly positioned relative to ground and walls)
  const getDoorPositions = (roomId: string, connectedRooms: string[]) => {
    const positions: Array<{
      position: [number, number, number];
      rotation: [number, number, number];
      roomId: string;
    }> = [];

    // Room dimensions
    const roomSize = 10; // Standard room size
    const wallThickness = 0.2; // Wall thickness
    const doorHeight = 2.5; // Door height (from ground)
    const doorWidth = 2; // Door width
    const groundLevel = -0.5; // Ground level (floor is at y: -0.5)

    // Create positions for ALL connected rooms
    connectedRooms.forEach((connectedRoomId, index) => {
      // Distribute doors around the room perimeter
      const totalDoors = connectedRooms.length;
      const angleStep = (2 * Math.PI) / totalDoors;
      const radius = roomSize / 2 + wallThickness;

      // Calculate position around the perimeter
      const angle = index * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Calculate rotation to face inward toward the room
      const rotationY = angle + Math.PI; // Face inward

      positions.push({
        position: [x, groundLevel + 1.25, z], // Position door at appropriate height above floor
        rotation: [0, rotationY, 0],
        roomId: connectedRoomId,
      });
    });

    return positions;
  };

  const doorPositions = getDoorPositions(currentRoomId, availableDoors);

  return (
    <group>
      {/* Render the current room */}
      <SimpleRoomRenderer />

      {/* Render doors for connected rooms */}
      {doorPositions.map((doorPosition) => {
        const targetRoom = ROOM_DEFINITIONS[doorPosition.roomId];
        const roomName = targetRoom?.name || doorPosition.roomId;

        return (
          <group key={`door-group-${doorPosition.roomId}`}>
            <SimpleDoor
              targetRoomId={doorPosition.roomId}
              position={doorPosition.position}
              rotation={doorPosition.rotation}
              width={2}
              height={2.5}
              color="#8B4513"
            />

            {/* Debug sign next to door */}
            <DebugSign
              position={[
                doorPosition.position[0] + 1.5,
                doorPosition.position[1] + 1,
                doorPosition.position[2] + 1.5,
              ]}
              text={`→ ${roomName}`}
              color="#00FF00"
            />
          </group>
        );
      })}
    </group>
  );
};

export default SimpleRoomManager;

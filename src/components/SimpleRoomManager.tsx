import React, { memo } from "react";
import { useRoomStore, getConnectedRooms } from "../store/roomStore";
import SimpleRoomRenderer from "./SimpleRoomRenderer";
import Door from "./Door";
import DebugSign from "./DebugSign";
import { ROOM_DEFINITIONS } from "../data/roomDefinitions";

const SimpleRoomManager: React.FC = memo(() => {
  const { currentRoomId } = useRoomStore();
  const connectedRooms = getConnectedRooms(currentRoomId);

  const currentRoom = ROOM_DEFINITIONS[currentRoomId];
  const availableDoors = connectedRooms;

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

  const doorPositions = getDoorPositions(
    currentRoomId,
    availableDoors.map((room) => room.id)
  );

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
            <Door
              targetRoomId={doorPosition.roomId}
              position={doorPosition.position}
              rotation={doorPosition.rotation}
              showLabel={true}
              onDoorClick={() => {
                console.log(
                  `🚪 SimpleRoomManager: Door clicked -> ${doorPosition.roomId}`
                );
                // Add room change logic here if needed
              }}
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
});

SimpleRoomManager.displayName = "SimpleRoomManager";

export default SimpleRoomManager;

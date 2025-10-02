import React, { useEffect, useState } from "react";
import { segmentManager } from "../../../utils/segmentUtils";
import type { RoomSegments } from "../../../utils/segmentUtils";
import WallSegment from "./WallSegment";
import SimpleDoor from "../../SimpleDoor";

interface RoomSegmentRendererProps {
  roomId: string;
  roomSize: number;
  wallHeight: number;
  wallThickness: number;
  doorWidth: number;
  connections: string[];
  roomConnections?: string[]; // Actual room connection IDs
  onDoorClick?: (targetRoomId: string, direction: string) => void;
  onSegmentClick?: (segmentId: string) => void;
  onSegmentHover?: (segmentId: string) => void;
  onSegmentUnhover?: (segmentId: string) => void;
}

const RoomSegmentRenderer: React.FC<RoomSegmentRendererProps> = ({
  roomId,
  roomSize,
  wallHeight,
  wallThickness,
  doorWidth,
  connections,
  roomConnections,
  onDoorClick,
  onSegmentClick,
  onSegmentHover,
  onSegmentUnhover,
}) => {
  const [segments, setSegments] = useState<RoomSegments | null>(null);

  useEffect(() => {
    // Initialize segments for this room
    let roomSegments = segmentManager.getRoomSegments(roomId);
    if (!roomSegments) {
      roomSegments = segmentManager.createRoomSegments(roomId);
      // Generate wall segments
      segmentManager.generateWallSegmentsForRoom(
        roomId,
        roomSize,
        wallHeight,
        wallThickness,
        doorWidth,
        connections,
        roomConnections
      );
    }

    console.log(
      `🚪 RoomSegmentRenderer: Generated ${roomSegments.doors.length} doors for room ${roomId}`,
      {
        connections,
        roomConnections,
        connectionsLength: connections?.length || 0,
        roomConnectionsLength: roomConnections?.length || 0,
      }
    );

    setSegments(roomSegments);

    // Cleanup function
    return () => {
      // Clean up segments when component unmounts or room changes
      segmentManager.clearRoomSegments(roomId);
    };
  }, [
    roomId,
    roomSize,
    wallHeight,
    wallThickness,
    doorWidth,
    connections,
    roomConnections,
  ]);

  if (!segments) {
    return null;
  }

  return (
    <group>
      {/* Render wall segments */}
      {segments.walls.map((segment) => (
        <WallSegment
          key={segment.id}
          segment={segment}
          onSegmentClick={onSegmentClick}
          onSegmentHover={onSegmentHover}
          onSegmentUnhover={onSegmentUnhover}
        />
      ))}

      {/* Render door segments */}
      {segments.doors.map((doorSegment) => (
        <SimpleDoor
          key={doorSegment.id}
          position={doorSegment.position}
          rotation={doorSegment.rotation}
          targetRoomId={
            doorSegment.targetRoomId || `room_${doorSegment.direction}`
          }
          onDoorClick={() => {
            console.log(
              `🚪 RoomSegmentRenderer: Door clicked ${doorSegment.direction} -> ${doorSegment.targetRoomId}`
            );
            onDoorClick?.(
              doorSegment.targetRoomId || `room_${doorSegment.direction}`,
              doorSegment.direction
            );
          }}
        />
      ))}

      {/* Render floor segments */}
      {segments.floors.map((segment) => (
        <WallSegment
          key={segment.id}
          segment={segment}
          onSegmentClick={onSegmentClick}
          onSegmentHover={onSegmentHover}
          onSegmentUnhover={onSegmentUnhover}
        />
      ))}

      {/* Render ceiling segments */}
      {segments.ceilings.map((segment) => (
        <WallSegment
          key={segment.id}
          segment={segment}
          onSegmentClick={onSegmentClick}
          onSegmentHover={onSegmentHover}
          onSegmentUnhover={onSegmentUnhover}
        />
      ))}
    </group>
  );
};

export default RoomSegmentRenderer;

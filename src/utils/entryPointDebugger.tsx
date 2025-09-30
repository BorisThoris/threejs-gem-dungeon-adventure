import React from "react";
import { Text } from "@react-three/drei";
import type { Room, EntryPoint } from "../types/map";
import * as THREE from "three";

interface EntryPointDebuggerProps {
  room: Room;
  showLabels?: boolean;
  showConnections?: boolean;
}

/**
 * Visual debugger component for entry points
 * Shows entry point positions, directions, and connections
 */
export const EntryPointDebugger: React.FC<EntryPointDebuggerProps> = ({
  room,
  showLabels = true,
  showConnections = true,
}) => {
  if (!room.entryPoints || room.entryPoints.length === 0) {
    return null;
  }

  return (
    <group>
      {room.entryPoints.map((entryPoint, index) => (
        <EntryPointMarker
          key={entryPoint.id}
          entryPoint={entryPoint}
          showLabel={showLabels}
          showConnection={showConnections}
        />
      ))}
    </group>
  );
};

interface EntryPointMarkerProps {
  entryPoint: EntryPoint;
  showLabel?: boolean;
  showConnection?: boolean;
}

const EntryPointMarker: React.FC<EntryPointMarkerProps> = ({
  entryPoint,
  showLabel = true,
  showConnection = true,
}) => {
  const { position, direction, isActive, connectedTo } = entryPoint;

  // Color based on state
  const color = isActive ? "#00ff00" : "#ffff00";
  const emissiveColor = isActive ? "#00aa00" : "#aaaa00";

  // Direction arrow
  const arrowDirection = getArrowDirection(direction);
  const arrowRotation = getArrowRotation(direction);

  return (
    <group position={[position.x, 0.5, position.z]}>
      {/* Entry point marker sphere */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Direction indicator arrow */}
      <mesh
        position={[arrowDirection.x * 0.4, 0, arrowDirection.z * 0.4]}
        rotation={arrowRotation}
      >
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Vertical line to show height */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Label */}
      {showLabel && (
        <>
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.15}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {direction.toUpperCase()}
          </Text>
          <Text
            position={[0, 1.0, 0]}
            fontSize={0.12}
            color={isActive ? "#00ff00" : "#ffff00"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {isActive ? "●ACTIVE" : "○INACTIVE"}
          </Text>
          {connectedTo && showConnection && (
            <Text
              position={[0, 0.8, 0]}
              fontSize={0.1}
              color="#aaaaaa"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.01}
              outlineColor="#000000"
            >
              → {connectedTo.split("_")[0]}
            </Text>
          )}
        </>
      )}
    </group>
  );
};

/**
 * Get arrow direction vector based on cardinal direction
 */
function getArrowDirection(direction: string): { x: number; z: number } {
  switch (direction) {
    case "north":
      return { x: 0, z: -1 };
    case "south":
      return { x: 0, z: 1 };
    case "east":
      return { x: 1, z: 0 };
    case "west":
      return { x: -1, z: 0 };
    default:
      return { x: 0, z: 0 };
  }
}

/**
 * Get arrow rotation for the direction indicator
 */
function getArrowRotation(direction: string): [number, number, number] {
  switch (direction) {
    case "north":
      return [0, 0, 0]; // Points forward (negative Z)
    case "south":
      return [0, Math.PI, 0]; // Points backward (positive Z)
    case "east":
      return [0, -Math.PI / 2, 0]; // Points right (positive X)
    case "west":
      return [0, Math.PI / 2, 0]; // Points left (negative X)
    default:
      return [0, 0, 0];
  }
}

/**
 * Component to show all entry points across all rooms in the map
 */
interface MapEntryPointDebuggerProps {
  rooms: Room[];
  enabled?: boolean;
  showLabels?: boolean;
  showConnections?: boolean;
}

export const MapEntryPointDebugger: React.FC<MapEntryPointDebuggerProps> = ({
  rooms,
  enabled = true,
  showLabels = true,
  showConnections = true,
}) => {
  if (!enabled) {
    return null;
  }

  return (
    <group>
      {rooms.map((room) => (
        <group key={room.id} position={[room.position.x, 0, room.position.z]}>
          <EntryPointDebugger
            room={room}
            showLabels={showLabels}
            showConnections={showConnections}
          />
        </group>
      ))}
    </group>
  );
};

/**
 * Helper to log entry point information to console
 */
export function logEntryPointInfo(room: Room): void {
  if (!room.entryPoints) {
    console.log(`Room ${room.id} has no entry points`);
    return;
  }

  console.group(`Entry Points for ${room.id} (${room.type})`);
  console.log(`Total entry points: ${room.entryPoints.length}`);
  console.log(
    `Active entry points: ${
      room.entryPoints.filter((ep) => ep.isActive).length
    }`
  );

  room.entryPoints.forEach((ep, index) => {
    console.log(`  [${index}] ${ep.id}`);
    console.log(`      Direction: ${ep.direction}`);
    console.log(`      Position: [${ep.position.x}, ${ep.position.z}]`);
    console.log(`      Active: ${ep.isActive}`);
    console.log(`      Connected to: ${ep.connectedTo || "none"}`);
    console.log(`      Type: ${ep.type || "door"}`);
  });

  console.groupEnd();
}

/**
 * Validate entry point connections
 */
export function validateEntryPoints(rooms: Room[]): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  rooms.forEach((room) => {
    if (!room.entryPoints) {
      warnings.push(`Room ${room.id} has no entry points defined`);
      return;
    }

    // Check for duplicate entry point IDs
    const ids = new Set<string>();
    room.entryPoints.forEach((ep) => {
      if (ids.has(ep.id)) {
        errors.push(`Duplicate entry point ID: ${ep.id} in room ${room.id}`);
      }
      ids.add(ep.id);
    });

    // Validate active connections
    room.entryPoints.forEach((ep) => {
      if (ep.isActive && !ep.connectedTo) {
        warnings.push(`Entry point ${ep.id} is active but not connected`);
      }

      if (!ep.isActive && ep.connectedTo) {
        warnings.push(`Entry point ${ep.id} has connection but is not active`);
      }

      // Try to find the connected entry point
      if (ep.connectedTo) {
        const connectedRoomId = ep.connectedTo.split("_entry_")[0];
        const connectedRoom = rooms.find((r) => r.id === connectedRoomId);

        if (!connectedRoom) {
          errors.push(
            `Entry point ${ep.id} connects to non-existent room ${connectedRoomId}`
          );
        } else if (connectedRoom.entryPoints) {
          const connectedEP = connectedRoom.entryPoints.find(
            (e) => e.id === ep.connectedTo
          );
          if (!connectedEP) {
            errors.push(
              `Entry point ${ep.id} connects to non-existent entry point ${ep.connectedTo}`
            );
          } else if (connectedEP.connectedTo !== ep.id) {
            errors.push(
              `Entry point ${ep.id} and ${ep.connectedTo} are not mutually connected`
            );
          }
        }
      }
    });

    // Check if connections match entry points
    if (room.connections.length > 0) {
      const activeConnections = room.entryPoints.filter(
        (ep) => ep.isActive
      ).length;
      if (activeConnections !== room.connections.length) {
        warnings.push(
          `Room ${room.id} has ${room.connections.length} connections but ${activeConnections} active entry points`
        );
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

import type { Room, EntryPoint, EntryDirection } from '../types/map';

/**
 * Calculate door position and rotation from entry point data
 * @param currentRoom - The current room
 * @param targetRoomId - The ID of the room this door connects to
 * @returns Door position and rotation, or null if no entry point found
 */
export function getDoorPositionFromEntryPoint(
  currentRoom: Room,
  targetRoomId: string
): { pos: [number, number, number]; rot: [number, number, number] } | null {
  // Find the entry point connected to the target room
  const entryPoint = currentRoom.entryPoints?.find((ep) => {
    // Check if this entry point is active and connected
    if (!ep.connectedTo || !ep.isActive) return false;
    
    // Check if the connected entry point belongs to the target room
    // Entry point IDs follow format: roomId_entry_direction_index
    return ep.connectedTo.startsWith(`${targetRoomId}_entry_`);
  });

  if (!entryPoint) {
    // No active entry point found
    return null;
  }

  // Using entry point
  
  // Convert entry point to door position
  return {
    pos: [entryPoint.position.x, 1.5, entryPoint.position.z],
    rot: getRotationFromDirection(entryPoint.direction),
  };
}

/**
 * Get rotation based on entry direction
 */
function getRotationFromDirection(
  direction: EntryDirection
): [number, number, number] {
  const rotations: Record<EntryDirection, [number, number, number]> = {
    north: [0, 0, 0],
    south: [0, Math.PI, 0],
    east: [0, Math.PI / 2, 0],
    west: [0, -Math.PI / 2, 0],
  };
  return rotations[direction];
}

/**
 * Get default door position if no entry point is found (backward compatibility)
 */
function getDefaultDoorPosition(
  room: Room
): { pos: [number, number, number]; rot: [number, number, number] } {
  const roomSize = room.size || 10;
  return {
    pos: [0, 0.5, roomSize / 2], // Position door at appropriate height above floor
    rot: [0, Math.PI, 0],
  };
}

/**
 * Calculate door position based on entry points with support for multiple doors
 * on the same wall using the entry point data
 */
export function calculateDoorPositionFromEntryPoints(
  currentRoom: Room,
  targetRoomId: string,
  connectionIndex: number
): { pos: [number, number, number]; rot: [number, number, number] } | null {
  // Try to use entry point system - find the specific entry point for this target room
  if (currentRoom.entryPoints && currentRoom.entryPoints.length > 0) {
    // First, try to find the exact entry point connected to this target room
    const targetEntryPoint = currentRoom.entryPoints.find((ep) => {
      if (!ep.connectedTo || !ep.isActive) return false;
      return ep.connectedTo.startsWith(`${targetRoomId}_entry_`);
    });
    
    if (targetEntryPoint) {
      // Found entry point
      return {
        pos: [targetEntryPoint.position.x, 1.5, targetEntryPoint.position.z],
        rot: getRotationFromDirection(targetEntryPoint.direction),
      };
    }
    
    // Fallback: use connection index if specific entry point not found
    const activeEntryPoints = currentRoom.entryPoints.filter(ep => ep.isActive);
    if (activeEntryPoints.length > 0 && connectionIndex < activeEntryPoints.length) {
      const entryPoint = activeEntryPoints[connectionIndex];
      // Using fallback entry point
      return {
        pos: [entryPoint.position.x, 1.5, entryPoint.position.z],
        rot: getRotationFromDirection(entryPoint.direction),
      };
    }
  }

  // No entry points available
  // No entry points available
  return null;
}

/**
 * Get all active entry points grouped by direction
 * Useful for spacing multiple doors on the same wall
 */
export function getActiveEntryPointsByDirection(
  room: Room
): Map<EntryDirection, EntryPoint[]> {
  const byDirection = new Map<EntryDirection, EntryPoint[]>();
  
  if (!room.entryPoints) return byDirection;

  room.entryPoints
    .filter((ep) => ep.isActive)
    .forEach((ep) => {
      const existing = byDirection.get(ep.direction) || [];
      existing.push(ep);
      byDirection.set(ep.direction, existing);
    });

  return byDirection;
}

/**
 * Apply spacing to multiple doors on the same wall
 * This adjusts the position slightly for doors that share the same wall
 */
export function applyDoorSpacing(
  basePosition: [number, number, number],
  direction: EntryDirection,
  doorIndex: number,
  totalDoorsOnWall: number
): [number, number, number] {
  if (totalDoorsOnWall <= 1) {
    return basePosition;
  }

  const spacing = 2.5; // Space between doors
  const totalWidth = (totalDoorsOnWall - 1) * spacing;
  const offset = (doorIndex * spacing) - (totalWidth / 2);

  const [x, y, z] = basePosition;

  // Apply offset perpendicular to the wall direction
  switch (direction) {
    case 'north':
    case 'south':
      // Doors on north/south walls - offset along X axis
      return [x + offset, y, z];
    case 'east':
    case 'west':
      // Doors on east/west walls - offset along Z axis
      return [x, y, z + offset];
    default:
      return basePosition;
  }
}

/**
 * Get all doors that should be rendered for a room with proper spacing
 */
export function getRoomDoorsWithSpacing(
  currentRoom: Room,
  connections: string[]
): Array<{
  targetRoomId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  direction: EntryDirection;
}> {
  const doors: Array<{
    targetRoomId: string;
    position: [number, number, number];
    rotation: [number, number, number];
    direction: EntryDirection;
  }> = [];

  if (!currentRoom.entryPoints) {
    return doors;
  }

  // Group doors by direction
  const doorsByDirection = new Map<EntryDirection, Array<{
    targetRoomId: string;
    entryPoint: EntryPoint;
  }>>();

  // Find all connected entry points
  connections.forEach((targetRoomId) => {
    const entryPoint = currentRoom.entryPoints?.find((ep) => {
      if (!ep.connectedTo || !ep.isActive) return false;
      return ep.connectedTo.startsWith(`${targetRoomId}_entry_`);
    });

    if (entryPoint) {
      const existing = doorsByDirection.get(entryPoint.direction) || [];
      existing.push({ targetRoomId, entryPoint });
      doorsByDirection.set(entryPoint.direction, existing);
    }
  });

  // Apply spacing to doors on the same wall
  doorsByDirection.forEach((doorsOnWall, direction) => {
    doorsOnWall.forEach((door, index) => {
      const basePos: [number, number, number] = [
        door.entryPoint.position.x,
        1.5,
        door.entryPoint.position.z
      ];
      
      const spacedPos = applyDoorSpacing(
        basePos,
        direction,
        index,
        doorsOnWall.length
      );

      doors.push({
        targetRoomId: door.targetRoomId,
        position: spacedPos,
        rotation: getRotationFromDirection(direction),
        direction: direction,
      });
    });
  });

  return doors;
}


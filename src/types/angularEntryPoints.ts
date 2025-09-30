/**
 * Extended Entry Point System with Angular Support
 * This extends the basic entry point system to support arbitrary angles
 */

import type { Position } from './map';

// Extended direction type that supports angles
export type AngularEntryDirection = 
  | 'north' | 'south' | 'east' | 'west'  // Cardinal directions
  | 'northeast' | 'northwest' | 'southeast' | 'southwest'  // Diagonal directions
  | number;  // Custom angle in degrees (0-360)

// Extended entry point with angular support
export interface AngularEntryPoint {
  id: string;
  direction: AngularEntryDirection;
  angle: number;  // Angle in degrees (0-360)
  position: Position;
  connectedTo?: string;
  type?: 'door' | 'corridor' | 'portal' | 'diagonal' | 'custom';
  isActive?: boolean;
  // Additional properties for angular support
  wallSegment?: number;  // Which wall segment (for complex shapes)
  isDiagonal?: boolean;  // Whether this is a diagonal connection
}

/**
 * Convert direction to angle in degrees
 */
export function directionToAngle(direction: AngularEntryDirection): number {
  if (typeof direction === 'number') {
    return direction;
  }

  const angleMap: Record<string, number> = {
    'north': 0,
    'northeast': 45,
    'east': 90,
    'southeast': 135,
    'south': 180,
    'southwest': 225,
    'west': 270,
    'northwest': 315,
  };

  return angleMap[direction] ?? 0;
}

/**
 * Convert angle to direction vector
 */
export function angleToDirection(angle: number): { x: number; z: number } {
  const radians = (angle * Math.PI) / 180;
  return {
    x: Math.sin(radians),
    z: -Math.cos(radians),  // Negative because Z+ is "south" in our coordinate system
  };
}

/**
 * Get opposite angle
 */
export function getOppositeAngle(angle: number): number {
  return (angle + 180) % 360;
}

/**
 * Calculate position on room perimeter at given angle
 */
export function getPositionAtAngle(
  roomShape: string,
  roomSize: number,
  angle: number
): Position {
  const radians = (angle * Math.PI) / 180;
  
  switch (roomShape) {
    case 'circle':
      // Circular room - position on circle perimeter
      const radius = roomSize / 2;
      return {
        x: Math.sin(radians) * radius,
        z: -Math.cos(radians) * radius,
      };

    case 'hexagon':
      // Hexagonal room - position on hexagon perimeter
      return getHexagonPositionAtAngle(roomSize, angle);

    case 'octagon':
      // Octagonal room - position on octagon perimeter
      return getOctagonPositionAtAngle(roomSize, angle);

    case 'square':
    default:
      // Square room - snap to nearest wall
      return getSquarePositionAtAngle(roomSize, angle);
  }
}

/**
 * Get position on hexagon perimeter at given angle
 */
function getHexagonPositionAtAngle(roomSize: number, angle: number): Position {
  const radius = roomSize / 2;
  const radians = (angle * Math.PI) / 180;
  
  // Hexagon has 6 sides, each 60 degrees
  const sideAngle = Math.floor(angle / 60) * 60;
  const sideRadians = (sideAngle * Math.PI) / 180;
  
  // Calculate position on the specific side
  const x = Math.sin(sideRadians) * radius;
  const z = -Math.cos(sideRadians) * radius;
  
  return { x, z };
}

/**
 * Get position on octagon perimeter at given angle
 */
function getOctagonPositionAtAngle(roomSize: number, angle: number): Position {
  const radius = roomSize / 2;
  const radians = (angle * Math.PI) / 180;
  
  // Octagon has 8 sides, each 45 degrees
  const sideAngle = Math.floor(angle / 45) * 45;
  const sideRadians = (sideAngle * Math.PI) / 180;
  
  const x = Math.sin(sideRadians) * radius;
  const z = -Math.cos(sideRadians) * radius;
  
  return { x, z };
}

/**
 * Get position on square perimeter at given angle (snap to nearest wall)
 */
function getSquarePositionAtAngle(roomSize: number, angle: number): Position {
  const halfSize = roomSize / 2;
  
  // Determine which wall the angle points to
  if (angle >= 315 || angle < 45) {
    // North wall
    return { x: 0, z: -halfSize };
  } else if (angle >= 45 && angle < 135) {
    // East wall
    return { x: halfSize, z: 0 };
  } else if (angle >= 135 && angle < 225) {
    // South wall
    return { x: 0, z: halfSize };
  } else {
    // West wall
    return { x: -halfSize, z: 0 };
  }
}

/**
 * Generate entry points with angular support
 */
export function generateAngularEntryPoints(
  roomId: string,
  roomType: string,
  roomShape: string = 'square',
  roomSize: number = 10,
  customAngles?: number[]  // Custom angles for special cases
): AngularEntryPoint[] {
  const entryPoints: AngularEntryPoint[] = [];
  
  // Helper to create an angular entry point
  const createAngularEntry = (
    direction: AngularEntryDirection,
    angle: number,
    position: Position,
    type: string = 'door'
  ): AngularEntryPoint => ({
    id: `${roomId}_entry_${direction}_${entryPoints.length}`,
    direction,
    angle,
    position,
    type,
    isActive: false,
    isDiagonal: angle % 90 !== 0,
    wallSegment: Math.floor(angle / 45),
  });

  // Standard angles based on room shape
  let angles: number[] = [];

  switch (roomShape) {
    case 'square':
      angles = [0, 90, 180, 270];  // Cardinal directions
      break;
    case 'circle':
      angles = [0, 90, 180, 270];  // Cardinal directions
      break;
    case 'hexagon':
      angles = [0, 60, 120, 180, 240, 300];  // 6 sides
      break;
    case 'octagon':
      angles = [0, 45, 90, 135, 180, 225, 270, 315];  // 8 sides
      break;
    case 'triangle':
      angles = [0, 120, 240];  // 3 sides
      break;
    case 'diamond':
      angles = [45, 135, 225, 315];  // Diagonal directions
      break;
    default:
      angles = [0, 90, 180, 270];  // Default to cardinal
  }

  // Add custom angles if provided
  if (customAngles) {
    angles = [...angles, ...customAngles];
  }

  // Generate entry points for each angle
  angles.forEach((angle) => {
    const position = getPositionAtAngle(roomShape, roomSize, angle);
    const direction = angleToDirectionName(angle);
    
    entryPoints.push(
      createAngularEntry(direction, angle, position)
    );
  });

  // Filter for corridors (only opposing directions)
  if (roomType === 'corridor') {
    return entryPoints.filter(ep => 
      ep.angle === 0 || ep.angle === 180  // North and South only
    );
  }

  return entryPoints;
}

/**
 * Convert angle to direction name
 */
function angleToDirectionName(angle: number): AngularEntryDirection {
  const normalizedAngle = ((angle % 360) + 360) % 360;
  
  if (normalizedAngle === 0) return 'north';
  if (normalizedAngle === 45) return 'northeast';
  if (normalizedAngle === 90) return 'east';
  if (normalizedAngle === 135) return 'southeast';
  if (normalizedAngle === 180) return 'south';
  if (normalizedAngle === 225) return 'southwest';
  if (normalizedAngle === 270) return 'west';
  if (normalizedAngle === 315) return 'northwest';
  
  return normalizedAngle;  // Return the angle as a number
}

/**
 * Find entry point at specific angle
 */
export function findEntryPointAtAngle(
  entryPoints: AngularEntryPoint[],
  angle: number,
  tolerance: number = 5  // 5 degree tolerance
): AngularEntryPoint | undefined {
  return entryPoints.find(ep => {
    const angleDiff = Math.abs(ep.angle - angle);
    return angleDiff <= tolerance || angleDiff >= (360 - tolerance);
  });
}

/**
 * Connect two angular entry points
 */
export function connectAngularEntryPoints(
  sourceEntry: AngularEntryPoint,
  targetEntry: AngularEntryPoint
): void {
  sourceEntry.connectedTo = targetEntry.id;
  targetEntry.connectedTo = sourceEntry.id;
  sourceEntry.isActive = true;
  targetEntry.isActive = true;
}

/**
 * Calculate door rotation from angle
 */
export function getDoorRotationFromAngle(angle: number): [number, number, number] {
  const radians = (angle * Math.PI) / 180;
  return [0, radians, 0];
}

/**
 * Get all entry points within angle range
 */
export function getEntryPointsInRange(
  entryPoints: AngularEntryPoint[],
  startAngle: number,
  endAngle: number
): AngularEntryPoint[] {
  return entryPoints.filter(ep => {
    const angle = ep.angle;
    if (startAngle <= endAngle) {
      return angle >= startAngle && angle <= endAngle;
    } else {
      // Handle wrap-around (e.g., 350° to 10°)
      return angle >= startAngle || angle <= endAngle;
    }
  });
}

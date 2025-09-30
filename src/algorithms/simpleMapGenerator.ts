import type { Room, Position, MapConfig, Item, ItemEffect, EntryDirection } from '../types/map';
import { RoomType } from '../types/map';
import {
  generateEntryPoints,
  getOppositeDirection,
  getDirectionBetweenRooms,
  findAvailableEntryPoint,
  connectEntryPoints,
} from '../utils/entryPointGenerator';
import { ensureRoomConnectivity, analyzeConnectivity } from '../utils/roomConnectivityValidator';

export interface SimpleMapConfig extends MapConfig {
  useShapedRooms: boolean;
  usePortals: boolean;
  shapeChance: number;
  portalChance: number;
  useLiminalSpaces?: boolean;
  corridorChance?: number;
  useMultiTileRooms?: boolean;
  multiTileChance?: number;
  multiTileMaxSegments?: number;
  // Advanced generation
  roomTypeWeights?: Record<string, number>;
  hubChance?: number; // chance to spawn a hub/atrium (plus/block)
  corridorRunChance?: number; // chance to extend corridors in a line
  culDeSacChance?: number; // chance to add a side-room off a corridor
  useThemes?: boolean;
}

export const defaultSimpleConfig: SimpleMapConfig = {
  width: 20,
  height: 20,
  roomSize: 10,
  minRooms: 8,
  maxRooms: 20,
  specialRoomChance: 0.6,
  connectionChance: 0.4,
  useShapedRooms: true,
  usePortals: true,
  shapeChance: 0.3,
  portalChance: 0.1,
  useLiminalSpaces: true,
  corridorChance: 0.5,
  useMultiTileRooms: true,
  multiTileChance: 0.35,
  multiTileMaxSegments: 4,
  roomTypeWeights: {
    normal: 1.0,
    treasure: 0.3,
    shop: 0.25,
    puzzle: 0.4,
    secret: 0.2,
    library: 0.25,
    'bench-press': 0.15,
    coffee: 0.2,
    'library-upgrade': 0.15,
    meditation: 0.2,
    portal: 0.15,
    arena: 0.12,
    boss: 0.1,
    trap: 0.2,
    corridor: 0.6,
    colosseum: 0.05,
  },
  hubChance: 0.15,
  corridorRunChance: 0.4,
  culDeSacChance: 0.35,
  useThemes: true,
};

export class SimpleMapGenerator {
  private config: SimpleMapConfig;
  private rooms: Room[] = [];
  private grid: (Room | null)[][] = [];
  private gridSize: number;
  private startX: number;
  private startZ: number;
  private roomIdCounter = 1;

  constructor(config: Partial<SimpleMapConfig> = {}) {
    this.config = { ...defaultSimpleConfig, ...config };
    this.gridSize = 12;
    this.startX = Math.floor(this.gridSize / 2);
    this.startZ = Math.floor(this.gridSize / 2);
  }

  generateMap(): { rooms: Room[]; startRoomId: string; endRoomId: string } {
    this.initializeGrid();
    this.generateStartRoom();
    this.generateRooms();
    this.addShapedRooms();
    this.addPortals();
    if ((this.config.useThemes ?? true)) {
      this.assignThemes();
    }
    
    // Enhanced connectivity check and repair
    this.ensureConnectivity();
    
    const endRoom = this.rooms.find(room => room.type === RoomType.END) || this.createEndRoom();
    
    // Final connectivity validation using the new system
    const map = {
      id: `map_${Date.now()}`,
      rooms: this.rooms,
      startRoomId: this.rooms[0].id,
      endRoomId: endRoom.id,
      config: this.config,
      generatedAt: Date.now(),
    };
    
    const finalMap = ensureRoomConnectivity(map);
    
    return {
      rooms: finalMap.rooms,
      startRoomId: finalMap.startRoomId,
      endRoomId: finalMap.endRoomId
    };
  }

  private initializeGrid(): void {
    this.grid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill(null));
    this.rooms = [];
    this.roomIdCounter = 1;
  }

  private generateStartRoom(): void {
    const startRoom: Room = {
      id: 'start',
      position: { x: 0, z: 0 },
      type: RoomType.START,
      connections: [],
      size: this.config.roomSize,
      isVisited: true,
      isCurrent: true,
      shape: 'circle',
      theme: 'mystical',
      lighting: 'bright',
      difficulty: 1,
      level: 1,
      items: this.getItemsForRoomType(RoomType.START),
      specialProperties: this.getSpecialPropertiesForRoomType(RoomType.START),
      // Generate entry points for start room
      entryPoints: generateEntryPoints('start', RoomType.START, 'circle', this.config.roomSize),
    };
    
    this.rooms.push(startRoom);
    this.grid[this.startX][this.startZ] = startRoom;
    
    console.log('SimpleMapGenerator: Created start room with ID:', startRoom.id);
  }

  private generateRooms(): void {
    const maxRooms = this.config.minRooms + Math.floor(Math.random() * (this.config.maxRooms - this.config.minRooms));
    const directions = [
      { dx: 0, dz: -1 }, { dx: 0, dz: 1 },
      { dx: -1, dz: 0 }, { dx: 1, dz: 0 }
    ];
    
    let attempts = 0;
    const maxAttempts = maxRooms * 10;
    
    while (this.rooms.length < maxRooms && attempts < maxAttempts) {
      attempts++;
      
      // Pick a random existing room to branch from
      const sourceRoom = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      const sourceGridPos = this.getGridPosition(sourceRoom.position);
      
      // Pick a random direction
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const newX = sourceGridPos.x + direction.dx;
      const newZ = sourceGridPos.z + direction.dz;
      
      // Check if position is valid and empty
      if (newX >= 0 && newX < this.gridSize && 
          newZ >= 0 && newZ < this.gridSize && 
          !this.grid[newX][newZ]) {
        
        // Optionally insert a corridor (liminal space) between rooms
        const useCorridor = this.config.useLiminalSpaces && Math.random() < (this.config.corridorChance ?? 0.5);
        if (useCorridor) {
          const corridor = this.createRoomAt(newX, newZ, RoomType.CORRIDOR);
          this.connectRooms(sourceRoom, corridor);
          console.log(`SimpleMapGenerator: Inserted corridor ${corridor.id} from ${sourceRoom.id}`);

          // Attempt to place the target room one tile beyond the corridor
          const targetX = newX + direction.dx;
          const targetZ = newZ + direction.dz;
          if (
            targetX >= 0 && targetX < this.gridSize &&
            targetZ >= 0 && targetZ < this.gridSize &&
            !this.grid[targetX][targetZ]
          ) {
            const targetType = this.getRandomRoomType();
            const targetRoom = this.createRoomAt(targetX, targetZ, targetType);
            this.connectRooms(corridor, targetRoom);
            console.log(`SimpleMapGenerator: Corridor ${corridor.id} to target ${targetRoom.id}`);

            // Corridor run extension
            if (Math.random() < (this.config.corridorRunChance ?? 0.4)) {
              const runLen = 1 + Math.floor(Math.random() * 3); // +1..+3
              let lastX = targetX;
              let lastZ = targetZ;
              for (let r = 0; r < runLen; r++) {
                const nx = lastX + direction.dx;
                const nz = lastZ + direction.dz;
                if (nx < 0 || nx >= this.gridSize || nz < 0 || nz >= this.gridSize || this.grid[nx][nz]) break;
                const seg = this.createRoomAt(nx, nz, RoomType.CORRIDOR);
                this.connectRooms(this.grid[lastX][lastZ] as Room, seg);
                // Optional cul-de-sac side room
                if (Math.random() < (this.config.culDeSacChance ?? 0.35)) {
                  const side = Math.random() < 0.5 ? { dx: direction.dz, dz: -direction.dx } : { dx: -direction.dz, dz: direction.dx };
                  const sx = nx + side.dx;
                  const sz = nz + side.dz;
                  if (sx >= 0 && sx < this.gridSize && sz >= 0 && sz < this.gridSize && !this.grid[sx][sz]) {
                    const sideType = this.getRandomRoomType();
                    const sideRoom = this.createRoomAt(sx, sz, sideType);
                    this.connectRooms(seg, sideRoom);
                  }
                }
                lastX = nx;
                lastZ = nz;
              }
            }
          }
        } else {
          // Optionally create a multi-tile room occupying multiple cells
          const useMulti = this.config.useMultiTileRooms && Math.random() < (this.config.multiTileChance ?? 0.35);
          if (useMulti) {
            // Prefer hub/atrium occasionally
            const pattern = Math.random() < (this.config.hubChance ?? 0.15) ? (Math.random() < 0.5 ? 'plus' : 'block') : this.pickMultiTilePattern();
            const tiles = this.computePatternTiles(newX, newZ, direction, pattern);
            // Validate all tiles are in-bounds and empty
            const valid = tiles.every(({ x, z }) => x >= 0 && x < this.gridSize && z >= 0 && z < this.gridSize && !this.grid[x][z]);
            if (valid) {
              const roomType = this.getRandomRoomType();
              const baseRoom = this.createRoomAt(newX, newZ, roomType);
              baseRoom.isMultiTile = true;
              baseRoom.tilePositions = tiles.map(({ x, z }) => ({
                x: (x - this.startX) * this.config.roomSize,
                z: (z - this.startZ) * this.config.roomSize,
              }));
              // Mark additional tiles in grid to reference the same room
              tiles.forEach(({ x, z }) => {
                this.grid[x][z] = baseRoom;
              });
              this.connectRooms(sourceRoom, baseRoom);
              console.log(`SimpleMapGenerator: Created multi-tile room ${baseRoom.id} with ${tiles.length} segments`);
            } else {
              const roomType = this.getRandomRoomType();
              const newRoom = this.createRoomAt(newX, newZ, roomType);
              this.connectRooms(sourceRoom, newRoom);
              console.log(`SimpleMapGenerator: Connected ${sourceRoom.id} to ${newRoom.id}`);
            }
          } else {
            const roomType = this.getRandomRoomType();
            const newRoom = this.createRoomAt(newX, newZ, roomType);
            // Connect to source room
            this.connectRooms(sourceRoom, newRoom);
            console.log(`SimpleMapGenerator: Connected ${sourceRoom.id} to ${newRoom.id}`);
          }
        }
      }
    }
  }

  private pickMultiTilePattern(): 'line' | 'L' | 'T' | 'plus' | 'block' {
    const patterns: Array<'line' | 'L' | 'T' | 'plus' | 'block'> = ['line', 'L', 'T', 'plus', 'block'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private computePatternTiles(
    startX: number,
    startZ: number,
    dir: { dx: number; dz: number },
    pattern: 'line' | 'L' | 'T' | 'plus' | 'block'
  ): Array<{ x: number; z: number }> {
    const tiles: Array<{ x: number; z: number }> = [{ x: startX, z: startZ }];
    const maxSeg = Math.max(2, Math.min(this.config.multiTileMaxSegments ?? 4, 6));

    if (pattern === 'line') {
      const len = 1 + Math.floor(Math.random() * (maxSeg - 1));
      for (let i = 1; i <= len; i++) tiles.push({ x: startX + dir.dx * i, z: startZ + dir.dz * i });
      return tiles;
    }

    const perp = { dx: dir.dz, dz: dir.dx }; // simple perpendicular (swap)

    if (pattern === 'L') {
      tiles.push({ x: startX + dir.dx, z: startZ + dir.dz });
      tiles.push({ x: startX + dir.dx + perp.dx, z: startZ + dir.dz + perp.dz });
      return tiles;
    }

    if (pattern === 'T') {
      tiles.push({ x: startX + perp.dx, z: startZ + perp.dz });
      tiles.push({ x: startX, z: startZ });
      tiles.push({ x: startX - perp.dx, z: startZ - perp.dz });
      tiles.push({ x: startX + dir.dx, z: startZ + dir.dz });
      return tiles;
    }

    if (pattern === 'plus') {
      tiles.push({ x: startX + 1, z: startZ });
      tiles.push({ x: startX - 1, z: startZ });
      tiles.push({ x: startX, z: startZ + 1 });
      tiles.push({ x: startX, z: startZ - 1 });
      return tiles;
    }

    // block (2x2)
    tiles.push({ x: startX + 1, z: startZ });
    tiles.push({ x: startX, z: startZ + 1 });
    tiles.push({ x: startX + 1, z: startZ + 1 });
    return tiles;
  }

  private addShapedRooms(): void {
    if (!this.config.useShapedRooms) return;
    
    this.rooms.forEach(room => {
      if (Math.random() < this.config.shapeChance) {
        const shapes: Array<Room['shape']> = ['circle', 'triangle', 'hexagon', 'octagon', 'diamond'];
        room.shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // Adjust size for different shapes
        switch (room.shape) {
          case 'circle':
            room.width = room.size;
            room.height = room.size;
            break;
          case 'triangle':
            room.width = room.size * 0.8;
            room.height = room.size * 0.8;
            break;
          case 'hexagon':
            room.width = room.size * 1.2;
            room.height = room.size * 1.1;
            break;
          case 'diamond':
            room.width = room.size * 1.3;
            room.height = room.size * 1.3;
            break;
        }
      }
    });
  }

  private addPortals(): void {
    if (!this.config.usePortals) return;
    
    const portalCount = Math.floor(this.rooms.length * this.config.portalChance);
    
    for (let i = 0; i < portalCount; i++) {
      const room = this.rooms[Math.floor(Math.random() * this.rooms.length)];
      if (!room.isPortal && room.type !== RoomType.START && room.type !== RoomType.END) {
        room.isPortal = true;
        room.type = RoomType.PORTAL;
        room.portalDestination = this.findPortalDestination(room);
        room.theme = 'mystical';
        room.lighting = 'mystical';
        room.items = this.getItemsForRoomType(RoomType.PORTAL);
        room.specialProperties = this.getSpecialPropertiesForRoomType(RoomType.PORTAL);
      }
    }
  }

  private ensureConnectivity(): void {
    console.log('🔗 SimpleMapGenerator: Starting connectivity check...');
    
    const visited = new Set<string>();
    const queue = [this.rooms[0].id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      const currentRoom = this.rooms.find(r => r.id === currentId)!;
      
      for (const connectedId of currentRoom.connections) {
        if (!visited.has(connectedId)) {
          queue.push(connectedId);
        }
      }
    }
    
    console.log(`SimpleMapGenerator: Visited ${visited.size} rooms during connectivity check`);
    
    // Connect unvisited rooms with enhanced connection types
    const unvisited = this.rooms.filter(r => !visited.has(r.id));
    console.log(`SimpleMapGenerator: Found ${unvisited.length} unvisited rooms`);
    
    for (const room of unvisited) {
      const closestRoom = this.rooms
        .filter(r => visited.has(r.id))
        .reduce((closest, current) => {
          const roomDist = Math.abs(room.position.x - current.position.x) + Math.abs(room.position.z - current.position.z);
          const closestDist = Math.abs(room.position.x - closest.position.x) + Math.abs(room.position.z - closest.position.z);
          return roomDist < closestDist ? current : closest;
        });
      
      // Determine connection type based on room properties
      const connectionType = this.determineConnectionType(room, closestRoom);
      
      if (!room.connections.includes(closestRoom.id)) {
        room.connections.push(closestRoom.id);
        console.log(`SimpleMapGenerator: Connected unvisited room ${room.id} to ${closestRoom.id} (${connectionType})`);
      }
      if (!closestRoom.connections.includes(room.id)) {
        closestRoom.connections.push(room.id);
        console.log(`SimpleMapGenerator: Connected ${closestRoom.id} to unvisited room ${room.id} (${connectionType})`);
      }
      
      // Update entry points for the connection
      this.updateEntryPointsForConnection(room, closestRoom, connectionType);
      
      visited.add(room.id);
    }
    
    // Final connectivity check
    const startRoom = this.rooms[0];
    console.log(`SimpleMapGenerator: Final start room connections:`, startRoom.connections);
    
    // Log final connectivity statistics
    const totalConnections = this.rooms.reduce((sum, room) => sum + room.connections.length, 0);
    const avgConnections = totalConnections / this.rooms.length;
    console.log(`SimpleMapGenerator: Average connections per room: ${avgConnections.toFixed(2)}`);
  }

  private getGridPosition(position: Position): Position {
    return {
      x: Math.round(position.x / this.config.roomSize) + this.startX,
      z: Math.round(position.z / this.config.roomSize) + this.startZ
    };
  }

  private determineConnectionType(room1: Room, room2: Room): 'door' | 'breakable_wall' | 'portal' | 'corridor' {
    const room1Type = room1.type.toLowerCase();
    const room2Type = room2.type.toLowerCase();
    
    // Portal connections for mystical or special rooms
    if (room1Type.includes('portal') || room2Type.includes('portal') ||
        room1Type.includes('mystical') || room2Type.includes('mystical') ||
        room1.theme === 'mystical' || room2.theme === 'mystical') {
      return 'portal';
    }
    
    // Breakable wall for dungeon or challenging rooms
    if (room1Type.includes('dungeon') || room2Type.includes('dungeon') ||
        room1Type.includes('challenge') || room2Type.includes('challenge') ||
        room1Type.includes('boss') || room2Type.includes('boss') ||
        room1.theme === 'dungeon' || room2.theme === 'dungeon') {
      return 'breakable_wall';
    }
    
    // Corridor for connecting different areas
    if (room1Type.includes('corridor') || room2Type.includes('corridor')) {
      return 'corridor';
    }
    
    // Default to door
    return 'door';
  }

  private updateEntryPointsForConnection(
    room1: Room, 
    room2: Room, 
    connectionType: 'door' | 'breakable_wall' | 'portal' | 'corridor'
  ): void {
    if (!room1.entryPoints || !room2.entryPoints) return;
    
    const direction = this.getDirectionBetweenRooms(room1, room2);
    const oppositeDirection = getOppositeDirection(direction);
    
    // Find entry points in the correct directions
    const room1Entry = room1.entryPoints.find(ep => ep.direction === direction);
    const room2Entry = room2.entryPoints.find(ep => ep.direction === oppositeDirection);
    
    if (room1Entry && room2Entry) {
      // Connect the entry points
      connectEntryPoints(room1Entry, room2Entry);
      
      // Set the connection type
      const entryType = connectionType === 'breakable_wall' ? 'door' : 
                       connectionType === 'portal' ? 'portal' : 'door';
      
      room1Entry.type = entryType;
      room2Entry.type = entryType;
      
      console.log(`SimpleMapGenerator: Updated entry points for ${room1.id} <-> ${room2.id} (${connectionType})`);
    }
  }

  private getDirectionBetweenRooms(room1: Room, room2: Room): EntryDirection {
    const dx = room2.position.x - room1.position.x;
    const dz = room2.position.z - room1.position.z;
    
    if (Math.abs(dx) > Math.abs(dz)) {
      return dx > 0 ? 'east' : 'west';
    } else {
      return dz > 0 ? 'south' : 'north';
    }
  }

  private createRoomAt(x: number, z: number, type: string): Room {
    // Random visual scale for room footprint (does not affect grid connectivity)
    const scale = 0.85 + Math.random() * 0.5; // 0.85x - 1.35x

    // Pick base dims by type, then jitter by scale
    const dims = this.getDimensionsForType(type, this.config.roomSize);
    const width = dims.width * scale;
    const height = dims.height * scale;

    const roomId = `room_${this.roomIdCounter++}`;
    
    // Assign default shape by type if applicable
    const typeShape = this.getShapeForType(type);
    const shape = typeShape || 'square';

    const room: Room = {
      id: roomId,
      position: { x: (x - this.startX) * this.config.roomSize, z: (z - this.startZ) * this.config.roomSize },
      type,
      connections: [],
      size: this.config.roomSize,
      isVisited: false,
      isCurrent: false,
      // Visual sizing (used by renderer overlays)
      width,
      height,
      items: this.getItemsForRoomType(type),
      specialProperties: this.getSpecialPropertiesForRoomType(type),
      shape: shape as any,
      // Generate entry points based on room shape and type
      entryPoints: generateEntryPoints(roomId, type, shape, this.config.roomSize),
    };
    
    this.rooms.push(room);
    this.grid[x][z] = room;
    return room;
  }

  private getDimensionsForType(
    type: string,
    base: number
  ): { width: number; height: number } {
    switch (type) {
      case RoomType.CORRIDOR:
        return { width: base * 0.5, height: base * 1.0 };
      case RoomType.COLOSSEUM:
      case RoomType.ARENA:
      case RoomType.BOSS:
        return { width: base * 1.6, height: base * 1.6 };
      case RoomType.TREASURE:
      case RoomType.SECRET:
        return { width: base * 0.8, height: base * 0.8 };
      case RoomType.LIBRARY:
      case RoomType.LIBRARY_UPGRADE:
      case RoomType.SHRINE:
        return { width: base * 1.2, height: base * 1.2 };
      case RoomType.SHOP:
      case RoomType.COFFEE:
        return { width: base, height: base };
      case RoomType.MEDITATION:
        return { width: base * 1.0, height: base * 1.0 };
      default:
        return { width: base, height: base };
    }
  }

  private getShapeForType(type: string): Room['shape'] | null {
    switch (type) {
      case RoomType.COLOSSEUM:
      case RoomType.ARENA:
      case RoomType.PORTAL:
      case RoomType.MEDITATION:
        return 'circle';
      case RoomType.BOSS:
        return 'octagon';
      case RoomType.LIBRARY:
        return 'hexagon';
      case RoomType.SECRET:
        return 'diamond';
      case RoomType.CORRIDOR:
        return 'square';
      default:
        return null;
    }
  }

  private connectRooms(room1: Room, room2: Room): void {
    // Add to connections list (for backward compatibility)
    if (!room1.connections.includes(room2.id)) {
      room1.connections.push(room2.id);
    }
    if (!room2.connections.includes(room1.id)) {
      room2.connections.push(room1.id);
    }

    // Connect via entry points for proper alignment
    const room1GridPos = this.getGridPosition(room1.position);
    const room2GridPos = this.getGridPosition(room2.position);
    
    // Determine the direction from room1 to room2
    const directionToRoom2 = getDirectionBetweenRooms(
      room1GridPos.x,
      room1GridPos.z,
      room2GridPos.x,
      room2GridPos.z
    );

    if (directionToRoom2 && room1.entryPoints && room2.entryPoints) {
      // Find available entry point in room1 facing room2
      const room1Entry = findAvailableEntryPoint(room1, directionToRoom2);
      
      // Find available entry point in room2 facing room1 (opposite direction)
      const oppositeDirection = getOppositeDirection(directionToRoom2);
      const room2Entry = findAvailableEntryPoint(room2, oppositeDirection);

      // Connect the entry points if both are available
      if (room1Entry && room2Entry) {
        connectEntryPoints(room1Entry, room2Entry);
        console.log(
          `Connected entry points: ${room1.id}[${directionToRoom2}] <-> ${room2.id}[${oppositeDirection}]`
        );
      }
    }
  }

  private getRandomRoomType(): string {
    const weights = this.config.roomTypeWeights || {};
    const pool: Array<{ t: string; w: number }> = [
      RoomType.NORMAL,
      RoomType.TREASURE,
      RoomType.SHOP,
      RoomType.PUZZLE,
      RoomType.SECRET,
      RoomType.LIBRARY,
      RoomType.BENCH_PRESS,
      RoomType.COFFEE,
      RoomType.LIBRARY_UPGRADE,
      RoomType.MEDITATION,
      RoomType.PORTAL,
      RoomType.ARENA,
      RoomType.CORRIDOR,
      RoomType.COLOSSEUM,
      RoomType.BOSS,
      RoomType.TRAP,
    ].map((t) => ({ t, w: Math.max(0.0001, weights[t] ?? 0.2) }));
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    for (const p of pool) {
      if ((r -= p.w) <= 0) return p.t;
    }
    return RoomType.NORMAL;
  }

  private findPortalDestination(room: Room): string {
    const otherRooms = this.rooms.filter(r => r.id !== room.id && !r.isPortal);
    if (otherRooms.length === 0) return room.id;
    
    return otherRooms[Math.floor(Math.random() * otherRooms.length)].id;
  }

  private createEndRoom(): Room {
    const endRoomId = `room_end_${Date.now()}`;
    const endRoom: Room = {
      id: endRoomId,
      position: { x: 0, z: this.config.roomSize * 3 },
      type: RoomType.END,
      connections: [],
      size: this.config.roomSize,
      isVisited: false,
      isCurrent: false,
      items: this.getItemsForRoomType(RoomType.END),
      specialProperties: this.getSpecialPropertiesForRoomType(RoomType.END),
      // Generate entry points for end room
      entryPoints: generateEntryPoints(endRoomId, RoomType.END, 'square', this.config.roomSize),
    };
    
    this.rooms.push(endRoom);
    
    // Connect to nearest room
    const nearestRoom = this.rooms
      .filter(r => r.id !== endRoom.id)
      .reduce((nearest, current) => {
        const endDist = Math.abs(endRoom.position.x - current.position.x) + Math.abs(endRoom.position.z - current.position.z);
        const nearestDist = Math.abs(endRoom.position.x - nearest.position.x) + Math.abs(endRoom.position.z - nearest.position.z);
        return endDist < nearestDist ? current : nearest;
      });
    
    this.connectRooms(endRoom, nearestRoom);
    return endRoom;
  }

  private getItemsForRoomType(roomType: string): Item[] {
    switch (roomType) {
      case RoomType.TREASURE:
        return [
          this.createItem('treasure-coin', 'Gold Coin', 'A shiny gold coin', 'consumable', 'common', 10, [{ type: 'points', value: 10, description: '+10 points' }], '🪙'),
          this.createItem('treasure-gem', 'Ruby', 'A precious red gem', 'consumable', 'rare', 50, [{ type: 'points', value: 50, description: '+50 points' }], '💎')
        ];
      case RoomType.PORTAL:
        return [
          this.createItem('portal-energy', 'Portal Energy', 'Mystical energy from the portal', 'consumable', 'rare', 100, [{ type: 'points', value: 100, description: '+100 points' }], '🌌')
        ];
      case RoomType.ARENA:
        return [
          this.createItem('arena-trophy', 'Arena Trophy', 'A trophy from arena victory', 'consumable', 'epic', 200, [{ type: 'points', value: 200, description: '+200 points' }], '🏆')
        ];
      default:
        return [];
    }
  }

  private createItem(
    id: string, 
    name: string, 
    description: string, 
    type: Item['type'], 
    rarity: Item['rarity'], 
    cost: number, 
    effects: ItemEffect[], 
    icon: string
  ): Item {
    return {
      id,
      name,
      description,
      type,
      rarity,
      cost,
      effects,
      icon
    };
  }

  private getSpecialPropertiesForRoomType(roomType: string): Record<string, unknown> {
    switch (roomType) {
      case RoomType.PORTAL:
        return { isPortal: true, teleportation: true };
      case RoomType.ARENA:
        return { isArena: true, combat: true };
      case RoomType.TREASURE:
        return { hasTreasure: true, lootable: true };
      default:
        return {};
    }
  }

  private assignThemes(): void {
    const centerX = 0;
    const centerZ = 0;
    const maxDist = this.config.roomSize * (this.gridSize / 2);
    this.rooms.forEach((room) => {
      const dx = room.position.x - centerX;
      const dz = room.position.z - centerZ;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const norm = Math.min(1, dist / maxDist);
      if (norm < 0.33) {
        room.theme = 'sanctuary';
        room.lighting = 'bright';
      } else if (norm < 0.66) {
        room.theme = 'dungeon';
        room.lighting = 'dim';
      } else {
        room.theme = 'forge';
        room.lighting = 'dark';
      }
    });
  }
}

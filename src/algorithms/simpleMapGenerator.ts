import type { Room, Position, MapConfig, Item, ItemEffect } from '../types/map';
import { RoomType } from '../types/map';

export interface SimpleMapConfig extends MapConfig {
  useShapedRooms: boolean;
  usePortals: boolean;
  shapeChance: number;
  portalChance: number;
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
    this.ensureConnectivity();
    
    const endRoom = this.rooms.find(room => room.type === RoomType.END) || this.createEndRoom();
    
    return {
      rooms: this.rooms,
      startRoomId: this.rooms[0].id,
      endRoomId: endRoom.id
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
    };
    
    this.rooms.push(startRoom);
    this.grid[this.startX][this.startZ] = startRoom;
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
        
        const roomType = this.getRandomRoomType();
        const newRoom = this.createRoomAt(newX, newZ, roomType);
        
        // Connect to source room
        this.connectRooms(sourceRoom, newRoom);
      }
    }
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
    
    // Connect unvisited rooms
    const unvisited = this.rooms.filter(r => !visited.has(r.id));
    for (const room of unvisited) {
      const closestRoom = this.rooms
        .filter(r => visited.has(r.id))
        .reduce((closest, current) => {
          const roomDist = Math.abs(room.position.x - current.position.x) + Math.abs(room.position.z - current.position.z);
          const closestDist = Math.abs(room.position.x - closest.position.x) + Math.abs(room.position.z - closest.position.z);
          return roomDist < closestDist ? current : closest;
        });
      
      if (!room.connections.includes(closestRoom.id)) {
        room.connections.push(closestRoom.id);
      }
      if (!closestRoom.connections.includes(room.id)) {
        closestRoom.connections.push(room.id);
      }
      visited.add(room.id);
    }
  }

  private getGridPosition(position: Position): Position {
    return {
      x: Math.round(position.x / this.config.roomSize) + this.startX,
      z: Math.round(position.z / this.config.roomSize) + this.startZ
    };
  }

  private createRoomAt(x: number, z: number, type: string): Room {
    // Random visual scale for room footprint (does not affect grid connectivity)
    const scale = 0.8 + Math.random() * 0.7; // 0.8x - 1.5x

    const room: Room = {
      id: `room_${this.roomIdCounter++}`,
      position: { x: (x - this.startX) * this.config.roomSize, z: (z - this.startZ) * this.config.roomSize },
      type,
      connections: [],
      size: this.config.roomSize,
      isVisited: false,
      isCurrent: false,
      // Visual sizing (used by renderer floor/walls overlay)
      width: this.config.roomSize * scale,
      height: this.config.roomSize * scale,
      items: this.getItemsForRoomType(type),
      specialProperties: this.getSpecialPropertiesForRoomType(type),
    };
    
    this.rooms.push(room);
    this.grid[x][z] = room;
    return room;
  }

  private connectRooms(room1: Room, room2: Room): void {
    if (!room1.connections.includes(room2.id)) {
      room1.connections.push(room2.id);
    }
    if (!room2.connections.includes(room1.id)) {
      room2.connections.push(room1.id);
    }
  }

  private getRandomRoomType(): string {
    // Whitelist types we render or handle explicitly
    const types = [
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
      RoomType.BOSS,
      RoomType.TRAP,
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private findPortalDestination(room: Room): string {
    const otherRooms = this.rooms.filter(r => r.id !== room.id && !r.isPortal);
    if (otherRooms.length === 0) return room.id;
    
    return otherRooms[Math.floor(Math.random() * otherRooms.length)].id;
  }

  private createEndRoom(): Room {
    const endRoom: Room = {
      id: `room_end_${Date.now()}`,
      position: { x: 0, z: this.config.roomSize * 3 },
      type: RoomType.END,
      connections: [],
      size: this.config.roomSize,
      isVisited: false,
      isCurrent: false,
      items: this.getItemsForRoomType(RoomType.END),
      specialProperties: this.getSpecialPropertiesForRoomType(RoomType.END),
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
}

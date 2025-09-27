import type { BasePrototype, Action } from './PrototypeSystem';
import { BasePrototypeClass, createCustomAction } from './PrototypeSystem';

// Extended prototype types for game objects
export interface GameObjectPrototype extends BasePrototype {
  objectType: 'tile' | 'wall' | 'stair' | 'door' | 'furniture' | 'decoration' | 'interactive';
  roomId?: string;
  parentId?: string;
  children: string[]; // IDs of child objects
  isVisible: boolean;
  isInteractive: boolean;
  physics: {
    enabled: boolean;
    mass: number;
    velocity: [number, number, number];
    acceleration: [number, number, number];
    friction: number;
    bounce: number;
  };
  collision: {
    enabled: boolean;
    shape: 'box' | 'sphere' | 'cylinder' | 'mesh';
    size: [number, number, number];
  };
}

// Room prototype that can manage child objects
export interface RoomPrototype extends BasePrototype {
  roomType: 'start' | 'puzzle' | 'enemy' | 'treasure' | 'boss' | 'custom';
  children: string[]; // IDs of all objects in this room
  bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  spawnPoints: [number, number, number][];
  exits: {
    direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
    position: [number, number, number];
    targetRoomId?: string;
  }[];
}

// Base game object prototype class
export class GameObjectPrototypeClass extends BasePrototypeClass implements GameObjectPrototype {
  public objectType: 'tile' | 'wall' | 'stair' | 'door' | 'furniture' | 'decoration' | 'interactive';
  public roomId?: string;
  public parentId?: string;
  public children: string[] = [];
  public isVisible: boolean = true;
  public isInteractive: boolean = false;
  public physics: {
    enabled: boolean;
    mass: number;
    velocity: [number, number, number];
    acceleration: [number, number, number];
    friction: number;
    bounce: number;
  };
  public collision: {
    enabled: boolean;
    shape: 'box' | 'sphere' | 'cylinder' | 'mesh';
    size: [number, number, number];
  };

  constructor(config: Partial<GameObjectPrototype> = {}) {
    super(config);
    this.type = 'game-object';
    this.objectType = config.objectType || 'tile';
    this.roomId = config.roomId;
    this.parentId = config.parentId;
    this.children = config.children || [];
    this.isVisible = config.isVisible ?? true;
    this.isInteractive = config.isInteractive ?? false;
    this.physics = config.physics || {
      enabled: false,
      mass: 1.0,
      velocity: [0, 0, 0],
      acceleration: [0, 0, 0],
      friction: 0.9,
      bounce: 0.8,
    };
    this.collision = config.collision || {
      enabled: true,
      shape: 'box',
      size: [1, 1, 1],
    };
    
    this.addGameObjectActions();
  }

  private addGameObjectActions(): void {
    // Visibility actions
    this.addAction(createCustomAction(
      'toggle-visibility',
      'Toggle Visibility',
      'Show/hide this object',
      '👁️',
      (target) => {
        (target as GameObjectPrototypeClass).isVisible = !(target as GameObjectPrototypeClass).isVisible;
        console.log(`Visibility toggled for ${target.id}: ${(target as GameObjectPrototypeClass).isVisible}`);
      }
    ));

    // Interaction actions
    this.addAction(createCustomAction(
      'toggle-interaction',
      'Toggle Interaction',
      'Enable/disable interaction',
      '👆',
      (target) => {
        (target as GameObjectPrototypeClass).isInteractive = !(target as GameObjectPrototypeClass).isInteractive;
        console.log(`Interaction toggled for ${target.id}: ${(target as GameObjectPrototypeClass).isInteractive}`);
      }
    ));

    // Physics actions
    this.addAction(createCustomAction(
      'toggle-physics',
      'Toggle Physics',
      'Enable/disable physics',
      '⚡',
      (target) => {
        (target as GameObjectPrototypeClass).physics.enabled = !(target as GameObjectPrototypeClass).physics.enabled;
        console.log(`Physics toggled for ${target.id}: ${(target as GameObjectPrototypeClass).physics.enabled}`);
      }
    ));

    // Collision actions
    this.addAction(createCustomAction(
      'toggle-collision',
      'Toggle Collision',
      'Enable/disable collision',
      '🛡️',
      (target) => {
        (target as GameObjectPrototypeClass).collision.enabled = !(target as GameObjectPrototypeClass).collision.enabled;
        console.log(`Collision toggled for ${target.id}: ${(target as GameObjectPrototypeClass).collision.enabled}`);
      }
    ));

    // Move to room action
    this.addAction(createCustomAction(
      'move-to-room',
      'Move to Room',
      'Move this object to another room',
      '🚪',
      (target, context) => {
        if (context && typeof context === 'object' && 'roomId' in context) {
          (target as GameObjectPrototypeClass).roomId = context.roomId as string;
          console.log(`Moved ${target.id} to room ${context.roomId}`);
        }
      }
    ));

    // Duplicate action
    this.addAction(createCustomAction(
      'duplicate',
      'Duplicate',
      'Create a copy of this object',
      '📋',
      (target, context) => {
        if (context && typeof context === 'object' && 'onDuplicate' in context) {
          const clone = (target as GameObjectPrototypeClass).clone();
          clone.position = [
            target.position[0] + 1,
            target.position[1] + 1,
            target.position[2]
          ];
          (context.onDuplicate as (clone: GameObjectPrototypeClass) => void)(clone);
        }
      }
    ));
  }

  // Add child object
  public addChild(childId: string): void {
    if (!this.children.includes(childId)) {
      this.children.push(childId);
    }
  }

  // Remove child object
  public removeChild(childId: string): void {
    this.children = this.children.filter(id => id !== childId);
  }

  // Get all child objects
  public getChildren(): string[] {
    return [...this.children];
  }

  // Check if object is in this room
  public isInRoom(roomId: string): boolean {
    return this.roomId === roomId;
  }

  // Clone with new ID
  public clone(): GameObjectPrototypeClass {
    const cloned = new GameObjectPrototypeClass({
      ...this,
      id: this.generateId(),
      children: [], // Don't copy children references
    });
    return cloned;
  }
}

// Room prototype class
export class RoomPrototypeClass extends BasePrototypeClass implements RoomPrototype {
  public roomType: 'start' | 'puzzle' | 'enemy' | 'treasure' | 'boss' | 'custom';
  public children: string[] = [];
  public bounds: {
    min: [number, number, number];
    max: [number, number, number];
  };
  public spawnPoints: [number, number, number][] = [];
  public exits: {
    direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
    position: [number, number, number];
    targetRoomId?: string;
  }[] = [];

  constructor(config: Partial<RoomPrototype> = {}) {
    super(config);
    this.type = 'room';
    this.roomType = config.roomType || 'custom';
    this.children = config.children || [];
    this.bounds = config.bounds || {
      min: [-10, -10, -10],
      max: [10, 10, 10],
    };
    this.spawnPoints = config.spawnPoints || [];
    this.exits = config.exits || [];
    
    this.addRoomActions();
  }

  private addRoomActions(): void {
    // Add object to room
    this.addAction(createCustomAction(
      'add-object',
      'Add Object',
      'Add an object to this room',
      '➕',
      (target, context) => {
        if (context && typeof context === 'object' && 'objectId' in context) {
          const objectId = context.objectId as string;
          if (!(target as RoomPrototypeClass).children.includes(objectId)) {
            (target as RoomPrototypeClass).children.push(objectId);
            console.log(`Added object ${objectId} to room ${target.id}`);
          }
        }
      }
    ));

    // Remove object from room
    this.addAction(createCustomAction(
      'remove-object',
      'Remove Object',
      'Remove an object from this room',
      '➖',
      (target, context) => {
        if (context && typeof context === 'object' && 'objectId' in context) {
          const objectId = context.objectId as string;
          (target as RoomPrototypeClass).children = (target as RoomPrototypeClass).children.filter(id => id !== objectId);
          console.log(`Removed object ${objectId} from room ${target.id}`);
        }
      }
    ));

    // Get all objects in room
    this.addAction(createCustomAction(
      'list-objects',
      'List Objects',
      'List all objects in this room',
      '📋',
      (target, context) => {
        const room = target as RoomPrototypeClass;
        console.log(`Objects in room ${target.id}:`, room.children);
        if (context && typeof context === 'object' && 'onListObjects' in context) {
          (context.onListObjects as (objects: string[]) => void)(room.children);
        }
      }
    ));

    // Move all objects
    this.addAction(createCustomAction(
      'move-all-objects',
      'Move All Objects',
      'Move all objects in this room',
      '↔️',
      (target, context) => {
        if (context && typeof context === 'object' && 'offset' in context) {
          const offset = context.offset as [number, number, number];
          const room = target as RoomPrototypeClass;
          console.log(`Moving all objects in room ${target.id} by ${offset}`);
          // This would need to be implemented with the prototype manager
        }
      }
    ));

    // Scale all objects
    this.addAction(createCustomAction(
      'scale-all-objects',
      'Scale All Objects',
      'Scale all objects in this room',
      '📏',
      (target, context) => {
        if (context && typeof context === 'object' && 'factor' in context) {
          const factor = context.factor as number;
          const room = target as RoomPrototypeClass;
          console.log(`Scaling all objects in room ${target.id} by factor ${factor}`);
          // This would need to be implemented with the prototype manager
        }
      }
    ));

    // Color all objects
    this.addAction(createCustomAction(
      'color-all-objects',
      'Color All Objects',
      'Change color of all objects in this room',
      '🎨',
      (target, context) => {
        if (context && typeof context === 'object' && 'color' in context) {
          const color = context.color as string;
          const room = target as RoomPrototypeClass;
          console.log(`Coloring all objects in room ${target.id} with ${color}`);
          // This would need to be implemented with the prototype manager
        }
      }
    ));
  }

  // Add object to room
  public addObject(objectId: string): void {
    if (!this.children.includes(objectId)) {
      this.children.push(objectId);
    }
  }

  // Remove object from room
  public removeObject(objectId: string): void {
    this.children = this.children.filter(id => id !== objectId);
  }

  // Get all objects in room
  public getObjects(): string[] {
    return [...this.children];
  }

  // Check if object is in this room
  public hasObject(objectId: string): boolean {
    return this.children.includes(objectId);
  }

  // Get objects by type
  public getObjectsByType(objectType: string): string[] {
    // This would need to be implemented with the prototype manager
    return this.children; // Placeholder
  }

  // Clone room
  public clone(): RoomPrototypeClass {
    const cloned = new RoomPrototypeClass({
      ...this,
      id: this.generateId(),
      children: [], // Don't copy children references
    });
    return cloned;
  }
}

// Universal prototype manager
export class UniversalPrototypeManager {
  private prototypes: Map<string, BasePrototype> = new Map();
  private rooms: Map<string, RoomPrototype> = new Map();
  private gameObjects: Map<string, GameObjectPrototype> = new Map();

  // Register any prototype
  registerPrototype(prototype: BasePrototype): void {
    this.prototypes.set(prototype.id, prototype);
    
    if (prototype.type === 'room') {
      this.rooms.set(prototype.id, prototype as RoomPrototype);
    } else if (prototype.type === 'game-object') {
      this.gameObjects.set(prototype.id, prototype as GameObjectPrototype);
    }
  }

  // Get prototype by ID
  getPrototype(id: string): BasePrototype | undefined {
    return this.prototypes.get(id);
  }

  // Get room by ID
  getRoom(id: string): RoomPrototype | undefined {
    return this.rooms.get(id);
  }

  // Get game object by ID
  getGameObject(id: string): GameObjectPrototype | undefined {
    return this.gameObjects.get(id);
  }

  // Get all prototypes
  getAllPrototypes(): BasePrototype[] {
    return Array.from(this.prototypes.values());
  }

  // Get all rooms
  getAllRooms(): RoomPrototype[] {
    return Array.from(this.rooms.values());
  }

  // Get all game objects
  getAllGameObjects(): GameObjectPrototype[] {
    return Array.from(this.gameObjects.values());
  }

  // Get objects in a room
  getObjectsInRoom(roomId: string): GameObjectPrototype[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    
    return room.children
      .map(id => this.gameObjects.get(id))
      .filter((obj): obj is GameObjectPrototype => obj !== undefined);
  }

  // Move object to room
  moveObjectToRoom(objectId: string, roomId: string): boolean {
    const object = this.gameObjects.get(objectId);
    const room = this.rooms.get(roomId);
    
    if (!object || !room) return false;
    
    // Remove from current room
    if (object.roomId) {
      const currentRoom = this.rooms.get(object.roomId);
      if (currentRoom) {
        currentRoom.removeObject(objectId);
      }
    }
    
    // Add to new room
    object.roomId = roomId;
    room.addObject(objectId);
    
    return true;
  }

  // Execute action on all objects in room
  executeActionInRoom(roomId: string, actionId: string, context?: unknown): void {
    const objects = this.getObjectsInRoom(roomId);
    objects.forEach(obj => {
      if (obj.actions) {
        const action = obj.actions.find(a => a.id === actionId);
        if (action && (!action.canExecute || action.canExecute(obj, context))) {
          action.execute(obj, context);
        }
      }
    });
  }

  // Execute action on all objects of a type
  executeActionOnType(objectType: string, actionId: string, context?: unknown): void {
    const objects = this.getAllGameObjects().filter(obj => obj.objectType === objectType);
    objects.forEach(obj => {
      if (obj.actions) {
        const action = obj.actions.find(a => a.id === actionId);
        if (action && (!action.canExecute || action.canExecute(obj, context))) {
          action.execute(obj, context);
        }
      }
    });
  }
}

// Global universal prototype manager
export const universalPrototypeManager = new UniversalPrototypeManager();

// Factory functions
export const createGameObject = (config: Partial<GameObjectPrototype> = {}): GameObjectPrototypeClass => {
  const obj = new GameObjectPrototypeClass(config);
  universalPrototypeManager.registerPrototype(obj);
  return obj;
};

export const createRoom = (config: Partial<RoomPrototype> = {}): RoomPrototypeClass => {
  const room = new RoomPrototypeClass(config);
  universalPrototypeManager.registerPrototype(room);
  return room;
};

// Utility functions
export const createTile = (position: [number, number, number], roomId?: string): GameObjectPrototypeClass => {
  return createGameObject({
    objectType: 'tile',
    position,
    roomId,
    color: '#8B4513',
    scale: 1,
  });
};

export const createWall = (position: [number, number, number], roomId?: string): GameObjectPrototypeClass => {
  return createGameObject({
    objectType: 'wall',
    position,
    roomId,
    color: '#696969',
    scale: 1,
  });
};

export const createStair = (position: [number, number, number], roomId?: string): GameObjectPrototypeClass => {
  return createGameObject({
    objectType: 'stair',
    position,
    roomId,
    color: '#A0522D',
    scale: 1,
  });
};

export const createDoor = (position: [number, number, number], roomId?: string): GameObjectPrototypeClass => {
  return createGameObject({
    objectType: 'door',
    position,
    roomId,
    color: '#8B4513',
    scale: 1,
    isInteractive: true,
  });
};

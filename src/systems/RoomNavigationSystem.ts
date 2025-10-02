import { BrowserEventEmitter } from '../utils/BrowserEventEmitter';
import * as THREE from 'three';
import type { Room } from '../types/map';

export interface RoomTransition {
  fromRoomId: string | null;
  toRoomId: string;
  direction: 'north' | 'south' | 'east' | 'west';
  startTime: number;
  duration: number;
  progress: number;
}

export interface DoorInfo {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  direction: 'north' | 'south' | 'east' | 'west';
  isLocked: boolean;
  keyRequired?: string;
  isVisible: boolean;
  style?: 'wooden' | 'metal' | 'stone' | 'medieval' | 'modern';
}

export interface NavigationState {
  currentRoomId: string | null;
  previousRoomId: string | null;
  roomHistory: string[];
  isTransitioning: boolean;
  transition: RoomTransition | null;
  doors: Map<string, DoorInfo>;
  roomInstances: Map<string, Room>;
}

export class RoomNavigationSystem extends BrowserEventEmitter {
  private state: NavigationState = {
    currentRoomId: null,
    previousRoomId: null,
    roomHistory: [],
    isTransitioning: false,
    transition: null,
    doors: new Map(),
    roomInstances: new Map(),
  };

  private roomBounds: Map<string, THREE.Box3> = new Map();
  private transitionDuration = 1000; // 1 second transition
  private maxHistorySize = 10;
  private defaultDoorStyle: 'wooden' | 'metal' | 'stone' | 'medieval' | 'modern' = 'wooden';

  // Initialize the navigation system
  initialize(rooms: Room[], startRoomId: string): void {
    this.state.roomInstances.clear();
    this.roomBounds.clear();
    
    // Store room instances
    rooms.forEach(room => {
      this.state.roomInstances.set(room.id, room);
      this.calculateRoomBounds(room);
    });

    // Set start room
    this.setCurrentRoom(startRoomId);
    this.emit('initialized', { startRoomId, roomCount: rooms.length });
  }

  // Calculate room bounds for collision detection
  private calculateRoomBounds(room: Room): void {
    const roomSize = room.size || 10;
    const halfSize = roomSize / 2;
    
    const bounds = new THREE.Box3(
      new THREE.Vector3(
        room.position.x - halfSize,
        room.position.y - 2,
        room.position.z - halfSize
      ),
      new THREE.Vector3(
        room.position.x + halfSize,
        room.position.y + 4,
        room.position.z + halfSize
      )
    );
    
    this.roomBounds.set(room.id, bounds);
  }

  // Set current room (internal method)
  private setCurrentRoom(roomId: string): void {
    if (this.state.currentRoomId === roomId) {
      return;
    }

    this.state.previousRoomId = this.state.currentRoomId;
    this.state.currentRoomId = roomId;

    // Add to history
    if (this.state.previousRoomId) {
      this.state.roomHistory.unshift(this.state.previousRoomId);
      if (this.state.roomHistory.length > this.maxHistorySize) {
        this.state.roomHistory.pop();
      }
    }

    this.updateDoors();
    this.emit('roomChanged', { 
      currentRoomId: roomId, 
      previousRoomId: this.state.previousRoomId 
    });
  }

  // Update doors for current room
  private updateDoors(): void {
    this.state.doors.clear();
    
    const currentRoom = this.state.currentRoomId 
      ? this.state.roomInstances.get(this.state.currentRoomId)
      : null;

    if (!currentRoom) {
      console.warn('RoomNavigationSystem: No current room found for door update');
      return;
    }

    console.log(`🚪 RoomNavigationSystem: Updating doors for room ${currentRoom.id}`, {
      connections: currentRoom.connections,
      connectionsLength: currentRoom.connections?.length || 0,
      roomSize: currentRoom.size,
      position: currentRoom.position
    });

    const roomSize = currentRoom.size || 10;
    const halfSize = roomSize / 2;

    // Calculate door positions for each connection
    if (currentRoom.connections && currentRoom.connections.length > 0) {
      currentRoom.connections.forEach((targetRoomId, index) => {
        const targetRoom = this.state.roomInstances.get(targetRoomId);
        if (!targetRoom) {
          console.warn(`RoomNavigationSystem: Target room ${targetRoomId} not found`);
          return;
        }

        // Use the room-instance aware direction calculation
        const direction = this.calculateDoorDirectionForInstance(currentRoom, targetRoom, index);
        const doorInfo = this.calculateDoorInfo(currentRoom, targetRoom, direction, index);
        
        console.log(`RoomNavigationSystem: Created door ${doorInfo.id} -> ${targetRoomId} (${direction})`, {
          position: doorInfo.position,
          rotation: doorInfo.rotation,
          targetRoomId: doorInfo.targetRoomId
        });
        this.state.doors.set(doorInfo.id, doorInfo);
      });
    } else {
      console.warn(`RoomNavigationSystem: Room ${currentRoom.id} has no connections!`);
    }

    console.log(`RoomNavigationSystem: Updated ${this.state.doors.size} doors for room ${currentRoom.id}`);
    this.emit('doorsUpdated', Array.from(this.state.doors.values()));
  }

  // Calculate door direction based on room positions
  private calculateDoorDirection(currentRoom: Room, targetRoom: Room): 'north' | 'south' | 'east' | 'west' {
    const dx = targetRoom.position.x - currentRoom.position.x;
    const dz = targetRoom.position.z - currentRoom.position.z;
    const roomSize = currentRoom.size || 10;

    // Check if rooms are adjacent
    if (Math.abs(dx) === roomSize && Math.abs(dz) === 0) {
      return dx > 0 ? 'east' : 'west';
    }
    if (Math.abs(dz) === roomSize && Math.abs(dx) === 0) {
      return dz > 0 ? 'south' : 'north';
    }

    // Fallback based on relative position
    if (Math.abs(dx) > Math.abs(dz)) {
      return dx > 0 ? 'east' : 'west';
    } else {
      return dz > 0 ? 'south' : 'north';
    }
  }

  // Calculate door direction for room-instance mode (all rooms at origin)
  private calculateDoorDirectionForInstance(currentRoom: Room, targetRoom: Room, connectionIndex: number): 'north' | 'south' | 'east' | 'west' {
    // In room-instance mode, we need to determine door direction based on the connection index
    // or use a more intelligent method based on room connections
    
    // Try to get direction from the original room positions first
    const originalDirection = this.calculateDoorDirection(currentRoom, targetRoom);
    
    // If the original direction makes sense (rooms are adjacent), use it
    const dx = targetRoom.position.x - currentRoom.position.x;
    const dz = targetRoom.position.z - currentRoom.position.z;
    const roomSize = currentRoom.size || 10;
    
    if (Math.abs(dx) === roomSize && Math.abs(dz) === 0) {
      return originalDirection;
    }
    if (Math.abs(dz) === roomSize && Math.abs(dx) === 0) {
      return originalDirection;
    }
    
    // For non-adjacent rooms, use a cycling pattern based on connection index
    const directions: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
    return directions[connectionIndex % directions.length];
  }

  // Calculate door information
  private calculateDoorInfo(
    currentRoom: Room, 
    targetRoom: Room, 
    direction: 'north' | 'south' | 'east' | 'west',
    index: number
  ): DoorInfo {
    const roomSize = currentRoom.size || 10;
    const halfSize = roomSize / 2;
    
    // Simple door positioning - center doors on walls
    let position: [number, number, number];
    let rotation: [number, number, number];

    // Position doors at appropriate height above floor (floor is at y: -0.5, door height is 3, so center is 0.5)
    const doorY = 0.5;

    switch (direction) {
      case 'north':
        position = [0, doorY, -halfSize];
        rotation = [0, 0, 0];
        break;
      case 'south':
        position = [0, doorY, halfSize];
        rotation = [0, Math.PI, 0];
        break;
      case 'east':
        position = [halfSize, doorY, 0];
        rotation = [0, Math.PI / 2, 0];
        break;
      case 'west':
        position = [-halfSize, doorY, 0];
        rotation = [0, -Math.PI / 2, 0];
        break;
    }

    return {
      id: `door_${currentRoom.id}_${targetRoom.id}`,
      position,
      rotation,
      targetRoomId: targetRoom.id,
      direction,
      isLocked: false, // Can be extended for locked doors
      isVisible: true,
      style: this.defaultDoorStyle,
    };
  }

  // Start room transition
  startTransition(toRoomId: string, direction?: 'north' | 'south' | 'east' | 'west'): Promise<void> {
    return new Promise((resolve) => {
      if (this.state.isTransitioning) {
        resolve();
        return;
      }

      if (!this.state.roomInstances.has(toRoomId)) {
        resolve();
        return;
      }

      // Auto-detect direction if not provided
      if (!direction && this.state.currentRoomId) {
        const currentRoom = this.state.roomInstances.get(this.state.currentRoomId);
        const targetRoom = this.state.roomInstances.get(toRoomId);
        if (currentRoom && targetRoom) {
          direction = this.calculateDoorDirection(currentRoom, targetRoom);
        }
      }

      this.state.isTransitioning = true;
      this.state.transition = {
        fromRoomId: this.state.currentRoomId,
        toRoomId,
        direction: direction || 'south',
        startTime: Date.now(),
        duration: this.transitionDuration,
        progress: 0,
      };

      this.emit('transitionStarted', this.state.transition);

      // Animate transition
      this.animateTransition(resolve);
    });
  }

  // Animate transition progress
  private animateTransition(onComplete: () => void): void {
    if (!this.state.transition) return;

    const animate = () => {
      if (!this.state.transition) return;

      const elapsed = Date.now() - this.state.transition.startTime;
      const progress = Math.min(elapsed / this.state.transition.duration, 1);

      this.state.transition.progress = progress;
      this.emit('transitionProgress', progress);

      if (progress >= 1) {
        // Complete transition
        this.completeTransition();
        onComplete();
      } else {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Complete room transition
  private completeTransition(): void {
    if (!this.state.transition) return;

    const { toRoomId } = this.state.transition;
    
    this.setCurrentRoom(toRoomId);
    this.state.isTransitioning = false;
    this.state.transition = null;

    // Ensure doors are updated after transition
    this.updateDoors();

    this.emit('transitionCompleted', { roomId: toRoomId });
  }

  // Navigate to previous room
  goBack(): boolean {
    if (this.state.roomHistory.length === 0) return false;

    const previousRoomId = this.state.roomHistory[0];
    this.state.roomHistory.shift();
    
    this.startTransition(previousRoomId);
    return true;
  }

  // Get current room
  getCurrentRoom(): Room | null {
    return this.state.currentRoomId 
      ? this.state.roomInstances.get(this.state.currentRoomId) || null
      : null;
  }

  // Get room by ID
  getRoom(roomId: string): Room | null {
    return this.state.roomInstances.get(roomId) || null;
  }

  // Get all doors for current room
  getCurrentDoors(): DoorInfo[] {
    return Array.from(this.state.doors.values());
  }

  // Get door by ID
  getDoor(doorId: string): DoorInfo | null {
    return this.state.doors.get(doorId) || null;
  }

  // Check if player is in room bounds
  isPlayerInRoom(playerPosition: THREE.Vector3, roomId?: string): boolean {
    const targetRoomId = roomId || this.state.currentRoomId;
    if (!targetRoomId) return false;

    const bounds = this.roomBounds.get(targetRoomId);
    return bounds ? bounds.containsPoint(playerPosition) : false;
  }

  // Get navigation state
  getState(): NavigationState {
    return { ...this.state };
  }

  // Get navigation history
  getHistory(): string[] {
    return [...this.state.roomHistory];
  }

  // Clear navigation history
  clearHistory(): void {
    this.state.roomHistory = [];
    this.emit('historyCleared');
  }

  // Set transition duration
  setTransitionDuration(duration: number): void {
    this.transitionDuration = Math.max(100, duration);
  }

  // Set default door style
  setDefaultDoorStyle(style: 'wooden' | 'metal' | 'stone' | 'medieval' | 'modern'): void {
    this.defaultDoorStyle = style;
    // Update existing doors
    this.updateDoors();
  }

  // Get default door style
  getDefaultDoorStyle(): 'wooden' | 'metal' | 'stone' | 'medieval' | 'modern' {
    return this.defaultDoorStyle;
  }

  // Manual door update for debugging
  forceUpdateDoors(): void {
    console.log('🔧 Force updating doors...');
    this.updateDoors();
  }

  // Cleanup
  destroy(): void {
    this.removeAllListeners();
    this.state.roomInstances.clear();
    this.state.doors.clear();
    this.roomBounds.clear();
  }
}

// Singleton instance
export const roomNavigationSystem = new RoomNavigationSystem();

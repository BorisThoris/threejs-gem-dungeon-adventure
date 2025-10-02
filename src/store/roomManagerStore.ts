import { create } from 'zustand';
import type { RoomInstance, RoomManagerState, RoomManagerActions, RoomTransition } from '../types/roomInstance';
import type { Room } from '../types/map';
import useMapStore from './mapStore';
import usePlayerMovementStore from './playerMovementStore';
import * as THREE from 'three';

const useRoomManagerStore = create<RoomManagerState & RoomManagerActions>((set, get) => ({
  // State
  currentRoomId: null,
  roomInstances: new Map(),
  transition: null,
  isLoading: false,
  loadingProgress: 0,

  // Actions
  loadRoom: async (roomId: string) => {
    const { currentMap } = useMapStore.getState();
    if (!currentMap) {
      console.error('No map available for room loading');
      return;
    }

    const room = currentMap.rooms.find(r => r.id === roomId);
    if (!room) {
      console.error(`Room ${roomId} not found in map`);
      console.log('Available room IDs:', currentMap.rooms.map(r => r.id));
      console.log('Map has', currentMap.rooms.length, 'rooms');
      return;
    }

    // Check if room is already loaded
    const existingInstance = get().roomInstances.get(roomId);
    if (existingInstance?.isLoaded) {
      return;
    }

    
    set({ isLoading: true, loadingProgress: 0 });

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      const currentProgress = get().loadingProgress;
      if (currentProgress < 0.9) {
        set({ loadingProgress: currentProgress + 0.1 });
        // Update transition progress in player movement store
        usePlayerMovementStore.getState().updateTransitionProgress(currentProgress + 0.1);
      }
    }, 100);

    try {
      // Create room instance
      const roomInstance: RoomInstance = {
        id: roomId,
        room,
        isLoaded: false,
        isActive: false,
        enemies: [],
        items: [],
        puzzles: [],
        isTransitioning: false,
      };

      // Simulate room loading time (like loading assets, generating content, etc.)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark as loaded
      roomInstance.isLoaded = true;
      roomInstance.loadedAt = Date.now();

      // Update room instances
      const newInstances = new Map(get().roomInstances);
      newInstances.set(roomId, roomInstance);

      set({ 
        roomInstances: newInstances,
        loadingProgress: 1.0,
        isLoading: false 
      });

      // Update final transition progress
      usePlayerMovementStore.getState().updateTransitionProgress(1.0);

      clearInterval(progressInterval);
    } catch (error) {
      console.error(`Failed to load room ${roomId}:`, error);
      clearInterval(progressInterval);
      set({ isLoading: false, loadingProgress: 0 });
    }
  },

  unloadRoom: (roomId: string) => {
    const newInstances = new Map(get().roomInstances);
    newInstances.delete(roomId);
    set({ roomInstances: newInstances });
  },

  setActiveRoom: (roomId: string) => {
    const { roomInstances } = get();
    const roomInstance = roomInstances.get(roomId);
    
    if (!roomInstance || !roomInstance.isLoaded) {
      console.error(`Cannot set active room ${roomId}: not loaded`);
      return;
    }

    // Deactivate all rooms
    const newInstances = new Map(roomInstances);
    newInstances.forEach((instance, id) => {
      instance.isActive = id === roomId;
    });

    set({ 
      currentRoomId: roomId,
      roomInstances: newInstances 
    });

  },

  startTransition: async (fromRoomId: string, toRoomId: string, direction: 'north' | 'south' | 'east' | 'west') => {
    
    // Validate that the target room exists in the map
    const { currentMap } = useMapStore.getState();
    const targetRoom = currentMap?.rooms.find(r => r.id === toRoomId);
    
    if (!targetRoom) {
      console.error(`Cannot transition to room ${toRoomId}: Room does not exist in map`);
      return;
    }

    // Start transition and freeze player movement
    usePlayerMovementStore.getState().startTransition(fromRoomId, toRoomId);
    
    // Load the target room if not already loaded
    await get().loadRoom(toRoomId);
    
    // Set new active room immediately
    get().setActiveRoom(toRoomId);
    
    // Emit teleportation event for player to listen to
    if (targetRoom) {
      const roomSize = targetRoom.size || 10;
      
      // Calculate entrance position (room is at origin in room-instance mode)
      // Spawn player at door position, facing inward into the room
      const entranceDistance = 1.5; // Closer to door
      const roomHalfSize = roomSize / 2;
      let position: THREE.Vector3;
      let rotation: THREE.Euler;

      switch (direction) {
        case 'north':
          // Entering from north, spawn at north wall, face south (into room)
          position = new THREE.Vector3(0, 0.5, -roomHalfSize + entranceDistance);
          rotation = new THREE.Euler(0, 0, 0); // Face south (into room)
          break;
        case 'south':
          // Entering from south, spawn at south wall, face north (into room)
          position = new THREE.Vector3(0, 0.5, roomHalfSize - entranceDistance);
          rotation = new THREE.Euler(0, Math.PI, 0); // Face north (into room)
          break;
        case 'east':
          // Entering from east, spawn at east wall, face west (into room)
          position = new THREE.Vector3(roomHalfSize - entranceDistance, 0.5, 0);
          rotation = new THREE.Euler(0, -Math.PI / 2, 0); // Face west (into room)
          break;
        case 'west':
          // Entering from west, spawn at west wall, face east (into room)
          position = new THREE.Vector3(-roomHalfSize + entranceDistance, 0.5, 0);
          rotation = new THREE.Euler(0, Math.PI / 2, 0); // Face east (into room)
          break;
        default:
          position = new THREE.Vector3(0, 0.5, roomHalfSize - entranceDistance);
          rotation = new THREE.Euler(0, Math.PI, 0);
      }

      // Validate spawn position is within room bounds
      const isWithinBounds = 
        Math.abs(position.x) < roomHalfSize - 1 && 
        Math.abs(position.z) < roomHalfSize - 1;
      
      if (!isWithinBounds) {
        console.warn(`Spawn position ${position.toArray()} is out of bounds for room size ${roomSize}`);
        // Fallback to center of room
        position = new THREE.Vector3(0, 1.6, 0);
        rotation = new THREE.Euler(0, 0, 0);
      }

      // Emit teleportation event
      
      window.dispatchEvent(new CustomEvent('playerTeleport', {
        detail: { position: position.toArray(), rotation: rotation.toArray() }
      }));
    }
    
    // Complete transition and re-enable movement after a delay
    setTimeout(() => {
      usePlayerMovementStore.getState().completeTransition();
      get().unloadRoom(fromRoomId);
    }, 1500); // Longer delay to show transition effect
    
  },

  completeTransition: () => {
    const { transition } = get();
    if (!transition) return;

    
    // Set new active room
    get().setActiveRoom(transition.toRoomId);

    // Clear transition
    set({ transition: null });
  },

  updateRoomState: (roomId: string, updates: Partial<RoomInstance>) => {
    const { roomInstances } = get();
    const roomInstance = roomInstances.get(roomId);
    
    if (!roomInstance) {
      console.error(`Room ${roomId} not found for state update`);
      return;
    }

    const updatedInstance = { ...roomInstance, ...updates };
    const newInstances = new Map(roomInstances);
    newInstances.set(roomId, updatedInstance);
    
    set({ roomInstances: newInstances });
  },

  setLoading: (isLoading: boolean, progress = 0) => {
    set({ isLoading, loadingProgress: progress });
  },

  cleanup: () => {
    set({
      currentRoomId: null,
      roomInstances: new Map(),
      transition: null,
      isLoading: false,
      loadingProgress: 0,
    });
  },
}));

export default useRoomManagerStore;

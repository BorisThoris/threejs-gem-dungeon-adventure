import { create } from 'zustand';
import type { RoomInstance, RoomManagerState, RoomManagerActions, RoomTransition } from '../types/roomInstance';
import type { Room } from '../types/map';
import useMapStore from './mapStore';
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
      return;
    }

    // Check if room is already loaded
    const existingInstance = get().roomInstances.get(roomId);
    if (existingInstance?.isLoaded) {
      console.log(`Room ${roomId} already loaded`);
      return;
    }

    console.log(`Loading room: ${roomId} (${room.type})`);
    
    set({ isLoading: true, loadingProgress: 0 });

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      const currentProgress = get().loadingProgress;
      if (currentProgress < 0.9) {
        set({ loadingProgress: currentProgress + 0.1 });
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

      clearInterval(progressInterval);
      console.log(`Room ${roomId} loaded successfully`);
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
    console.log(`Unloaded room: ${roomId}`);
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

    console.log(`Set active room: ${roomId}`);
  },

  startTransition: async (fromRoomId: string, toRoomId: string, direction: 'north' | 'south' | 'east' | 'west') => {
    console.log(`Starting instant transition: ${fromRoomId} -> ${toRoomId} (${direction})`);
    
    // Load the target room if not already loaded
    await get().loadRoom(toRoomId);
    
    // Set new active room immediately
    get().setActiveRoom(toRoomId);
    
    // Emit teleportation event for player to listen to
    const { currentMap } = useMapStore.getState();
    const targetRoom = currentMap?.rooms.find(r => r.id === toRoomId);
    if (targetRoom) {
      const roomSize = targetRoom.size || 10;
      
      // Calculate entrance position (room is at origin in room-instance mode)
      const entranceDistance = 2;
      let position: THREE.Vector3;
      let rotation: THREE.Euler;

      switch (direction) {
        case 'north':
          position = new THREE.Vector3(0, 1, -roomSize / 2 + entranceDistance);
          rotation = new THREE.Euler(0, 0, 0); // Face into room
          break;
        case 'south':
          position = new THREE.Vector3(0, 1, roomSize / 2 - entranceDistance);
          rotation = new THREE.Euler(0, Math.PI, 0); // Face into room
          break;
        case 'east':
          position = new THREE.Vector3(roomSize / 2 - entranceDistance, 1, 0);
          rotation = new THREE.Euler(0, -Math.PI / 2, 0); // Face into room
          break;
        case 'west':
          position = new THREE.Vector3(-roomSize / 2 + entranceDistance, 1, 0);
          rotation = new THREE.Euler(0, Math.PI / 2, 0); // Face into room
          break;
        default:
          position = new THREE.Vector3(0, 1, roomSize / 2 - entranceDistance);
          rotation = new THREE.Euler(0, Math.PI, 0);
      }

      // Emit teleportation event
      console.log('Emitting teleportation event:', {
        position: position.toArray(),
        rotation: rotation.toArray(),
        direction,
        roomSize
      });
      
      window.dispatchEvent(new CustomEvent('playerTeleport', {
        detail: { position: position.toArray(), rotation: rotation.toArray() }
      }));
    }
    
    // Unload previous room after a short delay
    setTimeout(() => {
      get().unloadRoom(fromRoomId);
    }, 100);
    
    console.log(`Transition completed: ${fromRoomId} -> ${toRoomId}`);
  },

  completeTransition: () => {
    const { transition } = get();
    if (!transition) return;

    console.log(`Completing transition: ${transition.fromRoomId} -> ${transition.toRoomId}`);
    
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

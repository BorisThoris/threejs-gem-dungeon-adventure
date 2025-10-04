import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Unified room store using Zustand

export interface Room {
  id: string;
  name: string;
  position: { x: number; z: number };
  connections: string[];
  spawnPosition: [number, number, number];
}

export interface RoomState {
  // Current room
  currentRoomId: string;
  rooms: Record<string, Room>;
  
  // Room transitions
  isTransitioning: boolean;
  transitionProgress: number;
  
  // Actions
  setCurrentRoom: (roomId: string) => void;
  addRoom: (room: Room) => void;
  updateRoom: (roomId: string, updates: Partial<Room>) => void;
  removeRoom: (roomId: string) => void;
  
  // Room transitions
  startTransition: (targetRoomId: string) => Promise<void>;
  completeTransition: () => void;
  
  // Door interactions
  handleDoorClick: (targetRoomId: string) => void;
}

export const useRoomStore = create<RoomState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentRoomId: 'start',
    rooms: {},
    isTransitioning: false,
    transitionProgress: 0,
    
    // Room management
    setCurrentRoom: (roomId: string) => {
      set({ currentRoomId: roomId });
    },
    
    addRoom: (room: Room) => {
      set((state) => ({
        rooms: { ...state.rooms, [room.id]: room }
      }));
    },
    
    updateRoom: (roomId: string, updates: Partial<Room>) => {
      set((state) => ({
        rooms: {
          ...state.rooms,
          [roomId]: { ...state.rooms[roomId], ...updates }
        }
      }));
    },
    
    removeRoom: (roomId: string) => {
      set((state) => {
        const { [roomId]: removed, ...remainingRooms } = state.rooms;
        return { rooms: remainingRooms };
      });
    },
    
    // Room transitions
    startTransition: async (targetRoomId: string) => {
      const { currentRoomId } = get();
      
      if (currentRoomId === targetRoomId) return;
      
      set({ 
        isTransitioning: true, 
        transitionProgress: 0 
      });
      
      // Simulate transition progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        set({ transitionProgress: progress });
      }
      
      // Complete transition
      set({ 
        currentRoomId: targetRoomId,
        isTransitioning: false,
        transitionProgress: 100
      });
    },
    
    completeTransition: () => {
      set({ 
        isTransitioning: false,
        transitionProgress: 0
      });
    },
    
    // Door interactions
    handleDoorClick: (targetRoomId: string) => {
      const { startTransition } = get();
      startTransition(targetRoomId);
    }
  }))
);

// Helper functions
export const getCurrentRoom = () => useRoomStore.getState().rooms[useRoomStore.getState().currentRoomId];
export const getRoomById = (roomId: string) => useRoomStore.getState().rooms[roomId];
export const getConnectedRooms = (roomId: string) => {
  const room = getRoomById(roomId);
  return room ? room.connections.map(id => getRoomById(id)).filter(Boolean) : [];
};
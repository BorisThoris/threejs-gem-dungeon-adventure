import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ROOM_DEFINITIONS } from '../data/roomDefinitions';

interface RoomState {
  currentRoomId: string;
}

interface RoomActions {
  navigateToRoom: (roomId: string) => void;
  getCurrentRoom: () => any;
  getRoomDoors: () => string[];
  getRoomSpawnPosition: () => [number, number, number];
  getAllConnectedRooms: () => string[];
}

type RoomStore = RoomState & RoomActions;

export const useRoomStore = create<RoomStore>()(
  subscribeWithSelector((set, get) => ({
    // State
    currentRoomId: "start",

    // Actions
    navigateToRoom: (roomId: string) => {
      if (ROOM_DEFINITIONS[roomId]) {
        set({ currentRoomId: roomId });
      } else {
        console.warn(`Room not found: ${roomId}`);
      }
    },

    getCurrentRoom: () => {
      const { currentRoomId } = get();
      return ROOM_DEFINITIONS[currentRoomId] || null;
    },

    getRoomDoors: () => {
      const room = get().getCurrentRoom();
      return room?.doors || [];
    },

    getRoomSpawnPosition: () => {
      const room = get().getCurrentRoom();
      return room?.spawnPosition || [0, 1.5, 0];
    },

    getAllConnectedRooms: () => {
      const { currentRoomId } = get();
      const currentRoom = get().getCurrentRoom();
      if (!currentRoom) return [];

      // Get rooms this room connects to (outgoing)
      const outgoingConnections = currentRoom.doors || [];

      // Get rooms that connect to this room (incoming)
      const incomingConnections = Object.values(ROOM_DEFINITIONS)
        .filter((room) => room.doors.includes(currentRoomId))
        .map((room) => room.id);

      // Combine and remove duplicates
      const allConnections = [
        ...new Set([...outgoingConnections, ...incomingConnections]),
      ];

      return allConnections;
    },
  }))
);

// Selector hooks for better performance
export const useCurrentRoomId = () => useRoomStore((state) => state.currentRoomId);
export const useCurrentRoom = () => useRoomStore((state) => state.getCurrentRoom());
export const useRoomDoors = () => useRoomStore((state) => state.getRoomDoors());
export const useRoomSpawnPosition = () => useRoomStore((state) => state.getRoomSpawnPosition());
export const useAllConnectedRooms = () => useRoomStore((state) => state.getAllConnectedRooms());
export const useNavigateToRoom = () => useRoomStore((state) => state.navigateToRoom);

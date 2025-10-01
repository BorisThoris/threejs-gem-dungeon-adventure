import { create } from 'zustand';
import type { MapState, MapActions, GameMap, MapConfig } from '../types/map';
import { SimpleMapGenerator, defaultSimpleConfig } from '../algorithms/simpleMapGenerator';
import { playerRoomDetection } from '../utils/playerRoomDetection';

const defaultConfig: MapConfig = {
  width: 20,
  height: 20,
  roomSize: 10,
  minRooms: 8,
  maxRooms: 15,
  specialRoomChance: 0.6,
  connectionChance: 0.4,
};

const useMapStore = create<MapState & MapActions>((set, get) => ({
  // State
  currentMap: null,
  currentRoomId: null,
  visitedRooms: new Set(),
  isGenerating: false,
  error: null,

  // Actions
  generateMap: (config = {}, enabledBiomeCategories?: string[]) => {
    set({ isGenerating: true, error: null });
    
    try {
      const finalConfig = { ...defaultConfig, ...config };
      
      // Use simple generator for enhanced maps
      const generator = new SimpleMapGenerator({
        ...defaultSimpleConfig,
        ...config,
        minRooms: finalConfig.minRooms,
        maxRooms: finalConfig.maxRooms,
        specialRoomChance: finalConfig.specialRoomChance,
        enabledBiomeCategories: enabledBiomeCategories,
      });
      
      const result = generator.generateMap();
      
      const map: GameMap = {
        id: `map_${Date.now()}`,
        rooms: result.rooms,
        startRoomId: result.startRoomId,
        endRoomId: result.endRoomId,
        config: finalConfig,
        generatedAt: Date.now(),
      };
      
      // Debug logging for map generation
      console.log('MapStore: Generated map with', result.rooms.length, 'rooms');
      console.log('MapStore: Start room ID:', result.startRoomId);
      console.log('MapStore: End room ID:', result.endRoomId);
      
      const startRoom = result.rooms.find(r => r.id === result.startRoomId);
      if (startRoom) {
        console.log('MapStore: Start room connections:', startRoom.connections);
        console.log('MapStore: Start room type:', startRoom.type);
      }

      // Initialize room bounds for optimized collision detection
      playerRoomDetection.initializeRoomBounds(result.rooms);
      console.log('MapStore: Initialized room bounds for collision detection');
      
      set({
        currentMap: map,
        currentRoomId: map.startRoomId,
        visitedRooms: new Set([map.startRoomId]),
        isGenerating: false,
        error: null,
      });
    } catch (error) {
      set({
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate map',
      });
    }
  },

  setCurrentRoom: (roomId: string) => {
    const { currentMap } = get();
    if (currentMap && currentMap.rooms.find(room => room.id === roomId)) {
      set({ currentRoomId: roomId });
    }
  },

  markRoomVisited: (roomId: string) => {
    const { visitedRooms } = get();
    const newVisitedRooms = new Set(visitedRooms);
    newVisitedRooms.add(roomId);
    set({ visitedRooms: newVisitedRooms });
  },

  clearMap: () => {
    set({
      currentMap: null,
      currentRoomId: null,
      visitedRooms: new Set(),
      error: null,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));

export default useMapStore;
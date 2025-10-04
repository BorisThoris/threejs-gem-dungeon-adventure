import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { DoorState, DoorType } from '../components/Door';

export interface DoorUnlock {
  doorId: string;
  roomId: string;
  unlockedAt: number;
  method: 'key' | 'puzzle' | 'quest' | 'level' | 'manual';
}

export interface DoorProgression {
  unlockedDoors: Set<string>;
  doorStates: Record<string, DoorState>;
  doorTypes: Record<string, DoorType>;
  unlockHistory: DoorUnlock[];
  totalDoorsUnlocked: number;
  progressionLevel: number;
}

export interface DoorProgressionActions {
  unlockDoor: (doorId: string, roomId: string, method: DoorUnlock['method']) => void;
  lockDoor: (doorId: string) => void;
  setDoorState: (doorId: string, state: DoorState) => void;
  setDoorType: (doorId: string, type: DoorType) => void;
  isDoorUnlocked: (doorId: string) => boolean;
  getDoorState: (doorId: string) => DoorState;
  getDoorType: (doorId: string) => DoorType;
  getUnlockedDoors: () => string[];
  getProgressionStats: () => {
    totalUnlocked: number;
    progressionLevel: number;
    recentUnlocks: DoorUnlock[];
  };
  resetProgression: () => void;
}

export const useDoorProgressionStore = create<DoorProgression & DoorProgressionActions>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    unlockedDoors: new Set(),
    doorStates: {},
    doorTypes: {},
    unlockHistory: [],
    totalDoorsUnlocked: 0,
    progressionLevel: 1,
    
    // Actions
    unlockDoor: (doorId: string, roomId: string, method: DoorUnlock['method']) => {
      const { unlockedDoors, unlockHistory, totalDoorsUnlocked } = get();
      
      if (!unlockedDoors.has(doorId)) {
        const newUnlock: DoorUnlock = {
          doorId,
          roomId,
          unlockedAt: Date.now(),
          method
        };
        
        set({
          unlockedDoors: new Set([...unlockedDoors, doorId]),
          unlockHistory: [...unlockHistory, newUnlock],
          totalDoorsUnlocked: totalDoorsUnlocked + 1,
          doorStates: { ...get().doorStates, [doorId]: 'open' },
          progressionLevel: Math.floor((totalDoorsUnlocked + 1) / 5) + 1 // Level up every 5 doors
        });
        
        console.log(`🚪 Door ${doorId} unlocked via ${method}!`);
      }
    },
    
    lockDoor: (doorId: string) => {
      const { unlockedDoors } = get();
      const newUnlockedDoors = new Set(unlockedDoors);
      newUnlockedDoors.delete(doorId);
      
      set({
        unlockedDoors: newUnlockedDoors,
        doorStates: { ...get().doorStates, [doorId]: 'locked' }
      });
    },
    
    setDoorState: (doorId: string, state: DoorState) => {
      set({
        doorStates: { ...get().doorStates, [doorId]: state }
      });
    },
    
    setDoorType: (doorId: string, type: DoorType) => {
      set({
        doorTypes: { ...get().doorStates, [doorId]: type }
      });
    },
    
    isDoorUnlocked: (doorId: string) => {
      return get().unlockedDoors.has(doorId);
    },
    
    getDoorState: (doorId: string) => {
      return get().doorStates[doorId] || 'closed';
    },
    
    getDoorType: (doorId: string) => {
      return get().doorTypes[doorId] || 'standard';
    },
    
    getUnlockedDoors: () => {
      return Array.from(get().unlockedDoors);
    },
    
    getProgressionStats: () => {
      const { totalDoorsUnlocked, progressionLevel, unlockHistory } = get();
      const recentUnlocks = unlockHistory.slice(-5); // Last 5 unlocks
      
      return {
        totalUnlocked: totalDoorsUnlocked,
        progressionLevel,
        recentUnlocks
      };
    },
    
    resetProgression: () => {
      set({
        unlockedDoors: new Set(),
        doorStates: {},
        doorTypes: {},
        unlockHistory: [],
        totalDoorsUnlocked: 0,
        progressionLevel: 1
      });
    }
  }))
);

// Helper functions
export const getDoorProgressionStats = () => useDoorProgressionStore.getState().getProgressionStats();
export const isDoorUnlocked = (doorId: string) => useDoorProgressionStore.getState().isDoorUnlocked(doorId);
export const unlockDoor = (doorId: string, roomId: string, method: DoorUnlock['method'] = 'manual') => {
  useDoorProgressionStore.getState().unlockDoor(doorId, roomId, method);
};

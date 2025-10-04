import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WallToggleState {
  wallsEnabled: boolean;
}

interface WallToggleActions {
  toggleWalls: () => void;
  setWallsEnabled: (enabled: boolean) => void;
}

type WallToggleStore = WallToggleState & WallToggleActions;

export const useWallToggleStore = create<WallToggleStore>()(
  persist(
    (set, get) => ({
      // State
      wallsEnabled: true,

      // Actions
      toggleWalls: () => {
        set((state) => ({ wallsEnabled: !state.wallsEnabled }));
      },

      setWallsEnabled: (enabled: boolean) => {
        set({ wallsEnabled: enabled });
      },
    }),
    {
      name: 'wall-toggle-storage', // unique name for localStorage key
      partialize: (state) => ({ wallsEnabled: state.wallsEnabled }),
    }
  )
);

// Selector hooks for better performance
export const useWallsEnabled = () => useWallToggleStore((state) => state.wallsEnabled);
export const useToggleWalls = () => useWallToggleStore((state) => state.toggleWalls);
export const useSetWallsEnabled = () => useWallToggleStore((state) => state.setWallsEnabled);

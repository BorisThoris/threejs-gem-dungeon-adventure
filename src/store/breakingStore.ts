import { create } from 'zustand';

interface BreakingState {
  globalBreakingEnabled: boolean;
}

interface BreakingActions {
  setGlobalBreakingEnabled: (enabled: boolean) => void;
  toggleGlobalBreaking: () => void;
}

type BreakingStore = BreakingState & BreakingActions;

export const useBreakingStore = create<BreakingStore>((set, get) => ({
  // State
  globalBreakingEnabled: false,

  // Actions
  setGlobalBreakingEnabled: (enabled: boolean) => {
    set({ globalBreakingEnabled: enabled });
    console.log(`Global breaking ${enabled ? "enabled" : "disabled"}`);
  },

  toggleGlobalBreaking: () => {
    const current = get().globalBreakingEnabled;
    set({ globalBreakingEnabled: !current });
    console.log(`Global breaking ${!current ? "enabled" : "disabled"}`);
  },
}));

// Selector hooks for better performance
export const useGlobalBreakingEnabled = () => useBreakingStore((state) => state.globalBreakingEnabled);
export const useSetGlobalBreakingEnabled = () => useBreakingStore((state) => state.setGlobalBreakingEnabled);
export const useToggleGlobalBreaking = () => useBreakingStore((state) => state.toggleGlobalBreaking);

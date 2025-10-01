import { create } from 'zustand';

interface PlayerMovementState {
  isMovementEnabled: boolean;
  isTransitioning: boolean;
  transitionProgress: number;
  fromRoomId: string | null;
  toRoomId: string | null;
}

interface PlayerMovementActions {
  enableMovement: () => void;
  disableMovement: () => void;
  startTransition: (fromRoomId: string, toRoomId: string) => void;
  updateTransitionProgress: (progress: number) => void;
  completeTransition: () => void;
  reset: () => void;
}

const usePlayerMovementStore = create<PlayerMovementState & PlayerMovementActions>((set, get) => ({
  // State
  isMovementEnabled: true,
  isTransitioning: false,
  transitionProgress: 0,
  fromRoomId: null,
  toRoomId: null,

  // Actions
  enableMovement: () => set({ isMovementEnabled: true }),
  
  disableMovement: () => set({ isMovementEnabled: false }),
  
  startTransition: (fromRoomId: string, toRoomId: string) => set({
    isMovementEnabled: false,
    isTransitioning: true,
    transitionProgress: 0,
    fromRoomId,
    toRoomId,
  }),
  
  updateTransitionProgress: (progress: number) => set({
    transitionProgress: Math.max(0, Math.min(1, progress)),
  }),
  
  completeTransition: () => set({
    isMovementEnabled: true,
    isTransitioning: false,
    transitionProgress: 1,
    fromRoomId: null,
    toRoomId: null,
  }),
  
  reset: () => set({
    isMovementEnabled: true,
    isTransitioning: false,
    transitionProgress: 0,
    fromRoomId: null,
    toRoomId: null,
  }),
}));

export default usePlayerMovementStore;

import { createContext } from "react";

interface BreakingContextType {
  globalBreakingEnabled: boolean;
  setGlobalBreakingEnabled: (enabled: boolean) => void;
  toggleGlobalBreaking: () => void;
}

export const BreakingContext = createContext<BreakingContextType | undefined>(
  undefined
);

export type { BreakingContextType };

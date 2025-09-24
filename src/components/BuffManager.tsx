import React from "react";
import { refBasedGameState } from "../utils/refBasedGameState";

const BuffManager: React.FC = () => {
  // Buffs are now managed by refBasedGameState in the game loop
  // No React state updates, no re-renders, no stutters!

  // Don't render anything, this is just a background manager
  return null;
};

export default BuffManager;

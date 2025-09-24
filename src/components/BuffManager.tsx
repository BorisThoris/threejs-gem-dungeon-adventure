import React, { useEffect } from "react";
import useGameStore from "../store/gameStore";

const BuffManager: React.FC = () => {
  const { updateBuffs } = useGameStore();

  useEffect(() => {
    // Update buffs every second
    const interval = setInterval(() => {
      updateBuffs();
    }, 1000);

    return () => clearInterval(interval);
  }, [updateBuffs]);

  // Don't render anything, this is just a background manager
  return null;
};

export default BuffManager;

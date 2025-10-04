import React, { useState } from "react";
import type { ReactNode } from "react";
import { BreakingContext } from "./BreakingContextDefinition";

interface BreakingProviderProps {
  children: ReactNode;
}

export const BreakingProvider: React.FC<BreakingProviderProps> = ({
  children,
}) => {
  const [globalBreakingEnabled, setGlobalBreakingEnabled] = useState(false);

  const toggleGlobalBreaking = () => {
    setGlobalBreakingEnabled((prev) => !prev);
    console.log(
      `Global breaking ${!globalBreakingEnabled ? "enabled" : "disabled"}`
    );
  };

  return (
    <BreakingContext.Provider
      value={{
        globalBreakingEnabled,
        setGlobalBreakingEnabled,
        toggleGlobalBreaking,
      }}
    >
      {children}
    </BreakingContext.Provider>
  );
};

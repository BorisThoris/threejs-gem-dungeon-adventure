import React, { createContext, useContext, useState, ReactNode } from "react";

interface BreakingContextType {
  globalBreakingEnabled: boolean;
  setGlobalBreakingEnabled: (enabled: boolean) => void;
  toggleGlobalBreaking: () => void;
}

const BreakingContext = createContext<BreakingContextType | undefined>(
  undefined
);

export const useBreakingContext = () => {
  const context = useContext(BreakingContext);
  if (!context) {
    throw new Error(
      "useBreakingContext must be used within a BreakingProvider"
    );
  }
  return context;
};

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

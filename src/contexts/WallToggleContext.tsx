import React, { createContext, useContext, useState, useEffect } from "react";

interface WallToggleContextType {
  wallsEnabled: boolean;
  toggleWalls: () => void;
  setWallsEnabled: (enabled: boolean) => void;
}

const WallToggleContext = createContext<WallToggleContextType | undefined>(
  undefined
);

export const useWallToggle = () => {
  const context = useContext(WallToggleContext);
  if (context === undefined) {
    throw new Error("useWallToggle must be used within a WallToggleProvider");
  }
  return context;
};

interface WallToggleProviderProps {
  children: React.ReactNode;
}

export const WallToggleProvider: React.FC<WallToggleProviderProps> = ({
  children,
}) => {
  const [wallsEnabled, setWallsEnabled] = useState(true);

  const toggleWalls = () => {
    setWallsEnabled((prev) => !prev);
  };

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("wallsEnabled", wallsEnabled.toString());
  }, [wallsEnabled]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wallsEnabled");
    if (saved !== null) {
      setWallsEnabled(saved === "true");
    }
  }, []);

  const value = {
    wallsEnabled,
    toggleWalls,
    setWallsEnabled,
  };

  return (
    <WallToggleContext.Provider value={value}>
      {children}
    </WallToggleContext.Provider>
  );
};

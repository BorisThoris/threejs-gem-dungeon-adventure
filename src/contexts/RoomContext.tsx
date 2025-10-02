import React, { createContext, useContext, useState, ReactNode } from "react";

// Import all room components
import StartRoom from "../components/primitives/game-rooms/StartRoom";
import MeditationBiome from "../components/primitives/game-rooms/MeditationBiome";
import GymBiome from "../components/primitives/game-rooms/GymBiome";
import LibraryBiome from "../components/primitives/game-rooms/LibraryBiome";
import ShopBiome from "../components/primitives/game-rooms/ShopBiome";
import TreasureBiome from "../components/primitives/game-rooms/TreasureBiome";
import PuzzleBiome from "../components/primitives/game-rooms/PuzzleBiome";
import BossBiome from "../components/primitives/game-rooms/BossBiome";
import CoffeeBiome from "../components/primitives/game-rooms/CoffeeBiome";
import ChallengeBiome from "../components/primitives/game-rooms/ChallengeBiome";
import LibraryUpgradeBiome from "../components/primitives/game-rooms/LibraryUpgradeBiome";
import PortalBiome from "../components/primitives/game-rooms/PortalBiome";
import ArenaBiome from "../components/primitives/game-rooms/ArenaBiome";
import EnemyBiome from "../components/primitives/game-rooms/EnemyBiome";
import EndBiome from "../components/primitives/game-rooms/EndBiome";
import SpecialBiome from "../components/primitives/game-rooms/SpecialBiome";

// Room configuration
export interface RoomConfig {
  id: string;
  name: string;
  component: React.ComponentType<any>;
  doors: string[]; // IDs of rooms this room connects to
  spawnPosition: [number, number, number]; // Where player spawns in this room
}

// Define all available rooms
export const ROOM_DEFINITIONS: Record<string, RoomConfig> = {
  start: {
    id: "start",
    name: "Start Room",
    component: StartRoom,
    doors: ["meditation", "shop", "treasure"],
    spawnPosition: [0, 1, 0],
  },
  meditation: {
    id: "meditation",
    name: "Meditation Room",
    component: MeditationBiome,
    doors: ["start", "library"],
    spawnPosition: [0, 1, 0],
  },
  shop: {
    id: "shop",
    name: "Shop",
    component: ShopBiome,
    doors: ["start", "treasure"],
    spawnPosition: [0, 1, 0],
  },
  treasure: {
    id: "treasure",
    name: "Treasure Room",
    component: TreasureBiome,
    doors: ["start", "shop", "puzzle"],
    spawnPosition: [0, 1, 0],
  },
  library: {
    id: "library",
    name: "Library",
    component: LibraryBiome,
    doors: ["meditation", "puzzle"],
    spawnPosition: [0, 1, 0],
  },
  puzzle: {
    id: "puzzle",
    name: "Puzzle Room",
    component: PuzzleBiome,
    doors: ["treasure", "library", "boss"],
    spawnPosition: [0, 1, 0],
  },
  boss: {
    id: "boss",
    name: "Boss Room",
    component: BossBiome,
    doors: ["puzzle", "end"],
    spawnPosition: [0, 1, 0],
  },
  end: {
    id: "end",
    name: "End Room",
    component: EndBiome,
    doors: ["boss"],
    spawnPosition: [0, 1, 0],
  },
  coffee: {
    id: "coffee",
    name: "Coffee Shop",
    component: CoffeeBiome,
    doors: ["start", "meditation"],
    spawnPosition: [0, 1, 0],
  },
  challenge: {
    id: "challenge",
    name: "Challenge Room",
    component: ChallengeBiome,
    doors: ["start", "arena"],
    spawnPosition: [0, 1, 0],
  },
  arena: {
    id: "arena",
    name: "Arena",
    component: ArenaBiome,
    doors: ["challenge", "boss"],
    spawnPosition: [0, 1, 0],
  },
};

// Room context
interface RoomContextType {
  currentRoomId: string;
  navigateToRoom: (roomId: string) => void;
  getCurrentRoom: () => RoomConfig | null;
  getRoomDoors: () => string[];
  getRoomSpawnPosition: () => [number, number, number];
  getAllConnectedRooms: () => string[]; // Gets both outgoing and incoming connections
}

const RoomContext = createContext<RoomContextType | null>(null);

// Room provider component
export const RoomProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentRoomId, setCurrentRoomId] = useState<string>("start");

  const navigateToRoom = (roomId: string) => {
    if (ROOM_DEFINITIONS[roomId]) {
      console.log(`Navigating from ${currentRoomId} to ${roomId}`);
      setCurrentRoomId(roomId);
    } else {
      console.warn(`Room ${roomId} not found!`);
    }
  };

  const getCurrentRoom = () => {
    return ROOM_DEFINITIONS[currentRoomId] || null;
  };

  const getRoomDoors = () => {
    const room = getCurrentRoom();
    return room?.doors || [];
  };

  const getRoomSpawnPosition = () => {
    const room = getCurrentRoom();
    return room?.spawnPosition || [0, 1, 0];
  };

  const getAllConnectedRooms = () => {
    const currentRoom = getCurrentRoom();
    if (!currentRoom) return [];

    // Get rooms this room connects to (outgoing)
    const outgoingConnections = currentRoom.doors || [];

    // Get rooms that connect to this room (incoming)
    const incomingConnections = Object.values(ROOM_DEFINITIONS)
      .filter((room) => room.doors.includes(currentRoomId))
      .map((room) => room.id);

    // Combine and remove duplicates
    const allConnections = [
      ...new Set([...outgoingConnections, ...incomingConnections]),
    ];

    // Debug: Room connections
    // console.log(`getAllConnectedRooms for ${currentRoomId}:`, {
    //   outgoing: outgoingConnections,
    //   incoming: incomingConnections,
    //   all: allConnections,
    // });

    return allConnections;
  };

  return (
    <RoomContext.Provider
      value={{
        currentRoomId,
        navigateToRoom,
        getCurrentRoom,
        getRoomDoors,
        getRoomSpawnPosition,
        getAllConnectedRooms,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

// Hook to use room context
export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error("useRoomContext must be used within a RoomProvider");
  }
  return context;
};

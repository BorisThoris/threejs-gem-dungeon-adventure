import React, { useEffect, useRef, useState, useCallback } from "react";
import GameLoadingScreen from "./GameLoadingScreen";
import useInitializationStore from "../store/initializationStore";
import useMapStore from "../store/mapStore";
import useRoomManagerStore from "../store/roomManagerStore";
import useGameStore from "../store/gameStore";
import { texturePreloader } from "../utils/texturePreloader";
import { BIOME_CATEGORIES } from "../types/biomeCategories";
import type { GameMap } from "../types/map";

interface GameInitializerProps {
  children: React.ReactNode;
}

let startupInitializationPromise: Promise<void> | null = null;

const GameInitializer: React.FC<GameInitializerProps> = ({ children }) => {
  const {
    isInitializing,
    progress,
    status,
    setInitializing,
    setProgress,
    setStatus,
    setComplete,
    setError,
    setStepComplete,
  } = useInitializationStore();

  const { generateMap } = useMapStore();
  const { loadRoom } = useRoomManagerStore();
  const { resetGame } = useGameStore();

  const [showGame, setShowGame] = useState(false);
  const defaultBiomeCategories = useRef(
    BIOME_CATEGORIES.map((category) => category.id)
  );

  // Pre-load textures
  const preloadTextures = useCallback(async () => {
    setStatus("Loading textures...");
    try {
      await texturePreloader.preloadAll();
      setProgress(0.3);
      setStepComplete("textures", true);
    } catch (error) {
      // Failed to preload some textures
      // Continue even if texture loading fails
      setProgress(0.3);
      setStepComplete("textures", true);
    }
  }, [setStatus, setProgress, setStepComplete]);

  // Pre-load room assets
  const preloadRoomAssets = useCallback(async (map: GameMap | null) => {
    if (!map) return;

    setStatus("Pre-loading rooms...");

    try {
      // Pre-load start room
      if (map.startRoomId) {
        await loadRoom(map.startRoomId);
        setProgress(0.4);
      }

      // Pre-load connected rooms (first level)
      const startRoom = map.rooms.find(
        (r) => r.id === map.startRoomId
      );
      if (startRoom && startRoom.connections) {
        const connectedRoomIds = startRoom.connections.slice(0, 3);
        for (let i = 0; i < connectedRoomIds.length; i++) {
          try {
            // Check if room exists in map before trying to load
            const roomExists = map.rooms.some(
              (r) => r.id === connectedRoomIds[i]
            );
            if (!roomExists) {
              // Room does not exist in map, skipping
              continue;
            }
            await loadRoom(connectedRoomIds[i]);
            setProgress(0.4 + (i / connectedRoomIds.length) * 0.3);
          } catch (error) {
            // Failed to preload room
            // Continue with other rooms
          }
        }
      }
      setStepComplete("rooms", true);
    } catch (error) {
      // Failed to preload some rooms
      setStepComplete("rooms", true);
    }
  }, [loadRoom, setStatus, setProgress, setStepComplete]);

  // Initialize game systems
  const initializeGameSystems = useCallback(async (resetForNewRun: boolean) => {
    setStatus("Initializing game systems...");

    if (resetForNewRun) {
      resetGame();
    }
    setProgress(0.05);

    // Initialize physics world (simulated)
    await new Promise((resolve) => setTimeout(resolve, 200));
    setProgress(0.1);

    setStepComplete("systems", true);
  }, [resetGame, setStatus, setProgress, setStepComplete]);

  // Cache game data
  const cacheGameData = useCallback(async (map: GameMap | null) => {
    setStatus("Caching game data...");

    // Cache room configurations
    const roomConfigs =
      map?.rooms.map((room) => ({
        id: room.id,
        type: room.type,
        position: room.position,
        connections: room.connections,
      })) || [];

    // Store in session storage for quick access
    sessionStorage.setItem("cachedRoomConfigs", JSON.stringify(roomConfigs));

    setProgress(0.8);
    setStepComplete("cache", true);
  }, [setStatus, setProgress, setStepComplete]);

  // Main initialization
  useEffect(() => {
    const initialize = async () => {
      if (!startupInitializationPromise) {
        startupInitializationPromise = (async () => {
          try {
            setInitializing(true);
            setProgress(0);
            setStatus("Starting initialization...");

            const existingMap = useMapStore.getState().currentMap;
            const shouldGenerateMap = !existingMap;

            // Step 1: Initialize game systems
            await initializeGameSystems(shouldGenerateMap);

            // Step 2: Generate map
            setStatus("Generating world map...");
            if (shouldGenerateMap) {
              generateMap({}, defaultBiomeCategories.current);
              await new Promise((resolve) => setTimeout(resolve, 300));
            }
            const initializedMap = useMapStore.getState().currentMap;
            setProgress(0.2);
            setStepComplete("map", true);

            // Step 3: Pre-load textures
            await preloadTextures();

            // Step 4: Pre-load room assets
            await preloadRoomAssets(initializedMap);

            // Step 5: Cache game data
            await cacheGameData(initializedMap);

            // Final step
            setStatus("Finalizing...");
            await new Promise((resolve) => setTimeout(resolve, 200));
            setProgress(1.0);
            setStatus("Ready to play!");
            setComplete(true);
            setInitializing(false); // Mark initialization as complete
          } catch (error) {
            // Initialization failed
            setError(error instanceof Error ? error.message : "Unknown error");
            setInitializing(false); // Mark initialization as complete even on error
            startupInitializationPromise = null;
          }
        })();
      }

      await startupInitializationPromise;
    };

    initialize();
  }, [
    generateMap,
    setInitializing,
    setProgress,
    setStatus,
    setComplete,
    setError,
    setStepComplete,
    cacheGameData,
    initializeGameSystems,
    preloadRoomAssets,
    preloadTextures,
  ]);

  // Debug logging

  // Show loading screen while initializing
  if (isInitializing || !showGame) {
    return (
      <GameLoadingScreen
        progress={progress}
        status={status}
        onComplete={() => {
          setShowGame(true);
        }}
      />
    );
  }

  // Show the actual game
  return <>{children}</>;
};

export default GameInitializer;

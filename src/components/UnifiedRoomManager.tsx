import React, { memo, useEffect, useCallback, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Store imports - only import what we need
import {
  useRoomStore,
  getCurrentRoom,
  getConnectedRooms,
} from "../store/roomStore";
import { useDoorProgressionStore } from "../store/doorProgressionStore";
import useRoomManagerStore from "../store/roomManagerStore";
import useMapStore from "../store/mapStore";
import usePlayerMovementStore from "../store/playerMovementStore";
import { useGameState } from "../hooks/useGameState";

// Component imports
import Door from "./Door";
import DoorDebugger from "./DoorDebugger";
import DebugSign from "./DebugSign";
import SimpleRoomRenderer from "./SimpleRoomRenderer";
import RoomInstanceRenderer from "./RoomInstanceRenderer";
import RoomTransitionEffect from "./RoomTransitionEffect";

// Data and utils
import { ROOM_DEFINITIONS } from "../data/roomDefinitions";
import { playerRoomDetection } from "../utils/playerRoomDetection";
import { gameEvents, GAME_EVENTS } from "../utils/gameEvents";

// Types
interface RoomData {
  id: string;
  name?: string;
  size?: number;
  connections?: string[];
  position?: { x: number; z: number };
}

interface DoorPosition {
  position: [number, number, number];
  rotation: [number, number, number];
}

interface UnifiedRoomManagerProps {
  mode?: "simple" | "instance" | "full";
  playerPosition?: [number, number, number];
  onRoomChange?: (roomId: string) => void;
  onRoomEnter?: (roomId: string) => void;
  onRoomExit?: (roomId: string) => void;
  onInteraction?: (interactionType: string, roomId: string) => void;
  showDebugInfo?: boolean;
}

// Constants
const ROOM_SIZE = 10;
const WALL_THICKNESS = 0.2;
const GROUND_LEVEL = -0.5;
const DOOR_HEIGHT_OFFSET = 1.25;

// Memoized door position calculator
const calculateDoorPosition = (
  mode: string,
  roomSize: number,
  index: number,
  totalDoors: number,
  currentRoom?: RoomData,
  targetRoom?: RoomData
): DoorPosition => {
  if (mode === "simple") {
    // Simple mode: distribute doors around perimeter
    const angleStep = (2 * Math.PI) / totalDoors;
    const radius = roomSize / 2 + WALL_THICKNESS;
    const angle = index * angleStep;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const rotationY = angle + Math.PI;

    return {
      position: [x, GROUND_LEVEL + DOOR_HEIGHT_OFFSET, z],
      rotation: [0, rotationY, 0],
    };
  } else {
    // Instance/full mode: use proper door positioning based on room positions
    if (currentRoom && targetRoom) {
      const dx = targetRoom.position.x - currentRoom.position.x;
      const dz = targetRoom.position.z - currentRoom.position.z;

      const roomHalfSize = roomSize / 2;

      if (Math.abs(dx) > Math.abs(dz)) {
        // East or West
        if (dx > 0) {
          return {
            position: [roomHalfSize, 0.5, 0],
            rotation: [0, -Math.PI / 2, 0],
          };
        } else {
          return {
            position: [-roomHalfSize, 0.5, 0],
            rotation: [0, Math.PI / 2, 0],
          };
        }
      } else {
        // North or South
        if (dz > 0) {
          return {
            position: [0, 0.5, roomHalfSize],
            rotation: [0, 0, 0],
          };
        } else {
          return {
            position: [0, 0.5, -roomHalfSize],
            rotation: [0, Math.PI, 0],
          };
        }
      }
    } else {
      // Fallback: distribute doors around perimeter
      const angleStep = (2 * Math.PI) / totalDoors;
      const radius = roomSize / 2;
      const angle = index * angleStep;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const rotationY = angle + Math.PI;

      return {
        position: [x, 0.5, z],
        rotation: [0, rotationY, 0],
      };
    }
  }
};

// Memoized room data getter
const useRoomData = (
  mode: string,
  activeRoomId: string,
  roomInstances: Map<string, any>,
  currentMap: any
) => {
  return useMemo(() => {
    if (mode === "instance") {
      const currentRoomInstance = activeRoomId
        ? roomInstances.get(activeRoomId)
        : null;
      const room = currentRoomInstance?.room;
      const connectedRooms =
        room?.connections
          ?.map((connectionId: string) =>
            currentMap?.rooms.find((r: RoomData) => r.id === connectionId)
          )
          .filter(Boolean) || [];
      return { room, connectedRooms };
    } else {
      const room = getCurrentRoom();
      const connectedRooms = getConnectedRooms(activeRoomId);
      return { room, connectedRooms };
    }
  }, [mode, activeRoomId, roomInstances, currentMap]);
};

const UnifiedRoomManager: React.FC<UnifiedRoomManagerProps> = memo(
  ({
    mode = "instance",
    playerPosition = [0, 0, 0],
    onRoomChange,
    onRoomEnter,
    onRoomExit,
    onInteraction,
    showDebugInfo = false,
  }) => {
    // Store hooks - only subscribe to what we need
    const roomStore = useRoomStore();
    const doorStore = useDoorProgressionStore();
    const roomManagerStore = useRoomManagerStore();
    const mapStore = useMapStore();
    const playerMovementStore = usePlayerMovementStore();
    const gameState = useGameState();
    const { camera } = useThree();

    // Extract only the values we need
    const { currentRoomId, isTransitioning, transitionProgress } = roomStore;
    const { isDoorUnlocked, getDoorState, getDoorType, unlockDoor } = doorStore;
    const {
      currentRoomId: instanceRoomId,
      roomInstances,
      loadRoom,
      setActiveRoom,
    } = roomManagerStore;
    const { currentMap, generateMap } = mapStore;
    const {
      isTransitioning: playerTransitioning,
      transitionProgress: playerProgress,
      fromRoomId,
      toRoomId,
    } = playerMovementStore;
    const { updateRoom, updateGamePhase } = gameState;

    // Refs for room detection
    const lastDetectedRoomId = React.useRef<string | null>(null);
    const lastUpdateTime = React.useRef(0);

    // Computed values
    const activeRoomId = mode === "instance" ? instanceRoomId : currentRoomId;
    const activeTransitioning =
      mode === "instance" ? playerTransitioning : isTransitioning;
    const activeProgress =
      mode === "instance" ? playerProgress : transitionProgress;

    // Get room data using memoized hook
    const { room: currentRoom, connectedRooms } = useRoomData(
      mode,
      activeRoomId,
      roomInstances,
      currentMap
    );

    // Initialize rooms from definitions (for simple/full modes)
    useEffect(() => {
      if (mode === "simple" || mode === "full") {
        const { addRoom } = useRoomStore.getState();
        Object.values(ROOM_DEFINITIONS).forEach((roomDef) => {
          addRoom({
            id: roomDef.id,
            name: roomDef.name,
            position: { x: 0, z: 0 },
            connections: roomDef.doors,
            spawnPosition: roomDef.spawnPosition,
          });
        });
      }
    }, [mode]);

    // Initialize map and load start room (for instance mode)
    useEffect(() => {
      if (mode === "instance") {
        const initializeGame = async () => {
          if (!currentMap) {
            generateMap();
            return;
          }

          if (!instanceRoomId) {
            await loadRoom(currentMap.startRoomId);
            setActiveRoom(currentMap.startRoomId);

            // Spawn player in the start room
            const startRoom = currentMap.rooms.find(
              (r: RoomData) => r.id === currentMap.startRoomId
            );
            if (startRoom) {
              const roomSize = startRoom.size || ROOM_SIZE;
              const spawnPosition = new THREE.Vector3(
                0,
                0.5,
                roomSize / 2 - 1.5
              );
              const spawnRotation = new THREE.Euler(0, Math.PI, 0);

              setTimeout(() => {
                window.dispatchEvent(
                  new CustomEvent("playerTeleport", {
                    detail: {
                      position: spawnPosition.toArray(),
                      rotation: spawnRotation.toArray(),
                    },
                  })
                );
              }, 100);
            }
          }
        };

        initializeGame();
      }
    }, [
      mode,
      currentMap,
      instanceRoomId,
      generateMap,
      loadRoom,
      setActiveRoom,
    ]);

    // Initialize room bounds for player detection (for instance mode)
    useEffect(() => {
      if (mode === "instance" && currentMap?.rooms) {
        playerRoomDetection.initializeRoomBounds(currentMap.rooms);
      }
    }, [mode, currentMap]);

    // Handle room changes
    useEffect(() => {
      if (onRoomChange && activeRoomId) {
        onRoomChange(activeRoomId);
      }
    }, [activeRoomId, onRoomChange]);

    // Room detection for instance mode - memoized callback
    const detectRoom = useCallback(
      (playerPosition: { x: number; y: number; z: number }) => {
        if (mode !== "instance") return;

        const now = Date.now();
        if (now - lastUpdateTime.current < 100) return; // Throttle to 10fps max
        lastUpdateTime.current = now;

        const detectedRoomId =
          playerRoomDetection.detectCurrentRoom(playerPosition);

        if (detectedRoomId !== lastDetectedRoomId.current) {
          const previousRoomId = lastDetectedRoomId.current;
          lastDetectedRoomId.current = detectedRoomId;

          updateRoom(detectedRoomId);

          if (detectedRoomId) {
            const room = currentMap?.rooms.find(
              (r: RoomData) => r.id === detectedRoomId
            );
            if (room) {
              // Update game phase based on room type
              const gamePhase =
                room.type === "boss"
                  ? "boss"
                  : room.type === "puzzle"
                  ? "puzzle"
                  : "exploration";
              updateGamePhase(gamePhase);

              gameEvents.emit(GAME_EVENTS.ROOM_ENTER, room);
              onRoomEnter?.(detectedRoomId);
            }
          } else if (previousRoomId) {
            const previousRoom = currentMap?.rooms.find(
              (r: RoomData) => r.id === previousRoomId
            );
            if (previousRoom) {
              gameEvents.emit(GAME_EVENTS.ROOM_EXIT, previousRoom);
              onRoomExit?.(previousRoomId);
            }
            updateGamePhase("exploration");
          }
        }
      },
      [mode, currentMap, updateRoom, updateGamePhase, onRoomEnter, onRoomExit]
    );

    // Main detection loop for instance mode
    useFrame(() => {
      if (mode === "instance" && playerRoomDetection.isDetectionEnabled()) {
        const playerPos = {
          x: camera.position.x,
          y: camera.position.y,
          z: camera.position.z,
        };
        detectRoom(playerPos);
      }
    });

    // Cleanup
    useEffect(() => {
      return () => {
        if (mode === "instance") {
          playerRoomDetection.clearCurrentRoom();
        }
      };
    }, [mode]);

    // Memoized door click handler
    const handleDoorClickCallback = useCallback(
      (room: RoomData, doorId: string) => {
        if (mode === "full") {
          const isUnlocked = isDoorUnlocked(doorId);
          if (isUnlocked) {
            // Use roomManagerStore's startTransition for proper room loading
            const { startTransition } = useRoomManagerStore.getState();
            startTransition(activeRoomId, room.id, "north");
          } else {
            unlockDoor(doorId, activeRoomId, "manual");
          }
        } else {
          // Instance mode: also handle door clicks for navigation
          console.log(`🚪 UnifiedRoomManager: Door clicked -> ${room.id}`);
          // Use roomManagerStore's startTransition for proper room loading
          const { startTransition } = useRoomManagerStore.getState();
          startTransition(activeRoomId, room.id, "north");
        }
      },
      [mode, isDoorUnlocked, unlockDoor, activeRoomId]
    );

    // Memoized door state change handler
    const handleDoorStateChange = useCallback(
      (doorId: string, newState: string) => {
        if (mode === "full") {
          useDoorProgressionStore.getState().setDoorState(doorId, newState);
        }
      },
      [mode]
    );

    // Memoized room transition handler
    const handleRoomTransition = useCallback(
      (fromRoomId: string, toRoomId: string, direction: string) => {
        const { startTransition } = useRoomManagerStore.getState();
        startTransition(fromRoomId, toRoomId, direction);
      },
      []
    );

    // Show loading/transition state
    if (activeTransitioning) {
      return (
        <group>
          <mesh position={[0, 2, 0]}>
            <planeGeometry args={[8, 4]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 2, 0.1]}>
            <planeGeometry args={[6, 2]} />
            <meshBasicMaterial color="#FFFFFF" />
          </mesh>
        </group>
      );
    }

    if (!currentRoom) {
      return null;
    }

    // Get room component for rendering
    const CurrentRoomComponent =
      activeRoomId && ROOM_DEFINITIONS[activeRoomId]?.component;

    return (
      <group>
        {/* Render current room content */}
        {mode === "simple" && <SimpleRoomRenderer />}
        {mode === "instance" && (
          <RoomInstanceRenderer
            playerPosition={playerPosition}
            onInteraction={onInteraction}
            onRoomTransition={handleRoomTransition}
          />
        )}
        {mode === "full" && CurrentRoomComponent && <CurrentRoomComponent />}

        {/* Render doors */}
        {connectedRooms.map((room: RoomData, index: number) => {
          if (!room) return null;

          const doorPosition = calculateDoorPosition(
            mode,
            currentRoom?.size || ROOM_SIZE,
            index,
            connectedRooms.length,
            currentRoom,
            room
          );
          const doorId = `door-${activeRoomId}-${room.id}`;
          const roomName = room.name || room.id;

          // Use different door components based on mode
          if (mode === "simple") {
            return (
              <group key={`door-group-${room.id}`}>
                <Door
                  targetRoomId={room.id}
                  position={doorPosition.position}
                  rotation={doorPosition.rotation}
                  showLabel={true}
                  onDoorClick={() => handleDoorClickCallback(room, doorId)}
                />
                {showDebugInfo && (
                  <DebugSign
                    position={[
                      doorPosition.position[0] + 1.5,
                      doorPosition.position[1] + 1,
                      doorPosition.position[2] + 1.5,
                    ]}
                    text={`→ ${roomName}`}
                    color="#00FF00"
                  />
                )}
              </group>
            );
          } else {
            const isUnlocked = mode === "full" ? isDoorUnlocked(doorId) : true;
            const doorState = mode === "full" ? getDoorState(doorId) : "closed";
            const doorType = mode === "full" ? getDoorType(doorId) : "normal";

            return (
              <Door
                key={doorId}
                position={doorPosition.position}
                rotation={doorPosition.rotation}
                targetRoomId={room.id}
                showLabel={true}
                state={doorState}
                type={doorType}
                isLocked={!isUnlocked}
                glowEffect={doorType === "secret"}
                onDoorClick={() => handleDoorClickCallback(room, doorId)}
                onStateChange={(newState) =>
                  handleDoorStateChange(doorId, newState)
                }
              />
            );
          }
        })}

        {/* Room Transition Effect (instance mode) */}
        {mode === "instance" && (
          <RoomTransitionEffect
            isTransitioning={activeTransitioning}
            fromRoomId={fromRoomId}
            toRoomId={toRoomId}
            progress={activeProgress}
          />
        )}

        {/* Door Debugger (full mode) */}
        {mode === "full" && showDebugInfo && (
          <DoorDebugger showDebugger={import.meta.env.DEV} />
        )}
      </group>
    );
  }
);

UnifiedRoomManager.displayName = "UnifiedRoomManager";

export default UnifiedRoomManager;

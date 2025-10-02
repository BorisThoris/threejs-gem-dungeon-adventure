import React, { useEffect, useState, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  roomNavigationSystem,
  type DoorInfo,
} from "../systems/RoomNavigationSystem";
import TexturedDoor from "./TexturedDoor";
import EnhancedRoomTransition from "./EnhancedRoomTransition";
import Room from "./Room";
import useMapStore from "../store/mapStore";

interface ImprovedRoomManagerProps {
  onRoomChange?: (roomId: string) => void;
  onDoorHover?: (doorId: string, isHovered: boolean) => void;
  playerPosition?: [number, number, number];
}

const ImprovedRoomManager: React.FC<ImprovedRoomManagerProps> = ({
  onRoomChange,
  onDoorHover,
  playerPosition = [0, 0, 0],
}) => {
  const { camera } = useThree();
  const { currentMap, generateMap } = useMapStore();

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [doors, setDoors] = useState<DoorInfo[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionInfo, setTransitionInfo] = useState<{
    fromRoomId?: string;
    toRoomId?: string;
    direction?: "north" | "south" | "east" | "west";
  }>({});

  // Initialize navigation system
  useEffect(() => {
    if (!currentMap) {
      generateMap();
      return;
    }

    // Initialize navigation system
    roomNavigationSystem.initialize(currentMap.rooms, currentMap.startRoomId);

    // Set up event listeners
    const handleRoomChanged = ({
      currentRoomId: roomId,
    }: {
      currentRoomId: string;
    }) => {
      setCurrentRoomId(roomId);
      onRoomChange?.(roomId);
    };

    const handleDoorsUpdated = (doorList: DoorInfo[]) => {
      console.log("ImprovedRoomManager: Doors updated event received", {
        doorCount: doorList.length,
        doors: doorList.map((d) => ({
          id: d.id,
          targetRoomId: d.targetRoomId,
          direction: d.direction,
        })),
      });
      setDoors(doorList);
    };

    const handleTransitionStarted = (transition: any) => {
      setIsTransitioning(true);
      setTransitionProgress(0);
      setTransitionInfo({
        fromRoomId: transition.fromRoomId,
        toRoomId: transition.toRoomId,
        direction: transition.direction,
      });
    };

    const handleTransitionProgress = (progress: number) => {
      setTransitionProgress(progress);
    };

    const handleTransitionCompleted = ({ roomId }: { roomId: string }) => {
      setIsTransitioning(false);
      setTransitionProgress(0);
      setTransitionInfo({});
    };

    // Add event listeners
    roomNavigationSystem.on("roomChanged", handleRoomChanged);
    roomNavigationSystem.on("doorsUpdated", handleDoorsUpdated);
    roomNavigationSystem.on("transitionStarted", handleTransitionStarted);
    roomNavigationSystem.on("transitionProgress", handleTransitionProgress);
    roomNavigationSystem.on("transitionCompleted", handleTransitionCompleted);

    // Get initial state
    const state = roomNavigationSystem.getState();
    setCurrentRoomId(state.currentRoomId);
    setDoors(Array.from(state.doors.values()));

    return () => {
      // Cleanup event listeners
      roomNavigationSystem.off("roomChanged", handleRoomChanged);
      roomNavigationSystem.off("doorsUpdated", handleDoorsUpdated);
      roomNavigationSystem.off("transitionStarted", handleTransitionStarted);
      roomNavigationSystem.off("transitionProgress", handleTransitionProgress);
      roomNavigationSystem.off(
        "transitionCompleted",
        handleTransitionCompleted
      );
    };
  }, [currentMap, generateMap, onRoomChange]);

  // Handle door click
  const handleDoorClick = useCallback(
    (doorId: string, targetRoomId: string) => {
      console.log(`🚪 Door clicked: ${doorId} -> ${targetRoomId}`);

      // Get door info to determine direction
      const door = roomNavigationSystem.getDoor(doorId);
      const direction = door?.direction || "south";

      // Start transition
      roomNavigationSystem.startTransition(targetRoomId, direction);
    },
    []
  );

  // Handle door hover
  const handleDoorHover = useCallback(
    (doorId: string, isHovered: boolean) => {
      onDoorHover?.(doorId, isHovered);
    },
    [onDoorHover]
  );

  // Get current room for rendering
  const currentRoom = currentRoomId
    ? roomNavigationSystem.getRoom(currentRoomId)
    : null;

  console.log(
    `🚪 ImprovedRoomManager: Rendering ${doors.length} doors for room ${currentRoomId}`,
    {
      currentRoom: currentRoom
        ? {
            id: currentRoom.id,
            connections: currentRoom.connections,
            connectionsLength: currentRoom.connections?.length || 0,
          }
        : null,
    }
  );

  // Render room at origin (room-instance mode)
  const roomAtOrigin = currentRoom
    ? {
        ...currentRoom,
        position: { x: 0, y: 0, z: 0 }, // Always render at origin
      }
    : null;

  if (!currentMap || !currentRoom || !roomAtOrigin) {
    return null;
  }

  return (
    <group>
      {/* Debug button to force door update */}
      {process.env.NODE_ENV === "development" && (
        <mesh
          position={[0, 2, 0]}
          onClick={() => roomNavigationSystem.forceUpdateDoors()}
        >
          <boxGeometry args={[0.5, 0.5, 0.1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      )}

      {/* Render current room */}
      <Room
        room={roomAtOrigin}
        isCurrent={true}
        isVisited={true}
        connectedRooms={[]} // Doors are handled separately
        playerPosition={playerPosition}
        disableDoors={true} // Disable internal door rendering - we use TexturedDoor instead
        // Don't pass onRoomTransition - we handle doors separately with TexturedDoor
      />

      {/* Render doors */}
      {doors.map((door) => (
        <TexturedDoor
          key={door.id}
          id={door.id}
          position={door.position}
          rotation={door.rotation}
          targetRoomId={door.targetRoomId}
          direction={door.direction}
          isLocked={door.isLocked}
          keyRequired={door.keyRequired}
          onDoorClick={handleDoorClick}
          onDoorHover={handleDoorHover}
          playerPosition={playerPosition}
          interactionDistance={3}
          showLabel={true}
          doorStyle={door.style || "wooden"}
        />
      ))}

      {/* Room transition effect */}
      <EnhancedRoomTransition
        isTransitioning={isTransitioning}
        fromRoomId={transitionInfo.fromRoomId}
        toRoomId={transitionInfo.toRoomId}
        progress={transitionProgress}
        direction={transitionInfo.direction}
        style="fade"
      />
    </group>
  );
};

export default ImprovedRoomManager;

import React, { useRef, useEffect } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import useMapStore from "../../store/mapStore";
import { useGameState } from "../../hooks/useGameState";
import { gameEvents, GAME_EVENTS } from "../../utils/gameEvents";
import { useDoorInteraction } from "../../hooks/useDoorInteraction";
import type { Room } from "../../types/map";

// Import all room content components
import StartRoom from "./StartRoom";
import MeditationRoom from "./MeditationRoom";
import BenchPressRoom from "./BenchPressRoom";
import LibraryRoom from "./LibraryRoom";
import ShopRoom from "./ShopRoom";
import TreasureRoom from "./TreasureRoom";
import PuzzleRoom from "./PuzzleRoom";
import BossRoom from "./BossRoom";
import CoffeeRoom from "./CoffeeRoom";
import ChallengeRoom from "./ChallengeRoom";
import LibraryUpgradeRoom from "./LibraryUpgradeRoom";
import PortalRoom from "./PortalRoom";
import ArenaRoom from "./ArenaRoom";
import EnemyRoom from "./EnemyRoom";
import EndRoom from "./EndRoom";
import SpecialRoom from "./SpecialRoom";
import CorridorRoom from "./CorridorRoom";
import ColosseumRoom from "./ColosseumRoom";
import ShapedShell from "./ShapedShell";

// Room configuration interface
interface RoomConfig {
  type: string;
  component: React.ComponentType<any>;
  title: string;
  emoji: string;
  props?: (room: Room) => any;
}

// Room factory configuration
const ROOM_CONFIGS: RoomConfig[] = [
  {
    type: "start",
    component: StartRoom,
    title: "🚀 START ROOM 🚀",
    emoji: "🚀",
  },
  {
    type: "corridor",
    component: CorridorRoom,
    title: "🧱 CORRIDOR 🧱",
    emoji: "🧱",
    props: (room) => ({ size: room.size }),
  },
  {
    type: "colosseum",
    component: ColosseumRoom,
    title: "🏟️ COLOSSEUM 🏟️",
    emoji: "🏟️",
    props: (room) => ({ size: room.size }),
  },
  {
    type: "meditation",
    component: MeditationRoom,
    title: "🧘 MEDITATION ROOM 🧘",
    emoji: "🧘",
  },
  {
    type: "bench-press",
    component: BenchPressRoom,
    title: "💪 GYM ROOM 💪",
    emoji: "💪",
  },
  {
    type: "library",
    component: LibraryRoom,
    title: "📚 LIBRARY 📚",
    emoji: "📚",
    props: (room) => ({ books: (room as any).books || [] }),
  },
  {
    type: "shop",
    component: ShopRoom,
    title: "🛒 SHOP 🛒",
    emoji: "🛒",
  },
  {
    type: "treasure",
    component: TreasureRoom,
    title: "💰 TREASURE ROOM 💰",
    emoji: "💰",
  },
  {
    type: "puzzle",
    component: PuzzleRoom,
    title: "🧩 PUZZLE ROOM 🧩",
    emoji: "🧩",
    props: (room) => ({
      puzzle: (room as any).puzzle,
      onPuzzleComplete: () => {},
    }),
  },
  {
    type: "boss",
    component: BossRoom,
    title: "👹 BOSS ROOM 👹",
    emoji: "👹",
  },
  {
    type: "coffee",
    component: CoffeeRoom,
    title: "☕ COFFEE ROOM ☕",
    emoji: "☕",
  },
  {
    type: "challenge",
    component: ChallengeRoom,
    title: "⚔️ CHALLENGE ROOM ⚔️",
    emoji: "⚔️",
  },
  {
    type: "library-upgrade",
    component: LibraryUpgradeRoom,
    title: "📖 LIBRARY UPGRADE 📖",
    emoji: "📖",
  },
  {
    type: "portal",
    component: PortalRoom,
    title: "🌀 PORTAL ROOM 🌀",
    emoji: "🌀",
    props: (room) => ({ portalDestination: (room as any).portalDestination }),
  },
  {
    type: "arena",
    component: ArenaRoom,
    title: "⚔️ ARENA ROOM ⚔️",
    emoji: "⚔️",
  },
  {
    type: "enemy",
    component: EnemyRoom,
    title: "👾 ENEMY ROOM 👾",
    emoji: "👾",
  },
  {
    type: "end",
    component: EndRoom,
    title: "🏁 END ROOM 🏁",
    emoji: "🏁",
  },
  {
    type: "devil-room",
    component: SpecialRoom,
    title: "😈 DEVIL ROOM 😈",
    emoji: "😈",
    props: (room) => ({
      roomType: room.type as any,
      items: (room as any).items || [],
      onItemInteraction: () => {},
      onRoomEnter: () => {},
    }),
  },
  {
    type: "angel-room",
    component: SpecialRoom,
    title: "😇 ANGEL ROOM 😇",
    emoji: "😇",
    props: (room) => ({
      roomType: room.type as any,
      items: (room as any).items || [],
      onItemInteraction: () => {},
      onRoomEnter: () => {},
    }),
  },
  {
    type: "cursed-room",
    component: SpecialRoom,
    title: "💀 CURSED ROOM 💀",
    emoji: "💀",
    props: (room) => ({
      roomType: room.type as any,
      items: (room as any).items || [],
      onItemInteraction: () => {},
      onRoomEnter: () => {},
    }),
  },
  {
    type: "secret",
    component: SpecialRoom,
    title: "🔍 SECRET ROOM 🔍",
    emoji: "🔍",
    props: (room) => ({
      roomType: room.type as any,
      items: (room as any).items || [],
      onItemInteraction: () => {},
      onRoomEnter: () => {},
    }),
  },
];

// Get room configuration by type
const getRoomConfig = (roomType: string): RoomConfig | null => {
  return ROOM_CONFIGS.find((config) => config.type === roomType) || null;
};

// Calculate door position based on relative position of target room
const calculateDoorPosition = (
  currentRoom: Room,
  targetRoom: Room,
  roomSize: number
) => {
  const dx = targetRoom.position.x - currentRoom.position.x;
  const dz = targetRoom.position.z - currentRoom.position.z;

  // Determine which wall the door should be on based on relative position
  if (Math.abs(dx) > Math.abs(dz)) {
    // East/West connection
    if (dx > 0) {
      // Target is to the East (right), door on East wall
      return {
        pos: [roomSize / 2, 1.5, 0] as [number, number, number],
        rot: [0, Math.PI / 2, 0] as [number, number, number],
      };
    } else {
      // Target is to the West (left), door on West wall
      return {
        pos: [-roomSize / 2, 1.5, 0] as [number, number, number],
        rot: [0, -Math.PI / 2, 0] as [number, number, number],
      };
    }
  } else {
    // North/South connection
    if (dz > 0) {
      // Target is to the South (front), door on South wall
      return {
        pos: [0, 1.5, roomSize / 2] as [number, number, number],
        rot: [0, Math.PI, 0] as [number, number, number],
      };
    } else {
      // Target is to the North (back), door on North wall
      return {
        pos: [0, 1.5, -roomSize / 2] as [number, number, number],
        rot: [0, 0, 0] as [number, number, number],
      };
    }
  }
};

// Add spacing for multiple doors on the same wall
const addDoorSpacing = (
  doorPosition: {
    pos: [number, number, number];
    rot: [number, number, number];
  },
  index: number,
  totalDoors: number,
  roomSize: number
) => {
  const { pos, rot } = doorPosition;
  const [x, y, z] = pos;

  // If there are multiple doors, space them out
  if (totalDoors > 1) {
    const spacing = roomSize / (totalDoors + 1);
    const offset = (index + 1) * spacing - roomSize / 2;

    // Determine which axis to offset based on wall orientation
    if (Math.abs(rot[1]) === Math.PI / 2) {
      // East/West walls - offset Z
      return {
        pos: [x, y, offset] as [number, number, number],
        rot: rot,
      };
    } else {
      // North/South walls - offset X
      return {
        pos: [offset, y, z] as [number, number, number],
        rot: rot,
      };
    }
  }

  return doorPosition;
};

// Door component
const Door: React.FC<{
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  targetRoomType: string;
  onDoorEnter: () => void;
}> = ({ position, rotation, targetRoomId, targetRoomType, onDoorEnter }) => {
  const doorRef = useRef<THREE.Mesh>(null);
  const roomConfig = getRoomConfig(targetRoomType);

  return (
    <group position={position} rotation={rotation}>
      {/* Door frame - Black rectangle */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 3, 0.2]} />
        <meshLambertMaterial color="#000000" />
      </mesh>

      {/* Door outline for better visibility */}
      <mesh position={[0, 0, 0.11]}>
        <boxGeometry args={[2.1, 3.1, 0.02]} />
        <meshLambertMaterial color="#333333" />
      </mesh>

      {/* Door collision detector - Larger invisible area for easier clicking */}
      <RigidBody type="fixed" sensor>
        <mesh
          ref={doorRef}
          position={[0, 1.5, 0]}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(`Door clicked: ${targetRoomType} (${targetRoomId})`);
            onDoorEnter();
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            e.preventDefault();
            document.body.style.cursor = "pointer";
            console.log(`Door hover: ${targetRoomType} (${targetRoomId})`);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            e.preventDefault();
            document.body.style.cursor = "default";
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(
              `Door pointer down: ${targetRoomType} (${targetRoomId})`
            );
            // Also trigger on pointer down for better responsiveness
            onDoorEnter();
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(`Door pointer up: ${targetRoomType} (${targetRoomId})`);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log(
              `Door double-clicked: ${targetRoomType} (${targetRoomId})`
            );
            onDoorEnter();
          }}
        >
          <boxGeometry args={[3, 4, 0.5]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.1} />
        </mesh>
      </RigidBody>

      {/* Door label with room type emoji */}
      <Text
        position={[0, 1.5, 0.15]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {roomConfig?.emoji || "🚪"} DOOR
      </Text>

      {/* Room type text below */}
      <Text
        position={[0, 0.8, 0.15]}
        fontSize={0.2}
        color="#cccccc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {targetRoomType.toUpperCase()}
      </Text>
    </group>
  );
};

// Main Room Factory Component
interface RoomFactoryProps {
  currentRoomId: string | null;
  onRoomChange?: (roomId: string) => void;
}

const RoomFactory: React.FC<RoomFactoryProps> = ({
  currentRoomId,
  onRoomChange,
}) => {
  const { currentMap } = useMapStore();
  const { updateRoom, updateGamePhase } = useGameState();
  const roomRef = useRef<THREE.Group>(null);

  // Get current room data
  const currentRoom = currentMap?.rooms.find(
    (room) => room.id === currentRoomId
  );
  const roomConfig = currentRoom ? getRoomConfig(currentRoom.type) : null;

  // Debug logging for room connections
  if (currentRoom) {
    console.log(
      `RoomFactory: Current room ${currentRoom.id} (${currentRoom.type})`
    );
    console.log(`RoomFactory: Connections:`, currentRoom.connections);
    console.log(`RoomFactory: Total rooms in map:`, currentMap?.rooms.length);
  }

  // Get room size early for door calculations
  const roomSize = currentRoom?.size || 8;

  // Prepare door data for keyboard interaction
  const doorData =
    currentRoom?.connections
      ?.map((connectionId) => {
        const targetRoom = currentMap?.rooms.find((r) => r.id === connectionId);
        if (!targetRoom) return null;

        const doorPosition = calculateDoorPosition(
          currentRoom!,
          targetRoom,
          roomSize
        );
        const spacedPosition = addDoorSpacing(
          doorPosition,
          0, // For keyboard interaction, we'll use the first door position
          currentRoom!.connections.length,
          roomSize
        );

        return {
          id: connectionId,
          position: spacedPosition.pos,
          type: targetRoom.type,
        };
      })
      .filter(Boolean) || [];

  // Enable keyboard door interaction
  useDoorInteraction({
    onDoorEnter: (doorId) => {
      console.log(`RoomFactory: Keyboard door interaction to ${doorId}`);
      onRoomChange?.(doorId);
    },
    doors: doorData,
    interactionDistance: 4,
  });

  // Update game state when room changes
  useEffect(() => {
    if (currentRoom) {
      updateRoom(currentRoom.id);

      // Set game phase based on room type
      if (currentRoom.type === "boss") {
        updateGamePhase("boss");
      } else if (currentRoom.type === "puzzle") {
        updateGamePhase("puzzle");
      } else {
        updateGamePhase("exploration");
      }

      // Emit room enter event
      gameEvents.emit(GAME_EVENTS.ROOM_ENTER, currentRoom);

      console.log(
        `RoomFactory: Entered ${currentRoom.id} (${currentRoom.type})`
      );
      console.log(`RoomFactory: Room connections:`, currentRoom.connections);
    }
  }, [currentRoom, updateRoom, updateGamePhase]);

  if (!currentMap || !currentRoom || !roomConfig) {
    return null;
  }

  const roomPosition = { x: 0, y: 0, z: 0 }; // Always center the room

  // Debug logging for room positioning
  console.log(
    `RoomFactory: Room ${currentRoom.id} positioned at [${roomPosition.x}, ${roomPosition.y}, ${roomPosition.z}]`
  );
  console.log(`RoomFactory: Floor positioned at [0, -0.5, 0] relative to room`);
  console.log(`RoomFactory: Floor top at y = 0`);

  // Get room component props and always include size for consistent footprint
  const roomProps = {
    size: roomSize,
    ...(roomConfig.props ? roomConfig.props(currentRoom) : {}),
  } as any;

  return (
    <group
      ref={roomRef}
      position={[roomPosition.x, roomPosition.y, roomPosition.z]}
    >
      {/* Size-based shell(s): if multi-tile, render a shell per tile position */}
      {currentRoom.isMultiTile &&
      currentRoom.tilePositions &&
      currentRoom.tilePositions.length > 0 ? (
        <group>
          {currentRoom.tilePositions.map((pos, idx) => (
            <group
              key={`tile-${idx}`}
              position={[
                pos.x - currentRoom.position.x,
                0,
                pos.z - currentRoom.position.z,
              ]}
            >
              <ShapedShell size={roomSize} shape={currentRoom.shape as any} />
            </group>
          ))}
        </group>
      ) : (
        <ShapedShell size={roomSize} shape={currentRoom.shape as any} />
      )}

      {/* Roof */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, 4.5, 0]} receiveShadow>
          <boxGeometry args={[roomSize, 0.5, roomSize]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </RigidBody>

      {/* Doors - Black rectangle doors that trigger room changes */}
      {currentRoom.connections && currentRoom.connections.length > 0 ? (
        <group key={`doors-${currentRoom.id}`}>
          {/* RoomFactory: Rendering doors for room */}
          {currentRoom.connections.map((connectionId, index) => {
            const targetRoom = currentMap?.rooms.find(
              (r) => r.id === connectionId
            );
            if (!targetRoom) {
              console.warn(
                `RoomFactory: Target room ${connectionId} not found!`
              );
              return null;
            }

            // Calculate door position based on relative position of target room
            const doorPosition = calculateDoorPosition(
              currentRoom,
              targetRoom,
              roomSize
            );

            // Add spacing for multiple doors on same wall
            const spacedPosition = addDoorSpacing(
              doorPosition,
              index,
              currentRoom.connections.length,
              roomSize
            );

            // Debug logging
            console.log(
              `Door ${index + 1}/${currentRoom.connections.length}: ${
                currentRoom.type
              } -> ${targetRoom.type}`,
              {
                currentPos: `${currentRoom.position.x}, ${currentRoom.position.z}`,
                targetPos: `${targetRoom.position.x}, ${targetRoom.position.z}`,
                doorPos: spacedPosition.pos,
                doorRot: spacedPosition.rot,
              }
            );

            return (
              <Door
                key={`door-${connectionId}`}
                position={spacedPosition.pos}
                rotation={spacedPosition.rot}
                targetRoomId={connectionId}
                targetRoomType={targetRoom.type}
                onDoorEnter={() => onRoomChange?.(connectionId)}
              />
            );
          })}
        </group>
      ) : (
        console.warn(
          `RoomFactory: No connections found for room ${currentRoom.id}`
        )
      )}

      {/* Room-specific content - Render actual room components */}
      <roomConfig.component {...roomProps} />

      {/* Room Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        {roomConfig.title}
      </Text>
    </group>
  );
};

export default RoomFactory;

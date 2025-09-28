import React from "react";
import { RigidBody } from "@react-three/rapier";
import {
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  OctahedronGeometry,
} from "three";
import type { Room as RoomType, Item } from "../types/map";
import { RoomType as RoomTypeValues } from "../types/map";
import ItemSprite from "./ItemSprite";
import PuzzleGrid from "./PuzzleGrid";
import TreasureRoom from "./primitives/rooms/TreasureRoom";
import ShopRoom from "./primitives/rooms/ShopRoom";
import PuzzleRoom from "./primitives/rooms/PuzzleRoom";
import SpecialRoom from "./primitives/rooms/SpecialRoom";
import LibraryRoom from "./primitives/rooms/LibraryRoom";
import BenchPressRoom from "./primitives/rooms/BenchPressRoom";
import CoffeeRoom from "./primitives/rooms/CoffeeRoom";
import LibraryUpgradeRoom from "./primitives/rooms/LibraryUpgradeRoom";
import MeditationRoom from "./primitives/rooms/MeditationRoom";
import PortalRoom from "./primitives/rooms/PortalRoom";
import ArenaRoom from "./primitives/rooms/ArenaRoom";
import BossRoom from "./primitives/rooms/BossRoom";
import StartRoom from "./primitives/rooms/StartRoom";
import EndRoom from "./primitives/rooms/EndRoom";
import EnemyRoom from "./primitives/rooms/EnemyRoom";
import RoomInteraction from "./RoomInteraction";
// import Door from "./Door"; // DISABLED FOR NOW
import DestructibleWall from "./DestructibleWall";
import RoomDecorator from "./primitives/elements/RoomDecorator";

interface RoomProps {
  room: RoomType;
  isCurrent: boolean;
  isVisited: boolean;
  connectedRooms: RoomType[];
  onClick?: () => void;
  playerPosition?: [number, number, number];
  onInteraction?: (interactionType: string, roomId: string) => void;
}

const Room: React.FC<RoomProps> = ({
  room,
  isCurrent,
  isVisited,
  connectedRooms,
  onClick,
  playerPosition = [0, 0, 0],
  onInteraction,
}) => {
  const roomSize = room.size || 10;

  // Debug logging for room rendering
  console.log(`=== ROOM DEBUG: ${room.id} (${room.type}) ===`);
  console.log("Room position:", room.position);
  console.log("Room size:", roomSize);
  console.log("Is current:", isCurrent);
  console.log("Is visited:", isVisited);
  console.log("Connected rooms:", connectedRooms.length);

  // Compute door placement based on relative position of connected room - DISABLED FOR NOW
  // const getDoorPosition = (self: RoomType, target: RoomType) => {
  //   const dx = target.position.x - self.position.x;
  //   const dz = target.position.z - self.position.z;

  //   // East / West
  //   if (Math.abs(dx) > Math.abs(dz)) {
  //     if (dx > 0) {
  //       // East (right wall)
  //       return {
  //         position: [roomSize / 2, 1.5, 0] as [number, number, number],
  //         rotation: [0, Math.PI / 2, 0] as [number, number, number],
  //       };
  //     } else {
  //       // West (left wall)
  //       return {
  //         position: [-roomSize / 2, 1.5, 0] as [number, number, number],
  //         rotation: [0, -Math.PI / 2, 0] as [number, number, number],
  //       };
  //     }
  //   }

  //   // North / South (z axis)
  //   if (dz > 0) {
  //     // South (front wall)
  //     return {
  //       position: [0, 1.5, roomSize / 2] as [number, number, number],
  //       rotation: [0, 0, 0] as [number, number, number],
  //     };
  //   }
  //   // North (back wall)
  //   return {
  //     position: [0, 1.5, -roomSize / 2] as [number, number, number],
  //     rotation: [0, Math.PI, 0] as [number, number, number],
  //   };
  // };

  const getRoomColor = (type: string): string => {
    switch (type) {
      case RoomTypeValues.START:
        return "#4CAF50"; // Green
      case RoomTypeValues.END:
        return "#F44336"; // Red
      case RoomTypeValues.TREASURE:
        return "#FFD700"; // Gold
      case RoomTypeValues.ENEMY:
        return "#FF5722"; // Orange
      case RoomTypeValues.PUZZLE:
        return "#9C27B0"; // Purple
      case RoomTypeValues.BOSS:
        return "#E91E63"; // Pink
      case RoomTypeValues.SECRET:
        return "#607D8B"; // Blue Grey
      // Enhanced room types
      case RoomTypeValues.MEMORY_CHAMBER:
        return "#673AB7"; // Deep Purple
      case RoomTypeValues.SHOP:
        return "#4CAF50"; // Green
      case RoomTypeValues.TRAP:
        return "#FF5722"; // Orange
      case RoomTypeValues.CHALLENGE:
        return "#FF9800"; // Amber
      case RoomTypeValues.LIBRARY:
        return "#795548"; // Brown
      case RoomTypeValues.CURSED_ROOM:
        return "#9C27B0"; // Purple
      case RoomTypeValues.DEVIL_ROOM:
        return "#E91E63"; // Pink
      case RoomTypeValues.ANGEL_ROOM:
        return "#00BCD4"; // Cyan
      default:
        return "#2196F3"; // Blue
    }
  };

  const getRoomHeight = (type: string): number => {
    switch (type) {
      case RoomTypeValues.START:
      case RoomTypeValues.END:
        return 0.2;
      case RoomTypeValues.BOSS:
        return 0.3;
      default:
        return 0.1;
    }
  };

  const roomColor = getRoomColor(room.type);
  const roomHeight = getRoomHeight(room.type);
  const opacity = isVisited ? 1 : 0.3;
  const scale = isCurrent ? 1.1 : 1;

  const wallThickness = 0.2;
  const wallHeight = 3;
  const doorWidth = 2; // Width of door openings

  // Check which walls should have doors (connections)
  const hasNorthConnection = connectedRooms.some(
    (connectedRoom) =>
      connectedRoom.position.z < room.position.z &&
      Math.abs(room.position.z - connectedRoom.position.z) === room.size &&
      room.position.x === connectedRoom.position.x
  );

  const hasSouthConnection = connectedRooms.some(
    (connectedRoom) =>
      connectedRoom.position.z > room.position.z &&
      Math.abs(room.position.z - connectedRoom.position.z) === room.size &&
      room.position.x === connectedRoom.position.x
  );

  const hasEastConnection = connectedRooms.some(
    (connectedRoom) =>
      connectedRoom.position.x > room.position.x &&
      Math.abs(room.position.x - connectedRoom.position.x) === room.size &&
      room.position.z === connectedRoom.position.z
  );

  const hasWestConnection = connectedRooms.some(
    (connectedRoom) =>
      connectedRoom.position.x < room.position.x &&
      Math.abs(room.position.x - connectedRoom.position.x) === room.size &&
      room.position.z === connectedRoom.position.z
  );

  // Get room shape geometry
  const getRoomGeometry = () => {
    const width = room.width || room.size;
    const height = room.height || room.size;

    switch (room.shape) {
      case "circle":
        return <primitive object={new CircleGeometry(width / 2, 32)} />;
      case "triangle":
        return <primitive object={new ConeGeometry(width / 2, height, 3)} />;
      case "hexagon":
        return (
          <primitive
            object={new CylinderGeometry(width / 2, width / 2, 0.1, 6)}
          />
        );
      case "octagon":
        return (
          <primitive
            object={new CylinderGeometry(width / 2, width / 2, 0.1, 8)}
          />
        );
      case "diamond":
        return <primitive object={new OctahedronGeometry(width / 2)} />;
      case "star":
        return <boxGeometry args={[width, 0.1, height]} />; // Fallback to box for star
      case "cross":
        return <boxGeometry args={[width, 0.1, height]} />;
      default:
        return <planeGeometry args={[width, height]} />;
    }
  };

  return (
    <group
      position={[room.position.x, 0, room.position.z]}
      scale={scale}
      rotation={[0, room.rotation || 0, 0]}
    >
      {/* Physical Floor with Collision - always full square for reliable physics */}
      <RigidBody type="fixed" colliders="trimesh">
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -roomHeight / 2, 0]}
          receiveShadow
        >
          <planeGeometry
            args={[room.width || roomSize, room.height || roomSize]}
          />
          <meshLambertMaterial
            color={roomColor}
            transparent
            opacity={opacity}
          />
        </mesh>
      </RigidBody>

      {/* Visual Floor Overlay - shaped for variety */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -roomHeight / 2 + 0.01, 0]}
        receiveShadow
        onClick={onClick}
      >
        {getRoomGeometry()}
        <meshLambertMaterial color={roomColor} transparent opacity={opacity} />
      </mesh>

      {/* North Wall - Split into segments if there's a door */}
      {hasNorthConnection ? (
        <>
          {/* Left segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[-roomSize / 4, wallHeight / 2, -roomSize / 2]}
              castShadow
            >
              <boxGeometry
                args={[roomSize / 2 - doorWidth / 2, wallHeight, wallThickness]}
              />
              <meshLambertMaterial
                color="#8B4513"
                onUpdate={(material) => {
                  console.log(
                    "North Wall Left Material created/updated:",
                    material
                  );
                }}
              />
            </mesh>
          </RigidBody>
          {/* Right segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[roomSize / 4, wallHeight / 2, -roomSize / 2]}
              castShadow
            >
              <boxGeometry
                args={[roomSize / 2 - doorWidth / 2, wallHeight, wallThickness]}
              />
              <meshLambertMaterial
                color="#8B4513"
                onUpdate={(material) => {
                  console.log(
                    "North Wall Right Material created/updated:",
                    material
                  );
                }}
              />
            </mesh>
          </RigidBody>
        </>
      ) : (
        <RigidBody type="fixed" colliders="trimesh">
          <mesh position={[0, wallHeight / 2, -roomSize / 2]} castShadow>
            <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
            <meshLambertMaterial
              color="#8B4513"
              onUpdate={(material) => {
                console.log("North Wall Material created/updated:", material);
              }}
            />
          </mesh>
        </RigidBody>
      )}

      {/* South Wall - Split into segments if there's a door */}
      {hasSouthConnection ? (
        <>
          {/* Left segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[-roomSize / 4, wallHeight / 2, roomSize / 2]}
              castShadow
            >
              <boxGeometry
                args={[roomSize / 2 - doorWidth / 2, wallHeight, wallThickness]}
              />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
          {/* Right segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[roomSize / 4, wallHeight / 2, roomSize / 2]}
              castShadow
            >
              <boxGeometry
                args={[roomSize / 2 - doorWidth / 2, wallHeight, wallThickness]}
              />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
        </>
      ) : (
        <RigidBody type="fixed" colliders="trimesh">
          <mesh position={[0, wallHeight / 2, roomSize / 2]} castShadow>
            <boxGeometry args={[roomSize, wallHeight, wallThickness]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        </RigidBody>
      )}

      {/* East Wall - Split into segments if there's a door */}
      {hasEastConnection ? (
        <>
          {/* Top segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[roomSize / 2, wallHeight / 2, -roomSize / 4]}
              castShadow
            >
              <boxGeometry
                args={[wallThickness, wallHeight, roomSize / 2 - doorWidth / 2]}
              />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
          {/* Bottom segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[roomSize / 2, wallHeight / 2, roomSize / 4]}
              castShadow
            >
              <boxGeometry
                args={[wallThickness, wallHeight, roomSize / 2 - doorWidth / 2]}
              />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
        </>
      ) : (
        <RigidBody type="fixed" colliders="trimesh">
          <mesh position={[roomSize / 2, wallHeight / 2, 0]} castShadow>
            <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        </RigidBody>
      )}

      {/* West Wall - Split into segments if there's a door */}
      {hasWestConnection ? (
        <>
          {/* Top segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[-roomSize / 2, wallHeight / 2, -roomSize / 4]}
              castShadow
            >
              <boxGeometry
                args={[wallThickness, wallHeight, roomSize / 2 - doorWidth / 2]}
              />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
          {/* Bottom segment */}
          <RigidBody type="fixed" colliders="trimesh">
            <mesh
              position={[-roomSize / 2, wallHeight / 2, roomSize / 4]}
              castShadow
            >
              <boxGeometry
                args={[wallThickness, wallHeight, roomSize / 2 - doorWidth / 2]}
              />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
        </>
      ) : (
        <RigidBody type="fixed" colliders="trimesh">
          <mesh position={[-roomSize / 2, wallHeight / 2, 0]} castShadow>
            <boxGeometry args={[wallThickness, wallHeight, roomSize]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
        </RigidBody>
      )}

      {/* Current Room Indicator */}
      <mesh position={[0, roomHeight + 0.5, 0]}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshLambertMaterial
          color={isCurrent ? "#FFEB3B" : roomColor}
          transparent
          opacity={isCurrent ? 1 : 0.7}
        />
      </mesh>

      {/* Room Type Icon */}
      {room.type !== RoomTypeValues.NORMAL && (
        <mesh position={[0, roomHeight + 0.8, 0]}>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshLambertMaterial color="#FFFFFF" />
        </mesh>
      )}

      {/* Room Type Label */}
      <mesh position={[0, roomHeight + 1.2, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshLambertMaterial color="#FFFFFF" transparent opacity={0.8} />
      </mesh>

      {/* Simple visual indicator for special rooms */}
      {room.type !== RoomTypeValues.NORMAL &&
        room.type !== RoomTypeValues.START &&
        room.type !== RoomTypeValues.END && (
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={roomColor} />
          </mesh>
        )}

      {/* Room Decorations - Add elements to all room types */}
      <RoomDecorator roomType={room.type} roomSize={roomSize} />

      {/* Enhanced Room Features - Always render all specialized rooms */}
      <>
        {/* Specialized Room Types */}
        {room.type === RoomTypeValues.TREASURE && <TreasureRoom />}

        {room.type === RoomTypeValues.SHOP && <ShopRoom />}

        {room.type === RoomTypeValues.PUZZLE && (room as any).puzzle && (
          <PuzzleRoom
            puzzle={(room as any).puzzle}
            onPuzzleComplete={() => {
              console.log("Puzzle completed!");
              // Handle puzzle completion through card system
            }}
          />
        )}

        {(room.type === RoomTypeValues.DEVIL_ROOM ||
          room.type === RoomTypeValues.ANGEL_ROOM ||
          room.type === RoomTypeValues.CURSED_ROOM ||
          room.type === RoomTypeValues.SECRET) && (
          <SpecialRoom
            roomType={room.type as any}
            items={(room as any).items || []}
            onItemInteraction={(item) => {
              console.log(`Interacted with special item: ${item.name}`);
              // Handle special item interaction through card system
            }}
            onRoomEnter={() => {
              console.log(`Entered ${room.type}`);
              // Handle special room entry through card system
            }}
          />
        )}

        {room.type === RoomTypeValues.LIBRARY && (
          <LibraryRoom books={(room as any).books || []} />
        )}

        {/* Upgrade Rooms - All interactions through card system */}
        {room.type === RoomTypeValues.BENCH_PRESS && <BenchPressRoom />}

        {room.type === RoomTypeValues.COFFEE && <CoffeeRoom />}

        {room.type === RoomTypeValues.LIBRARY_UPGRADE && <LibraryUpgradeRoom />}

        {room.type === RoomTypeValues.MEDITATION && <MeditationRoom />}

        {/* New Advanced Room Types - All interactions through card system */}
        {room.type === RoomTypeValues.PORTAL && (
          <PortalRoom portalDestination={room.portalDestination} />
        )}

        {room.type === RoomTypeValues.ARENA && <ArenaRoom />}

        {room.type === RoomTypeValues.BOSS && <BossRoom />}

        {room.type === RoomTypeValues.START && <StartRoom />}

        {room.type === RoomTypeValues.END && <EndRoom />}

        {room.type === RoomTypeValues.ENEMY && <EnemyRoom />}

        {/* Fallback for other room types */}
        {![
          RoomTypeValues.START,
          RoomTypeValues.END,
          RoomTypeValues.TREASURE,
          RoomTypeValues.SHOP,
          RoomTypeValues.PUZZLE,
          RoomTypeValues.DEVIL_ROOM,
          RoomTypeValues.ANGEL_ROOM,
          RoomTypeValues.CURSED_ROOM,
          RoomTypeValues.SECRET,
          RoomTypeValues.LIBRARY,
          RoomTypeValues.BENCH_PRESS,
          RoomTypeValues.COFFEE,
          RoomTypeValues.LIBRARY_UPGRADE,
          RoomTypeValues.MEDITATION,
          RoomTypeValues.PORTAL,
          RoomTypeValues.ARENA,
          RoomTypeValues.BOSS,
          RoomTypeValues.ENEMY,
          RoomTypeValues.TRAP,
        ].includes(room.type as any) && (
          <>
            {/* Items in room */}
            {(room as any).items?.map((item: Item, index: number) => (
              <ItemSprite
                key={item.id}
                item={item}
                position={
                  [
                    ((index % 3) - 1) * 2,
                    roomHeight + 0.5,
                    Math.floor(index / 3) * 2 - 1,
                  ] as [number, number, number]
                }
                scale={0.5}
                onClick={() => {
                  console.log(`Picked up ${item.name}`);
                  // Handle item pickup
                }}
              />
            ))}

            {/* Puzzle in room */}
            {(room as any).puzzle && (
              <PuzzleGrid
                puzzle={(room as any).puzzle}
                onTileClick={(tile) => {
                  console.log(`Clicked tile: ${tile.id}`);
                  // Handle puzzle tile click
                }}
                onComplete={() => {
                  console.log("Puzzle completed!");
                  // Handle puzzle completion
                }}
              />
            )}

            {/* Special room effects */}
            {(room as any).specialProperties && (
              <group position={[0, roomHeight + 2, 0]}>
                {/* Special room indicator */}
                <mesh>
                  <sphereGeometry args={[0.2, 8, 8]} />
                  <meshBasicMaterial
                    color="#FFD700"
                    transparent
                    opacity={0.8}
                  />
                </mesh>
              </group>
            )}
          </>
        )}

        {/* Room Interaction System */}
        {onInteraction && (
          <RoomInteraction
            room={room}
            playerPosition={playerPosition}
            onInteraction={onInteraction}
          />
        )}

        {/* Room Collision Detection - Now handled by PlayerRoomManager */}

        {/* Doors - DISABLED FOR NOW */}
        {/* {room.connections && room.connections.length > 0 && (
          <>
            {room.connections.map((connectionId) => {
              const target = connectedRooms.find((r) => r.id === connectionId);
              if (!target) return null;
              const doorPosition = getDoorPosition(room, target);
              return (
                <Door
                  key={`door-${connectionId}`}
                  position={doorPosition.position}
                  rotation={doorPosition.rotation}
                  keyRequired={Math.random() > 0.7}
                  keyId="master-key"
                />
              );
            })}
          </>
        )} */}

        {/* Destructible Walls */}
        {Math.random() > 0.8 && ( // 20% chance of having destructible walls
          <>
            <DestructibleWall
              position={[4, 1.5, 0]}
              rotation={[0, Math.PI / 2, 0]}
              bombRequired={Math.random() > 0.5}
            />
            <DestructibleWall
              position={[-4, 1.5, 0]}
              rotation={[0, -Math.PI / 2, 0]}
              bombRequired={Math.random() > 0.5}
            />
          </>
        )}
      </>
    </group>
  );
};

export default Room;

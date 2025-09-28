import React, { useState } from "react";
import MeditationRoom from "./primitives/game-rooms/MeditationRoom";
import BenchPressRoom from "./primitives/game-rooms/BenchPressRoom";
import ShopRoom from "./primitives/game-rooms/ShopRoom";
import TreasureRoom from "./primitives/game-rooms/TreasureRoom";
import ChallengeRoom from "./primitives/game-rooms/ChallengeRoom";
import PuzzleRoom from "./primitives/game-rooms/PuzzleRoom";
import LibraryRoom from "./primitives/game-rooms/LibraryRoom";

type RoomType =
  | "meditation"
  | "benchpress"
  | "shop"
  | "treasure"
  | "challenge"
  | "puzzle"
  | "library";

const RoomDemo: React.FC = () => {
  const [currentRoom, setCurrentRoom] = useState<RoomType>("meditation");

  const rooms = [
    {
      id: "meditation" as RoomType,
      name: "Meditation Room",
      component: MeditationRoom,
    },
    {
      id: "benchpress" as RoomType,
      name: "Bench Press Room",
      component: BenchPressRoom,
    },
    { id: "shop" as RoomType, name: "Shop Room", component: ShopRoom },
    {
      id: "treasure" as RoomType,
      name: "Treasure Room",
      component: TreasureRoom,
    },
    {
      id: "challenge" as RoomType,
      name: "Challenge Room",
      component: ChallengeRoom,
    },
    { id: "puzzle" as RoomType, name: "Puzzle Room", component: PuzzleRoom },
    { id: "library" as RoomType, name: "Library Room", component: LibraryRoom },
  ];

  const CurrentRoomComponent =
    rooms.find((r) => r.id === currentRoom)?.component || MeditationRoom;

  return (
    <group>
      {/* Room Navigation */}
      <group position={[0, 4, 0]}>
        {rooms.map((room, index) => (
          <mesh
            key={room.id}
            position={[(index - 3) * 2, 0, 0]}
            onClick={() => setCurrentRoom(room.id)}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              document.body.style.cursor = "default";
            }}
          >
            <boxGeometry args={[1.5, 0.5, 0.2]} />
            <meshStandardMaterial
              color={currentRoom === room.id ? "#00ff00" : "#666666"}
              emissive={currentRoom === room.id ? "#00ff00" : "#000000"}
              emissiveIntensity={currentRoom === room.id ? 0.3 : 0}
            />
          </mesh>
        ))}
      </group>

      {/* Room Labels */}
      <group position={[0, 3.5, 0]}>
        {rooms.map((room, index) => (
          <mesh key={`label-${room.id}`} position={[(index - 3) * 2, 0, 0]}>
            <boxGeometry args={[1.2, 0.1, 0.1]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>

      {/* Current Room */}
      <CurrentRoomComponent />

      {/* Instructions */}
      <group position={[0, -3, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[8, 0.5, 0.2]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
      </group>
    </group>
  );
};

export default RoomDemo;

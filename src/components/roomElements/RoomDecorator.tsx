import React from "react";
import {
  Torch,
  Candle,
  Barrel,
  Chest,
  Table,
  Chair,
  Bookshelf,
  PotionBottle,
  Crystal,
  Skull,
  FloatingText,
} from "./RoomElements";

interface RoomDecoratorProps {
  roomType: string;
  roomSize?: number;
}

const RoomDecorator: React.FC<RoomDecoratorProps> = ({
  roomType,
  roomSize = 8,
}) => {
  const halfSize = roomSize / 2;
  const margin = 1.5; // Distance from walls

  const getRoomElements = () => {
    switch (roomType) {
      case "start":
        return (
          <>
            {/* Welcome area with table and chairs */}
            <Table position={[0, 0, 0]} />
            <Chair position={[-0.6, 0, 0.4]} />
            <Chair position={[0.6, 0, 0.4]} />

            {/* Torches for lighting */}
            <Torch position={[-halfSize + margin, 0, -halfSize + margin]} />
            <Torch position={[halfSize - margin, 0, -halfSize + margin]} />
            <Torch position={[-halfSize + margin, 0, halfSize - margin]} />
            <Torch position={[halfSize - margin, 0, halfSize - margin]} />

            {/* Welcome chest */}
            <Chest position={[0, 0, -1.5]} />

            {/* Floating welcome text */}
            <FloatingText
              position={[0, 2, 0]}
              text="Welcome, Adventurer!"
              color="#00ff00"
            />
          </>
        );

      case "end":
        return (
          <>
            {/* Exit portal area */}
            <Crystal position={[0, 1, 0]} color="#ff00ff" />
            <Crystal position={[-1, 0.5, 0]} color="#00ffff" />
            <Crystal position={[1, 0.5, 0]} color="#ffff00" />

            {/* Altar table */}
            <Table position={[0, 0, 0]} />

            {/* Magical candles */}
            <Candle position={[-0.8, 0.4, -0.4]} />
            <Candle position={[0.8, 0.4, -0.4]} />
            <Candle position={[-0.8, 0.4, 0.4]} />
            <Candle position={[0.8, 0.4, 0.4]} />

            {/* Victory chest */}
            <Chest position={[0, 0, -1.5]} />

            {/* Exit text */}
            <FloatingText
              position={[0, 2.5, 0]}
              text="EXIT PORTAL"
              color="#ff00ff"
            />
          </>
        );

      case "normal":
        return (
          <>
            {/* Random furniture */}
            {Math.random() > 0.5 && (
              <Table
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
            {Math.random() > 0.7 && (
              <Chair
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}

            {/* Barrels and chests */}
            {Math.random() > 0.6 && (
              <Barrel
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
            {Math.random() > 0.8 && (
              <Chest
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}

            {/* Lighting */}
            <Torch position={[-halfSize + margin, 0, -halfSize + margin]} />
            <Torch position={[halfSize - margin, 0, halfSize - margin]} />

            {/* Potions */}
            {Math.random() > 0.7 && (
              <PotionBottle
                position={[Math.random() * 4 - 2, 0.2, Math.random() * 4 - 2]}
                color={
                  ["#ff0000", "#00ff00", "#0000ff", "#ffff00"][
                    Math.floor(Math.random() * 4)
                  ]
                }
              />
            )}
          </>
        );

      case "treasure":
        return (
          <>
            {/* Multiple chests */}
            <Chest position={[0, 0, 0]} />
            <Chest position={[-1.5, 0, 0]} />
            <Chest position={[1.5, 0, 0]} />

            {/* Gold and gems scattered around */}
            {Array.from({ length: 8 }).map((_, i) => (
              <Crystal
                key={i}
                position={[
                  (Math.random() - 0.5) * 6,
                  0.1,
                  (Math.random() - 0.5) * 6,
                ]}
                color="#FFD700"
              />
            ))}

            {/* Magical lighting */}
            <Candle position={[-2, 0.4, -2]} />
            <Candle position={[2, 0.4, -2]} />
            <Candle position={[-2, 0.4, 2]} />
            <Candle position={[2, 0.4, 2]} />

            <FloatingText
              position={[0, 2, 0]}
              text="TREASURE ROOM"
              color="#FFD700"
            />
          </>
        );

      case "shop":
        return (
          <>
            {/* Shop counter */}
            <Table position={[0, 0, -1]} />
            <Table position={[0, 0, 1]} />

            {/* Shopkeeper area */}
            <Chair position={[0, 0, -2]} />

            {/* Display shelves */}
            <Bookshelf position={[-2, 0, 0]} />
            <Bookshelf position={[2, 0, 0]} />

            {/* Potion display */}
            <PotionBottle position={[-1, 0.4, -1]} color="#ff0000" />
            <PotionBottle position={[0, 0.4, -1]} color="#00ff00" />
            <PotionBottle position={[1, 0.4, -1]} color="#0000ff" />

            {/* Shop lighting */}
            <Torch position={[-halfSize + margin, 0, 0]} />
            <Torch position={[halfSize - margin, 0, 0]} />

            <FloatingText position={[0, 2, 0]} text="SHOP" color="#00ff00" />
          </>
        );

      case "puzzle":
        return (
          <>
            {/* Puzzle table */}
            <Table position={[0, 0, 0]} />

            {/* Mystical elements */}
            <Crystal position={[-1, 0.5, 0]} color="#8000ff" />
            <Crystal position={[1, 0.5, 0]} color="#8000ff" />
            <Crystal position={[0, 0.5, -1]} color="#8000ff" />
            <Crystal position={[0, 0.5, 1]} color="#8000ff" />

            {/* Books for reference */}
            <Bookshelf position={[-2.5, 0, 0]} />

            {/* Magical candles */}
            <Candle position={[-1, 0.4, -1]} />
            <Candle position={[1, 0.4, -1]} />
            <Candle position={[-1, 0.4, 1]} />
            <Candle position={[1, 0.4, 1]} />

            <FloatingText
              position={[0, 2, 0]}
              text="PUZZLE CHAMBER"
              color="#8000ff"
            />
          </>
        );

      case "library":
        return (
          <>
            {/* Multiple bookshelves */}
            <Bookshelf position={[-2, 0, -2]} />
            <Bookshelf position={[0, 0, -2]} />
            <Bookshelf position={[2, 0, -2]} />
            <Bookshelf position={[-2, 0, 2]} />
            <Bookshelf position={[0, 0, 2]} />
            <Bookshelf position={[2, 0, 2]} />

            {/* Reading area */}
            <Table position={[0, 0, 0]} />
            <Chair position={[-0.6, 0, 0.4]} />
            <Chair position={[0.6, 0, 0.4]} />

            {/* Magical lighting */}
            <Candle position={[-1, 0.4, 0]} />
            <Candle position={[1, 0.4, 0]} />

            <FloatingText position={[0, 2, 0]} text="LIBRARY" color="#4169E1" />
          </>
        );

      case "devil-room":
        return (
          <>
            {/* Altar */}
            <Table position={[0, 0, 0]} />

            {/* Skulls and bones */}
            <Skull position={[-1, 0.2, -1]} />
            <Skull position={[1, 0.2, -1]} />
            <Skull position={[-1, 0.2, 1]} />
            <Skull position={[1, 0.2, 1]} />

            {/* Dark crystals */}
            <Crystal position={[0, 0.5, 0]} color="#8B0000" />

            {/* Red candles */}
            <Candle position={[-1, 0.4, 0]} />
            <Candle position={[1, 0.4, 0]} />
            <Candle position={[0, 0.4, -1]} />
            <Candle position={[0, 0.4, 1]} />

            <FloatingText
              position={[0, 2, 0]}
              text="DEVIL ROOM"
              color="#8B0000"
            />
          </>
        );

      case "angel-room":
        return (
          <>
            {/* Altar */}
            <Table position={[0, 0, 0]} />

            {/* Golden crystals */}
            <Crystal position={[-1, 0.5, 0]} color="#FFD700" />
            <Crystal position={[1, 0.5, 0]} color="#FFD700" />
            <Crystal position={[0, 0.5, -1]} color="#FFD700" />
            <Crystal position={[0, 0.5, 1]} color="#FFD700" />

            {/* Healing potions */}
            <PotionBottle position={[-1, 0.4, -1]} color="#00ff00" />
            <PotionBottle position={[1, 0.4, -1]} color="#00ff00" />
            <PotionBottle position={[-1, 0.4, 1]} color="#00ff00" />
            <PotionBottle position={[1, 0.4, 1]} color="#00ff00" />

            {/* White candles */}
            <Candle position={[-1, 0.4, 0]} />
            <Candle position={[1, 0.4, 0]} />

            <FloatingText
              position={[0, 2, 0]}
              text="ANGEL ROOM"
              color="#FFD700"
            />
          </>
        );

      case "secret":
        return (
          <>
            {/* Hidden treasures */}
            <Chest position={[0, 0, 0]} />
            <Barrel position={[-1.5, 0, 0]} />
            <Barrel position={[1.5, 0, 0]} />

            {/* Mysterious crystals */}
            {Array.from({ length: 6 }).map((_, i) => (
              <Crystal
                key={i}
                position={[
                  (Math.random() - 0.5) * 4,
                  0.2,
                  (Math.random() - 0.5) * 4,
                ]}
                color={
                  ["#00ffff", "#ff00ff", "#ffff00"][
                    Math.floor(Math.random() * 3)
                  ]
                }
              />
            ))}

            {/* Dim lighting */}
            <Candle position={[-2, 0.4, -2]} />
            <Candle position={[2, 0.4, 2]} />

            <FloatingText
              position={[0, 2, 0]}
              text="SECRET ROOM"
              color="#800080"
            />
          </>
        );

      case "boss":
        return (
          <>
            {/* Boss arena */}
            <Table position={[0, 0, 0]} />

            {/* Boss throne/altar */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1, 1, 0.5]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>

            {/* Boss crystals */}
            <Crystal position={[-1.5, 0.5, 0]} color="#ff0000" />
            <Crystal position={[1.5, 0.5, 0]} color="#ff0000" />
            <Crystal position={[0, 0.5, -1.5]} color="#ff0000" />
            <Crystal position={[0, 0.5, 1.5]} color="#ff0000" />

            {/* Skulls and bones */}
            <Skull position={[-1, 0.2, -1]} />
            <Skull position={[1, 0.2, -1]} />
            <Skull position={[-1, 0.2, 1]} />
            <Skull position={[1, 0.2, 1]} />

            {/* Red candles */}
            <Candle position={[-2, 0.4, -2]} />
            <Candle position={[2, 0.4, -2]} />
            <Candle position={[-2, 0.4, 2]} />
            <Candle position={[2, 0.4, 2]} />

            <FloatingText
              position={[0, 2, 0]}
              text="BOSS ARENA"
              color="#ff0000"
            />
          </>
        );

      case "trap":
        return (
          <>
            {/* Trap mechanisms */}
            <mesh position={[0, 0.1, 0]} castShadow>
              <boxGeometry args={[2, 0.2, 2]} />
              <meshStandardMaterial color="#2F4F4F" />
            </mesh>

            {/* Pressure plates */}
            <mesh position={[-0.5, 0.15, -0.5]} castShadow>
              <boxGeometry args={[0.3, 0.1, 0.3]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>
            <mesh position={[0.5, 0.15, 0.5]} castShadow>
              <boxGeometry args={[0.3, 0.1, 0.3]} />
              <meshStandardMaterial color="#C0C0C0" />
            </mesh>

            {/* Trap spikes */}
            <mesh position={[-1, 0.3, 0]} castShadow>
              <coneGeometry args={[0.1, 0.4, 6]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>
            <mesh position={[1, 0.3, 0]} castShadow>
              <coneGeometry args={[0.1, 0.4, 6]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>
            <mesh position={[0, 0.3, -1]} castShadow>
              <coneGeometry args={[0.1, 0.4, 6]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>
            <mesh position={[0, 0.3, 1]} castShadow>
              <coneGeometry args={[0.1, 0.4, 6]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>

            {/* Warning candles */}
            <Candle position={[-1.5, 0.4, -1.5]} />
            <Candle position={[1.5, 0.4, 1.5]} />

            <FloatingText
              position={[0, 2, 0]}
              text="TRAP ROOM"
              color="#ff8000"
            />
          </>
        );

      default:
        return (
          <>
            {/* Basic elements for unknown room types */}
            <Torch position={[-halfSize + margin, 0, -halfSize + margin]} />
            <Torch position={[halfSize - margin, 0, halfSize - margin]} />

            {Math.random() > 0.5 && (
              <Barrel
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
            {Math.random() > 0.7 && (
              <Chest
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
          </>
        );
    }
  };

  return <>{getRoomElements()}</>;
};

export default RoomDecorator;

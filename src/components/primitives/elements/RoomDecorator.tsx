import React from "react";
import {
  BreakableTorch,
  BreakableCandle,
  BreakableBarrel,
  BreakableChest,
  BreakableTable,
  BreakableChair,
  BreakableBookshelf,
  BreakablePotionBottle,
  BreakableCrystal,
  BreakableSkull,
  BreakableFloatingText,
} from "./index";

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
            <BreakableTable position={[0, 0, 0]} />
            <BreakableChair position={[-0.6, 0, 0.4]} />
            <BreakableChair position={[0.6, 0, 0.4]} />

            {/* Torches for lighting */}
            <BreakableTorch
              position={[-halfSize + margin, 0, -halfSize + margin]}
            />
            <BreakableTorch
              position={[halfSize - margin, 0, -halfSize + margin]}
            />
            <BreakableTorch
              position={[-halfSize + margin, 0, halfSize - margin]}
            />
            <BreakableTorch
              position={[halfSize - margin, 0, halfSize - margin]}
            />

            {/* Welcome chest */}
            <BreakableChest position={[0, 0, -1.5]} />

            {/* Floating welcome text */}
            <BreakableFloatingText
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
            <BreakableCrystal position={[0, 1, 0]} color="#ff00ff" />
            <BreakableCrystal position={[-1, 0.5, 0]} color="#00ffff" />
            <BreakableCrystal position={[1, 0.5, 0]} color="#ffff00" />

            {/* Altar table */}
            <BreakableTable position={[0, 0, 0]} />

            {/* Magical candles */}
            <BreakableCandle position={[-0.8, 0.4, -0.4]} />
            <BreakableCandle position={[0.8, 0.4, -0.4]} />
            <BreakableCandle position={[-0.8, 0.4, 0.4]} />
            <BreakableCandle position={[0.8, 0.4, 0.4]} />

            {/* Victory chest */}
            <BreakableChest position={[0, 0, -1.5]} />

            {/* Exit text */}
            <BreakableFloatingText
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
              <BreakableTable
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
            {Math.random() > 0.7 && (
              <BreakableChair
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}

            {/* Barrels and chests */}
            {Math.random() > 0.6 && (
              <BreakableBarrel
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
            {Math.random() > 0.8 && (
              <BreakableChest
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}

            {/* Lighting */}
            <BreakableTorch
              position={[-halfSize + margin, 0, -halfSize + margin]}
            />
            <BreakableTorch
              position={[halfSize - margin, 0, halfSize - margin]}
            />

            {/* Potions */}
            {Math.random() > 0.7 && (
              <BreakablePotionBottle
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
            <BreakableChest position={[0, 0, 0]} />
            <BreakableChest position={[-1.5, 0, 0]} />
            <BreakableChest position={[1.5, 0, 0]} />

            {/* Gold and gems scattered around */}
            {Array.from({ length: 8 }).map((_, i) => (
              <BreakableCrystal
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
            <BreakableCandle position={[-2, 0.4, -2]} />
            <BreakableCandle position={[2, 0.4, -2]} />
            <BreakableCandle position={[-2, 0.4, 2]} />
            <BreakableCandle position={[2, 0.4, 2]} />

            <BreakableFloatingText
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
            <BreakableTable position={[0, 0, -1]} />
            <BreakableTable position={[0, 0, 1]} />

            {/* Shopkeeper area */}
            <BreakableChair position={[0, 0, -2]} />

            {/* Display shelves */}
            <BreakableBookshelf position={[-2, 0, 0]} />
            <BreakableBookshelf position={[2, 0, 0]} />

            {/* Potion display */}
            <BreakablePotionBottle position={[-1, 0.4, -1]} color="#ff0000" />
            <BreakablePotionBottle position={[0, 0.4, -1]} color="#00ff00" />
            <BreakablePotionBottle position={[1, 0.4, -1]} color="#0000ff" />

            {/* Shop lighting */}
            <BreakableTorch position={[-halfSize + margin, 0, 0]} />
            <BreakableTorch position={[halfSize - margin, 0, 0]} />

            <BreakableFloatingText
              position={[0, 2, 0]}
              text="SHOP"
              color="#00ff00"
            />
          </>
        );

      case "puzzle":
        return (
          <>
            {/* Puzzle table */}
            <BreakableTable position={[0, 0, 0]} />

            {/* Mystical elements */}
            <BreakableCrystal position={[-1, 0.5, 0]} color="#8000ff" />
            <BreakableCrystal position={[1, 0.5, 0]} color="#8000ff" />
            <BreakableCrystal position={[0, 0.5, -1]} color="#8000ff" />
            <BreakableCrystal position={[0, 0.5, 1]} color="#8000ff" />

            {/* Books for reference */}
            <BreakableBookshelf position={[-2.5, 0, 0]} />

            {/* Magical candles */}
            <BreakableCandle position={[-1, 0.4, -1]} />
            <BreakableCandle position={[1, 0.4, -1]} />
            <BreakableCandle position={[-1, 0.4, 1]} />
            <BreakableCandle position={[1, 0.4, 1]} />

            <BreakableFloatingText
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
            <BreakableBookshelf position={[-2, 0, -2]} />
            <BreakableBookshelf position={[0, 0, -2]} />
            <BreakableBookshelf position={[2, 0, -2]} />
            <BreakableBookshelf position={[-2, 0, 2]} />
            <BreakableBookshelf position={[0, 0, 2]} />
            <BreakableBookshelf position={[2, 0, 2]} />

            {/* Reading area */}
            <BreakableTable position={[0, 0, 0]} />
            <BreakableChair position={[-0.6, 0, 0.4]} />
            <BreakableChair position={[0.6, 0, 0.4]} />

            {/* Magical lighting */}
            <BreakableCandle position={[-1, 0.4, 0]} />
            <BreakableCandle position={[1, 0.4, 0]} />

            <BreakableFloatingText
              position={[0, 2, 0]}
              text="LIBRARY"
              color="#4169E1"
            />
          </>
        );

      case "devil-room":
        return (
          <>
            {/* Altar */}
            <BreakableTable position={[0, 0, 0]} />

            {/* Skulls and bones */}
            <BreakableSkull position={[-1, 0.2, -1]} />
            <BreakableSkull position={[1, 0.2, -1]} />
            <BreakableSkull position={[-1, 0.2, 1]} />
            <BreakableSkull position={[1, 0.2, 1]} />

            {/* Dark crystals */}
            <BreakableCrystal position={[0, 0.5, 0]} color="#8B0000" />

            {/* Red candles */}
            <BreakableCandle position={[-1, 0.4, 0]} />
            <BreakableCandle position={[1, 0.4, 0]} />
            <BreakableCandle position={[0, 0.4, -1]} />
            <BreakableCandle position={[0, 0.4, 1]} />

            <BreakableFloatingText
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
            <BreakableTable position={[0, 0, 0]} />

            {/* Golden crystals */}
            <BreakableCrystal position={[-1, 0.5, 0]} color="#FFD700" />
            <BreakableCrystal position={[1, 0.5, 0]} color="#FFD700" />
            <BreakableCrystal position={[0, 0.5, -1]} color="#FFD700" />
            <BreakableCrystal position={[0, 0.5, 1]} color="#FFD700" />

            {/* Healing potions */}
            <BreakablePotionBottle position={[-1, 0.4, -1]} color="#00ff00" />
            <BreakablePotionBottle position={[1, 0.4, -1]} color="#00ff00" />
            <BreakablePotionBottle position={[-1, 0.4, 1]} color="#00ff00" />
            <BreakablePotionBottle position={[1, 0.4, 1]} color="#00ff00" />

            {/* White candles */}
            <BreakableCandle position={[-1, 0.4, 0]} />
            <BreakableCandle position={[1, 0.4, 0]} />

            <BreakableFloatingText
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
            <BreakableChest position={[0, 0, 0]} />
            <BreakableBarrel position={[-1.5, 0, 0]} />
            <BreakableBarrel position={[1.5, 0, 0]} />

            {/* Mysterious crystals */}
            {Array.from({ length: 6 }).map((_, i) => (
              <BreakableCrystal
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
            <BreakableCandle position={[-2, 0.4, -2]} />
            <BreakableCandle position={[2, 0.4, 2]} />

            <BreakableFloatingText
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
            <BreakableTable position={[0, 0, 0]} />

            {/* Boss throne/altar */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[1, 1, 0.5]} />
              <meshStandardMaterial color="#8B0000" />
            </mesh>

            {/* Boss crystals */}
            <BreakableCrystal position={[-1.5, 0.5, 0]} color="#ff0000" />
            <BreakableCrystal position={[1.5, 0.5, 0]} color="#ff0000" />
            <BreakableCrystal position={[0, 0.5, -1.5]} color="#ff0000" />
            <BreakableCrystal position={[0, 0.5, 1.5]} color="#ff0000" />

            {/* Skulls and bones */}
            <BreakableSkull position={[-1, 0.2, -1]} />
            <BreakableSkull position={[1, 0.2, -1]} />
            <BreakableSkull position={[-1, 0.2, 1]} />
            <BreakableSkull position={[1, 0.2, 1]} />

            {/* Red candles */}
            <BreakableCandle position={[-2, 0.4, -2]} />
            <BreakableCandle position={[2, 0.4, -2]} />
            <BreakableCandle position={[-2, 0.4, 2]} />
            <BreakableCandle position={[2, 0.4, 2]} />

            <BreakableFloatingText
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
            <BreakableCandle position={[-1.5, 0.4, -1.5]} />
            <BreakableCandle position={[1.5, 0.4, 1.5]} />

            <BreakableFloatingText
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
            <BreakableTorch
              position={[-halfSize + margin, 0, -halfSize + margin]}
            />
            <BreakableTorch
              position={[halfSize - margin, 0, halfSize - margin]}
            />

            {Math.random() > 0.5 && (
              <BreakableBarrel
                position={[Math.random() * 4 - 2, 0, Math.random() * 4 - 2]}
              />
            )}
            {Math.random() > 0.7 && (
              <BreakableChest
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

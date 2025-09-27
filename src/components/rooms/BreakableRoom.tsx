import React, { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import { Tile, Wall, Stair, Candle, Table, Chair } from "../roomElements";
import UniversalPrototype from "../UniversalPrototype";
import { useObjectPrototypeActions } from "../../utils/SimplePrototypeMixin";
import { PrototypeRegistry } from "../../utils/ObjectPrototype";
import Debris from "../Debris";

interface BreakableRoomProps {
  onRoomComplete?: () => void;
}

const BreakableRoom: React.FC<BreakableRoomProps> = ({ onRoomComplete }) => {
  const [brokenObjects, setBrokenObjects] = useState<string[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [allDebris, setAllDebris] = useState<any[]>([]);

  // Get prototype actions for various objects
  const { executeAction: damageFloor } =
    useObjectPrototypeActions("breakable_floor");
  const { executeAction: damageWall1 } =
    useObjectPrototypeActions("breakable_wall_1");
  const { executeAction: damageWall2 } =
    useObjectPrototypeActions("breakable_wall_2");
  const { executeAction: damageStair } =
    useObjectPrototypeActions("breakable_stair");
  const { executeAction: damageCandle } =
    useObjectPrototypeActions("breakable_candle");
  const { executeAction: damageTable } =
    useObjectPrototypeActions("breakable_table");
  const { executeAction: damageChair } =
    useObjectPrototypeActions("breakable_chair");

  const handleObjectBreak = (objectId: string) => {
    setBrokenObjects((prev) => {
      if (!prev.includes(objectId)) {
        const newBroken = [...prev, objectId];
        console.log(
          `Object ${objectId} broken! Total broken: ${newBroken.length}/${totalObjects}`
        );

        // Check if all objects are broken
        if (newBroken.length >= totalObjects) {
          console.log("🎉 All objects broken! Room complete!");
          onRoomComplete?.();
        }
        return newBroken;
      }
      return prev;
    });
  };

  const damageObject = (objectId: string, damageAmount: number = 1) => {
    console.log(`Damaging ${objectId} with ${damageAmount} damage`);
    // This will trigger the damage action on the prototype
    switch (objectId) {
      case "breakable_floor":
        damageFloor("damage", { amount: damageAmount });
        break;
      case "breakable_wall_1":
        damageWall1("damage", { amount: damageAmount });
        break;
      case "breakable_wall_2":
        damageWall2("damage", { amount: damageAmount });
        break;
      case "breakable_stair":
        damageStair("damage", { amount: damageAmount });
        break;
      case "breakable_candle":
        damageCandle("damage", { amount: damageAmount });
        break;
      case "breakable_table":
        damageTable("damage", { amount: damageAmount });
        break;
      case "breakable_chair":
        damageChair("damage", { amount: damageAmount });
        break;
    }
  };

  const physicsBreakObject = (
    objectId: string,
    impactPoint?: [number, number, number]
  ) => {
    console.log(
      `🔥 PHYSICS BREAKING ${objectId} 🔥 at impact point:`,
      impactPoint
    );

    // Debug: List all registered prototypes
    const allPrototypes = PrototypeRegistry.getAll();
    console.log(
      `All registered prototypes:`,
      allPrototypes.map((p) => p.id)
    );

    // Check if prototype exists
    let prototype = PrototypeRegistry.get(objectId);
    if (!prototype) {
      console.error(`Prototype ${objectId} not found!`);
      console.log(
        `Available prototypes:`,
        allPrototypes.map((p) => p.id)
      );
      return;
    }

    // Force make breakable if not already
    if (!prototype.isBreakable) {
      console.log(`Force making ${objectId} breakable...`);
      prototype.makeBreakable();
    }

    console.log(`Prototype ${objectId} found:`, {
      isBreakable: prototype.isBreakable,
      isBroken: prototype.isBroken,
      health: prototype.breakThreshold,
      damage: prototype.currentDamage,
    });

    // This will trigger the physics breaking action on the prototype with impact point
    switch (objectId) {
      case "breakable_floor":
        damageFloor("breakWithPhysics", {
          force: 1.5,
          direction: [0, 1, 0],
          impactPoint,
        });
        break;
      case "breakable_wall_1":
        damageWall1("breakWithPhysics", {
          force: 1.5,
          direction: [1, 0, 0],
          impactPoint,
        });
        break;
      case "breakable_wall_2":
        damageWall2("breakWithPhysics", {
          force: 1.5,
          direction: [-1, 0, 0],
          impactPoint,
        });
        break;
      case "breakable_stair":
        damageStair("breakWithPhysics", {
          force: 1.5,
          direction: [0, 1, 0],
          impactPoint,
        });
        break;
      case "breakable_candle":
        damageCandle("breakWithPhysics", {
          force: 1.5,
          direction: [0, 1, 0],
          impactPoint,
        });
        break;
      case "breakable_table":
        damageTable("breakWithPhysics", {
          force: 1.5,
          direction: [0, 1, 0],
          impactPoint,
        });
        break;
      case "breakable_chair":
        damageChair("breakWithPhysics", {
          force: 1.5,
          direction: [0, 1, 0],
          impactPoint,
        });
        break;
    }
  };

  // New impact-based breaking function (like Three.js example)
  const impactBreakObject = (
    objectId: string,
    impactPoint: [number, number, number],
    impulse: number
  ) => {
    console.log(
      `💥 IMPACT BREAKING ${objectId} 💥 with impulse ${impulse} at:`,
      impactPoint
    );

    // Calculate impact normal (direction from impact point to object center)
    const prototype = PrototypeRegistry.get(objectId);
    if (!prototype) {
      console.error(`Prototype ${objectId} not found!`);
      return;
    }

    // Force make breakable if not already
    if (!prototype.isBreakable) {
      console.log(`Force making ${objectId} breakable...`);
      prototype.makeBreakable();
    }

    // Calculate impact normal
    const impactNormal: [number, number, number] = [
      impactPoint[0] - prototype.position[0],
      impactPoint[1] - prototype.position[1],
      impactPoint[2] - prototype.position[2],
    ];

    // Normalize the impact normal
    const length = Math.sqrt(
      impactNormal[0] ** 2 + impactNormal[1] ** 2 + impactNormal[2] ** 2
    );
    if (length > 0) {
      impactNormal[0] /= length;
      impactNormal[1] /= length;
      impactNormal[2] /= length;
    }

    // Use the new impact-based breaking
    switch (objectId) {
      case "breakable_floor":
        damageFloor("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
      case "breakable_wall_1":
        damageWall1("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
      case "breakable_wall_2":
        damageWall2("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
      case "breakable_stair":
        damageStair("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
      case "breakable_candle":
        damageCandle("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
      case "breakable_table":
        damageTable("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
      case "breakable_chair":
        damageChair("breakWithImpact", {
          impulse,
          impactPoint,
          impactNormal,
        });
        break;
    }
  };

  const repairAll = () => {
    setBrokenObjects([]);
    // Repair all objects
    damageFloor("repair");
    damageWall1("repair");
    damageWall2("repair");
    damageStair("repair");
    damageCandle("repair");
    damageTable("repair");
    damageChair("repair");
  };

  // Set total objects count and make them breakable
  useEffect(() => {
    setTotalObjects(7); // floor, 2 walls, stair, candle, table, chair

    // Make all objects breakable when room loads (with longer delay to ensure prototypes exist)
    const timer = setTimeout(() => {
      console.log("Making objects breakable...");

      // Check if prototypes exist first
      const allPrototypes = PrototypeRegistry.getAll();
      console.log(
        "Available prototypes before makeBreakable:",
        allPrototypes.map((p) => p.id)
      );

      // Make each object breakable directly through the registry
      const objectIds = [
        "breakable_floor",
        "breakable_wall_1",
        "breakable_wall_2",
        "breakable_stair",
        "breakable_candle",
        "breakable_table",
        "breakable_chair",
      ];

      objectIds.forEach((id) => {
        const prototype = PrototypeRegistry.get(id);
        if (prototype) {
          console.log(`Making ${id} breakable directly...`);
          prototype.makeBreakable();
          console.log(`${id} is now breakable:`, {
            isBreakable: prototype.isBreakable,
            health: prototype.breakThreshold,
          });
        } else {
          console.error(`Prototype ${id} not found for direct makeBreakable!`);
        }
      });

      // Verify they're breakable
      setTimeout(() => {
        const updatedPrototypes = PrototypeRegistry.getAll();
        console.log(
          "Prototypes after makeBreakable:",
          updatedPrototypes.map((p) => ({
            id: p.id,
            isBreakable: p.isBreakable,
            health: p.breakThreshold,
          }))
        );
      }, 100);

      console.log("All objects made breakable!");
    }, 500); // Increased delay

    return () => clearTimeout(timer);
  }, []);

  // Keyboard handler for reset
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        console.log("R key pressed - resetting room!");
        repairAll();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  // Collect debris from all broken objects
  useEffect(() => {
    const collectDebris = () => {
      const allPrototypes = PrototypeRegistry.getAll();
      const debrisPieces: any[] = [];

      allPrototypes.forEach((prototype) => {
        if (prototype.isBroken) {
          const debris = prototype.getDebris();
          debrisPieces.push(...debris);
        }
      });

      setAllDebris(debrisPieces);
    };

    const interval = setInterval(collectDebris, 100); // Update every 100ms
    return () => clearInterval(interval);
  }, []);

  return (
    <group>
      {/* Room Title */}
      <Text
        position={[0, 8, 0]}
        fontSize={1}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        💥 BREAKABLE ROOM 💥
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 6.5, 0]}
        fontSize={0.4}
        color="yellow"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Click objects to break them instantly with physics debris!
      </Text>

      {/* Progress */}
      <Text
        position={[0, 5.5, 0]}
        fontSize={0.3}
        color="lime"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Broken: {brokenObjects.length}/{totalObjects}
      </Text>

      {/* Breakable Floor */}
      <UniversalPrototype
        prototypeId="breakable_floor"
        prototypeType="floor"
        onPrototypeAction={(action, data) => {
          console.log(`Floor action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_floor");
          }
        }}
        onClick={(event) => {
          // Extract impact point from the event data
          const impactPoint = (event as any).impactPoint;
          // Use high impulse for floor (heavy object)
          impactBreakObject("breakable_floor", impactPoint, 500);
        }}
      >
        <Tile
          position={[0, -0.5, 0]}
          size={8}
          height={1}
          color="#4CAF50"
          material="stone"
          pattern="smooth"
          isCollidable={true}
        />
      </UniversalPrototype>

      {/* Breakable Walls */}
      <UniversalPrototype
        prototypeId="breakable_wall_1"
        prototypeType="wall"
        onPrototypeAction={(action, data) => {
          console.log(`Wall 1 action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_wall_1");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          // Use medium impulse for walls
          impactBreakObject("breakable_wall_1", impactPoint, 300);
        }}
      >
        <Wall
          position={[4, 2, 0]}
          width={1}
          height={4}
          color="#8B4513"
          material="wood"
          pattern="rough"
          isCollidable={true}
        />
      </UniversalPrototype>

      <UniversalPrototype
        prototypeId="breakable_wall_2"
        prototypeType="wall"
        onPrototypeAction={(action, data) => {
          console.log(`Wall 2 action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_wall_2");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          impactBreakObject("breakable_wall_2", impactPoint, 300);
        }}
      >
        <Wall
          position={[-4, 2, 0]}
          width={1}
          height={4}
          color="#8B4513"
          material="wood"
          pattern="rough"
          isCollidable={true}
        />
      </UniversalPrototype>

      {/* Breakable Stair */}
      <UniversalPrototype
        prototypeId="breakable_stair"
        prototypeType="stair"
        onPrototypeAction={(action, data) => {
          console.log(`Stair action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_stair");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          impactBreakObject("breakable_stair", impactPoint, 200);
        }}
      >
        <Stair
          position={[0, 0.5, 3]}
          width={2}
          height={1}
          depth={2}
          color="#696969"
          material="stone"
          pattern="rough"
          isCollidable={true}
        />
      </UniversalPrototype>

      {/* Breakable Furniture */}
      <UniversalPrototype
        prototypeId="breakable_candle"
        prototypeType="candle"
        onPrototypeAction={(action, data) => {
          console.log(`Candle action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_candle");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          impactBreakObject("breakable_candle", impactPoint, 50);
        }}
      >
        <Candle position={[2, 1, 0]} />
      </UniversalPrototype>

      <UniversalPrototype
        prototypeId="breakable_table"
        prototypeType="table"
        onPrototypeAction={(action, data) => {
          console.log(`Table action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_table");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          impactBreakObject("breakable_table", impactPoint, 150);
        }}
      >
        <Table position={[-2, 0.5, 0]} />
      </UniversalPrototype>

      <UniversalPrototype
        prototypeId="breakable_chair"
        prototypeType="chair"
        onPrototypeAction={(action, data) => {
          console.log(`Chair action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("breakable_chair");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          impactBreakObject("breakable_chair", impactPoint, 100);
        }}
      >
        <Chair position={[-2, 0.2, 1]} />
      </UniversalPrototype>

      {/* Control Panel */}
      <group position={[0, 3, 0]}>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Controls: Click objects to break them with physics
        </Text>
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.25}
          color="cyan"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Instant break demo | R: repair all
        </Text>
        <Text
          position={[0, -1, 0]}
          fontSize={0.2}
          color="yellow"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          Check console for debug info
        </Text>
      </group>

      {/* Success Message */}
      {brokenObjects.length >= totalObjects && (
        <Text
          position={[0, 4, 0]}
          fontSize={0.6}
          color="gold"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          🎉 ROOM COMPLETE! 🎉
        </Text>
      )}

      {/* Reset Button */}
      <group position={[0, 2, 0]}>
        <mesh
          position={[0, 0, 0]}
          onClick={() => {
            console.log("Reset button clicked!");
            repairAll();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[1.5, 0.3, 0.1]} />
          <meshStandardMaterial color="#ff4444" transparent opacity={0.8} />
        </mesh>
        <Text
          position={[0, 0, 0.06]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          🔄 RESET ROOM (R)
        </Text>
      </group>

      {/* Render Debris */}
      <Debris
        pieces={allDebris}
        onPieceExpired={(pieceId) => {
          console.log(`Debris piece ${pieceId} expired`);
        }}
      />
    </group>
  );
};

export default BreakableRoom;

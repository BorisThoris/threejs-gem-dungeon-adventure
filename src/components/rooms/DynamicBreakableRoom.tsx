import React, { useState, useEffect } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Tile, Wall, Stair, Candle, Table, Chair } from "../roomElements";
import UniversalPrototype from "../UniversalPrototype";
import { useObjectPrototypeActions } from "../../utils/SimplePrototypeMixin";
import { PrototypeRegistry } from "../../utils/ObjectPrototype";
import * as DynamicBreaker from "../../utils/DynamicBreaker";
const { dynamicBreaker } = DynamicBreaker;
type FragmentObject = DynamicBreaker.FragmentObject;
import FragmentMesh from "../FragmentMesh";

interface DynamicBreakableRoomProps {
  onRoomComplete?: () => void;
}

const DynamicBreakableRoom: React.FC<DynamicBreakableRoomProps> = ({
  onRoomComplete,
}) => {
  const [brokenObjects, setBrokenObjects] = useState<string[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [fragments, setFragments] = useState<FragmentObject[]>([]);
  const [allDebris, setAllDebris] = useState<any[]>([]);

  // Get prototype actions for various objects
  const { executeAction: damageFloor } =
    useObjectPrototypeActions("dynamic_floor");
  const { executeAction: damageWall1 } =
    useObjectPrototypeActions("dynamic_wall_1");
  const { executeAction: damageWall2 } =
    useObjectPrototypeActions("dynamic_wall_2");
  const { executeAction: damageStair } =
    useObjectPrototypeActions("dynamic_stair");
  const { executeAction: damageCandle } =
    useObjectPrototypeActions("dynamic_candle");
  const { executeAction: damageTable } =
    useObjectPrototypeActions("dynamic_table");
  const { executeAction: damageChair } =
    useObjectPrototypeActions("dynamic_chair");

  const handleObjectBreak = (objectId: string) => {
    setBrokenObjects((prev) => {
      if (!prev.includes(objectId)) {
        const newBroken = [...prev, objectId];
        console.log(
          `Object ${objectId} broken! Total broken: ${newBroken.length}/${totalObjects}`
        );
        if (newBroken.length >= totalObjects) {
          console.log("All objects broken! Room complete!");
          onRoomComplete?.();
        }
        return newBroken;
      }
      return prev;
    });
  };

  // Dynamic breaking function that creates interactive fragments
  const dynamicBreakObject = (
    objectId: string,
    impactPoint: [number, number, number],
    fragmentCount: number = 4
  ) => {
    console.log(
      `💥 DYNAMIC BREAKING ${objectId} 💥 into ${fragmentCount} fragments at:`,
      impactPoint
    );

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

    // Trigger dynamic breaking
    switch (objectId) {
      case "dynamic_floor":
        damageFloor("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
      case "dynamic_wall_1":
        damageWall1("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
      case "dynamic_wall_2":
        damageWall2("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
      case "dynamic_stair":
        damageStair("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
      case "dynamic_candle":
        damageCandle("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
      case "dynamic_table":
        damageTable("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
      case "dynamic_chair":
        damageChair("breakDynamically", {
          impactPoint,
          impactNormal,
          fragmentCount,
        });
        break;
    }
  };

  const repairAll = () => {
    setBrokenObjects([]);
    setFragments([]);
    damageFloor("repair");
    damageWall1("repair");
    damageWall2("repair");
    damageStair("repair");
    damageCandle("repair");
    damageTable("repair");
    damageChair("repair");
  };

  // Create fragments from broken objects using ConvexObjectBreaker
  useEffect(() => {
    const createFragments = () => {
      const allPrototypes = PrototypeRegistry.getAll();
      const newFragments: FragmentObject[] = [];

      allPrototypes.forEach((prototype) => {
        if (prototype.isBroken && prototype.properties.breakingData) {
          const breakingData = prototype.properties.breakingData as any;
          console.log(`Creating fragments for ${prototype.id}:`, breakingData);

          // Use the new ConvexObjectBreaker integration
          if (
            prototype.threeMesh &&
            prototype.originalGeometry &&
            prototype.originalMaterial
          ) {
            // Use the real Three.js mesh for breaking
            const objectFragments = dynamicBreaker.breakPrototype(
              prototype,
              breakingData.impactPoint,
              breakingData.impactNormal,
              breakingData.fragmentCount
            );

            // Convert fragments to prototypes and add to scene
            objectFragments.forEach((fragment) => {
              const fragmentPrototype = fragment.prototype;
              if (fragmentPrototype) {
                PrototypeRegistry.register(fragmentPrototype);
                newFragments.push(fragment);
              }
            });
          } else {
            // Fallback to old method if not prepared for breaking
            console.warn(
              `${prototype.id} not prepared for ConvexObjectBreaker, using fallback`
            );
            const objectFragments = dynamicBreaker.breakObject(
              // Create a mock mesh for the breaker
              {
                geometry: new THREE.BoxGeometry(1, 1, 1),
                material: new THREE.MeshStandardMaterial({
                  color: prototype.color,
                }),
                position: new THREE.Vector3(...prototype.position),
                scale: new THREE.Vector3(
                  prototype.scale,
                  prototype.scale,
                  prototype.scale
                ),
                rotation: new THREE.Euler(0, 0, 0),
                name: prototype.id,
              } as any,
              breakingData.impactPoint,
              breakingData.impactNormal,
              breakingData.fragmentCount
            );

            // Convert fragments to prototypes and add to scene
            objectFragments.forEach((fragment) => {
              const fragmentPrototype =
                dynamicBreaker.createFragmentPrototype(fragment);
              PrototypeRegistry.register(fragmentPrototype);
              newFragments.push(fragment);
            });
          }

          // Clear breaking data to prevent duplicate fragment creation
          delete prototype.properties.breakingData;
        }
      });

      if (newFragments.length > 0) {
        setFragments((prev) => [...prev, ...newFragments]);
        console.log(`Created ${newFragments.length} new fragments`);
      }
    };

    const interval = setInterval(createFragments, 100);
    return () => clearInterval(interval);
  }, []);

  // Collect debris from all broken prototypes
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

    const interval = setInterval(collectDebris, 100);
    return () => clearInterval(interval);
  }, []);

  // Initialize room
  useEffect(() => {
    setTotalObjects(7);
    const timer = setTimeout(() => {
      console.log("Making objects breakable...");
      const objectIds = [
        "dynamic_floor",
        "dynamic_wall_1",
        "dynamic_wall_2",
        "dynamic_stair",
        "dynamic_candle",
        "dynamic_table",
        "dynamic_chair",
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

      console.log("All objects made breakable!");
    }, 500);

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

  const handleFragmentExpired = (fragmentId: string) => {
    console.log(`Fragment ${fragmentId} expired`);
    setFragments((prev) => prev.filter((f) => f.id !== fragmentId));
  };

  const handleFragmentClick = (fragmentId: string) => {
    console.log(`Fragment ${fragmentId} clicked - breaking further!`);
    // Fragments can be broken further
  };

  return (
    <group>
      <Text
        position={[0, 7.5, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        💥 DYNAMIC BREAKABLE ROOM 💥
      </Text>
      <Text
        position={[0, 6.5, 0]}
        fontSize={0.4}
        color="yellow"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Click objects to break them into interactive fragments!
      </Text>
      <Text
        position={[0, 5.5, 0]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        Broken: {brokenObjects.length}/{totalObjects} | Fragments:{" "}
        {fragments.length}
      </Text>

      {/* Floor */}
      <UniversalPrototype
        prototypeId="dynamic_floor"
        prototypeType="floor"
        onPrototypeAction={(action, data) => {
          console.log(`Floor action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_floor");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_floor", impactPoint, 6);
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

      {/* Walls */}
      <UniversalPrototype
        prototypeId="dynamic_wall_1"
        prototypeType="wall"
        onPrototypeAction={(action, data) => {
          console.log(`Wall 1 action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_wall_1");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_wall_1", impactPoint, 4);
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
        prototypeId="dynamic_wall_2"
        prototypeType="wall"
        onPrototypeAction={(action, data) => {
          console.log(`Wall 2 action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_wall_2");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_wall_2", impactPoint, 4);
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

      {/* Stair */}
      <UniversalPrototype
        prototypeId="dynamic_stair"
        prototypeType="stair"
        onPrototypeAction={(action, data) => {
          console.log(`Stair action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_stair");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_stair", impactPoint, 3);
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

      {/* Furniture */}
      <UniversalPrototype
        prototypeId="dynamic_candle"
        prototypeType="candle"
        onPrototypeAction={(action, data) => {
          console.log(`Candle action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_candle");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_candle", impactPoint, 2);
        }}
      >
        <Candle position={[2, 1, 0]} />
      </UniversalPrototype>

      <UniversalPrototype
        prototypeId="dynamic_table"
        prototypeType="table"
        onPrototypeAction={(action, data) => {
          console.log(`Table action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_table");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_table", impactPoint, 5);
        }}
      >
        <Table position={[-2, 0.5, 0]} />
      </UniversalPrototype>

      <UniversalPrototype
        prototypeId="dynamic_chair"
        prototypeType="chair"
        onPrototypeAction={(action, data) => {
          console.log(`Chair action: ${action}`, data);
          if (action === "break") {
            handleObjectBreak("dynamic_chair");
          }
        }}
        onClick={(event) => {
          const impactPoint = (event as any).impactPoint;
          dynamicBreakObject("dynamic_chair", impactPoint, 3);
        }}
      >
        <Chair position={[-2, 0.2, 1]} />
      </UniversalPrototype>

      {/* Render all fragments */}
      {fragments.map((fragment) => (
        <FragmentMesh
          key={fragment.id}
          fragment={fragment}
          onFragmentExpired={handleFragmentExpired}
          onFragmentClick={handleFragmentClick}
        />
      ))}

      {/* Instructions */}
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
          Controls: Click objects to break them into interactive fragments
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
          Click fragments to break them further | R: reset room
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
    </group>
  );
};

export default DynamicBreakableRoom;

import React, { useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { Tile, Wall, Stair, Candle, Table, Chair } from "../roomElements";
import GenericBreakable from "../GenericBreakable";

interface SimpleBreakableRoomProps {
  onRoomComplete?: () => void;
}

const SimpleBreakableRoom: React.FC<SimpleBreakableRoomProps> = ({
  onRoomComplete,
}) => {
  const [brokenObjects, setBrokenObjects] = useState<string[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [fragments, setFragments] = useState<THREE.Mesh[]>([]);

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

  const handleFragmentCreated = (newFragments: THREE.Mesh[]) => {
    setFragments((prev) => [...prev, ...newFragments]);
    console.log(`Added ${newFragments.length} new fragments`);
  };

  const repairAll = () => {
    setBrokenObjects([]);
    setFragments([]);
  };

  // Initialize room
  React.useEffect(() => {
    setTotalObjects(7);
  }, []);

  // Keyboard handler for reset
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        console.log("R key pressed - resetting room!");
        repairAll();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

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
        💥 SIMPLE BREAKABLE ROOM 💥
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
      <GenericBreakable
        id="floor"
        type="floor"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={100}
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
      </GenericBreakable>

      {/* Walls */}
      <GenericBreakable
        id="wall_1"
        type="wall"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={80}
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
      </GenericBreakable>

      <GenericBreakable
        id="wall_2"
        type="wall"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={80}
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
      </GenericBreakable>

      {/* Stair */}
      <GenericBreakable
        id="stair"
        type="stair"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={60}
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
      </GenericBreakable>

      {/* Furniture */}
      <GenericBreakable
        id="candle"
        type="candle"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={30}
      >
        <Candle position={[2, 1, 0]} />
      </GenericBreakable>

      <GenericBreakable
        id="table"
        type="table"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={70}
      >
        <Table position={[-2, 0.5, 0]} />
      </GenericBreakable>

      <GenericBreakable
        id="chair"
        type="chair"
        onFragmentCreated={handleFragmentCreated}
        fractureImpulse={40}
      >
        <Chair position={[-2, 0.2, 1]} />
      </GenericBreakable>

      {/* Render all fragments */}
      {fragments.map((fragment, index) => (
        <primitive
          key={`fragment_${index}`}
          object={fragment}
          onClick={(event: any) => {
            event.stopPropagation();
            console.log(`Fragment ${fragment.userData.fragmentId} clicked!`);
            // Fragments can be broken further
            if (fragment.userData.prototype) {
              // Create a new GenericBreakable for the fragment
              const fragmentBreakable = (
                <GenericBreakable
                  id={fragment.userData.fragmentId}
                  type="fragment"
                  onFragmentCreated={handleFragmentCreated}
                  fractureImpulse={25}
                >
                  <primitive object={fragment} />
                </GenericBreakable>
              );
            }
          }}
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

export default SimpleBreakableRoom;

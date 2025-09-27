import React, { useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import GenericBreakable from "../GenericBreakable";

interface SimpleBreakableRoomV2Props {
  onRoomComplete?: () => void;
}

const SimpleBreakableRoomV2: React.FC<SimpleBreakableRoomV2Props> = ({
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
        💥 SIMPLE BREAKABLE ROOM V2 💥
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

      {/* Floor - Simple Box */}
      <GenericBreakable
        id="floor"
        type="floor"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("floor");
        }}
        fractureImpulse={100}
      >
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
      </GenericBreakable>

      {/* Wall 1 - Simple Box */}
      <GenericBreakable
        id="wall_1"
        type="wall"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("wall_1");
        }}
        fractureImpulse={80}
      >
        <mesh position={[4, 2, 0]}>
          <boxGeometry args={[1, 4, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </GenericBreakable>

      {/* Wall 2 - Simple Box */}
      <GenericBreakable
        id="wall_2"
        type="wall"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("wall_2");
        }}
        fractureImpulse={80}
      >
        <mesh position={[-4, 2, 0]}>
          <boxGeometry args={[1, 4, 8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </GenericBreakable>

      {/* Stair - Simple Box */}
      <GenericBreakable
        id="stair"
        type="stair"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("stair");
        }}
        fractureImpulse={60}
      >
        <mesh position={[0, 0.5, 3]}>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </GenericBreakable>

      {/* Table - Simple Box */}
      <GenericBreakable
        id="table"
        type="table"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("table");
        }}
        fractureImpulse={70}
      >
        <mesh position={[-2, 0.5, 0]}>
          <boxGeometry args={[1.5, 0.1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </GenericBreakable>

      {/* Chair - Simple Box */}
      <GenericBreakable
        id="chair"
        type="chair"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("chair");
        }}
        fractureImpulse={40}
      >
        <mesh position={[-2, 0.2, 1]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </GenericBreakable>

      {/* Candle - Simple Cylinder */}
      <GenericBreakable
        id="candle"
        type="candle"
        onFragmentCreated={(fragments) => {
          handleFragmentCreated(fragments);
          handleObjectBreak("candle");
        }}
        fractureImpulse={30}
      >
        <mesh position={[2, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </GenericBreakable>

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

export default SimpleBreakableRoomV2;

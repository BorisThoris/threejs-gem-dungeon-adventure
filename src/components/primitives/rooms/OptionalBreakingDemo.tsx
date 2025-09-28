import React, { useState } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { BreakableTile, BreakableWall } from "../elements";
import OptionalBreakable from "../../OptionalBreakable";
import type { BreakingOptions } from "../../../hooks/useBreaking";

interface OptionalBreakingDemoProps {
  onRoomComplete?: () => void;
}

const OptionalBreakingDemo: React.FC<OptionalBreakingDemoProps> = ({
  onRoomComplete,
}) => {
  const [brokenObjects, setBrokenObjects] = useState<string[]>([]);
  const [totalObjects, setTotalObjects] = useState(0);
  const [fragments, setFragments] = useState<THREE.Mesh[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const [showResetMessage, setShowResetMessage] = useState(false);
  const [breakingEnabled, setBreakingEnabled] = useState(false);

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

  const handleFragmentCreated = (newFragments: any[]) => {
    const meshes = newFragments.map((f) => f.mesh);
    setFragments((prev) => [...prev, ...meshes]);
    console.log(`Added ${newFragments.length} new fragments`);
  };

  const handleFragmentClick = (fragmentId: string) => {
    console.log(`Fragment ${fragmentId} clicked!`);
  };

  const repairAll = () => {
    setBrokenObjects([]);
    setFragments([]);
    setResetKey((prev) => prev + 1);
    setShowResetMessage(true);
    console.log("Room reset! All objects restored.");

    setTimeout(() => {
      setShowResetMessage(false);
    }, 2000);
  };

  const toggleBreaking = () => {
    setBreakingEnabled(!breakingEnabled);
    console.log(`Breaking ${!breakingEnabled ? "enabled" : "disabled"}`);
  };

  // Initialize room
  React.useEffect(() => {
    setTotalObjects(8);
  }, []);

  // Keyboard handler for reset and toggle
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "r") {
        console.log("R key pressed - resetting room!");
        repairAll();
      } else if (event.key.toLowerCase() === "b") {
        console.log("B key pressed - toggling breaking!");
        toggleBreaking();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [breakingEnabled]);

  return (
    <group key={resetKey}>
      <Text
        position={[0, 7.5, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        💥 OPTIONAL BREAKING DEMO 💥
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
        Press B to toggle breaking, then click objects!
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
        Breaking: {breakingEnabled ? "ON" : "OFF"} | Broken:{" "}
        {brokenObjects.length}/{totalObjects} | Fragments: {fragments.length}
      </Text>

      {/* Floor with optional breaking */}
      <BreakableTile
        key={`floor_${resetKey}`}
        position={[0, -0.5, 0]}
        size={8}
        height={1}
        color="#4CAF50"
        material="stone"
        pattern="smooth"
        breakingEnabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 6,
          fractureImpulse: 1.0,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("floor")}
        onFragmentClick={handleFragmentClick}
      />

      {/* Walls with optional breaking */}
      <BreakableWall
        key={`wall_1_${resetKey}`}
        position={[4, 2, 0]}
        width={1}
        height={4}
        depth={8}
        color="#8B4513"
        material="stone"
        texture="smooth"
        breakingEnabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 4,
          fractureImpulse: 0.8,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("wall_1")}
        onFragmentClick={handleFragmentClick}
      />

      <BreakableWall
        key={`wall_2_${resetKey}`}
        position={[-4, 2, 0]}
        width={1}
        height={4}
        depth={8}
        color="#8B4513"
        material="stone"
        texture="smooth"
        breakingEnabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 4,
          fractureImpulse: 0.8,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("wall_2")}
        onFragmentClick={handleFragmentClick}
      />

      {/* Regular objects with optional breaking wrapper */}
      <OptionalBreakable
        key={`table_${resetKey}`}
        enabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 5,
          fractureImpulse: 0.7,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("table")}
        onFragmentClick={handleFragmentClick}
        showHoverEffect={breakingEnabled}
        hoverColor="#ff6b6b"
      >
        <mesh position={[-2, 0.5, 0]}>
          <boxGeometry args={[1.5, 0.1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </OptionalBreakable>

      <OptionalBreakable
        key={`chair_${resetKey}`}
        enabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 3,
          fractureImpulse: 0.4,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("chair")}
        onFragmentClick={handleFragmentClick}
        showHoverEffect={breakingEnabled}
        hoverColor="#ff6b6b"
      >
        <mesh position={[-2, 0.2, 1]}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#654321" />
        </mesh>
      </OptionalBreakable>

      <OptionalBreakable
        key={`candle_${resetKey}`}
        enabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 2,
          fractureImpulse: 0.3,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("candle")}
        onFragmentClick={handleFragmentClick}
        showHoverEffect={breakingEnabled}
        hoverColor="#ff6b6b"
      >
        <mesh position={[2, 1, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </OptionalBreakable>

      <OptionalBreakable
        key={`stair_${resetKey}`}
        enabled={breakingEnabled}
        breakingOptions={{
          fragmentCount: 3,
          fractureImpulse: 0.6,
          onFragmentCreated: handleFragmentCreated,
        }}
        onBreak={() => handleObjectBreak("stair")}
        onFragmentClick={handleFragmentClick}
        showHoverEffect={breakingEnabled}
        hoverColor="#ff6b6b"
      >
        <mesh position={[0, 0.5, 3]}>
          <boxGeometry args={[2, 1, 2]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </OptionalBreakable>

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
          Controls: B = toggle breaking, R = reset room
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
          When breaking is ON, objects show hover effects and can be broken
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

      {showResetMessage && (
        <Text
          position={[0, 4.5, 0]}
          fontSize={0.5}
          color="lime"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.05}
          outlineColor="#000000"
        >
          🔄 ROOM RESET! 🔄
        </Text>
      )}

      {/* Control Buttons */}
      <group position={[0, 2, 0]}>
        {/* Toggle Breaking Button */}
        <mesh
          position={[-1, 0, 0]}
          onClick={() => {
            console.log("Toggle breaking button clicked!");
            toggleBreaking();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[1.5, 0.3, 0.1]} />
          <meshStandardMaterial
            color={breakingEnabled ? "#4CAF50" : "#ff4444"}
            transparent
            opacity={0.8}
          />
        </mesh>
        <Text
          position={[-1, 0, 0.06]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {breakingEnabled ? "💥 BREAKING ON" : "💥 BREAKING OFF"}
        </Text>

        {/* Reset Button */}
        <mesh
          position={[1, 0, 0]}
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
          position={[1, 0, 0.06]}
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

export default OptionalBreakingDemo;

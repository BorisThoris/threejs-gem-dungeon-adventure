import React, { useState } from "react";
import { Text } from "@react-three/drei";
import useGameStore from "../../store/gameStore";
import { Torch, PotionBottle, Barrel } from "../roomElements/RoomElements";

interface BenchPressRoomProps {
  onRewardClaim?: () => void;
}

const BenchPressRoom: React.FC<BenchPressRoomProps> = ({ onRewardClaim }) => {
  const { upgradeSize, addPoints, addExperience } = useGameStore();
  const [isUsed, setIsUsed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBenchPress = () => {
    if (isUsed) return;

    setIsAnimating(true);
    setIsUsed(true);

    // Apply upgrades
    upgradeSize(0.1); // Increase character size by 10%
    addPoints(50); // Reward points
    addExperience(25); // Reward experience

    // Call reward callback
    onRewardClaim?.();

    // Stop animation after 2 seconds
    setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
  };

  return (
    <group>
      {/* Room Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Bench Press Equipment */}
      <group position={[0, 0, 0]}>
        {/* Bench */}
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[3, 0.4, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Barbell */}
        <mesh position={[0, 1.5, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 4]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>

        {/* Weight Plates */}
        {[-1.5, -1, -0.5, 0.5, 1, 1.5].map((x, index) => (
          <mesh
            key={index}
            position={[x, 1.5, 0]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.3, 0.3, 0.1]} />
            <meshStandardMaterial color="#FFD700" />
          </mesh>
        ))}

        {/* Clickable Bench Press */}
        <mesh
          position={[0, 0.5, 0]}
          onClick={handleBenchPress}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor = isUsed ? "not-allowed" : "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[3.2, 0.8, 1.2]} />
          <meshStandardMaterial
            color={isUsed ? "#666666" : "#4a4a4a"}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

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
        BENCH PRESS ROOM
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 2.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {isUsed ? "Already Used!" : "Click to work out!"}
      </Text>

      {/* Reward Info */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.3}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {isUsed ? "+10% Size, +2 Max Health" : "Gain size and health!"}
      </Text>

      {/* Animation Effect */}
      {isAnimating && (
        <group position={[0, 2, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.6}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            💪 WORKING OUT! 💪
          </Text>
        </group>
      )}

      {/* Decorative Elements */}
      {/* Mirrors on walls */}
      <mesh position={[-4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.1, 3, 8]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>
      <mesh position={[4, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.1, 3, 8]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>

      {/* Dumbbells */}
      <group position={[-2, 0.2, 2]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>

      <group position={[2, 0.2, 2]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.8]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>

      {/* Additional gym elements */}
      <Torch position={[-3, 0, -3]} />
      <Torch position={[3, 0, -3]} />
      <Torch position={[-3, 0, 3]} />
      <Torch position={[3, 0, 3]} />

      {/* Protein shake bottles */}
      <PotionBottle position={[-1.5, 0.2, -2]} color="#ff8000" />
      <PotionBottle position={[1.5, 0.2, -2]} color="#ff8000" />

      {/* Water barrels */}
      <Barrel position={[-2.5, 0, 0]} />
      <Barrel position={[2.5, 0, 0]} />
    </group>
  );
};

export default BenchPressRoom;

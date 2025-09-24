import React, { useState } from "react";
import { Text } from "@react-three/drei";
import useGameStore from "../../store/gameStore";
import {
  Candle,
  Table,
  Chair,
  PotionBottle,
} from "../roomElements/RoomElements";

interface CoffeeRoomProps {
  onRewardClaim?: () => void;
}

const CoffeeRoom: React.FC<CoffeeRoomProps> = ({ onRewardClaim }) => {
  const { addBuff, addPoints, addExperience } = useGameStore();
  const [coffeesDrunk, setCoffeesDrunk] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const maxCoffees = 3; // Maximum coffees per room visit

  const handleDrinkCoffee = () => {
    if (coffeesDrunk >= maxCoffees) return;

    setIsAnimating(true);
    setCoffeesDrunk((prev) => prev + 1);

    // Apply speed boost (30 seconds per coffee)
    addBuff("speedBoost", 30);
    addPoints(20); // Reward points
    addExperience(15); // Reward experience

    // Call reward callback
    onRewardClaim?.();

    // Stop animation after 1 second
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <group>
      {/* Room Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Coffee Shop Counter */}
      <group position={[0, 0, -2]}>
        {/* Counter */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <boxGeometry args={[6, 1, 1]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Coffee Machine */}
        <mesh position={[-1, 1.2, 0]} castShadow>
          <boxGeometry args={[0.8, 1.4, 0.6]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>

        {/* Coffee Cups */}
        {[0, 1, 2].map((i) => (
          <group key={i} position={[i * 0.8 - 0.8, 1.1, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.15, 0.15, 0.3]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow>
              <cylinderGeometry args={[0.12, 0.12, 0.1]} />
              <meshStandardMaterial color="#4A2C2A" />
            </mesh>
          </group>
        ))}

        {/* Clickable Coffee Area */}
        <mesh
          position={[0, 0.5, 0]}
          onClick={handleDrinkCoffee}
          onPointerOver={(e) => {
            e.stopPropagation();
            document.body.style.cursor =
              coffeesDrunk >= maxCoffees ? "not-allowed" : "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[6.2, 1.2, 1.2]} />
          <meshStandardMaterial
            color={coffeesDrunk >= maxCoffees ? "#666666" : "#4a4a4a"}
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
        ☕ COFFEE ROOM ☕
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
        {coffeesDrunk >= maxCoffees
          ? "No more coffee!"
          : "Click to drink coffee!"}
      </Text>

      {/* Coffee Counter */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.3}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {coffeesDrunk}/{maxCoffees} Coffees Drunk
      </Text>

      {/* Speed Boost Info */}
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.3}
        color="#FFD700"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        +30s Speed Boost per Coffee
      </Text>

      {/* Animation Effect */}
      {isAnimating && (
        <group position={[0, 2.5, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.6}
            color="#FFD700"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.05}
            outlineColor="#000000"
          >
            ☕ SLURP! ☕
          </Text>
        </group>
      )}

      {/* Decorative Elements */}
      {/* Tables and Chairs */}
      <Table position={[-2, 0, 1]} />
      <Chair position={[-2.6, 0, 1.4]} />
      <Chair position={[-1.4, 0, 1.4]} />

      <Table position={[2, 0, 1]} />
      <Chair position={[1.4, 0, 1.4]} />
      <Chair position={[2.6, 0, 1.4]} />

      {/* Coffee Beans */}
      <group position={[0, 0.1, 2]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <mesh
            key={i}
            position={[(Math.random() - 0.5) * 4, 0, (Math.random() - 0.5) * 2]}
            rotation={[0, Math.random() * Math.PI, 0]}
          >
            <boxGeometry args={[0.1, 0.1, 0.1]} />
            <meshStandardMaterial color="#4A2C2A" />
          </mesh>
        ))}
      </group>

      {/* Additional coffee shop elements */}
      <Candle position={[-1, 0.4, 0]} />
      <Candle position={[1, 0.4, 0]} />
      <Candle position={[0, 0.4, 2]} />

      {/* Coffee potions */}
      <PotionBottle position={[-0.5, 0.4, 1]} color="#4A2C2A" />
      <PotionBottle position={[0.5, 0.4, 1]} color="#4A2C2A" />
      <PotionBottle position={[0, 0.4, 1.5]} color="#8B4513" />
    </group>
  );
};

export default CoffeeRoom;

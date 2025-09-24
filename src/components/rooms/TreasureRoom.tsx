import React, { useState } from "react";
import { Text } from "@react-three/drei";
import RoomActionCards from "../RoomActionCards";
import { useRoomActions } from "../../hooks/useRoomActions";

interface TreasureRoomProps {
  onTreasureOpen?: () => void;
}

const TreasureRoom: React.FC<TreasureRoomProps> = ({ onTreasureOpen }) => {
  const [treasureOpened, setTreasureOpened] = useState(false);

  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: "treasure",
    onTreasureOpen: () => {
      setTreasureOpened(true);
      onTreasureOpen?.();
    },
  });

  return (
    <group>
      {/* Treasure Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial color="#2F4F4F" />
      </mesh>

      {/* Treasure Chest */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[2, 0.6, 1.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>

        {/* Chest Lid */}
        <mesh
          position={[0, 0.6, 0]}
          castShadow
          rotation={treasureOpened ? [0, 0, Math.PI * 0.3] : [0, 0, 0]}
        >
          <boxGeometry args={[2, 0.1, 1.5]} />
          <meshStandardMaterial color="#654321" />
        </mesh>

        {/* Chest */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[2.2, 0.8, 1.7]} />
          <meshStandardMaterial
            color={treasureOpened ? "#4CAF50" : "#8B4513"}
            emissive={treasureOpened ? "#4CAF50" : "#000000"}
            emissiveIntensity={treasureOpened ? 0.2 : 0}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Treasure Glow */}
      {treasureOpened && (
        <pointLight
          position={[0, 1, 0]}
          color="#FFD700"
          intensity={1}
          distance={5}
        />
      )}

      {/* Treasure Pile */}
      <group position={[0, 0.1, 0]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              (Math.random() - 0.5) * 3,
              0.1,
              (Math.random() - 0.5) * 3,
            ]}
            castShadow
          >
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
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
        💎 TREASURE ROOM 💎
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
        {treasureOpened
          ? "Treasure claimed!"
          : "Use action cards below to open it!"}
      </Text>

      {/* Treasure Info */}
      <Text
        position={[0, 1.8, 0]}
        fontSize={0.3}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {treasureOpened ? "Rich rewards await!" : "Valuable treasures inside!"}
      </Text>

      {/* Action Cards */}
      <RoomActionCards
        cards={cards}
        isVisible={isVisible}
        onCardClick={(card) => {
          if (card.id === "open_chest") {
            setTreasureOpened(true);
            hideCards();
          }
        }}
      />
    </group>
  );
};

export default TreasureRoom;

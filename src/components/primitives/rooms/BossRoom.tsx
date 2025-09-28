import React, { useState } from "react";
import { Text } from "@react-three/drei";
import RoomActionCards from "../../RoomActionCards";
import { useRoomActions } from "../../../hooks/useRoomActions";

interface BossRoomProps {
  onBossFight?: () => void;
}

const BossRoom: React.FC<BossRoomProps> = ({ onBossFight }) => {
  const [bossDefeated, setBossDefeated] = useState(false);
  const [bossActive, setBossActive] = useState(false);

  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: "boss",
    onBossFight: () => {
      setBossActive(true);
      onBossFight?.();
    },
  });

  return (
    <group>
      {/* Boss Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>

      {/* Boss Platform */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[4, 4, 0.2]} />
          <meshStandardMaterial color="#444444" />
        </mesh>

        {/* Boss Area */}
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[4.2, 4.2, 0.4]} />
          <meshStandardMaterial
            color={
              bossDefeated ? "#4CAF50" : bossActive ? "#FF5722" : "#E91E63"
            }
            emissive={
              bossDefeated ? "#4CAF50" : bossActive ? "#FF5722" : "#E91E63"
            }
            emissiveIntensity={0.4}
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>

      {/* Boss Monster */}
      <group position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.5, 2, 1]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>

        {/* Boss Head */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.8]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>

        {/* Boss Eyes */}
        <mesh position={[-0.3, 1.3, 0.6]} castShadow>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#FFFF00" />
        </mesh>
        <mesh position={[0.3, 1.3, 0.6]} castShadow>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#FFFF00" />
        </mesh>
      </group>

      {/* Boss Weapons */}
      <group position={[-2, 1, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 2, 0.2]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>
      <group position={[2, 1, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.2, 2, 0.2]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>

      {/* Boss Glow */}
      <pointLight
        position={[0, 2, 0]}
        color={bossDefeated ? "#4CAF50" : "#FF0000"}
        intensity={1.5}
        distance={8}
      />

      {/* Room Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={1.0}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        👹 BOSS ROOM 👹
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {bossDefeated
          ? "Boss defeated!"
          : bossActive
          ? "Boss battle in progress!"
          : "Use action cards below to see options!"}
      </Text>

      {/* Boss Info */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.3}
        color="#00ff00"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {bossDefeated
          ? "Epic victory achieved!"
          : bossActive
          ? "Face the ultimate challenge!"
          : "Prepare for the ultimate battle!"}
      </Text>

      {/* Action Cards */}
      <RoomActionCards
        cards={cards}
        isVisible={isVisible}
        onCardClick={(card) => {
          if (card.id === "boss_fight") {
            setBossActive(true);
            hideCards();
          } else if (card.id === "prepare") {
            setBossActive(false);
            hideCards();
          }
        }}
      />
    </group>
  );
};

export default BossRoom;

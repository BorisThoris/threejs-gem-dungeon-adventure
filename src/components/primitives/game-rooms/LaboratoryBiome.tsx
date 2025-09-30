import React, { useState } from "react";
import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import useGameStore from "../../../store/gameStore";
import { getBiomeScale } from "../../../utils/biomeScaling";
import RoomActionCards from "../../RoomActionCards";
import { useRoomActions } from "../../../hooks/useRoomActions";

interface LaboratoryBiomeProps {
  size?: number;
  onExperimentComplete?: () => void;
}

const LaboratoryBiome: React.FC<LaboratoryBiomeProps> = ({
  onExperimentComplete,
  size = 10,
}) => {
  const [experimenting, setExperimenting] = useState(false);
  const [experimentComplete, setExperimentComplete] = useState(false);

  const playerDimensions = useGameStore(
    (state) => state.playerStats.dimensions
  );
  const scale = getBiomeScale(playerDimensions);
  const biomeSize = size;

  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: "laboratory",
    onExperimentComplete: () => {
      setExperimentComplete(true);
      onExperimentComplete?.();
    },
  });

  return (
    <group>
      {/* Laboratory Floor */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[10, 1, 10]} />
          <meshStandardMaterial color="#E0E0E0" />
        </mesh>
      </RigidBody>

      {/* Workbench */}
      <RigidBody type="fixed" position={[0, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[8, 0.8, 2]} />
          <meshStandardMaterial color="#90A4AE" />
        </mesh>
      </RigidBody>

      {/* Lab Equipment */}
      {Array.from({ length: 4 }).map((_, i) => {
        const angle = (i / 4) * Math.PI * 2;
        const radius = 2.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={i} position={[x, 0.5, z]}>
            {/* Equipment Base */}
            <mesh castShadow>
              <cylinderGeometry args={[0.3, 0.3, 0.2]} />
              <meshStandardMaterial color="#607D8B" />
            </mesh>

            {/* Equipment Top */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.4]} />
              <meshStandardMaterial color="#455A64" />
            </mesh>

            {/* Glowing Effect */}
            {experimenting && (
              <pointLight
                position={[0, 0.5, 0]}
                color="#00E676"
                intensity={0.5}
                distance={2}
              />
            )}
          </group>
        );
      })}

      {/* Central Experiment Station */}
      <group position={[0, 0.8, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1]} />
          <meshStandardMaterial color="#37474F" />
        </mesh>

        {/* Experiment Vial */}
        {experimenting && (
          <mesh position={[0, 0.2, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.3]} />
            <meshStandardMaterial color="#00E676" />
          </mesh>
        )}
      </group>

      {/* Chemical Storage */}
      <RigidBody type="fixed" position={[0, 1.5, -3]}>
        <mesh castShadow>
          <boxGeometry args={[3, 3, 1]} />
          <meshStandardMaterial color="#FFC107" />
        </mesh>
      </RigidBody>

      {/* Lab Shelves */}
      <RigidBody type="fixed" position={[0, 2, 3]}>
        <mesh castShadow>
          <boxGeometry args={[6, 0.2, 1]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      </RigidBody>

      {/* Lab Equipment on Shelves */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-2 + i * 0.8, 2.2, 3]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#78909C" />
        </mesh>
      ))}

      {/* Laboratory Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        🧪 LABORATORY BIOME 🧪
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 3.2, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {experimentComplete
          ? "Experiment successful!"
          : "Conduct scientific experiments!"}
      </Text>

      {/* Action Cards */}
      <RoomActionCards
        cards={cards}
        isVisible={isVisible}
        onCardClick={(card) => {
          if (card.id === "start_experiment") {
            setExperimenting(true);
            hideCards();
          }
        }}
      />
    </group>
  );
};

export default LaboratoryBiome;

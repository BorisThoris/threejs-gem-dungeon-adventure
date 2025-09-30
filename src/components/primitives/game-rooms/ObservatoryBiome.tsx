import React, { useState } from "react";
import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import useGameStore from "../../../store/gameStore";
import { getBiomeScale } from "../../../utils/biomeScaling";
import RoomActionCards from "../../RoomActionCards";
import { useRoomActions } from "../../../hooks/useRoomActions";

interface ObservatoryBiomeProps {
  size?: number;
  onObservationComplete?: () => void;
}

const ObservatoryBiome: React.FC<ObservatoryBiomeProps> = ({
  onObservationComplete,
  size = 10,
}) => {
  const [observing, setObserving] = useState(false);
  const [discoveryMade, setDiscoveryMade] = useState(false);

  const playerDimensions = useGameStore(
    (state) => state.playerStats.dimensions
  );
  const scale = getBiomeScale(playerDimensions);
  const biomeSize = size;

  const { cards, isVisible, showCards, hideCards } = useRoomActions({
    roomType: "observatory",
    onObservationComplete: () => {
      setDiscoveryMade(true);
      onObservationComplete?.();
    },
  });

  return (
    <group>
      {/* Observatory Floor */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh receiveShadow>
          <boxGeometry args={[10, 1, 10]} />
          <meshStandardMaterial color="#263238" />
        </mesh>
      </RigidBody>

      {/* Telescope */}
      <group position={[0, 0, 0]}>
        <RigidBody type="fixed" position={[0, 0.3, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.6]} />
            <meshStandardMaterial color="#37474F" />
          </mesh>
        </RigidBody>

        {/* Telescope Tube */}
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.2, 1.5]} />
          <meshStandardMaterial color="#455A64" />
        </mesh>

        {/* Telescope Lens */}
        <mesh position={[0, 2, 0]} castShadow>
          <cylinderGeometry args={[0.4, 0.4, 0.1]} />
          <meshStandardMaterial color="#E0E0E0" />
        </mesh>

        {/* Star Light */}
        {observing && (
          <pointLight
            position={[0, 2, 0]}
            color="#E3F2FD"
            intensity={1}
            distance={8}
          />
        )}
      </group>

      {/* Star Charts */}
      <RigidBody type="fixed" position={[-3, 1.5, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2, 3, 0.1]} />
          <meshStandardMaterial color="#FFF8E1" />
        </mesh>
      </RigidBody>

      {/* Astronomical Instruments */}
      {Array.from({ length: 3 }).map((_, i) => {
        const angle = (i / 3) * Math.PI * 2;
        const radius = 3;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group key={i} position={[x, 0.5, z]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.2, 0.2, 0.4]} />
              <meshStandardMaterial color="#607D8B" />
            </mesh>

            <mesh position={[0, 0.3, 0]} castShadow>
              <sphereGeometry args={[0.15]} />
              <meshStandardMaterial color="#90A4AE" />
            </mesh>
          </group>
        );
      })}

      {/* Celestial Globe */}
      <group position={[3, 0.8, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial color="#37474F" />
        </mesh>

        {/* Globe Stand */}
        <mesh position={[0, -0.3, 0]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.6]} />
          <meshStandardMaterial color="#8D6E63" />
        </mesh>
      </group>

      {/* Star Field Effect */}
      {observing && (
        <>
          {Array.from({ length: 20 }).map((_, i) => {
            const angle = (i / 20) * Math.PI * 2;
            const radius = 8;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = 3 + Math.random() * 2;

            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.02]} />
                <meshStandardMaterial color="#E3F2FD" />
              </mesh>
            );
          })}
        </>
      )}

      {/* Observatory Title */}
      <Text
        position={[0, 4, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        🔭 OBSERVATORY BIOME 🔭
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
        {discoveryMade
          ? "New celestial discovery made!"
          : "Observe the stars and make discoveries!"}
      </Text>

      {/* Action Cards */}
      <RoomActionCards
        cards={cards}
        isVisible={isVisible}
        onCardClick={(card) => {
          if (card.id === "observe_stars") {
            setObserving(true);
            hideCards();
          }
        }}
      />
    </group>
  );
};

export default ObservatoryBiome;

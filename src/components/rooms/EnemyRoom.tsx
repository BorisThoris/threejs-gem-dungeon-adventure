import React, { useState } from "react";
import { Text } from "@react-three/drei";

interface EnemyRoomProps {
  onCombatStart?: () => void;
}

const EnemyRoom: React.FC<EnemyRoomProps> = ({ onCombatStart }) => {
  const [enemyDefeated, setEnemyDefeated] = useState(false);

  return (
    <group>
      {/* Enemy Floor */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[8, 1, 8]} />
        <meshStandardMaterial color="#FF5722" />
      </mesh>

      {/* Combat Arena */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[3.5, 3.5, 0.2]} />
          <meshStandardMaterial color="#FF7043" />
        </mesh>
      </group>

      {/* Enemy Monster */}
      <group position={[0, 1.2, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1.2, 1.8, 0.8]} />
          <meshStandardMaterial color="#8B0000" />
        </mesh>

        {/* Enemy Head */}
        <mesh position={[0, 1.1, 0]} castShadow>
          <sphereGeometry args={[0.6]} />
          <meshStandardMaterial color="#FF0000" />
        </mesh>

        {/* Enemy Eyes */}
        <mesh position={[-0.2, 1.2, 0.4]} castShadow>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#FFFF00" />
        </mesh>
        <mesh position={[0.2, 1.2, 0.4]} castShadow>
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial color="#FFFF00" />
        </mesh>
      </group>

      {/* Enemy Weapons */}
      <group position={[-1.5, 0.8, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.15, 1.5, 0.15]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>
      <group position={[1.5, 0.8, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.15, 1.5, 0.15]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </group>

      {/* Combat Glow */}
      <pointLight
        position={[0, 2, 0]}
        color={enemyDefeated ? "#4CAF50" : "#FF0000"}
        intensity={1.2}
        distance={6}
      />

      {/* Room Title */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        ⚔️ ENEMY ROOM ⚔️
      </Text>

      {/* Instructions */}
      <Text
        position={[0, 2.7, 0]}
        fontSize={0.4}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#000000"
      >
        {enemyDefeated ? "Enemy defeated!" : "Prepare for combat!"}
      </Text>
    </group>
  );
};

export default EnemyRoom;

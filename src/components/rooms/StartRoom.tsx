import React from "react";
import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";

interface StartRoomProps {
  onJourneyBegin?: () => void;
}

const StartRoom: React.FC<StartRoomProps> = ({ onJourneyBegin }) => {
  return (
    <group>
      {/* Start Floor with Collision */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
      </RigidBody>

      {/* Start Platform */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <cylinderGeometry args={[3, 3, 0.2]} />
          <meshStandardMaterial color="#66BB6A" />
        </mesh>
      </group>

      {/* Start Symbol */}
      <group position={[0, 1.5, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[1, 1, 0.2]} />
          <meshStandardMaterial color="#FFD700" />
        </mesh>
      </group>

      {/* Welcome Text */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.8}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000000"
      >
        🚀 START ROOM 🚀
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
        Begin your adventure here!
      </Text>
    </group>
  );
};

export default StartRoom;

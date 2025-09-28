import React from "react";
import { RigidBody } from "@react-three/rapier";
import Torch from "../elements/Torch";
import Barrel from "../elements/Barrel";
import Chest from "../elements/Chest";
import Skeleton from "../objects/Skeleton";
import Altar from "../objects/Altar";

export interface CryptRoomProps {
  size?: number;
  onRoomComplete?: () => void;
}

const CryptRoom: React.FC<CryptRoomProps> = ({ size = 10, onRoomComplete }) => {
  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[size, 1, size]} />
          <meshLambertMaterial color="#2C2C2C" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <RigidBody type="fixed" position={[0, size / 2, size / 2]}>
        <mesh>
          <boxGeometry args={[size, size, 1]} />
          <meshLambertMaterial color="#1A1A1A" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, size / 2, -size / 2]}>
        <mesh>
          <boxGeometry args={[size, size, 1]} />
          <meshLambertMaterial color="#1A1A1A" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[size / 2, size / 2, 0]}>
        <mesh>
          <boxGeometry args={[1, size, size]} />
          <meshLambertMaterial color="#1A1A1A" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-size / 2, size / 2, 0]}>
        <mesh>
          <boxGeometry args={[1, size, size]} />
          <meshLambertMaterial color="#1A1A1A" />
        </mesh>
      </RigidBody>

      {/* Ceiling */}
      <RigidBody type="fixed" position={[0, size, 0]}>
        <mesh>
          <boxGeometry args={[size, 1, size]} />
          <meshLambertMaterial color="#0F0F0F" />
        </mesh>
      </RigidBody>

      {/* Crypt decorations */}
      <Torch position={[-size / 3, 0, -size / 3]} color="#ff6b35" />
      <Torch position={[size / 3, 0, -size / 3]} color="#ff6b35" />
      <Torch position={[-size / 3, 0, size / 3]} color="#ff6b35" />
      <Torch position={[size / 3, 0, size / 3]} color="#ff6b35" />

      {/* Sarcophagi */}
      <RigidBody type="fixed" position={[-2, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[2, 1, 1]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[2, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[2, 1, 1]} />
          <meshLambertMaterial color="#654321" />
        </mesh>
      </RigidBody>

      {/* Skeletons */}
      <Skeleton position={[-1, 0, 2]} isAnimated={true} />
      <Skeleton position={[1, 0, 2]} isAnimated={true} />
      <Skeleton position={[0, 0, -2]} isAnimated={true} />

      {/* Altar */}
      <Altar position={[0, 0, 0]} isActivated={false} offering="Soul" />

      {/* Treasure chests */}
      <Chest position={[-3, 0, 3]} isOpen={false} treasure="Ancient Relic" />
      <Chest position={[3, 0, 3]} isOpen={false} treasure="Gold Coins" />

      {/* Barrels */}
      <Barrel position={[-4, 0, -3]} color="#8B4513" />
      <Barrel position={[4, 0, -3]} color="#8B4513" />
    </group>
  );
};

export default CryptRoom;

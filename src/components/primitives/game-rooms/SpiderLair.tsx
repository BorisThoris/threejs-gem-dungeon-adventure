import React, { useState } from "react";
import { RigidBody } from "@react-three/rapier";
import Torch from "../elements/Torch";
import Brazier from "../elements/Brazier";
import Web from "../elements/Web";
import Chain from "../elements/Chain";
import Spikes from "../elements/Spikes";
import Skeleton from "../objects/Skeleton";
import Door from "../elements/Door";

export interface SpiderLairProps {
  size?: number;
  onRoomComplete?: () => void;
}

const SpiderLair: React.FC<SpiderLairProps> = ({
  size = 10,
  onRoomComplete,
}) => {
  const [spiderDefeated, setSpiderDefeated] = useState(false);
  const [lairCleared, setLairCleared] = useState(false);

  const handleSpiderDefeat = () => {
    setSpiderDefeated(true);
    setLairCleared(true);
    if (onRoomComplete) onRoomComplete();
  };

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

      {/* Dim lighting */}
      <Torch
        position={[-size / 3, 0, -size / 3]}
        color="#8B4513"
        intensity={1}
      />
      <Torch
        position={[size / 3, 0, -size / 3]}
        color="#8B4513"
        intensity={1}
      />
      <Torch
        position={[-size / 3, 0, size / 3]}
        color="#8B4513"
        intensity={1}
      />
      <Torch position={[size / 3, 0, size / 3]} color="#8B4513" intensity={1} />

      {/* Central brazier */}
      <Brazier
        position={[0, 0, 0]}
        isLit={!spiderDefeated}
        flameColor="#8B4513"
      />

      {/* Spider webs */}
      <Web position={[-size / 3, 2, -size / 3]} size={2} sticky={true} />
      <Web position={[size / 3, 2, -size / 3]} size={2} sticky={true} />
      <Web position={[-size / 3, 2, size / 3]} size={2} sticky={true} />
      <Web position={[size / 3, 2, size / 3]} size={2} sticky={true} />
      <Web position={[0, 3, 0]} size={3} sticky={true} />

      {/* Hanging chains */}
      <Chain position={[-size / 4, 2, -size / 4]} length={1.5} swing={true} />
      <Chain position={[size / 4, 2, -size / 4]} length={1.5} swing={true} />
      <Chain position={[-size / 4, 2, size / 4]} length={1.5} swing={true} />
      <Chain position={[size / 4, 2, size / 4]} length={1.5} swing={true} />

      {/* Spikes around the room */}
      <Spikes
        position={[-size / 2 + 1, 0, -size / 2 + 1]}
        count={4}
        damage={10}
      />
      <Spikes
        position={[size / 2 - 1, 0, -size / 2 + 1]}
        count={4}
        damage={10}
      />
      <Spikes
        position={[-size / 2 + 1, 0, size / 2 - 1]}
        count={4}
        damage={10}
      />
      <Spikes
        position={[size / 2 - 1, 0, size / 2 - 1]}
        count={4}
        damage={10}
      />

      {/* Spider skeletons - using ragdoll for more dynamic movement */}
      <Skeleton
        position={[-2, 0, -2]}
        isRagdoll={true}
        health={30}
        color="#8B4513"
      />
      <Skeleton
        position={[2, 0, -2]}
        isRagdoll={true}
        health={30}
        color="#8B4513"
      />
      <Skeleton
        position={[-2, 0, 2]}
        isRagdoll={true}
        health={30}
        color="#8B4513"
      />
      <Skeleton
        position={[2, 0, 2]}
        isRagdoll={true}
        health={30}
        color="#8B4513"
      />

      {/* Central spider boss - regular skeleton for more control */}
      <Skeleton
        position={[0, 0, 0]}
        isAnimated={true}
        health={100}
        color="#FF6B6B"
        onDeath={handleSpiderDefeat}
      />

      {/* Exit door */}
      <Door
        position={[0, 0, size / 2]}
        isOpen={lairCleared}
        isLocked={!lairCleared}
        keyRequired="spider_defeated"
        onUnlock={(key) => key === "spider_defeated"}
      />

      {/* Cobweb decorations on walls */}
      <Web position={[-size / 2, 1, 0]} size={1.5} sticky={true} />
      <Web position={[size / 2, 1, 0]} size={1.5} sticky={true} />
      <Web position={[0, 1, -size / 2]} size={1.5} sticky={true} />
      <Web position={[0, 1, size / 2]} size={1.5} sticky={true} />

      {/* Victory effect */}
      {lairCleared && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[1.5, 8, 6]} />
          <meshLambertMaterial
            color="#00FF00"
            emissive="#00FF00"
            emissiveIntensity={0.5}
            transparent
            opacity={0.3}
          />
        </mesh>
      )}

      {/* Atmospheric fog */}
      <mesh position={[0, size / 2, 0]}>
        <boxGeometry args={[size - 1, size - 1, size - 1]} />
        <meshLambertMaterial color="#2C2C2C" transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

export default SpiderLair;

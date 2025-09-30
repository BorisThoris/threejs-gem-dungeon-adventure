import React, { useState } from "react";
import { RigidBody } from "@react-three/rapier";
import Torch from "../elements/Torch";
import Chest from "../elements/Chest";
import Barrel from "../elements/Barrel";
import Door from "../elements/Door";
import Lever from "../objects/Lever";
import Altar from "../objects/Altar";

export interface TreasureVaultProps {
  size?: number;
  onRoomComplete?: () => void;
}

const TreasureVault: React.FC<TreasureVaultProps> = ({
  size = 10,
  onRoomComplete,
}) => {
  const [vaultOpen, setVaultOpen] = useState(false);
  const [altarActivated, setAltarActivated] = useState(false);

  const handleLeverToggle = (activated: boolean) => {
    if (activated && altarActivated) {
      setVaultOpen(true);
      if (onRoomComplete) onRoomComplete();
    }
  };

  const handleAltarActivate = () => {
    setAltarActivated(true);
  };

  return (
    <group>
      <RigidBody type="fixed" position={[0, -0.5, 0]}>
        <mesh>
          <boxGeometry args={[size, 1, size]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <RigidBody type="fixed" position={[0, size / 2, size / 2]}>
        <mesh>
          <boxGeometry args={[size, size, 1]} />
          <meshLambertMaterial color="#B8860B" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[0, size / 2, -size / 2]}>
        <mesh>
          <boxGeometry args={[size, size, 1]} />
          <meshLambertMaterial color="#B8860B" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[size / 2, size / 2, 0]}>
        <mesh>
          <boxGeometry args={[1, size, size]} />
          <meshLambertMaterial color="#B8860B" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-size / 2, size / 2, 0]}>
        <mesh>
          <boxGeometry args={[1, size, size]} />
          <meshLambertMaterial color="#B8860B" />
        </mesh>
      </RigidBody>

      {/* Ceiling */}
      <RigidBody type="fixed" position={[0, size, 0]}>
        <mesh>
          <boxGeometry args={[size, 1, size]} />
          <meshLambertMaterial color="#DAA520" />
        </mesh>
      </RigidBody>

      {/* Golden lighting */}
      <Torch position={[-size / 3, 0, -size / 3]} color="#FFD700" />
      <Torch position={[size / 3, 0, -size / 3]} color="#FFD700" />
      <Torch position={[-size / 3, 0, size / 3]} color="#FFD700" />
      <Torch position={[size / 3, 0, size / 3]} color="#FFD700" />

      {/* Treasure chests */}
      <Chest position={[-3, 0, -3]} isOpen={vaultOpen} treasure="Diamond" />
      <Chest position={[3, 0, -3]} isOpen={vaultOpen} treasure="Ruby" />
      <Chest position={[-3, 0, 3]} isOpen={vaultOpen} treasure="Sapphire" />
      <Chest position={[3, 0, 3]} isOpen={vaultOpen} treasure="Emerald" />

      {/* Central treasure chest */}
      <Chest position={[0, 0, 0]} isOpen={vaultOpen} treasure="Ancient Crown" />

      {/* Gold barrels */}
      <Barrel position={[-4, 0, 0]} color="#FFD700" />
      <Barrel position={[4, 0, 0]} color="#FFD700" />
      <Barrel position={[0, 0, -4]} color="#FFD700" />
      <Barrel position={[0, 0, 4]} color="#FFD700" />

      {/* Altar for activation */}
      <Altar
        position={[0, 0, -size / 2 + 1]}
        isActivated={altarActivated}
        onActivate={handleAltarActivate}
        offering="Sacred Offering"
        glowColor="#FFD700"
      />

      {/* Control lever */}
      <Lever
        position={[0, 0, size / 2 - 1]}
        isActivated={vaultOpen}
        onToggle={handleLeverToggle}
        label="Open Vault"
      />

      {/* Vault door */}
      <Door
        position={[0, 0, size / 2]}
        isOpen={vaultOpen}
        isLocked={!vaultOpen}
        keyRequired="altar_and_lever"
        onUnlock={(key) => key === "altar_and_lever"}
      />

      {/* Decorative pillars */}
      <RigidBody type="fixed" position={[-2, 2, -2]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[2, 2, -2]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[-2, 2, 2]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      </RigidBody>
      <RigidBody type="fixed" position={[2, 2, 2]}>
        <mesh>
          <cylinderGeometry args={[0.2, 0.2, 4, 8]} />
          <meshLambertMaterial color="#FFD700" />
        </mesh>
      </RigidBody>
    </group>
  );
};

export default TreasureVault;

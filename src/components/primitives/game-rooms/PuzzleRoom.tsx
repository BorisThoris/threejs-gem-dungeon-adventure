import React, { useState } from "react";
import { RigidBody } from "@react-three/rapier";
import Torch from "../elements/Torch";
import Brazier from "../elements/Brazier";
import Pillar from "../elements/Pillar";
import PressurePlate from "../objects/PressurePlate";
import Switch from "../objects/Switch";
import Statue from "../objects/Statue";
import Door from "../elements/Door";

export interface PuzzleRoomProps {
  size?: number;
  onRoomComplete?: () => void;
}

const PuzzleRoom: React.FC<PuzzleRoomProps> = ({
  size = 12,
  onRoomComplete,
}) => {
  const [puzzleSolved, setPuzzleSolved] = useState(false);
  const [platesPressed, setPlatesPressed] = useState([
    false,
    false,
    false,
    false,
  ]);
  const [switchesOn, setSwitchesOn] = useState([false, false, false]);
  const [statueActivated, setStatueActivated] = useState(false);

  const handlePlatePress = (index: number) => {
    const newPlates = [...platesPressed];
    newPlates[index] = true;
    setPlatesPressed(newPlates);
    checkPuzzleComplete();
  };

  const handlePlateRelease = (index: number) => {
    const newPlates = [...platesPressed];
    newPlates[index] = false;
    setPlatesPressed(newPlates);
  };

  const handleSwitchToggle = (index: number, isOn: boolean) => {
    const newSwitches = [...switchesOn];
    newSwitches[index] = isOn;
    setSwitchesOn(newSwitches);
    checkPuzzleComplete();
  };

  const handleStatueInteract = () => {
    setStatueActivated(true);
    checkPuzzleComplete();
  };

  const checkPuzzleComplete = () => {
    const allPlatesPressed = platesPressed.every((pressed) => pressed);
    const allSwitchesOn = switchesOn.every((switched) => switched);

    if (allPlatesPressed && allSwitchesOn && statueActivated) {
      setPuzzleSolved(true);
      if (onRoomComplete) onRoomComplete();
    }
  };

  return (
    <group>
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

      {/* Lighting */}
      <Torch position={[-size / 3, 0, -size / 3]} color="#ff6b35" />
      <Torch position={[size / 3, 0, -size / 3]} color="#ff6b35" />
      <Torch position={[-size / 3, 0, size / 3]} color="#ff6b35" />
      <Torch position={[size / 3, 0, size / 3]} color="#ff6b35" />

      {/* Central brazier */}
      <Brazier position={[0, 0, 0]} isLit={puzzleSolved} flameColor="#00FF00" />

      {/* Puzzle pillars */}
      <Pillar position={[-size / 4, 0, -size / 4]} height={3} color="#8B4513" />
      <Pillar position={[size / 4, 0, -size / 4]} height={3} color="#8B4513" />
      <Pillar position={[-size / 4, 0, size / 4]} height={3} color="#8B4513" />
      <Pillar position={[size / 4, 0, size / 4]} height={3} color="#8B4513" />

      {/* Pressure plates */}
      <PressurePlate
        position={[-size / 3, 0, -size / 3]}
        isPressed={platesPressed[0]}
        onPress={() => handlePlatePress(0)}
        onRelease={() => handlePlateRelease(0)}
        label="Plate 1"
      />
      <PressurePlate
        position={[size / 3, 0, -size / 3]}
        isPressed={platesPressed[1]}
        onPress={() => handlePlatePress(1)}
        onRelease={() => handlePlateRelease(1)}
        label="Plate 2"
      />
      <PressurePlate
        position={[-size / 3, 0, size / 3]}
        isPressed={platesPressed[2]}
        onPress={() => handlePlatePress(2)}
        onRelease={() => handlePlateRelease(2)}
        label="Plate 3"
      />
      <PressurePlate
        position={[size / 3, 0, size / 3]}
        isPressed={platesPressed[3]}
        onPress={() => handlePlatePress(3)}
        onRelease={() => handlePlateRelease(3)}
        label="Plate 4"
      />

      {/* Switches */}
      <Switch
        position={[-size / 2 + 1, 0, 0]}
        isOn={switchesOn[0]}
        onToggle={(isOn) => handleSwitchToggle(0, isOn)}
        label="Switch 1"
        switchType="toggle"
      />
      <Switch
        position={[size / 2 - 1, 0, 0]}
        isOn={switchesOn[1]}
        onToggle={(isOn) => handleSwitchToggle(1, isOn)}
        label="Switch 2"
        switchType="momentary"
      />
      <Switch
        position={[0, 0, -size / 2 + 1]}
        isOn={switchesOn[2]}
        onToggle={(isOn) => handleSwitchToggle(2, isOn)}
        label="Switch 3"
        switchType="rotary"
      />

      {/* Central statue */}
      <Statue
        position={[0, 0, 0]}
        type="deity"
        isAnimated={true}
        onInteract={statueActivated ? undefined : handleStatueInteract}
      />

      {/* Exit door */}
      <Door
        position={[0, 0, size / 2]}
        isOpen={puzzleSolved}
        isLocked={!puzzleSolved}
        keyRequired="puzzle_solved"
        onUnlock={(key) => key === "puzzle_solved"}
      />

      {/* Puzzle indicators */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 12]} />
        <meshLambertMaterial
          color={puzzleSolved ? "#00FF00" : "#FF0000"}
          emissive={puzzleSolved ? "#00FF00" : "#FF0000"}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Success effect */}
      {puzzleSolved && (
        <mesh position={[0, 2, 0]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshLambertMaterial
            color="#00FF00"
            emissive="#00FF00"
            emissiveIntensity={0.8}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
};

export default PuzzleRoom;

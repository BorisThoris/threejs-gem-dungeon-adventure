import React from "react";
import { Text } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { Tile, Wall } from "../roomElements";
import UniversalPrototype from "../UniversalPrototype";
import { useObjectPrototypeActions } from "../../utils/SimplePrototypeMixin";

interface StartRoomProps {
  onJourneyBegin?: () => void;
}

const StartRoom: React.FC<StartRoomProps> = ({ onJourneyBegin }) => {
  // Example of using prototype actions
  const { executeAction: executeFloorAction } =
    useObjectPrototypeActions("start_floor");
  const { executeAction: executePlatformAction } =
    useObjectPrototypeActions("start_platform");

  return (
    <group>
      {/* Start Floor with Prototype */}
      <UniversalPrototype
        prototypeId="start_floor"
        prototypeType="floor"
        onPrototypeAction={(action, data) => {
          console.log(`Floor action: ${action}`, data);
          executeFloorAction(action, data);
        }}
      >
        <Tile
          position={[0, -0.5, 0]}
          size={8}
          height={1}
          color="#4CAF50"
          material="stone"
          pattern="smooth"
          isCollidable={true}
        />
      </UniversalPrototype>

      {/* Start Platform with Prototype */}
      <UniversalPrototype
        prototypeId="start_platform"
        prototypeType="platform"
        onPrototypeAction={(action, data) => {
          console.log(`Platform action: ${action}`, data);
          executePlatformAction(action, data);
        }}
      >
        <Tile
          position={[0, 0.1, 0]}
          size={6}
          height={0.2}
          color="#66BB6A"
          material="marble"
          pattern="polished"
          isCollidable={true}
        />
      </UniversalPrototype>

      {/* Start Symbol with Prototype */}
      <UniversalPrototype
        prototypeId="start_symbol"
        prototypeType="symbol"
        onPrototypeAction={(action, data) => {
          console.log(`Symbol action: ${action}`, data);
        }}
      >
        <Tile
          position={[0, 1.5, 0]}
          size={1}
          height={0.2}
          color="#FFD700"
          material="metal"
          pattern="polished"
          isCollidable={false}
        />
      </UniversalPrototype>

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

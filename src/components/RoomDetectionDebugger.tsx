import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { roomDetectionManager } from "../utils/roomDetectionManager";

const RoomDetectionDebugger: React.FC = () => {
  const { camera } = useThree();
  const debugRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const updateDebugInfo = () => {
      if (!debugRef.current) return;

      const currentRoom = roomDetectionManager.getCurrentRoomId();
      const lastKnownRoom = roomDetectionManager.getLastKnownRoomId();
      const playerPos = camera.position;

      // Update debug text
      const debugText = `Room: ${currentRoom || "None"}
Last: ${lastKnownRoom || "None"}
Pos: ${playerPos.x.toFixed(1)}, ${playerPos.y.toFixed(
        1
      )}, ${playerPos.z.toFixed(1)}`;

      // This would need to be implemented with a proper text update system
      console.log("Room Debug:", debugText);
    };

    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [camera]);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <group ref={debugRef} position={[0, 5, 0]}>
      <Text
        position={[0, 0, 0]}
        fontSize={0.3}
        color="yellow"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        Room Detection Debug
      </Text>
    </group>
  );
};

export default RoomDetectionDebugger;

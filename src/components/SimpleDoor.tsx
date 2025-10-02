import React, { useCallback } from "react";
import { RigidBody } from "@react-three/rapier";

interface SimpleDoorProps {
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  onDoorClick: () => void;
}

const SimpleDoor: React.FC<SimpleDoorProps> = React.memo(
  ({ position, rotation, targetRoomId, onDoorClick }) => {
    const handleClick = useCallback(
      (e: any) => {
        e.stopPropagation();
        console.log(`Door clicked: ${targetRoomId}`);
        onDoorClick();
      },
      [targetRoomId, onDoorClick]
    );

    const handlePointerOver = useCallback((e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "pointer";
    }, []);

    const handlePointerOut = useCallback((e: any) => {
      e.stopPropagation();
      document.body.style.cursor = "default";
    }, []);

    return (
      <group position={position} rotation={rotation}>
        {/* Simple door frame */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[2, 3, 0.2]} />
          <meshLambertMaterial color="#8B4513" />
        </mesh>

        {/* Clickable area */}
        <RigidBody type="fixed" sensor>
          <mesh
            position={[0, 1.5, 0.1]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[2.2, 3.2, 0.1]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </RigidBody>
      </group>
    );
  }
);

SimpleDoor.displayName = "SimpleDoor";

export default SimpleDoor;

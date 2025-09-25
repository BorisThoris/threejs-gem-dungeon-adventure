import { useRef, useCallback, useEffect } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { CapsuleCollider } from "@react-three/rapier";
import { SimpleFirstPersonArms } from "./SimpleFirstPersonArms";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";
import useGameStore from "../store/gameStore";
import useMapStore from "../store/mapStore";
import { useMouseLook } from "../hooks/useMouseLook";
import { refBasedGameState } from "../utils/refBasedGameState";

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void;
}

export function BasicFirstPersonPlayer() {
  console.log(`BasicFirstPersonPlayer: Component rendering`);

  const ref = useRef<RapierRigidBody>(null);
  const armsRef = useRef<THREE.Group>(null);
  const armsControlRef = useRef<ArmsRef>(null);
  const isMouseDown = useRef(false);
  const keys = usePhysicalKeyboard();
  const { gamePhase } = useGameStore();
  const { currentMap, currentRoomId } = useMapStore();
  const { camera } = useThree();

  console.log(`BasicFirstPersonPlayer: gamePhase: ${gamePhase}`);
  console.log(`BasicFirstPersonPlayer: currentMap:`, currentMap);
  console.log(`BasicFirstPersonPlayer: currentRoomId: ${currentRoomId}`);

  // Enable mouse look
  useMouseLook();

  // Camera refs to avoid stutters
  const cameraPositionRef = useRef(new Vector3());
  const lastUpdateTime = useRef(0);

  // Get current room and calculate spawn position
  const currentRoom = currentMap?.rooms.find(
    (room) => room.id === currentRoomId
  );
  // Spawn at room position + 1 unit above floor (room is at [0,0,0], floor at y=-0.5, so spawn at y=1)
  const spawnPosition: [number, number, number] = [0, 1, 0]; // Just above the floor in room coordinates

  // Debug logging for initial spawn
  console.log(
    `BasicFirstPersonPlayer: Initial spawn position: [${spawnPosition[0]}, ${spawnPosition[1]}, ${spawnPosition[2]}]`
  );
  console.log(`BasicFirstPersonPlayer: Current room ID: ${currentRoomId}`);
  console.log(`BasicFirstPersonPlayer: Current room:`, currentRoom);

  // Reposition player when room changes
  useEffect(() => {
    if (currentRoom && ref.current) {
      console.log(
        `BasicFirstPersonPlayer: Repositioning player for room ${currentRoom.id}`
      );
      console.log(`BasicFirstPersonPlayer: Room position: [0, 0, 0]`);
      console.log(`BasicFirstPersonPlayer: Player spawn position: [0, 1, 0]`);
      console.log(`BasicFirstPersonPlayer: Floor top at y: 0`);
      // Teleport player to center of new room, just above floor
      ref.current.setTranslation({ x: 0, y: 1, z: 0 }, true);
      // Reset camera position
      camera.position.set(0, 1, 0);
      camera.lookAt(0, 1, -1); // Look forward
      console.log(`BasicFirstPersonPlayer: Player teleported to [0, 1, 0]`);
    }
  }, [currentRoomId, currentRoom, camera]);

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (
        event.button === 0 &&
        !isMouseDown.current &&
        armsControlRef.current &&
        gamePhase === "exploration"
      ) {
        isMouseDown.current = true;
        armsControlRef.current.switchAnimation(true);
      }
    },
    [gamePhase]
  );

  const handleMouseUp = useCallback((event: MouseEvent) => {
    if (event.button === 0 && isMouseDown.current && armsControlRef.current) {
      isMouseDown.current = false;
      armsControlRef.current.switchAnimation(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseDown, handleMouseUp]);

  // Simple movement control
  useFrame(() => {
    // Update ref-based game state (no React re-renders)
    refBasedGameState.update();

    if (!ref.current) return;

    const { forward, backward, left, right, dash } = {
      forward: keys["KeyW"] || keys["ArrowUp"] || false,
      backward: keys["KeyS"] || keys["ArrowDown"] || false,
      left: keys["KeyA"] || keys["ArrowLeft"] || false,
      right: keys["KeyD"] || keys["ArrowRight"] || false,
      dash: keys["ShiftLeft"] || keys["ShiftRight"] || false,
    };

    const velocity = ref.current.linvel();
    const { x, y, z } = ref.current.translation();

    // Update camera position using refs (throttled to prevent stutters)
    const now = performance.now();
    if (now - lastUpdateTime.current > 16) {
      // ~60fps max
      cameraPositionRef.current.set(x, y + 1.6, z);
      camera.position.copy(cameraPositionRef.current);

      // Ensure camera looks straight ahead initially
      if (
        camera.rotation.x === 0 &&
        camera.rotation.y === 0 &&
        camera.rotation.z === 0
      ) {
        camera.rotation.order = "YXZ";
        camera.rotation.x = 0; // Look straight ahead
        camera.rotation.y = -Math.PI / 2; // Face forward
        camera.rotation.z = 0;
      }

      camera.updateMatrixWorld(true);
      lastUpdateTime.current = now;
    }

    // Calculate movement (slower speeds)
    const speed = dash ? 8 : 5;
    const frontVector = new Vector3(0, 0, +backward - +forward);
    const sideVector = new Vector3(+left - +right, 0, 0);
    const direction = new Vector3()
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed)
      .applyQuaternion(camera.quaternion);

    // No jumping - keep current Y velocity
    const yVelocity = velocity.y;

    // Apply movement
    ref.current.setLinvel(
      { x: direction.x, y: yVelocity, z: direction.z },
      true
    );

    // Position arms using refs (throttled)
    if (armsRef.current && now - lastUpdateTime.current > 16) {
      const cameraDirection = new Vector3();
      camera.getWorldDirection(cameraDirection);

      const armsPosition = new Vector3()
        .copy(camera.position)
        .add(cameraDirection.multiplyScalar(0.3))
        .add(new Vector3(0, -0.2, 0));

      armsRef.current.position.copy(armsPosition);
      armsRef.current.quaternion.copy(camera.quaternion);
      armsRef.current.updateMatrixWorld(true);
    }
  });

  console.log(
    `BasicFirstPersonPlayer: Rendering RigidBody at position: [${spawnPosition[0]}, ${spawnPosition[1]}, ${spawnPosition[2]}]`
  );

  return (
    <>
      <RigidBody
        gravityScale={2}
        ref={ref}
        colliders={false}
        mass={50}
        type="dynamic"
        position={spawnPosition} // Spawn in center of current room
        enabledRotations={[false, false, false]}
        lockRotations
      >
        <CapsuleCollider args={[0.8, 0.3]} />
      </RigidBody>

      <group ref={armsRef}>
        <SimpleFirstPersonArms ref={armsControlRef} />
      </group>
    </>
  );
}

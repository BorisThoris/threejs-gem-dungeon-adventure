import { useRef, useCallback, useEffect, useState } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { CapsuleCollider } from "@react-three/rapier";
import { SimpleFirstPersonArms } from "./SimpleFirstPersonArms";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";
import { useMouseLook } from "../hooks/useMouseLook";
import { refBasedGameState } from "../utils/refBasedGameState";
import { useSimpleSafeSpawn } from "../hooks/useSimpleSafeSpawn";
import { Text } from "@react-three/drei";
import usePlayerMovementStore from "../store/playerMovementStore";

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void;
}

interface SafeFirstPersonPlayerProps {
  initialSpawnPosition?: [number, number, number];
  showDebugInfo?: boolean;
}

export function SafeFirstPersonPlayer({
  initialSpawnPosition = [0, 0.5, 0],
  showDebugInfo = false,
}: SafeFirstPersonPlayerProps) {
  const ref = useRef<RapierRigidBody>(null);
  const armsRef = useRef<THREE.Group>(null);
  const armsControlRef = useRef<ArmsRef>(null);
  const isMouseDown = useRef(false);
  const keys = usePhysicalKeyboard();
  const { camera } = useThree();
  const { isMovementEnabled, isTransitioning } = usePlayerMovementStore();
  const { findSafeSpawnPosition } = useSimpleSafeSpawn({
    maxAttempts: 100,
    searchRadius: 25,
    searchHeight: 5, // Reduced from 15 to 5
    playerRadius: 0.8,
    playerHeight: 1.6,
    stepSize: 0.5,
  });

  // State for spawn management
  const [spawnPosition, setSpawnPosition] =
    useState<[number, number, number]>(initialSpawnPosition);
  const [isSpawned, setIsSpawned] = useState(false);
  const [spawnInfo, setSpawnInfo] = useState<{
    isSafe: boolean;
    attempts: number;
    position: [number, number, number];
  } | null>(null);

  // Enable mouse look
  useMouseLook();

  // Camera refs to avoid stutters
  const cameraPositionRef = useRef(new Vector3());
  const lastUpdateTime = useRef(0);

  // Find safe spawn position on mount
  useEffect(() => {
    const safeSpawn = findSafeSpawnPosition(initialSpawnPosition);
    setSpawnPosition(safeSpawn.position);
    setSpawnInfo(safeSpawn);
    setIsSpawned(true);

    if (showDebugInfo) {
    }
  }, [initialSpawnPosition, findSafeSpawnPosition, showDebugInfo]);

  // Initialize camera position once spawned
  useEffect(() => {
    if (isSpawned && spawnPosition) {
      camera.position.set(...spawnPosition);
      camera.lookAt(spawnPosition[0], spawnPosition[1], spawnPosition[2] - 1);
    }
  }, [camera, spawnPosition, isSpawned]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    if (event.button === 0 && !isMouseDown.current && armsControlRef.current) {
      isMouseDown.current = true;
      armsControlRef.current.switchAnimation(true);
    }
  }, []);

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

  // No periodic safety checks - safe spawn only works during initial spawn

  // Listen for teleportation events
  useEffect(() => {
    const handleTeleport = (event: CustomEvent) => {
      if (!ref.current) return;

      const { position, rotation } = event.detail;
      const newPosition = new THREE.Vector3(...position);
      const newRotation = new THREE.Euler(...rotation);

      console.log("Teleporting player:", {
        position: newPosition.toArray(),
        rotation: newRotation.toArray(),
      });

      // Teleport the rigid body
      ref.current.setTranslation(newPosition, true);
      ref.current.setRotation(newRotation, true);

      // Stop any existing velocity
      ref.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      ref.current.setAngvel({ x: 0, y: 0, z: 0 }, true);

      // Update camera position and rotation
      camera.position.copy(newPosition);
      camera.position.y += 1.0; // Eye level offset (reduced from 1.6)

      // Set camera rotation order and apply rotation
      camera.rotation.order = "YXZ";
      camera.rotation.x = newRotation.x;
      camera.rotation.y = newRotation.y;
      camera.rotation.z = newRotation.z;

      camera.updateMatrixWorld(true);

      console.log("Camera updated:", {
        position: camera.position.toArray(),
        rotation: camera.rotation.toArray(),
      });
    };

    window.addEventListener("playerTeleport", handleTeleport as EventListener);

    return () => {
      window.removeEventListener(
        "playerTeleport",
        handleTeleport as EventListener
      );
    };
  }, [camera]);

  // Simple movement control
  useFrame(() => {
    if (!isSpawned || !ref.current) return;

    // Update ref-based game state (no React re-renders)
    refBasedGameState.update();

    // Check if movement is enabled (frozen during transitions)
    if (!isMovementEnabled) {
      // Stop any existing movement
      if (ref.current) {
        const velocity = ref.current.linvel();
        ref.current.setLinvel({ x: 0, y: velocity.y, z: 0 }, true);
      }
      return;
    }

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
        .add(cameraDirection.multiplyScalar(0.2))
        .add(new Vector3(0, -0.3, 0));

      armsRef.current.position.copy(armsPosition);
      armsRef.current.quaternion.copy(camera.quaternion);
      armsRef.current.updateMatrixWorld(true);
    }
  });

  if (!isSpawned) {
    return null; // Don't render until we have a safe spawn position
  }

  return (
    <>
      <RigidBody
        gravityScale={2}
        ref={ref}
        colliders={false}
        mass={50}
        type="dynamic"
        position={spawnPosition}
        enabledRotations={[false, false, false]}
        lockRotations
      >
        <CapsuleCollider args={[0.8, 0.3]} />
      </RigidBody>

      <group ref={armsRef}>
        <SimpleFirstPersonArms ref={armsControlRef} />
      </group>

      {/* Debug information - shows initial spawn status only */}
      {showDebugInfo && spawnInfo && (
        <group position={[0, 3, 0]}>
          <Text
            position={[0, 0, 0]}
            fontSize={0.3}
            color={spawnInfo.isSafe ? "#00ff00" : "#ff0000"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            Initial Spawn: {spawnInfo.isSafe ? "SAFE" : "UNSAFE"}
          </Text>
          <Text
            position={[0, -0.4, 0]}
            fontSize={0.2}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            Search Attempts: {spawnInfo.attempts}
          </Text>
          <Text
            position={[0, -0.7, 0]}
            fontSize={0.2}
            color="#cccccc"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            Spawn Pos: {spawnInfo.position.map((p) => p.toFixed(1)).join(", ")}
          </Text>
        </group>
      )}
    </>
  );
}

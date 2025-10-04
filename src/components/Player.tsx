import { useRef, useEffect, useState } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { CapsuleCollider } from "@react-three/rapier";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import * as THREE from "three";
import { useMouseLook } from "../hooks/useMouseLook";
import { refBasedGameState } from "../utils/refBasedGameState";
import { useSimpleSafeSpawn } from "../hooks/useSimpleSafeSpawn";
import { Text } from "@react-three/drei";
import { useConsolidatedGameStore } from "../store/consolidatedGameStore";

interface PlayerProps {
  initialSpawnPosition?: [number, number, number];
  showDebugInfo?: boolean;
}

export function Player({
  initialSpawnPosition = [0, 1.5, 0],
  showDebugInfo = false,
}: PlayerProps) {
  const ref = useRef<RapierRigidBody>(null);
  const keys = usePhysicalKeyboard();
  const { camera } = useThree();
  const { isMovementEnabled, isTransitioning } = useConsolidatedGameStore();
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
    // Use a fixed safe height that should work for most rooms
    // This places the player 1.5 units above the floor (which is typically at Y=-0.5)
    const safeSpawnPosition: [number, number, number] = [
      initialSpawnPosition[0], // Keep X position
      1.5, // Safe height above floor
      initialSpawnPosition[2], // Keep Z position
    ];

    setSpawnPosition(safeSpawnPosition);
    setSpawnInfo({
      position: safeSpawnPosition,
      isSafe: true,
      attempts: 1,
    });
    setIsSpawned(true);

    if (showDebugInfo) {
      console.log("Player: Safe spawning at", safeSpawnPosition);
      console.log(
        "Player: Player capsule will be from Y=",
        1.5 - 0.3,
        "to Y=",
        1.5 + 0.3
      );
    }
  }, [initialSpawnPosition, showDebugInfo]);

  // Initialize camera position once spawned
  useEffect(() => {
    if (isSpawned && spawnPosition) {
      camera.position.set(...spawnPosition);
      camera.lookAt(spawnPosition[0], spawnPosition[1], spawnPosition[2] - 1);
    }
  }, [camera, spawnPosition, isSpawned]);

  // No periodic safety checks - safe spawn only works during initial spawn

  // Listen for teleportation events
  useEffect(() => {
    const handleTeleport = (event: CustomEvent) => {
      if (!ref.current) return;

      const { position, rotation } = event.detail;
      const newPosition = new THREE.Vector3(...position);
      const newRotation = new THREE.Euler(...rotation);
      newRotation.order = "YXZ"; // Set rotation order
      const newQuaternion = new THREE.Quaternion().setFromEuler(newRotation);

      // Teleport the rigid body
      ref.current.setTranslation(newPosition, true);
      ref.current.setRotation(newQuaternion, true);

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

      // Force camera rotation update after a small delay to ensure it's not overridden
      setTimeout(() => {
        camera.rotation.order = "YXZ";
        camera.rotation.x = newRotation.x;
        camera.rotation.y = newRotation.y;
        camera.rotation.z = newRotation.z;
        camera.updateMatrixWorld(true);
      }, 100);
    };

    window.addEventListener("playerTeleport", handleTeleport as EventListener);

    return () => {
      window.removeEventListener(
        "playerTeleport",
        handleTeleport as EventListener
      );
    };
  }, [camera]);

  // Reusable vectors to avoid garbage collection
  const frontVector = useRef(new Vector3());
  const sideVector = useRef(new Vector3());
  const direction = useRef(new Vector3());

  // Movement control using regular useFrame
  useFrame((state, delta) => {
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

    // Calculate movement (slower speeds) - reuse vectors
    const speed = dash ? 8 : 5;
    frontVector.current.set(0, 0, +backward - +forward);
    sideVector.current.set(+left - +right, 0, 0);
    direction.current
      .subVectors(frontVector.current, sideVector.current)
      .normalize()
      .multiplyScalar(speed)
      .applyQuaternion(camera.quaternion);

    // No jumping - keep current Y velocity
    const yVelocity = velocity.y;

    // Apply movement
    ref.current.setLinvel(
      { x: direction.current.x, y: yVelocity, z: direction.current.z },
      true
    );
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
        onCollisionEnter={(event) => {
          if (showDebugInfo) {
            console.log("Player: Collision detected", event);
          }
        }}
      >
        <CapsuleCollider args={[0.8, 0.3]} />
      </RigidBody>

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
          <Text
            position={[0, -1.0, 0]}
            fontSize={0.2}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            Physics Body: {spawnPosition.map((p) => p.toFixed(1)).join(", ")}
          </Text>
        </group>
      )}
    </>
  );
}

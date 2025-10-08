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
import PlayerHand from "./PlayerHand";

interface PlayerProps {
  initialSpawnPosition?: [number, number, number];
  showDebugInfo?: boolean;
  showHand?: boolean;
  handGesture?: "idle" | "pointing" | "grabbing" | "waving";
  editorMode?: boolean;
}

export function Player({
  initialSpawnPosition = [0, 1.5, 0],
  showDebugInfo = false,
  showHand = true,
  handGesture = "idle",
  editorMode = false,
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

  useMouseLook();

  // Camera refs to avoid stutters
  const cameraPositionRef = useRef(new Vector3());
  const lastUpdateTime = useRef(0);

  // Hand position tracking
  const handPositionRef = useRef(new Vector3());
  const handRotationRef = useRef(new Vector3());

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

  // Initialize camera position and rotation once spawned
  // Skip camera updates in editor mode to avoid conflicts with OrbitControls
  useEffect(() => {
    if (isSpawned && spawnPosition && !editorMode) {
      // Set camera position to spawn position with eye level offset
      camera.position.set(
        spawnPosition[0],
        spawnPosition[1] + 1.6,
        spawnPosition[2]
      );

      // Set camera rotation to look forward (reset from editor angle)
      camera.rotation.set(0, 0, 0);
      camera.updateMatrixWorld(true);
    }
  }, [camera, spawnPosition, isSpawned, editorMode]);

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

      // Update camera position only; rotation is owned by camera controller/mouse look
      camera.position.copy(newPosition);
      camera.position.y += 1.0; // Eye level offset (reduced from 1.6)
      camera.updateMatrixWorld(true);
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

    // Update camera position using refs (throttled to prevent stutters); do not write rotation
    // Skip camera updates in editor mode to avoid conflicts with OrbitControls
    if (!editorMode) {
      const now = performance.now();
      if (now - lastUpdateTime.current > 16) {
        // ~60fps max
        cameraPositionRef.current.set(x, y + 1.6, z);
        camera.position.copy(cameraPositionRef.current);
        camera.updateMatrixWorld(true);

        // Update hand position relative to camera
        if (showHand && camera.right && camera.direction) {
          // Position hand slightly in front and to the right of the camera
          handPositionRef.current.set(
            x + camera.right.x * 0.3 + camera.direction.x * 0.5,
            y + 1.2, // Slightly lower than camera
            z + camera.right.z * 0.3 + camera.direction.z * 0.5
          );

          // Match hand rotation to camera rotation
          handRotationRef.current.set(
            camera.rotation.x,
            camera.rotation.y,
            camera.rotation.z
          );
        } else if (showHand) {
          // Fallback position if camera vectors aren't ready yet
          handPositionRef.current.set(
            x + 0.3, // Simple offset to the right
            y + 1.2, // Slightly lower than camera
            z + 0.5 // Simple offset forward
          );

          // Use default rotation
          handRotationRef.current.set(0, 0, 0);
        }

        lastUpdateTime.current = now;
      }
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

      {/* Floating Hand - Mouse Driven */}
      {showHand && isSpawned && (
        <PlayerHand
          position={[0, 0, 0]} // Position is now handled by mouse following
          rotation={[0, 0, 0]} // Rotation is now handled by mouse following
          scale={[0.8, 0.8, 0.8]}
          visible={true}
          gesture={handGesture}
          animationSpeed={1.0}
          followMouse={true}
          followDistance={3}
        />
      )}

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

import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

interface PlayerHandProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
  animationSpeed?: number;
  gesture?: "idle" | "pointing" | "grabbing" | "waving";
  followMouse?: boolean;
  followDistance?: number;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  animationSpeed = 1,
  gesture = "idle",
  followMouse = true,
  followDistance = 3,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const { camera, size } = useThree();

  // Mouse position tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());

  // Mouse tracking effect
  useEffect(() => {
    if (!followMouse) return;

    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / size.width) * 2 - 1;
      const y = -(event.clientY / size.height) * 2 + 1;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [followMouse, size.width, size.height]);

  // Animation based on gesture and mouse position
  useFrame((state) => {
    if (!groupRef.current) return;

    timeRef.current += 0.016 * animationSpeed;

    if (followMouse) {
      // Convert mouse position to 3D world position
      const mouseVector = new THREE.Vector3(
        mousePosition.x,
        mousePosition.y,
        0.5
      );
      mouseVector.unproject(camera);

      // Calculate direction from camera to mouse position
      const direction = mouseVector.sub(camera.position).normalize();

      // Set target position at followDistance from camera
      targetPosition.current
        .copy(camera.position)
        .add(direction.multiplyScalar(followDistance));

      // Smooth interpolation to target position
      currentPosition.current.lerp(targetPosition.current, 0.1);
      groupRef.current.position.copy(currentPosition.current);

      // Make hand look at the camera
      if (groupRef.current) {
        groupRef.current.lookAt(camera.position);
      }

      // Add gesture-based animations on top of mouse following
      const baseFloat = Math.sin(timeRef.current) * 0.05;
      const baseSway = Math.sin(timeRef.current * 0.3) * 0.1;

      switch (gesture) {
        case "idle":
          groupRef.current.position.y += baseFloat;
          groupRef.current.rotation.z += baseSway;
          break;
        case "pointing":
          groupRef.current.rotation.x +=
            Math.sin(timeRef.current * 0.5) * 0.1 + 0.2;
          groupRef.current.rotation.z += baseSway;
          break;
        case "grabbing":
          groupRef.current.rotation.x +=
            Math.sin(timeRef.current * 0.8) * 0.15 + 0.3;
          groupRef.current.scale.setScalar(
            0.9 + Math.sin(timeRef.current * 2) * 0.1
          );
          break;
        case "waving":
          groupRef.current.rotation.z += Math.sin(timeRef.current * 3) * 0.5;
          groupRef.current.rotation.x += Math.sin(timeRef.current * 1.5) * 0.2;
          break;
      }
    } else {
      // Original position-based animation when not following mouse
      const baseFloat = Math.sin(timeRef.current) * 0.02;
      const baseSway = Math.sin(timeRef.current * 0.3) * 0.05;

      switch (gesture) {
        case "idle":
          groupRef.current.position.y = position[1] + baseFloat;
          groupRef.current.rotation.z = baseSway;
          groupRef.current.rotation.x = Math.sin(timeRef.current * 0.2) * 0.05;
          break;
        case "pointing":
          groupRef.current.rotation.x =
            Math.sin(timeRef.current * 0.5) * 0.1 + 0.2;
          groupRef.current.rotation.z = baseSway;
          groupRef.current.position.y = position[1] + baseFloat;
          groupRef.current.position.z =
            position[2] + Math.sin(timeRef.current * 0.3) * 0.05;
          break;
        case "grabbing":
          groupRef.current.rotation.x =
            Math.sin(timeRef.current * 0.8) * 0.15 + 0.3;
          groupRef.current.rotation.z = Math.sin(timeRef.current * 0.4) * 0.1;
          groupRef.current.position.y = position[1] + baseFloat * 0.5;
          groupRef.current.scale.setScalar(
            0.9 + Math.sin(timeRef.current * 2) * 0.1
          );
          break;
        case "waving":
          groupRef.current.rotation.z = Math.sin(timeRef.current * 3) * 0.8;
          groupRef.current.rotation.x = Math.sin(timeRef.current * 1.5) * 0.2;
          groupRef.current.position.y =
            position[1] + Math.sin(timeRef.current * 4) * 0.15;
          groupRef.current.position.x =
            position[0] + Math.sin(timeRef.current * 2) * 0.1;
          break;
      }
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Palm */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 0.2]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Thumb */}
      <mesh
        position={[0.25, 0.1, 0]}
        rotation={[0, 0, Math.PI / 6]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Index finger */}
      <mesh position={[0.05, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Middle finger */}
      <mesh position={[-0.05, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Ring finger */}
      <mesh position={[-0.15, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Pinky finger */}
      <mesh position={[-0.25, 0.2, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>
    </group>
  );
};

export default PlayerHand;

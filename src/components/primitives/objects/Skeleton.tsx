import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";

export interface SkeletonProps {
  position?: [number, number, number];
  color?: string;
  scale?: number;
  isAnimated?: boolean;
  health?: number;
  onDeath?: () => void;
}

const Skeleton: React.FC<SkeletonProps> = ({
  position = [0, 0, 0],
  color = "#F5F5DC",
  scale = 1,
  isAnimated = true,
  health = 50,
  onDeath,
}) => {
  const skeletonRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (isAnimated && skeletonRef.current) {
      // Gentle swaying animation
      const sway = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
      skeletonRef.current.rotation.z = sway;

      // Head bobbing
      if (headRef.current) {
        const bob = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        headRef.current.position.y = bob;
      }
    }
  });

  return (
    <RigidBody
      position={position}
      scale={scale}
      type="dynamic"
      colliders="hull"
    >
      <group ref={skeletonRef}>
        {/* Skeleton head */}
        <group ref={headRef} position={[0, 1.7, 0]}>
          <mesh>
            <sphereGeometry args={[0.2, 8, 6]} />
            <meshLambertMaterial color={color} />
          </mesh>

          {/* Eye sockets */}
          <mesh position={[-0.08, 0.05, 0.15]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshLambertMaterial color="#000000" />
          </mesh>
          <mesh position={[0.08, 0.05, 0.15]}>
            <sphereGeometry args={[0.03, 8, 6]} />
            <meshLambertMaterial color="#000000" />
          </mesh>
        </group>

        {/* Spine */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Ribs */}
        <mesh position={[0, 1.3, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.2]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.2]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Arms */}
        <mesh position={[-0.3, 1.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.3, 1.3, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Hands */}
        <mesh position={[-0.3, 1, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.3, 1, 0]}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Pelvis */}
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.15]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Legs */}
        <mesh position={[-0.1, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.1, 0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 8]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Feet */}
        <mesh position={[-0.1, -0.2, 0.1]}>
          <boxGeometry args={[0.1, 0.1, 0.2]} />
          <meshLambertMaterial color={color} />
        </mesh>
        <mesh position={[0.1, -0.2, 0.1]}>
          <boxGeometry args={[0.1, 0.1, 0.2]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Health indicator */}
        {health < 50 && (
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshLambertMaterial color="#FF0000" />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
};

export default Skeleton;

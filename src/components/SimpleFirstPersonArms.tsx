import React, { useRef, useImperativeHandle, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Vector3 } from "three";
import useGameStore from "../store/gameStore";

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void;
}

interface SimpleArmsProps {
  [key: string]: any;
}

export const SimpleFirstPersonArms = forwardRef<ArmsRef, SimpleArmsProps>(
  (props, ref) => {
    const { gamePhase } = useGameStore();
    const group = useRef<Group>(null);
    const isAnimating = useRef(false);

    const switchAnimation = (toMagic: boolean) => {
      isAnimating.current = toMagic;
    };

    useImperativeHandle(
      ref,
      () => ({
        switchAnimation,
      }),
      []
    );

    // Simple animation for the arms
    useFrame((state) => {
      if (group.current && isAnimating.current && gamePhase === "exploration") {
        // Simple bobbing animation
        group.current.rotation.x = Math.sin(state.clock.elapsedTime * 10) * 0.1;
        group.current.position.y = Math.sin(state.clock.elapsedTime * 8) * 0.05;
      } else if (group.current) {
        // Reset to idle position
        group.current.rotation.x = 0;
        group.current.position.y = 0;
      }
    });

    return (
      <group ref={group} {...props}>
        {/* Simple geometric arms */}
        <group position={[-0.3, -0.5, 0]}>
          {/* Left arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshBasicMaterial color="#8B4513" />
          </mesh>
          {/* Left hand */}
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial color="#FDBCB4" />
          </mesh>
        </group>

        <group position={[0.3, -0.5, 0]}>
          {/* Right arm */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.1, 0.6, 0.1]} />
            <meshBasicMaterial color="#8B4513" />
          </mesh>
          {/* Right hand */}
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshBasicMaterial color="#FDBCB4" />
          </mesh>
        </group>

        {/* Simple magic effect when animating */}
        {isAnimating.current && (
          <mesh position={[0, -0.8, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#00FFFF" transparent opacity={0.7} />
          </mesh>
        )}
      </group>
    );
  }
);

SimpleFirstPersonArms.displayName = "SimpleFirstPersonArms";

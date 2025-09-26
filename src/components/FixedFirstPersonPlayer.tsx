import { useRef, useCallback, useEffect } from "react";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { CapsuleCollider } from "@react-three/rapier";
import { SimpleFirstPersonArms } from "./SimpleFirstPersonArms";
import { useFixedFirstPersonControl } from "../hooks/useFixedFirstPersonControl";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import useGameStore from "../store/gameStore";
import * as THREE from "three";

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void;
}

export function FixedFirstPersonPlayer() {
  const ref = useRef<RapierRigidBody>(null);
  const targetRef = useRef<THREE.Mesh>(null);
  const armsRef = useRef<THREE.Group>(null);
  const armsControlRef = useRef<ArmsRef>(null);
  const isMouseDown = useRef(false);
  const keys = usePhysicalKeyboard();
  const { gamePhase } = useGameStore();

  useFixedFirstPersonControl(ref, targetRef, armsRef, keys);

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

  return (
    <>
      <RigidBody
        gravityScale={2}
        ref={ref}
        colliders={false}
        mass={50}
        type="dynamic"
        position={[0, 5, 0]} // Start higher to avoid ground collision issues
        enabledRotations={[false, false, false]}
        lockRotations
        linearDamping={0.1} // Add some damping for smoother movement
        angularDamping={0.1}
      >
        <CapsuleCollider args={[0.8, 0.3]} />
      </RigidBody>

      <group ref={armsRef}>
        <SimpleFirstPersonArms ref={armsControlRef} />
      </group>

      <mesh ref={targetRef} visible={false}>
        <sphereGeometry args={[0.001, 1]} />
      </mesh>
    </>
  );
}

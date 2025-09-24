import { useRef, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, RapierRigidBody } from "@react-three/rapier";
import { CapsuleCollider } from "@react-three/rapier";
import { FirstPersonArms } from "./FirstPersonArms";
import { useFirstPersonControl } from "../hooks/useFirstPersonControl";
import { usePhysicalKeyboard } from "../hooks/usePhysicalKeyboard";
import useGameStore from "../store/gameStore";

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void;
}

export function FirstPersonPlayer() {
  const ref = useRef<RapierRigidBody>(null);
  const targetRef = useRef<THREE.Mesh>(null);
  const armsRef = useRef<THREE.Group>(null);
  const armsControlRef = useRef<ArmsRef>(null);
  const isMouseDown = useRef(false);
  const keys = usePhysicalKeyboard();
  const { gamePhase } = useGameStore();

  useFirstPersonControl(ref, targetRef, armsRef, keys);

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
        mass={150}
        type="dynamic"
        position={[0, 2, 0]}
        enabledRotations={[false, false, false]}
        lockRotations
      >
        <CapsuleCollider args={[1.4, 0.5]} />
      </RigidBody>

      <group ref={armsRef}>
        <FirstPersonArms ref={armsControlRef} />
      </group>

      <mesh ref={targetRef} visible={false}>
        <sphereGeometry args={[0.001, 1]} />
      </mesh>
    </>
  );
}

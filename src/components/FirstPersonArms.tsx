/* eslint-disable @typescript-eslint/no-explicit-any */
/*
First Person Arms Component
Based on spellcaster-fps-main example
*/

import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { Group } from "three";
import useGameStore from "../store/gameStore";

interface ArmsRef {
  switchAnimation: (toMagic: boolean) => void;
}

interface ArmsProps {
  [key: string]: any;
}

export const FirstPersonArms = forwardRef<ArmsRef, ArmsProps>((props, ref) => {
  const { gamePhase } = useGameStore();
  const group = useRef<Group>(null);

  const gltf = useGLTF(
    "https://roman1510.github.io/files/psx_first_person_arms.glb"
  );
  const { nodes, materials, animations } = gltf;
  const { actions } = useAnimations(animations, group);

  const switchAnimation = useCallback(
    (toMagic: boolean) => {
      const idleAction = actions["arms_armature|Relax_hands_idle_loop"];
      const magicSpellAction = actions["arms_armature|Magic_spell_loop"];

      if (!idleAction || !magicSpellAction) {
        return;
      }

      if (toMagic) {
        idleAction.fadeOut(0.1);
        magicSpellAction.reset().fadeIn(0.1).play();
      } else {
        magicSpellAction.fadeOut(0.1);
        idleAction.reset().fadeIn(0.1).play();
      }
    },
    [actions]
  );

  useEffect(() => {
    const idleAction = actions["arms_armature|Relax_hands_idle_loop"];
    const magicSpellAction = actions["arms_armature|Magic_spell_loop"];

    if (gamePhase === "puzzle" || gamePhase === "boss") {
      if (idleAction?.isRunning()) {
        idleAction.stop();
        idleAction.reset();
      }
      if (magicSpellAction?.isRunning()) {
        magicSpellAction.stop();
        magicSpellAction.reset();
      }
    } else {
      idleAction?.reset().fadeIn(0.1).play();
    }
  }, [gamePhase, actions]);

  useImperativeHandle(
    ref,
    () => ({
      switchAnimation,
    }),
    [switchAnimation]
  );

  return (
    <group ref={group} {...props} dispose={null}>
      <mesh position={[0, 0, -1]}>
        <boxGeometry args={[0.005, 0.005]} />
        <meshBasicMaterial color="white" />
      </mesh>

      <group
        name="Sketchfab_Scene"
        rotation={[0, Math.PI, 0]}
        scale={0.24}
        position={[0, -1.22, 0]}
      >
        <group
          name="Sketchfab_model"
          rotation={[-Math.PI / 2, 0, 0]}
          scale={2.95}
        >
          <group
            name="PSX_First_Person_Armsfbx"
            rotation={[Math.PI / 2, 0, 0]}
            scale={0.01}
          >
            <group name="Object_2">
              <group name="RootNode">
                <group
                  name="arms_armature"
                  rotation={[-Math.PI / 2, 0, 0]}
                  scale={100}
                >
                  <group name="Object_5">
                    <primitive object={nodes._rootJoint} />
                    <skinnedMesh
                      name="Object_58"
                      geometry={(nodes.Object_58 as any).geometry}
                      material={materials.arms as any}
                      skeleton={(nodes.Object_58 as any).skeleton}
                    />
                    <group name="Object_57" />
                  </group>
                </group>
                <group name="arms" />
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
});

FirstPersonArms.displayName = "FirstPersonArms";

useGLTF.preload("https://roman1510.github.io/files/psx_first_person_arms.glb");

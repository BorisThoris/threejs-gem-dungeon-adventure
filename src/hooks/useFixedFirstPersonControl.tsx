import { useFrame, useThree } from "@react-three/fiber";
import { RefObject, useRef, useEffect } from "react";
import { Vector3, Mesh, Group } from "three";
import { RapierRigidBody } from "@react-three/rapier";
import { useMouseLook } from "./useMouseLook";

const direction = new Vector3();
const frontVector = new Vector3();
const sideVector = new Vector3();
const targetOffset = new Vector3();

const BASE_SPEED = 12;
const DASH_SPEED = 20;
const JUMP_VELOCITY = 12;
const EYE_LEVEL_OFFSET = 1.6;

const getMovementState = (keys: { [key: string]: boolean }) => {
  return {
    forward: keys["KeyW"] || keys["ArrowUp"] || false,
    backward: keys["KeyS"] || keys["ArrowDown"] || false,
    left: keys["KeyA"] || keys["ArrowLeft"] || false,
    right: keys["KeyD"] || keys["ArrowRight"] || false,
    dash: keys["ShiftLeft"] || keys["ShiftRight"] || false,
    jump: keys["Space"] || false,
  };
};

export const useFixedFirstPersonControl = (
  ref: RefObject<RapierRigidBody | null>,
  targetRef: RefObject<Mesh | null>,
  armsRef: RefObject<Group | null>,
  keys: { [key: string]: boolean }
) => {
  const { camera } = useThree();
  const hasSetInitialRotation = useRef(false);

  // Enable mouse look
  useMouseLook();

  const isGrounded = () => {
    if (!ref.current) return false;
    const velocity = ref.current.linvel();
    return Math.abs(velocity.y) < 0.2;
  };

  // Set up initial camera position and rotation
  useEffect(() => {
    if (!hasSetInitialRotation.current) {
      camera.position.set(0, EYE_LEVEL_OFFSET, 0);
      camera.rotation.set(0, 0, 0);
      hasSetInitialRotation.current = true;
    }
  }, [camera]);

  useFrame((state) => {
    if (!ref.current) return;

    const { forward, backward, left, right, dash, jump } =
      getMovementState(keys);
    const velocity = ref.current.linvel();
    const { x, y, z } = ref.current.translation();

    // Update camera position to follow player
    camera.position.set(x, y + EYE_LEVEL_OFFSET, z);
    camera.updateMatrixWorld(true);

    // Calculate movement direction based on camera orientation
    frontVector.set(0, 0, +backward - +forward);
    sideVector.set(+left - +right, 0, 0);
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(dash ? DASH_SPEED : BASE_SPEED)
      .applyQuaternion(camera.quaternion);

    const groundedCheck = isGrounded();
    const yVelocity = jump && groundedCheck ? JUMP_VELOCITY : velocity.y;

    // Apply movement with more force
    ref.current.setLinvel(
      { x: direction.x, y: yVelocity, z: direction.z },
      true
    );

    // Position target for interaction
    if (targetRef.current) {
      targetOffset.set(0, 0, -0.5).applyQuaternion(camera.quaternion);
      targetRef.current.position.copy(camera.position).add(targetOffset);
      targetRef.current.updateMatrixWorld(true);
    }

    // Position arms relative to camera
    if (armsRef.current) {
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
};

import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { uiEvents, UI_EVENTS } from "../utils/uiEvents";

export const useMouseLook = () => {
  const { camera } = useThree();
  const isPointerLocked = useRef(false);
  const euler = useRef({ x: 0, y: 0 });
  const sensitivity = 0.001; // Reduced for smoother movement
  const isMouseDown = useRef(false);
  const lastRotationUpdate = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const pendingRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Set FOV to 95 degrees
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = 95;
      camera.updateProjectionMatrix();
    }

    // Set initial camera rotation to look straight ahead
    camera.rotation.order = "YXZ";
    camera.rotation.x = 0; // Look straight ahead (not down)
    camera.rotation.y = -Math.PI / 2; // Face forward
    camera.rotation.z = 0;

    // Initialize euler refs to match camera rotation
    euler.current.x = 0;
    euler.current.y = -Math.PI / 2;

    // Smooth camera update function using requestAnimationFrame
    const updateCameraRotation = () => {
      if (isPointerLocked.current && isMouseDown.current) {
        camera.rotation.order = "YXZ";
        camera.rotation.y = euler.current.y;
        camera.rotation.x = euler.current.x;
        animationFrameRef.current = requestAnimationFrame(updateCameraRotation);
      } else {
        animationFrameRef.current = null;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      // Only handle mouse look when pointer is locked (right mouse button held)
      if (!isPointerLocked.current || !isMouseDown.current) return;

      const deltaX = event.movementX || 0;
      const deltaY = event.movementY || 0;

      // Accumulate rotation changes
      euler.current.y -= deltaX * sensitivity;
      euler.current.x -= deltaY * sensitivity;

      // Clamp vertical rotation
      euler.current.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, euler.current.x)
      );

      // Start smooth camera updates if not already running
      if (!animationFrameRef.current) {
        updateCameraRotation();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement !== null;
    };

    // Right mouse button to enable mouse look
    const handleMouseDown = (event: MouseEvent) => {
      if (event.button === 2) {
        // Right mouse button
        isMouseDown.current = true;
        if (!isPointerLocked.current) {
          document.body.requestPointerLock();
        }
        // Emit UI event instead of React state update
        uiEvents.emit(UI_EVENTS.MOUSE_LOOK_START);
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) {
        // Right mouse button
        isMouseDown.current = false;
        if (isPointerLocked.current) {
          document.exitPointerLock();
        }
        // Stop animation frame
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        // Emit UI event instead of React state update
        uiEvents.emit(UI_EVENTS.MOUSE_LOOK_END);
      }
    };

    // Prevent context menu on right click
    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener(
        "pointerlockchange",
        handlePointerLockChange
      );
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("contextmenu", handleContextMenu);

      // Cleanup animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [camera]);

  return {
    isPointerLocked: isPointerLocked.current,
    isMouseDown: isMouseDown.current,
  };
};

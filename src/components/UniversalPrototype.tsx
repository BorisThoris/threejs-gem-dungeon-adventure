import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useObjectPrototypeActions } from "../utils/SimplePrototypeMixin";
import * as THREE from "three";

interface UniversalPrototypeProps {
  children: React.ReactNode;
  prototypeId: string;
  prototypeType?: string;
  onPrototypeAction?: (action: string, data?: unknown) => void;
  onClick?: () => void;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
}

/**
 * Universal Prototype Wrapper
 *
 * Wraps any 3D component with prototype functionality.
 * Use this instead of creating individual prototype components.
 *
 * @param children - The 3D component to wrap
 * @param prototypeId - Unique ID for the prototype
 * @param prototypeType - Type of object (optional, defaults to "object")
 * @param onPrototypeAction - Callback for prototype actions
 * @param onClick - Click handler
 * @param onPointerOver - Pointer over handler
 * @param onPointerOut - Pointer out handler
 */
const UniversalPrototype: React.FC<UniversalPrototypeProps> = ({
  children,
  prototypeId,
  prototypeType = "object",
  onPrototypeAction,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { prototype, executeAction } = useObjectPrototypeActions(prototypeId);
  const { camera, raycaster } = useThree();

  // Update prototype type if provided
  useEffect(() => {
    if (prototype && prototypeType !== "object") {
      prototype.type = prototypeType;
    }
  }, [prototype, prototypeType]);

  // Update visibility based on prototype state
  useEffect(() => {
    if (groupRef.current && prototype) {
      const shouldBeVisible = prototype.isVisible && !prototype.isBroken;
      groupRef.current.visible = shouldBeVisible;
      console.log(`${prototypeId} visibility updated:`, {
        isVisible: prototype.isVisible,
        isBroken: prototype.isBroken,
        shouldBeVisible,
      });
    }
  }, [prototype?.isVisible, prototype?.isBroken, prototypeId]);

  // Prepare prototype for breaking when mesh is available
  useEffect(() => {
    if (groupRef.current && prototype && prototype.isBreakable) {
      // Find the first mesh in the group
      let mesh: THREE.Mesh | null = null;
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && !mesh) {
          mesh = child;
        }
      });

      if (mesh) {
        // Prepare the prototype for breaking with the actual Three.js mesh
        prototype.prepareForBreaking(mesh);
        console.log(`${prototypeId} prepared for breaking with Three.js mesh`);
      }
    }
  }, [prototype, prototypeId]);

  // Force visibility update when prototype changes
  useEffect(() => {
    if (prototype) {
      // Override the prototype's updateVisuals to also update our wrapper
      const originalUpdateVisuals = prototype.updateVisuals;
      prototype.updateVisuals = () => {
        originalUpdateVisuals.call(prototype);
        // Force visibility update
        if (groupRef.current) {
          groupRef.current.visible = prototype.isVisible && !prototype.isBroken;
          console.log(`Force updated ${prototypeId} visibility:`, {
            isVisible: prototype.isVisible,
            isBroken: prototype.isBroken,
            actualVisible: groupRef.current.visible,
          });
        }
      };
    }
  }, [prototype, prototypeId]);

  // Handle click events
  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`UniversalPrototype: Clicked ${prototypeId}`);

    // Calculate impact point using raycasting
    const impactPoint = calculateImpactPoint(event);
    console.log(`Impact point for ${prototypeId}:`, impactPoint);

    // Create enhanced event with impact point
    const enhancedEvent = {
      ...event,
      impactPoint,
    };

    // Call custom onClick if provided
    if (onClick) {
      onClick(enhancedEvent as any);
    }

    // Call prototype action callback with impact point
    if (onPrototypeAction) {
      onPrototypeAction("click", { prototypeId, impactPoint });
    }
  };

  // Calculate impact point from click event
  const calculateImpactPoint = (
    event: React.MouseEvent
  ): [number, number, number] | undefined => {
    if (!groupRef.current || !camera || !raycaster) {
      return undefined;
    }

    // For React Three Fiber events, we need to get the canvas element
    const canvas = document.querySelector("canvas");
    if (!canvas) {
      console.log("Canvas not found, using object center");
      const center = new THREE.Vector3();
      groupRef.current.getWorldPosition(center);
      return [center.x, center.y, center.z];
    }

    // Get mouse coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    raycaster.setFromCamera(mouse, camera);

    // Get all meshes in this group
    const meshes: THREE.Mesh[] = [];
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshes.push(child);
      }
    });

    // Find intersection with meshes
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      console.log(`Raycast hit at:`, point);
      return [point.x, point.y, point.z];
    }

    // Fallback to object center if no intersection found
    const center = new THREE.Vector3();
    groupRef.current.getWorldPosition(center);
    console.log(`Using object center as impact point:`, center);
    return [center.x, center.y, center.z];
  };

  // Handle pointer over events
  const handlePointerOver = (event: React.PointerEvent) => {
    event.stopPropagation();
    console.log(`UniversalPrototype: Pointer over ${prototypeId}`);

    if (onPointerOver) {
      onPointerOver();
    }

    if (onPrototypeAction) {
      onPrototypeAction("pointerOver", { prototypeId });
    }
  };

  // Handle pointer out events
  const handlePointerOut = (event: React.PointerEvent) => {
    event.stopPropagation();
    console.log(`UniversalPrototype: Pointer out ${prototypeId}`);

    if (onPointerOut) {
      onPointerOut();
    }

    if (onPrototypeAction) {
      onPrototypeAction("pointerOut", { prototypeId });
    }
  };

  // Note: executeAction and prototype are available through the useObjectPrototypeActions hook

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
    </group>
  );
};

export default UniversalPrototype;

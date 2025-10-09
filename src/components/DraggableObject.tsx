import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
  useEffect,
} from "react";
import * as THREE from "three";
import {
  RigidBody,
  CuboidCollider,
  type RigidBodyTypeString,
} from "@react-three/rapier";

export interface DraggableObjectRef {
  getObject: () => THREE.Object3D | null;
  setPosition: (position: THREE.Vector3) => void;
  getPosition: () => THREE.Vector3;
  setEnabled: (enabled: boolean) => void;
  isEnabled: () => boolean;
  releaseWithPhysics: (position: THREE.Vector3) => void;
}

export interface DraggableObjectProps {
  children: React.ReactNode;
  onGrab?: () => void;
  onRelease?: () => void;
  onMove?: (newPosition: [number, number, number]) => void;
  enabled?: boolean;
  position?: [number, number, number];
  type?: RigidBodyTypeString;
  colliders?: boolean;
  colliderArgs?: [number, number, number];
  userData?: any;
}

const DraggableObject = forwardRef<DraggableObjectRef, DraggableObjectProps>(
  (
    {
      children,
      onGrab,
      onRelease,
      onMove,
      enabled = true,
      position = [0, 0, 0],
      type = "dynamic",
      colliders = false,
      colliderArgs = [0.1, 0.3, 0.1],
      userData = {},
    },
    ref
  ) => {
    const groupRef = useRef<THREE.Group>(null);
    const rigidBodyRef = useRef<any>(null);
    const isGrabbedRef = useRef(false);
    const [currentPosition, setCurrentPosition] = useState<
      [number, number, number]
    >([
      isNaN(position[0]) ? 0 : position[0],
      isNaN(position[1]) ? 0 : position[1],
      isNaN(position[2]) ? 0 : position[2],
    ]);

    // Update position when prop changes
    useEffect(() => {
      const validPosition: [number, number, number] = [
        isNaN(position[0]) ? 0 : position[0],
        isNaN(position[1]) ? 0 : position[1],
        isNaN(position[2]) ? 0 : position[2],
      ];
      setCurrentPosition(validPosition);
      console.log("🎯 DraggableObject: Position updated to:", validPosition);
    }, [position]);

    // Debug when component mounts
    useEffect(() => {
      console.log("🎯 DraggableObject: Component mounted");
      console.log("🎯 DraggableObject: Initial position:", position);
      console.log("🎯 DraggableObject: Enabled:", enabled);
      console.log("🎯 DraggableObject: Type:", type);
      console.log("🎯 DraggableObject: Colliders:", colliders);
    }, [position, enabled, type, colliders]);

    useImperativeHandle(ref, () => ({
      getObject: () => groupRef.current,
      setPosition: (worldPosition: THREE.Vector3) => {
        if (groupRef.current) {
          // Convert world position to local position relative to current parent
          const localPosition = new THREE.Vector3();
          groupRef.current.parent?.worldToLocal(
            localPosition.copy(worldPosition)
          );

          // Set group position to local coordinates
          groupRef.current.position.copy(localPosition);

          // Sync physics body with world position (physics uses world coordinates)
          if (rigidBodyRef?.current) {
            rigidBodyRef.current.setTranslation(worldPosition, true);
          }
        }
      },
      getPosition: () => {
        return groupRef.current
          ? groupRef.current.position.clone()
          : new THREE.Vector3();
      },
      setEnabled: (enabled: boolean) => {
        if (rigidBodyRef?.current) {
          rigidBodyRef.current.setEnabled(enabled);
          console.log("🎯 DraggableObject: Physics body enabled:", enabled);
        }
      },
      isEnabled: () => {
        return rigidBodyRef?.current ? rigidBodyRef.current.isEnabled() : true;
      },
      // New method to release object with physics
      releaseWithPhysics: (worldPosition: THREE.Vector3) => {
        if (groupRef.current) {
          // Convert world position to local position relative to current parent
          const localPosition = new THREE.Vector3();
          groupRef.current.parent?.worldToLocal(
            localPosition.copy(worldPosition)
          );

          // Set group position to local coordinates
          groupRef.current.position.copy(localPosition);

          // Sync physics body with world position and enable physics
          if (rigidBodyRef?.current) {
            rigidBodyRef.current.setTranslation(worldPosition, true);
            rigidBodyRef.current.setEnabled(true);
          }

          // Notify parent of new position
          if (onMove) {
            onMove([localPosition.x, localPosition.y, localPosition.z]);
          }
        }
      },
    }));

    // Create a ref object that we can pass to userData
    const draggableRefObject = {
      current: {
        getObject: () => groupRef.current,
        setPosition: (worldPosition: THREE.Vector3) => {
          if (groupRef.current) {
            // Convert world position to local position relative to current parent
            const localPosition = new THREE.Vector3();
            groupRef.current.parent?.worldToLocal(
              localPosition.copy(worldPosition)
            );

            // Set group position to local coordinates
            groupRef.current.position.copy(localPosition);

            // Sync physics body with world position (physics uses world coordinates)
            if (rigidBodyRef?.current) {
              rigidBodyRef.current.setTranslation(worldPosition, true);
            }
          }
        },
        getPosition: () => {
          return groupRef.current
            ? groupRef.current.position.clone()
            : new THREE.Vector3();
        },
        setEnabled: (enabled: boolean) => {
          if (rigidBodyRef?.current) {
            rigidBodyRef.current.setEnabled(enabled);
            console.log("🎯 DraggableObject: Physics body enabled:", enabled);
          }
        },
        isEnabled: () => {
          return rigidBodyRef?.current
            ? rigidBodyRef.current.isEnabled()
            : true;
        },
        releaseWithPhysics: (worldPosition: THREE.Vector3) => {
          if (groupRef.current) {
            // Convert world position to local position relative to current parent
            const localPosition = new THREE.Vector3();
            groupRef.current.parent?.worldToLocal(
              localPosition.copy(worldPosition)
            );

            // Set group position to local coordinates
            groupRef.current.position.copy(localPosition);

            // Sync physics body with world position and enable physics
            if (rigidBodyRef?.current) {
              rigidBodyRef.current.setTranslation(worldPosition, true);
              rigidBodyRef.current.setEnabled(true);
            }

            // Notify parent of new position
            if (onMove) {
              onMove([localPosition.x, localPosition.y, localPosition.z]);
            }
          }
        },
      },
    };

    const handleGrab = () => {
      console.log("🎯 DraggableObject: handleGrab called");
      console.log("🎯 DraggableObject: enabled:", enabled);
      console.log("🎯 DraggableObject: groupRef.current:", groupRef.current);
      console.log(
        "🎯 DraggableObject: rigidBodyRef.current:",
        rigidBodyRef.current
      );

      if (!enabled) {
        console.log("🎯 DraggableObject: Grab blocked - not enabled");
        return;
      }
      isGrabbedRef.current = true;

      // Disable physics for smooth manipulation
      if (rigidBodyRef?.current) {
        console.log("🎯 DraggableObject: Disabling physics body");
        rigidBodyRef.current.setEnabled(false);
      }

      console.log("🎯 DraggableObject: Calling onGrab callback");
      onGrab?.();
    };

    const handleRelease = () => {
      if (!enabled) {
        return;
      }
      isGrabbedRef.current = false;
      onRelease?.();
    };

    return (
      <RigidBody
        ref={rigidBodyRef}
        position={currentPosition}
        type={type}
        colliders={colliders ? "cuboid" : false}
        userData={userData}
      >
        {colliders && <CuboidCollider args={colliderArgs} />}
        <group
          ref={groupRef}
          userData={{
            draggable: true,
            draggableRef: draggableRefObject,
            onGrab: handleGrab,
            onRelease: handleRelease,
            physicsBodyRef: rigidBodyRef,
          }}
        >
          {children}
        </group>
      </RigidBody>
    );
  }
);

DraggableObject.displayName = "DraggableObject";

export default DraggableObject;

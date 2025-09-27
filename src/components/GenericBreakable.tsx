import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ObjectPrototype } from "../utils/ObjectPrototype";
import { dynamicBreaker } from "../utils/DynamicBreaker";
import { PrototypeRegistry } from "../utils/ObjectPrototype";

interface GenericBreakableProps {
  children: React.ReactNode;
  id?: string;
  type?: string;
  onFragmentCreated?: (fragments: THREE.Mesh[]) => void;
  fractureImpulse?: number;
}

/**
 * Generic Breakable Wrapper
 *
 * Wraps any Three.js mesh and makes it breakable using ConvexObjectBreaker.
 * No need to pre-register prototypes - they're created on-demand.
 */
const GenericBreakable: React.FC<GenericBreakableProps> = ({
  children,
  id,
  type = "breakable-object",
  onFragmentCreated,
  fractureImpulse = 50,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const prototypeRef = useRef<ObjectPrototype | null>(null);
  const [fragments, setFragments] = useState<THREE.Mesh[]>([]);
  const [isBroken, setIsBroken] = useState(false);

  // Physics simulation for fragments
  useFrame((state, delta) => {
    fragments.forEach((fragment) => {
      // Simple physics simulation
      fragment.position.y -= 0.02; // Gravity
      fragment.rotation.x += 0.01;
      fragment.rotation.y += 0.01;
      fragment.rotation.z += 0.01;

      // Remove fragments that fall too far
      if (fragment.position.y < -10) {
        setFragments((prev) => prev.filter((f) => f !== fragment));
      }
    });
  });

  // Create prototype when mesh is available
  useEffect(() => {
    if (groupRef.current) {
      // Find the first mesh in the group
      let mesh: THREE.Mesh | null = null;
      groupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && !mesh) {
          mesh = child;
        }
      });

      if (mesh) {
        const meshId =
          id ||
          `breakable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create a generic prototype for this mesh
        const prototype = new ObjectPrototype(
          meshId,
          type,
          [mesh.position.x, mesh.position.y, mesh.position.z],
          `#${Math.floor(Math.random() * 16777215).toString(16)}`
        );

        // Make it breakable
        prototype.makeBreakable();
        prototype.fractureImpulse = fractureImpulse;

        // Prepare for breaking with the actual mesh
        prototype.prepareForBreaking(mesh);

        // Register the prototype
        PrototypeRegistry.register(prototype);
        prototypeRef.current = prototype;

        console.log(`Created generic breakable prototype: ${meshId}`);
      }
    }
  }, [id, type, fractureImpulse]);

  // Handle breaking
  const handleBreak = (mesh: THREE.Mesh, impactPoint: THREE.Vector3) => {
    if (!prototypeRef.current || isBroken) return;

    console.log(`Breaking ${prototypeRef.current.id} at:`, impactPoint);

    // Calculate impact normal (from object center to impact point)
    const impactNormal = new THREE.Vector3()
      .subVectors(impactPoint, mesh.position)
      .normalize();

    // Break the prototype using ConvexObjectBreaker
    const newFragments = dynamicBreaker.breakPrototype(
      prototypeRef.current,
      [impactPoint.x, impactPoint.y, impactPoint.z],
      [impactNormal.x, impactNormal.y, impactNormal.z],
      4
    );

    if (newFragments.length > 0) {
      console.log(
        `Created ${newFragments.length} fragments from ${prototypeRef.current.id}`
      );

      // Convert fragments to Three.js meshes for rendering
      const fragmentMeshes = newFragments.map((fragment) => {
        const fragmentMesh = new THREE.Mesh(
          fragment.geometry,
          fragment.material
        );
        fragmentMesh.position.set(...fragment.position);
        fragmentMesh.rotation.set(...fragment.rotation);
        fragmentMesh.scale.set(...fragment.scale);
        fragmentMesh.userData = {
          fragmentId: fragment.id,
          prototype: fragment.prototype,
        };
        return fragmentMesh;
      });

      // Store fragments for rendering
      setFragments(fragmentMeshes);
      setIsBroken(true);

      // Hide the original object
      if (groupRef.current) {
        groupRef.current.visible = false;
      }

      // Notify parent component
      onFragmentCreated?.(fragmentMeshes);
    }
  };

  // Clone children and add click handlers
  const childrenWithHandlers = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        onClick: (event: any) => {
          event.stopPropagation();
          handleBreak(event.object as THREE.Mesh, event.point);
        },
        onPointerOver: () => {
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          document.body.style.cursor = "default";
        },
      });
    }
    return child;
  });

  return (
    <group>
      {/* Original object */}
      <group ref={groupRef}>{childrenWithHandlers}</group>

      {/* Render fragments when broken */}
      {fragments.map((fragment, index) => (
        <primitive
          key={`fragment_${index}`}
          object={fragment}
          onClick={(event: any) => {
            event.stopPropagation();
            console.log(`Fragment ${fragment.userData.fragmentId} clicked!`);
            // Fragments can be broken further
            if (fragment.userData.prototype) {
              handleBreak(fragment, event.point);
            }
          }}
        />
      ))}
    </group>
  );
};

export default GenericBreakable;

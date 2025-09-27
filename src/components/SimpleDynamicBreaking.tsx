import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ObjectPrototype } from "../utils/ObjectPrototype";
import { dynamicBreaker } from "../utils/DynamicBreaker";
import { PrototypeRegistry } from "../utils/ObjectPrototype";

interface SimpleDynamicBreakingProps {
  onFragmentCreated?: (fragments: THREE.Mesh[]) => void;
}

const SimpleDynamicBreaking: React.FC<SimpleDynamicBreakingProps> = ({
  onFragmentCreated,
}) => {
  const [fragments, setFragments] = useState<THREE.Mesh[]>([]);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  // Create a generic prototype for any mesh
  const createGenericPrototype = (
    mesh: THREE.Mesh,
    id: string,
    type: string = "object"
  ) => {
    const prototype = new ObjectPrototype(
      id,
      type,
      [mesh.position.x, mesh.position.y, mesh.position.z],
      `#${Math.floor(Math.random() * 16777215).toString(16)}`
    );

    // Make it breakable
    prototype.makeBreakable();
    prototype.fractureImpulse = 50; // Easy to break

    // Prepare for breaking with the actual mesh
    prototype.prepareForBreaking(mesh);

    // Register the prototype
    PrototypeRegistry.register(prototype);

    return prototype;
  };

  // Handle breaking any mesh
  const handleBreak = (mesh: THREE.Mesh, impactPoint: THREE.Vector3) => {
    const meshId = mesh.userData.id || `mesh_${Date.now()}`;

    // Create or get prototype for this mesh
    let prototype = PrototypeRegistry.get(meshId);
    if (!prototype) {
      prototype = createGenericPrototype(mesh, meshId, "breakable-object");
    }

    console.log(`Breaking ${prototype.id} at:`, impactPoint);

    // Calculate impact normal (from object center to impact point)
    const impactNormal = new THREE.Vector3()
      .subVectors(impactPoint, mesh.position)
      .normalize();

    // Break the prototype using ConvexObjectBreaker
    const newFragments = dynamicBreaker.breakPrototype(
      prototype,
      [impactPoint.x, impactPoint.y, impactPoint.z],
      [impactNormal.x, impactNormal.y, impactNormal.z],
      4
    );

    if (newFragments.length > 0) {
      console.log(
        `Created ${newFragments.length} fragments from ${prototype.id}`
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

      setFragments((prev) => [...prev, ...fragmentMeshes]);
      onFragmentCreated?.(fragmentMeshes);
    }
  };

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

  return (
    <group>
      {/* Render some breakable objects */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={`box_${i}`}
          ref={(ref) => {
            if (ref) {
              ref.userData.id = `box_${i}`;
              meshRefs.current.set(`box_${i}`, ref);
            }
          }}
          position={[i * 2 - 4, 2, 0]}
          onClick={(event) => {
            event.stopPropagation();
            handleBreak(event.object as THREE.Mesh, event.point);
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
          />
        </mesh>
      ))}

      {/* Render some breakable spheres */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh
          key={`sphere_${i}`}
          ref={(ref) => {
            if (ref) {
              ref.userData.id = `sphere_${i}`;
              meshRefs.current.set(`sphere_${i}`, ref);
            }
          }}
          position={[i * 2 - 2, 4, 2]}
          onClick={(event) => {
            event.stopPropagation();
            handleBreak(event.object as THREE.Mesh, event.point);
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial
            color={`#${Math.floor(Math.random() * 16777215).toString(16)}`}
          />
        </mesh>
      ))}

      {/* Render fragments */}
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

      {/* Instructions */}
      <mesh position={[0, 6, 0]}>
        <planeGeometry args={[10, 2]} />
        <meshBasicMaterial color="black" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

export default SimpleDynamicBreaking;

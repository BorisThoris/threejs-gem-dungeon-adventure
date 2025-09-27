import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ObjectPrototype } from "../utils/ObjectPrototype";
import { dynamicBreaker } from "../utils/DynamicBreaker";
import { PrototypeRegistry } from "../utils/ObjectPrototype";

interface ConvexBreakingDemoProps {
  onFragmentCreated?: (fragments: THREE.Mesh[]) => void;
}

const ConvexBreakingDemo: React.FC<ConvexBreakingDemoProps> = ({
  onFragmentCreated,
}) => {
  const [prototypes, setPrototypes] = useState<ObjectPrototype[]>([]);
  const [fragments, setFragments] = useState<THREE.Mesh[]>([]);
  const meshRefs = useRef<Map<string, THREE.Mesh>>(new Map());

  // Create some breakable objects
  useEffect(() => {
    const newPrototypes: ObjectPrototype[] = [];

    // Create a few breakable boxes
    for (let i = 0; i < 3; i++) {
      const prototype = new ObjectPrototype(
        `breakable_box_${i}`,
        "box",
        [i * 3 - 3, 2, 0],
        `#${Math.floor(Math.random() * 16777215).toString(16)}`
      );

      // Make it breakable
      prototype.makeBreakable();
      prototype.fractureImpulse = 100; // Lower threshold for easier breaking

      newPrototypes.push(prototype);
      PrototypeRegistry.register(prototype);
    }

    setPrototypes(newPrototypes);
  }, []);

  // Handle object breaking
  const handleBreak = (
    prototype: ObjectPrototype,
    impactPoint: [number, number, number]
  ) => {
    console.log(`Breaking ${prototype.id} at:`, impactPoint);

    // Calculate impact normal (from object center to impact point)
    const impactNormal: [number, number, number] = [
      impactPoint[0] - prototype.position[0],
      impactPoint[1] - prototype.position[1],
      impactPoint[2] - prototype.position[2],
    ];

    // Normalize the impact normal
    const length = Math.sqrt(
      impactNormal[0] ** 2 + impactNormal[1] ** 2 + impactNormal[2] ** 2
    );
    if (length > 0) {
      impactNormal[0] /= length;
      impactNormal[1] /= length;
      impactNormal[2] /= length;
    }

    // Break the prototype using ConvexObjectBreaker
    const newFragments = dynamicBreaker.breakPrototype(
      prototype,
      impactPoint,
      impactNormal,
      4
    );

    if (newFragments.length > 0) {
      console.log(
        `Created ${newFragments.length} fragments from ${prototype.id}`
      );

      // Convert fragments to Three.js meshes for rendering
      const fragmentMeshes = newFragments.map((fragment) => {
        const mesh = new THREE.Mesh(fragment.geometry, fragment.material);
        mesh.position.set(...fragment.position);
        mesh.rotation.set(...fragment.rotation);
        mesh.scale.set(...fragment.scale);
        mesh.userData = {
          fragmentId: fragment.id,
          prototype: fragment.prototype,
        };
        return mesh;
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
      {/* Render prototypes */}
      {prototypes.map((prototype) => (
        <mesh
          key={prototype.id}
          ref={(ref) => {
            if (ref) {
              meshRefs.current.set(prototype.id, ref);
              // Set up the prototype for breaking
              prototype.prepareForBreaking(ref);
            }
          }}
          position={prototype.position}
          onClick={(event) => {
            event.stopPropagation();
            const impactPoint: [number, number, number] = [
              event.point.x,
              event.point.y,
              event.point.z,
            ];
            handleBreak(prototype, impactPoint);
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "default";
          }}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={prototype.color} />
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
              const impactPoint: [number, number, number] = [
                event.point.x,
                event.point.y,
                event.point.z,
              ];
              handleBreak(fragment.userData.prototype, impactPoint);
            }
          }}
        />
      ))}

      {/* Instructions */}
      <mesh position={[0, 5, 0]}>
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial color="black" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

export default ConvexBreakingDemo;

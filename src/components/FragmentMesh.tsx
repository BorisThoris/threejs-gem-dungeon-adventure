import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import * as DynamicBreaker from "../utils/DynamicBreaker";
type FragmentObject = DynamicBreaker.FragmentObject;
import { useObjectPrototypeActions } from "../utils/SimplePrototypeMixin";

interface FragmentMeshProps {
  fragment: FragmentObject;
  onFragmentExpired?: (fragmentId: string) => void;
  onFragmentClick?: (fragmentId: string) => void;
}

const FragmentMesh: React.FC<FragmentMeshProps> = ({
  fragment,
  onFragmentExpired,
  onFragmentClick,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { executeAction } = useObjectPrototypeActions(fragment.id);

  // Physics simulation
  const velocity = useRef(new THREE.Vector3(...fragment.velocity));
  const angularVelocity = useRef(
    new THREE.Vector3(...fragment.angularVelocity)
  );
  const position = useRef(new THREE.Vector3(...fragment.position));
  const rotation = useRef(new THREE.Euler(...fragment.rotation));

  // Lifetime management
  const lifetime = useRef(8000 + Math.random() * 4000); // 8-12 seconds
  const startTime = useRef(Date.now());

  // Initialize fragment prototype
  useEffect(() => {
    // Make the fragment breakable
    executeAction("makeBreakable", { threshold: 50 });
  }, [executeAction]);

  // Physics simulation loop
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Update position with velocity
    velocity.current.y -= 0.02; // Gravity
    position.current.add(velocity.current.clone().multiplyScalar(delta));

    // Update rotation
    rotation.current.x += angularVelocity.current.x * delta;
    rotation.current.y += angularVelocity.current.y * delta;
    rotation.current.z += angularVelocity.current.z * delta;

    // Apply physics to mesh
    meshRef.current.position.copy(position.current);
    meshRef.current.rotation.copy(rotation.current);

    // Check lifetime
    const elapsed = Date.now() - startTime.current;
    if (elapsed > lifetime.current) {
      onFragmentExpired?.(fragment.id);
    }
  });

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    console.log(`Fragment ${fragment.id} clicked!`);

    // Break the fragment further
    executeAction("breakWithPhysics", {
      force: 2.0,
      direction: [0, 1, 0],
      impactPoint: fragment.position,
    });

    onFragmentClick?.(fragment.id);
  };

  return (
    <mesh
      ref={meshRef}
      geometry={fragment.geometry}
      material={fragment.material}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
      castShadow
      receiveShadow
    />
  );
};

export default FragmentMesh;

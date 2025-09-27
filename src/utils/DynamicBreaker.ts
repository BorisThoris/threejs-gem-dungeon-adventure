import * as THREE from "three";
import { ObjectPrototype } from "./ObjectPrototype";
import { ConvexObjectBreaker } from "three/examples/jsm/misc/ConvexObjectBreaker.js";

// Fragment object that can be created from breaking
export interface FragmentObject {
  id: string;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  velocity: [number, number, number];
  angularVelocity: [number, number, number];
  mass: number;
  prototype?: ObjectPrototype;
}

// Dynamic breaker that creates real 3D fragments
export class DynamicBreaker {
  private fragmentCounter = 0;
  private convexBreaker = new ConvexObjectBreaker();

  // Break a prototype object into fragments using ConvexObjectBreaker
  breakPrototype(
    prototype: ObjectPrototype,
    impactPoint: [number, number, number],
    impactNormal: [number, number, number],
    fragmentCount: number = 4
  ): FragmentObject[] {
    if (!prototype.threeMesh || !prototype.originalGeometry || !prototype.originalMaterial) {
      console.warn(`Prototype ${prototype.id} not prepared for breaking`);
      return [];
    }

    try {
      // Use ConvexObjectBreaker to create real fragments
      const debris = this.convexBreaker.subdivideByImpact(
        prototype.threeMesh,
        new THREE.Vector3(...impactPoint),
        new THREE.Vector3(...impactNormal),
        1, // minSizeForFracture
        2, // maxSizeForFracture
        1.5 // fractureImpulse
      );

      console.log(`ConvexObjectBreaker created ${debris.length} fragments for prototype ${prototype.id}`);

      // Convert debris to FragmentObjects
      const fragments: FragmentObject[] = [];
      debris.forEach((debrisMesh, index) => {
        const fragment: FragmentObject = {
          id: `fragment_${prototype.id}_${this.fragmentCounter++}`,
          geometry: debrisMesh.geometry,
          material: debrisMesh.material,
          position: [
            debrisMesh.position.x,
            debrisMesh.position.y,
            debrisMesh.position.z
          ],
          rotation: [
            debrisMesh.rotation.x,
            debrisMesh.rotation.y,
            debrisMesh.rotation.z
          ],
          scale: [
            debrisMesh.scale.x,
            debrisMesh.scale.y,
            debrisMesh.scale.z
          ],
          velocity: [
            (Math.random() - 0.5) * 10,
            Math.random() * 5 + 2,
            (Math.random() - 0.5) * 10
          ],
          angularVelocity: [
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ],
          mass: prototype.mass / debris.length, // Distribute mass among fragments
          prototype: this.createFragmentPrototype(prototype, debrisMesh, index)
        };
        fragments.push(fragment);
      });

      return fragments;
    } catch (error) {
      console.error(`Error breaking prototype ${prototype.id}:`, error);
      return [];
    }
  }

  // Break an object into multiple fragments (like Three.js ConvexObjectBreaker)
  breakObject(
    object: THREE.Mesh,
    impactPoint: [number, number, number],
    impactNormal: [number, number, number],
    fragmentCount: number = 4
  ): FragmentObject[] {
    const fragments: FragmentObject[] = [];
    
    // Get object properties
    const position = object.position.clone();
    const scale = object.scale.clone();
    const rotation = object.rotation.clone();
    
    // Create fragments based on the original geometry
    for (let i = 0; i < fragmentCount; i++) {
      const fragment = this.createFragment(
        object.geometry,
        object.material,
        position,
        scale,
        rotation,
        impactPoint,
        impactNormal,
        i
      );
      fragments.push(fragment);
    }
    
    console.log(`Created ${fragmentCount} fragments from ${object.name || 'object'}`);
    return fragments;
  }

  // Create a single fragment
  private createFragment(
    originalGeometry: THREE.BufferGeometry,
    originalMaterial: THREE.Material,
    originalPosition: THREE.Vector3,
    originalScale: THREE.Vector3,
    originalRotation: THREE.Euler,
    impactPoint: [number, number, number],
    impactNormal: [number, number, number],
    index: number
  ): FragmentObject {
    // Create a simplified geometry for the fragment
    const fragmentGeometry = this.createFragmentGeometry(originalGeometry, index);
    
    // Clone the material
    const fragmentMaterial = originalMaterial.clone();
    
    // Calculate fragment position relative to impact point
    const angle = (index / 4) * Math.PI * 2;
    const radius = 0.5 + Math.random() * 1.0;
    const height = (Math.random() - 0.5) * 2;
    
    const fragmentPosition: [number, number, number] = [
      impactPoint[0] + Math.cos(angle) * radius,
      impactPoint[1] + height,
      impactPoint[2] + Math.sin(angle) * radius
    ];
    
    // Calculate velocity based on impact direction
    const impactDir = new THREE.Vector3(impactNormal[0], impactNormal[1], impactNormal[2]);
    const radialDir = new THREE.Vector3(
      fragmentPosition[0] - impactPoint[0],
      fragmentPosition[1] - impactPoint[1],
      fragmentPosition[2] - impactPoint[2]
    ).normalize();
    
    const velocity: [number, number, number] = [
      radialDir.x * 5 + impactDir.x * 2 + (Math.random() - 0.5) * 3,
      radialDir.y * 5 + impactDir.y * 2 + Math.random() * 3 + 2,
      radialDir.z * 5 + impactDir.z * 2 + (Math.random() - 0.5) * 3
    ];
    
    const angularVelocity: [number, number, number] = [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    ];
    
    const fragment: FragmentObject = {
      id: `fragment_${this.fragmentCounter++}`,
      geometry: fragmentGeometry,
      material: fragmentMaterial,
      position: fragmentPosition,
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      velocity,
      angularVelocity,
      mass: 10 + Math.random() * 20, // Random mass between 10-30
    };
    
    return fragment;
  }

  // Create simplified geometry for fragments
  private createFragmentGeometry(originalGeometry: THREE.BufferGeometry, index: number): THREE.BufferGeometry {
    // For now, create simple box geometries as fragments
    // In a full implementation, this would subdivide the original geometry
    const size = 0.3 + Math.random() * 0.4;
    const geometry = new THREE.BoxGeometry(size, size * 0.8, size * 0.6);
    
    // Add some randomness to make fragments look different
    const vertices = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < vertices.length; i += 3) {
      vertices[i] += (Math.random() - 0.5) * 0.1;
      vertices[i + 1] += (Math.random() - 0.5) * 0.1;
      vertices[i + 2] += (Math.random() - 0.5) * 0.1;
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    
    return geometry;
  }

  // Create a fragment prototype from a debris mesh
  private createFragmentPrototype(originalPrototype: ObjectPrototype, debrisMesh: THREE.Mesh, index: number): ObjectPrototype {
    const fragmentPrototype = new ObjectPrototype(
      `fragment_${originalPrototype.id}_${index}`,
      "fragment",
      [debrisMesh.position.x, debrisMesh.position.y, debrisMesh.position.z],
      originalPrototype.color
    );
    
    // Set fragment properties
    fragmentPrototype.scale = 1;
    fragmentPrototype.mass = originalPrototype.mass / 4; // Distribute mass
    fragmentPrototype.fractureImpulse = 25; // Fragments are easier to break
    fragmentPrototype.isBreakable = true;
    fragmentPrototype.isInteractive = true;
    
    // Store fragment data
    fragmentPrototype.properties.fragment = true;
    fragmentPrototype.properties.originalId = originalPrototype.id;
    fragmentPrototype.properties.originalType = originalPrototype.type;
    
    // Set up Three.js mesh for further breaking
    fragmentPrototype.prepareForBreaking(debrisMesh);
    
    return fragmentPrototype;
  }

  // Convert fragment to a prototype object
  createFragmentPrototype(fragment: FragmentObject): ObjectPrototype {
    const prototype = new ObjectPrototype(
      fragment.id,
      "fragment",
      fragment.position,
      "#888888" // Default fragment color
    );
    
    // Set fragment properties
    prototype.scale = 1;
    prototype.mass = fragment.mass;
    prototype.fractureImpulse = 50; // Fragments are easier to break
    prototype.isBreakable = true;
    prototype.isInteractive = true;
    
    // Store fragment data
    prototype.properties.fragment = fragment;
    prototype.properties.velocity = fragment.velocity;
    prototype.properties.angularVelocity = fragment.angularVelocity;
    
    return prototype;
  }
}

// Global breaker instance
export const dynamicBreaker = new DynamicBreaker();

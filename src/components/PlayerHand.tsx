import React, {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useRapier } from "@react-three/rapier";

interface PlayerHandProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  visible?: boolean;
  animationSpeed?: number;
  gesture?: "idle" | "pointing" | "grabbing" | "waving";
  followMouse?: boolean;
  followDistance?: number;
  playerPosition?: [number, number, number];
  editorMode?: boolean;
}

const PlayerHand: React.FC<PlayerHandProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  visible = true,
  animationSpeed = 1,
  gesture = "idle",
  followMouse = true,
  followDistance = 3,
  playerPosition = [0, 0, 0],
  editorMode = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const { camera, size, scene } = useThree();

  // Mouse position tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isCursorOnScreen, setIsCursorOnScreen] = useState(true);
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());

  // Black & White style hand system state
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [grabbedObject, setGrabbedObject] = useState<THREE.Object3D | null>(
    null
  );
  const [hoveredObject, setHoveredObject] = useState<THREE.Object3D | null>(
    null
  );
  const [handGesture, setHandGesture] = useState<
    "idle" | "hovering" | "grabbing" | "releasing"
  >("idle");
  const lastHandPosition = useRef(new THREE.Vector3());
  const grabStartTime = useRef(0);
  const handVelocity = useRef(new THREE.Vector3());
  const isHandMoving = useRef(false);
  const movementFrameCount = useRef(0);
  const { world } = useRapier();

  // Black & White style grab system
  const handleGrab = useCallback(() => {
    console.log("🖐️ PlayerHand: Grab attempt started");
    console.log("🖐️ PlayerHand: isGrabbing:", isGrabbing);
    console.log("🖐️ PlayerHand: groupRef.current:", groupRef.current);

    if (isGrabbing || !groupRef.current) {
      console.log(
        "🖐️ PlayerHand: Grab blocked - already grabbing or no group ref"
      );
      return;
    }

    // Create a raycaster from camera through mouse position
    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2(mousePosition.x, mousePosition.y);
    raycaster.setFromCamera(mouseVector, camera);

    console.log("🖐️ PlayerHand: Mouse position:", mousePosition);
    console.log("🖐️ PlayerHand: Mouse vector:", mouseVector);

    // Find objects that intersect with the ray
    if (!scene) {
      console.log("🖐️ PlayerHand: No scene found");
      return;
    }

    console.log("🖐️ PlayerHand: Scene found:", scene);

    const intersectableObjects: THREE.Object3D[] = [];
    scene.traverse((child) => {
      // Look for draggable objects
      if (
        child.userData?.draggable === true &&
        child !== groupRef.current &&
        child !== groupRef.current?.parent
      ) {
        console.log("🖐️ PlayerHand: Found draggable object:", child);
        intersectableObjects.push(child);
      }
    });

    console.log(
      "🖐️ PlayerHand: Total draggable objects found:",
      intersectableObjects.length
    );

    const intersects = raycaster.intersectObjects(intersectableObjects);
    console.log("🖐️ PlayerHand: Ray intersections:", intersects.length);

    if (intersects.length > 0) {
      const grabbedObj = intersects[0].object;
      console.log("🖐️ PlayerHand: Grabbing object:", grabbedObj);
      console.log(
        "🖐️ PlayerHand: Grabbed object userData:",
        grabbedObj.userData
      );

      // Find the draggable ref by traversing up the hierarchy
      let draggableRef = grabbedObj.userData?.draggableRef;
      let draggableParent = grabbedObj;

      console.log("🖐️ PlayerHand: Initial draggable ref:", draggableRef);

      // If the grabbed object doesn't have a draggable ref, look up the hierarchy
      if (!draggableRef) {
        console.log(
          "🖐️ PlayerHand: No draggable ref on object, traversing hierarchy"
        );
        let currentParent = grabbedObj.parent;
        while (currentParent && !draggableRef) {
          console.log("🖐️ PlayerHand: Checking parent:", currentParent);
          console.log(
            "🖐️ PlayerHand: Parent userData:",
            currentParent.userData
          );
          if (currentParent.userData?.draggableRef) {
            draggableRef = currentParent.userData.draggableRef;
            draggableParent = currentParent;
            console.log(
              "🖐️ PlayerHand: Found draggable ref in parent:",
              draggableRef
            );
            break;
          }
          currentParent = currentParent.parent;
        }
      }

      console.log("🖐️ PlayerHand: Final draggable ref:", draggableRef);
      console.log("🖐️ PlayerHand: Final draggable parent:", draggableParent);

      if (draggableRef?.current) {
        console.log("🖐️ PlayerHand: Draggable ref found, proceeding with grab");

        // Black & White style grab: smooth and responsive
        grabStartTime.current = Date.now();

        // Call the object's grab handler
        console.log("🖐️ PlayerHand: Calling onGrab handler");
        draggableParent.userData?.onGrab?.();

        // Disable physics for smooth manipulation
        const physicsBodyRef = draggableParent.userData?.physicsBodyRef;
        console.log("🖐️ PlayerHand: Physics body ref:", physicsBodyRef);
        if (physicsBodyRef?.current) {
          console.log("🖐️ PlayerHand: Disabling physics body");
          physicsBodyRef.current.setEnabled(false);
        }

        // Store initial positions for smooth following
        const originalPosition = draggableParent.position.clone();
        const originalWorldPosition = new THREE.Vector3();
        draggableParent.getWorldPosition(originalWorldPosition);

        // Store restoration data
        draggableParent.userData.originalPosition = originalPosition;
        draggableParent.userData.originalWorldPosition = originalWorldPosition;

        // Store initial hand position for smooth following
        const currentHandPosition = new THREE.Vector3();
        groupRef.current.getWorldPosition(currentHandPosition);
        lastHandPosition.current.copy(currentHandPosition);

        console.log("🖐️ PlayerHand: Setting grabbed object and states");
        setGrabbedObject(draggableParent);
        setHandGesture("grabbing");
        setIsGrabbing(true);

        console.log("🖐️ PlayerHand: Grab successful!");
      } else {
        console.log("🖐️ PlayerHand: No draggable ref found on object");
      }
    } else {
      console.log("🖐️ PlayerHand: No objects intersected with ray");
    }
  }, [isGrabbing, mousePosition, camera, scene]);

  const handleRelease = useCallback(() => {
    if (!isGrabbing || !grabbedObject) {
      return;
    }

    // Calculate velocity based on hand movement
    groupRef.current?.updateMatrixWorld(true);
    const currentHandPosition = new THREE.Vector3();
    groupRef.current?.getWorldPosition(currentHandPosition);

    // Use the velocity already calculated in useFrame
    const releaseVelocity = handVelocity.current.clone();

    // Only apply momentum if hand is actually moving
    if (!isHandMoving.current) {
      // Hand is stationary - release without momentum
      releaseVelocity.set(0, 0, 0);
      console.log("🖐️ Hand stationary, releasing without momentum");
    } else {
      // Apply very subtle momentum multiplier (Black & White style)
      const momentumMultiplier = 0.1; // Much more subtle, barely noticeable momentum
      releaseVelocity.multiplyScalar(momentumMultiplier);

      // Only apply momentum if hand was moving fast enough
      const minVelocityThreshold = 0.02; // Scaled down threshold (was 2.0)
      const velocityMagnitude = releaseVelocity.length();

      if (velocityMagnitude < minVelocityThreshold) {
        // If moving too slowly, just release without momentum
        releaseVelocity.set(0, 0, 0);
        console.log("🖐️ Hand moving too slowly, releasing without momentum");
      }
    }

    // Scale velocity based on object weight (heavier objects get less velocity)
    const objectWeight = grabbedObject.userData?.weight || 1;
    const velocityScale = Math.max(0.1, 1 / objectWeight); // Heavier = less velocity
    releaseVelocity.multiplyScalar(velocityScale);

    console.log("🖐️ Hand moving:", isHandMoving.current ? "YES" : "NO");
    console.log(
      "🖐️ Hand velocity:",
      handVelocity.current.length().toFixed(3),
      "units/sec"
    );
    console.log(
      "🖐️ Object weight:",
      objectWeight,
      "Velocity scale:",
      velocityScale.toFixed(2)
    );
    console.log(
      "🖐️ Final release velocity:",
      releaseVelocity.length().toFixed(3),
      "units/sec"
    );

    const draggableRef = grabbedObject.userData?.draggableRef;
    if (draggableRef?.current) {
      // Release with calculated velocity for momentum
      draggableRef.current.releaseWithVelocity(
        currentHandPosition,
        releaseVelocity
      );
      console.log("🖐️ Object released with velocity:", releaseVelocity);
    }

    // Call the object's release handler
    grabbedObject.userData?.onRelease?.();

    // Clean up stored data
    if (grabbedObject.userData?.originalPosition) {
      delete grabbedObject.userData.originalPosition;
      delete grabbedObject.userData.originalWorldPosition;
    }

    // Reset hand state
    setGrabbedObject(null);
    setHandGesture("idle");
    setIsGrabbing(false);
  }, [isGrabbing, grabbedObject]);

  // Mouse tracking effect
  useEffect(() => {
    if (!followMouse) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Get the canvas element to calculate relative coordinates
      const canvas = document.querySelector("canvas");
      if (!canvas) return;

      const canvasRect = canvas.getBoundingClientRect();

      // Calculate mouse position relative to the canvas
      const canvasX = event.clientX - canvasRect.left;
      const canvasY = event.clientY - canvasRect.top;

      // Convert to normalized device coordinates (-1 to 1)
      const x = (canvasX / canvasRect.width) * 2 - 1;
      const y = -(canvasY / canvasRect.height) * 2 + 1;

      setMousePosition({ x, y });

      // Check if cursor is on the canvas
      const isOnScreen =
        canvasX >= 0 &&
        canvasX <= canvasRect.width &&
        canvasY >= 0 &&
        canvasY <= canvasRect.height;
      setIsCursorOnScreen(isOnScreen);
    };

    const handleMouseEnter = () => setIsCursorOnScreen(true);
    const handleMouseLeave = () => setIsCursorOnScreen(false);

    // Mouse click handlers for grabbing
    const handleMouseDown = (event: MouseEvent) => {
      console.log("🖐️ PlayerHand: Mouse down event", event.button, event);
      if (event.button === 0) {
        // Left click
        console.log("🖐️ PlayerHand: Left click detected, calling handleGrab");
        handleGrab();
      }
    };

    const handleMouseUp = (event: MouseEvent) => {
      console.log("🖐️ PlayerHand: Mouse up event", event.button, event);
      if (event.button === 0) {
        // Left click release
        console.log(
          "🖐️ PlayerHand: Left click release detected, calling handleRelease"
        );
        handleRelease();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [followMouse, size.width, size.height, handleGrab, handleRelease]);

  // Animation based on gesture and mouse position
  useFrame((state) => {
    if (!groupRef.current) return;

    timeRef.current += 0.016 * animationSpeed;

    if (followMouse) {
      // Create a raycaster from camera through mouse position
      const raycaster = new THREE.Raycaster();
      const mouseVector = new THREE.Vector2(mousePosition.x, mousePosition.y);

      // Set up raycaster from camera through mouse position
      raycaster.setFromCamera(mouseVector, camera);

      // Calculate the point where the ray intersects a plane at followDistance from camera
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);

      // Create a plane perpendicular to camera direction at followDistance
      const plane = new THREE.Plane();
      plane.setFromNormalAndCoplanarPoint(
        cameraDirection,
        camera.position
          .clone()
          .add(cameraDirection.multiplyScalar(followDistance))
      );

      // Find intersection point
      const intersectionPoint = new THREE.Vector3();
      const hasIntersection = raycaster.ray.intersectPlane(
        plane,
        intersectionPoint
      );

      // If no intersection, fallback to the old method
      if (!hasIntersection) {
        const fallbackVector = new THREE.Vector3(
          mousePosition.x,
          mousePosition.y,
          0.5
        );
        fallbackVector.unproject(camera);
        const direction = fallbackVector.sub(camera.position).normalize();
        targetPosition.current
          .copy(camera.position)
          .add(direction.multiplyScalar(followDistance));
      } else {
        targetPosition.current.copy(intersectionPoint);
      }

      // In editor mode, the hand should follow the mouse directly without player offset
      // The mouse positioning already works correctly in world space

      // Smooth interpolation to target position with dynamic speed based on distance
      const distance = currentPosition.current.distanceTo(
        targetPosition.current
      );
      const lerpSpeed = Math.min(0.2, Math.max(0.05, distance * 0.1));
      currentPosition.current.lerp(targetPosition.current, lerpSpeed);
      groupRef.current.position.copy(currentPosition.current);

      // Track hand velocity for momentum when releasing objects
      const currentHandPosition = new THREE.Vector3();
      groupRef.current.getWorldPosition(currentHandPosition);
      const deltaTime = state.clock.getDelta();

      if (deltaTime > 0) {
        // Calculate velocity as distance moved per second (scaled down for realistic units)
        const distanceMoved = currentHandPosition.distanceTo(
          lastHandPosition.current
        );
        const velocityMagnitude = (distanceMoved / deltaTime) * 0.01; // Scale down by 100x

        // Determine if hand is actually moving (require sustained movement)
        const movementThreshold = 0.003; // Scaled down threshold (was 0.3)
        const isCurrentlyMoving = velocityMagnitude > movementThreshold;

        if (isCurrentlyMoving) {
          movementFrameCount.current++;
          // Require at least 2 frames of movement to consider "moving"
          isHandMoving.current = movementFrameCount.current >= 2;
        } else {
          movementFrameCount.current = 0;
          isHandMoving.current = false;
        }

        if (isHandMoving.current) {
          // Calculate direction of movement
          const direction = new THREE.Vector3();
          direction
            .subVectors(currentHandPosition, lastHandPosition.current)
            .normalize();

          // Set velocity with proper magnitude and direction
          handVelocity.current
            .copy(direction)
            .multiplyScalar(velocityMagnitude);

          // Debug velocity tracking (subtle, like Black & White)
          if (velocityMagnitude > 0.005) {
            // Scaled down threshold
            // Only log when moving significantly
            console.log(
              "🖐️ Hand moving:",
              velocityMagnitude.toFixed(3),
              "units/sec"
            );
          }
        } else {
          // Hand is stationary - clear velocity immediately
          handVelocity.current.set(0, 0, 0);
        }

        // Update last position for next frame
        lastHandPosition.current.copy(currentHandPosition);
      }

      // Make hand look at the camera
      if (groupRef.current) {
        groupRef.current.lookAt(camera.position);
      }

      // Black & White style object interaction
      if (isGrabbing && grabbedObject) {
        // Ensure matrix world is updated before getting world position
        groupRef.current.updateMatrixWorld(true);

        // Get the actual world position of the hand using Three.js best practices
        const currentHandPosition = new THREE.Vector3();
        groupRef.current.getWorldPosition(currentHandPosition);

        // Move object to hand position
        const draggableRef = grabbedObject.userData?.draggableRef;
        if (draggableRef?.current) {
          draggableRef.current.setPosition(currentHandPosition);
        }
      } else if (!isGrabbing) {
        // Hover detection: check for objects near the hand
        const raycaster = new THREE.Raycaster();
        const mouseVector = new THREE.Vector2(mousePosition.x, mousePosition.y);
        raycaster.setFromCamera(mouseVector, camera);

        const intersectableObjects: THREE.Object3D[] = [];
        scene.traverse((child) => {
          if (
            child.userData?.draggable === true &&
            child !== groupRef.current &&
            child !== groupRef.current?.parent
          ) {
            intersectableObjects.push(child);
          }
        });

        const intersects = raycaster.intersectObjects(intersectableObjects);

        if (intersects.length > 0) {
          if (!hoveredObject || hoveredObject !== intersects[0].object) {
            setHoveredObject(intersects[0].object);
            setHandGesture("hovering");
          }
        } else {
          if (hoveredObject) {
            setHoveredObject(null);
            setHandGesture("idle");
          }
        }
      }

      // Add gesture-based animations on top of mouse following
      const baseFloat = Math.sin(timeRef.current) * 0.05;
      const baseSway = Math.sin(timeRef.current * 0.3) * 0.1;

      // Black & White style hand gestures
      const currentGesture =
        handGesture === "grabbing"
          ? "grabbing"
          : handGesture === "hovering"
          ? "pointing"
          : gesture;

      switch (currentGesture) {
        case "idle":
          groupRef.current.position.y += baseFloat;
          groupRef.current.rotation.z += baseSway;
          break;
        case "pointing":
          groupRef.current.rotation.x +=
            Math.sin(timeRef.current * 0.5) * 0.1 + 0.2;
          groupRef.current.rotation.z += baseSway;
          break;
        case "grabbing":
          groupRef.current.rotation.x +=
            Math.sin(timeRef.current * 0.8) * 0.15 + 0.3;
          groupRef.current.scale.setScalar(
            0.9 + Math.sin(timeRef.current * 2) * 0.1
          );
          break;
        case "waving":
          groupRef.current.rotation.z += Math.sin(timeRef.current * 3) * 0.5;
          groupRef.current.rotation.x += Math.sin(timeRef.current * 1.5) * 0.2;
          break;
      }
    } else {
      // Original position-based animation when not following mouse
      const baseFloat = Math.sin(timeRef.current) * 0.02;
      const baseSway = Math.sin(timeRef.current * 0.3) * 0.05;

      switch (gesture) {
        case "idle":
          groupRef.current.position.y = position[1] + baseFloat;
          groupRef.current.rotation.z = baseSway;
          groupRef.current.rotation.x = Math.sin(timeRef.current * 0.2) * 0.05;
          break;
        case "pointing":
          groupRef.current.rotation.x =
            Math.sin(timeRef.current * 0.5) * 0.1 + 0.2;
          groupRef.current.rotation.z = baseSway;
          groupRef.current.position.y = position[1] + baseFloat;
          groupRef.current.position.z =
            position[2] + Math.sin(timeRef.current * 0.3) * 0.05;
          break;
        case "grabbing":
          groupRef.current.rotation.x =
            Math.sin(timeRef.current * 0.8) * 0.15 + 0.3;
          groupRef.current.rotation.z = Math.sin(timeRef.current * 0.4) * 0.1;
          groupRef.current.position.y = position[1] + baseFloat * 0.5;
          groupRef.current.scale.setScalar(
            0.9 + Math.sin(timeRef.current * 2) * 0.1
          );
          break;
        case "waving":
          groupRef.current.rotation.z = Math.sin(timeRef.current * 3) * 0.8;
          groupRef.current.rotation.x = Math.sin(timeRef.current * 1.5) * 0.2;
          groupRef.current.position.y =
            position[1] + Math.sin(timeRef.current * 4) * 0.15;
          groupRef.current.position.x =
            position[0] + Math.sin(timeRef.current * 2) * 0.1;
          break;
      }
    }
  });

  if (!visible || (followMouse && !isCursorOnScreen)) return null;

  return (
    <group ref={groupRef} position={position} rotation={rotation} scale={scale}>
      {/* Palm */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.4, 0.2]} />
        <meshLambertMaterial
          color={
            handGesture === "grabbing"
              ? 0xff6b6b
              : handGesture === "hovering"
              ? 0xffd93d
              : 0xffdbac
          }
        />
      </mesh>

      {/* Thumb */}
      <mesh
        position={[0.25, 0.1, 0]}
        rotation={[0, 0, Math.PI / 6]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[0.08, 0.3, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Index finger */}
      <mesh position={[0.05, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Middle finger */}
      <mesh position={[-0.05, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Ring finger */}
      <mesh position={[-0.15, 0.25, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.06, 0.4, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>

      {/* Pinky finger */}
      <mesh position={[-0.25, 0.2, 0]} castShadow receiveShadow>
        <capsuleGeometry args={[0.05, 0.3, 4, 8]} />
        <meshLambertMaterial color={0xffdbac} />
      </mesh>
    </group>
  );
};

export default PlayerHand;

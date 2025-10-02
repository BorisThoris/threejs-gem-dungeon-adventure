import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { Text } from "@react-three/drei";

export interface TexturedDoorProps {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  direction: "north" | "south" | "east" | "west";
  isLocked?: boolean;
  keyRequired?: string;
  onDoorClick: (doorId: string, targetRoomId: string) => void;
  onDoorHover?: (doorId: string, isHovered: boolean) => void;
  playerPosition?: [number, number, number];
  interactionDistance?: number;
  showLabel?: boolean;
  labelText?: string;
  doorStyle?: "wooden" | "metal" | "stone" | "medieval" | "modern";
}

const TexturedDoor: React.FC<TexturedDoorProps> = React.memo(
  ({
    id,
    position,
    rotation,
    targetRoomId,
    direction,
    isLocked = false,
    keyRequired,
    onDoorClick,
    onDoorHover,
    playerPosition = [0, 0, 0],
    interactionDistance = 3,
    showLabel = true,
    labelText,
    doorStyle = "wooden",
  }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const doorRef = useRef<THREE.Group>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isNearby, setIsNearby] = useState(false);
    const [canInteract, setCanInteract] = useState(false);
    const [textures, setTextures] = useState<{
      door?: THREE.Texture;
      frame?: THREE.Texture;
      handle?: THREE.Texture;
    }>({});

    // Create procedural textures
    useEffect(() => {
      const createProceduralTexture = (
        width: number,
        height: number,
        type: string
      ) => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;

        switch (type) {
          case "wooden":
            // Wood grain texture
            ctx.fillStyle = "#8B4513";
            ctx.fillRect(0, 0, width, height);

            // Add wood grain lines
            for (let i = 0; i < 20; i++) {
              ctx.strokeStyle = `rgba(139, 69, 19, ${
                0.3 + Math.random() * 0.4
              })`;
              ctx.lineWidth = 1 + Math.random() * 2;
              ctx.beginPath();
              ctx.moveTo(0, (i * height) / 20 + Math.random() * 10);
              ctx.lineTo(width, (i * height) / 20 + Math.random() * 10);
              ctx.stroke();
            }
            break;

          case "metal":
            // Metal texture
            ctx.fillStyle = "#C0C0C0";
            ctx.fillRect(0, 0, width, height);

            // Add metal scratches
            for (let i = 0; i < 50; i++) {
              ctx.strokeStyle = `rgba(192, 192, 192, ${
                0.1 + Math.random() * 0.3
              })`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(Math.random() * width, Math.random() * height);
              ctx.lineTo(Math.random() * width, Math.random() * height);
              ctx.stroke();
            }
            break;

          case "stone":
            // Stone texture
            ctx.fillStyle = "#696969";
            ctx.fillRect(0, 0, width, height);

            // Add stone patterns
            for (let i = 0; i < 100; i++) {
              ctx.fillStyle = `rgba(105, 105, 105, ${
                0.1 + Math.random() * 0.4
              })`;
              ctx.fillRect(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 20,
                Math.random() * 20
              );
            }
            break;

          case "medieval":
            // Medieval door texture
            ctx.fillStyle = "#654321";
            ctx.fillRect(0, 0, width, height);

            // Add medieval patterns
            ctx.strokeStyle = "#8B4513";
            ctx.lineWidth = 3;
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              ctx.moveTo(0, (i * height) / 5);
              ctx.lineTo(width, (i * height) / 5);
              ctx.stroke();
            }
            for (let i = 0; i < 3; i++) {
              ctx.beginPath();
              ctx.moveTo((i * width) / 3, 0);
              ctx.lineTo((i * width) / 3, height);
              ctx.stroke();
            }
            break;

          case "modern":
            // Modern door texture
            ctx.fillStyle = "#2F4F4F";
            ctx.fillRect(0, 0, width, height);

            // Add modern geometric patterns
            ctx.strokeStyle = "#708090";
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
              ctx.beginPath();
              ctx.rect((i * width) / 8, 0, width / 8, height);
              ctx.stroke();
            }
            break;
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1, 1);
        return texture;
      };

      const doorTexture = createProceduralTexture(512, 1024, doorStyle);
      const frameTexture = createProceduralTexture(256, 256, doorStyle);
      const handleTexture = createProceduralTexture(64, 64, "metal");

      setTextures({
        door: doorTexture,
        frame: frameTexture,
        handle: handleTexture,
      });
    }, [doorStyle]);

    // Calculate door appearance based on state
    const doorAppearance = useMemo(() => {
      const baseColor = (() => {
        switch (doorStyle) {
          case "wooden":
            return "#8B4513";
          case "metal":
            return "#C0C0C0";
          case "stone":
            return "#696969";
          case "medieval":
            return "#654321";
          case "modern":
            return "#2F4F4F";
          default:
            return "#8B4513";
        }
      })();

      if (isLocked) {
        return {
          color: new THREE.Color(baseColor).multiplyScalar(0.7).getHexString(),
          opacity: 0.7,
          emissive: new THREE.Color(baseColor)
            .multiplyScalar(0.3)
            .getHexString(),
        };
      }

      if (isHovered) {
        return {
          color: new THREE.Color(baseColor).multiplyScalar(1.1).getHexString(),
          opacity: 0.9,
          emissive: new THREE.Color(baseColor)
            .multiplyScalar(0.2)
            .getHexString(),
        };
      }

      if (isNearby) {
        return {
          color: new THREE.Color(baseColor).multiplyScalar(1.05).getHexString(),
          opacity: 0.95,
          emissive: new THREE.Color(baseColor)
            .multiplyScalar(0.1)
            .getHexString(),
        };
      }

      return {
        color: baseColor,
        opacity: 1.0,
        emissive: new THREE.Color(baseColor)
          .multiplyScalar(0.05)
          .getHexString(),
      };
    }, [doorStyle, isLocked, isHovered, isNearby]);

    // Calculate door label
    const doorLabel = useMemo(() => {
      if (!showLabel) return "";

      if (labelText) return labelText;

      if (isLocked) return `🔒 Locked (${keyRequired})`;

      const directionNames = {
        north: "North",
        south: "South",
        east: "East",
        west: "West",
      };

      return `🚪 ${directionNames[direction]} Door`;
    }, [showLabel, labelText, isLocked, keyRequired, direction]);

    // Check if player is nearby
    const checkPlayerProximity = useCallback(() => {
      const doorPosition = new THREE.Vector3(...position);
      const playerPos = new THREE.Vector3(...playerPosition);
      const distance = doorPosition.distanceTo(playerPos);

      const nearby = distance <= interactionDistance;
      const canInteractNow = nearby && !isLocked;

      if (nearby !== isNearby) {
        setIsNearby(nearby);
      }

      if (canInteractNow !== canInteract) {
        setCanInteract(canInteractNow);
      }
    }, [
      position,
      playerPosition,
      interactionDistance,
      isLocked,
      isNearby,
      canInteract,
    ]);

    // Handle door click
    const handleClick = useCallback(
      (event: any) => {
        event.stopPropagation();

        if (isLocked) {
          console.log(`🔒 Door ${id} is locked, requires key: ${keyRequired}`);
          return;
        }

        console.log(`🚪 TexturedDoor clicked: ${id} -> ${targetRoomId}`);
        onDoorClick(id, targetRoomId);
      },
      [id, targetRoomId, isLocked, keyRequired, onDoorClick]
    );

    // Handle door hover
    const handlePointerOver = useCallback(
      (event: any) => {
        event.stopPropagation();
        setIsHovered(true);
        onDoorHover?.(id, true);

        if (canInteract) {
          document.body.style.cursor = "pointer";
        }
      },
      [id, canInteract, onDoorHover]
    );

    const handlePointerOut = useCallback(
      (event: any) => {
        event.stopPropagation();
        setIsHovered(false);
        onDoorHover?.(id, false);
        document.body.style.cursor = "default";
      },
      [id, onDoorHover]
    );

    // Update proximity check
    useFrame(() => {
      checkPlayerProximity();
    });

    // Keyboard interaction
    React.useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "E" && canInteract && isNearby) {
          handleClick(event);
        }
      };

      document.addEventListener("keydown", handleKeyPress);
      return () => document.removeEventListener("keydown", handleKeyPress);
    }, [canInteract, isNearby, handleClick]);

    return (
      <group position={position} rotation={rotation} ref={doorRef}>
        {/* Door Frame */}
        <group>
          {/* Left frame */}
          <mesh position={[-1.1, 0, 0]} castShadow>
            <boxGeometry args={[0.2, 3.2, 0.3]} />
            <meshLambertMaterial
              color="#4A4A4A"
              map={textures.frame}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Right frame */}
          <mesh position={[1.1, 0, 0]} castShadow>
            <boxGeometry args={[0.2, 3.2, 0.3]} />
            <meshLambertMaterial
              color="#4A4A4A"
              map={textures.frame}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Top frame */}
          <mesh position={[0, 1.6, 0]} castShadow>
            <boxGeometry args={[2.4, 0.2, 0.3]} />
            <meshLambertMaterial
              color="#4A4A4A"
              map={textures.frame}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Bottom frame */}
          <mesh position={[0, -1.6, 0]} castShadow>
            <boxGeometry args={[2.4, 0.2, 0.3]} />
            <meshLambertMaterial
              color="#4A4A4A"
              map={textures.frame}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* Main Door Panel */}
        <mesh ref={meshRef} position={[0, 0, 0.05]} castShadow>
          <boxGeometry args={[2, 3, 0.1]} />
          <meshLambertMaterial
            color={doorAppearance.color}
            map={textures.door}
            transparent
            opacity={doorAppearance.opacity}
            emissive={doorAppearance.emissive}
            roughness={0.7}
            metalness={0.0}
          />
        </mesh>

        {/* Door Panels (for wooden/medieval styles) */}
        {(doorStyle === "wooden" || doorStyle === "medieval") && (
          <group>
            {/* Top panel */}
            <mesh position={[0, 0.75, 0.06]} castShadow>
              <boxGeometry args={[1.8, 0.8, 0.02]} />
              <meshLambertMaterial
                color="#654321"
                roughness={0.8}
                metalness={0.0}
              />
            </mesh>

            {/* Middle panel */}
            <mesh position={[0, 0, 0.06]} castShadow>
              <boxGeometry args={[1.8, 0.8, 0.02]} />
              <meshLambertMaterial
                color="#654321"
                roughness={0.8}
                metalness={0.0}
              />
            </mesh>

            {/* Bottom panel */}
            <mesh position={[0, -0.75, 0.06]} castShadow>
              <boxGeometry args={[1.8, 0.8, 0.02]} />
              <meshLambertMaterial
                color="#654321"
                roughness={0.8}
                metalness={0.0}
              />
            </mesh>
          </group>
        )}

        {/* Door Handle */}
        <group position={[0.7, 0, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
            <meshLambertMaterial
              color={isLocked ? "#8B4513" : "#FFD700"}
              map={textures.handle}
              roughness={0.3}
              metalness={0.7}
            />
          </mesh>

          {/* Handle base */}
          <mesh position={[0, 0, -0.1]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 0.1, 8]} />
            <meshLambertMaterial
              color={isLocked ? "#654321" : "#B8860B"}
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
        </group>

        {/* Lock indicator */}
        {isLocked && (
          <group position={[-0.7, 0, 0.15]}>
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.3, 0.05]} />
              <meshLambertMaterial
                color="#8B4513"
                roughness={0.6}
                metalness={0.3}
              />
            </mesh>

            {/* Lock keyhole */}
            <mesh position={[0, 0, 0.03]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
              <meshLambertMaterial
                color="#000000"
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </group>
        )}

        {/* Door Hinges */}
        <group>
          {/* Top hinge */}
          <mesh position={[-0.8, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshLambertMaterial
              color="#C0C0C0"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>

          {/* Middle hinge */}
          <mesh position={[-0.8, 0, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshLambertMaterial
              color="#C0C0C0"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>

          {/* Bottom hinge */}
          <mesh position={[-0.8, -1.2, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
            <meshLambertMaterial
              color="#C0C0C0"
              roughness={0.3}
              metalness={0.8}
            />
          </mesh>
        </group>

        {/* Interaction area (invisible) */}
        <RigidBody type="fixed" colliders="cuboid">
          <mesh
            position={[0, 0, 0]}
            onPointerDown={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[2.5, 3.5, 0.5]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </RigidBody>

        {/* Door label */}
        {showLabel && doorLabel && (
          <group position={[0, 2, 0]}>
            <Text
              position={[0, 0, 0.5]}
              fontSize={0.3}
              color={isLocked ? "#FF6B6B" : canInteract ? "#00FF00" : "#FFFFFF"}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
              maxWidth={4}
            >
              {doorLabel}
            </Text>
          </group>
        )}

        {/* Proximity indicator */}
        {isNearby && !isLocked && (
          <group position={[0, -1.5, 0]}>
            <mesh>
              <ringGeometry args={[1, 1.2, 16]} />
              <meshBasicMaterial
                color="#00FF00"
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )}

        {/* Interaction prompt */}
        {canInteract && (
          <group position={[0, -2, 0]}>
            <Text
              position={[0, 0, 0.5]}
              fontSize={0.25}
              color="#00FF00"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              Press E to enter
            </Text>
          </group>
        )}

        {/* Door threshold */}
        <mesh position={[0, -1.6, 0.1]} castShadow>
          <boxGeometry args={[2.6, 0.1, 0.2]} />
          <meshLambertMaterial
            color="#8B4513"
            roughness={0.9}
            metalness={0.0}
          />
        </mesh>
      </group>
    );
  }
);

TexturedDoor.displayName = "TexturedDoor";

export default TexturedDoor;

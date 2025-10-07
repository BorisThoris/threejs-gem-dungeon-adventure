import React, { useState, useRef, useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

export interface EnhancedPressurePlateProps {
  position?: [number, number, number];
  color?: string;
  scale?: number;
  isPressed?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
  onItemGrabbed?: () => void;
  onPlateFullyRaised?: () => void; // New callback for when plate reaches 100%
  label?: string;
  weight?: number;
  hasAward?: boolean;
  awardType?: "bag" | "coin" | "gem" | "scroll";
  canGrabAward?: boolean;
  showAward?: boolean;
}

const EnhancedPressurePlate: React.FC<EnhancedPressurePlateProps> = ({
  position = [0, 0, 0],
  color = "#8B4513",
  scale = 1,
  isPressed = false,
  onPress,
  onRelease,
  onItemGrabbed,
  onPlateFullyRaised,
  label = "Pressure Plate",
  weight = 1,
  hasAward = false,
  awardType = "bag",
  canGrabAward = true,
  showAward = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isGrabbing, setIsGrabbing] = useState(false);
  const [plateHeight, setPlateHeight] = useState(0); // 0 = fully down, 1 = fully up
  const [hasTriggeredFullyRaised, setHasTriggeredFullyRaised] = useState(false);
  const awardRef = useRef<THREE.Group>(null);
  const plateRef = useRef<THREE.Group>(null);
  const treasureRef = useRef<any>(null); // RigidBody ref
  const treasureVisualRef = useRef<THREE.Group>(null); // Visual group ref

  // Generate award bag texture
  const awardTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // Background - dark leather bag color
    ctx.fillStyle = "#2D1810";
    ctx.fillRect(0, 0, 64, 64);

    // Add leather texture pattern
    ctx.fillStyle = "#3D2415";
    for (let i = 0; i < 10; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = Math.random() * 4 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add stitching lines
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(5, 10);
    ctx.lineTo(59, 10);
    ctx.moveTo(5, 54);
    ctx.lineTo(59, 54);
    ctx.moveTo(10, 5);
    ctx.lineTo(10, 59);
    ctx.moveTo(54, 5);
    ctx.lineTo(54, 59);
    ctx.stroke();

    // Add magical glow effect
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 215, 0, 0.3)");
    gradient.addColorStop(0.7, "rgba(255, 215, 0, 0.1)");
    gradient.addColorStop(1, "rgba(255, 215, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    // Add magical sparkles
    ctx.fillStyle = "#FFD700";
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = Math.random() * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add bag opening
    ctx.fillStyle = "#1A0F08";
    ctx.beginPath();
    ctx.ellipse(32, 15, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }, []);

  const handleCollision = (other: any) => {
    if (other.rigidBodyObject?.userData?.weight >= weight) {
      if (!isPressed && onPress) {
        onPress();
      }
      // Gradually raise the plate when something is on it
      setPlateHeight((prev) => {
        const newHeight = Math.min(prev + 0.02, 1); // Gradually raise to max 1
        if (newHeight >= 1 && !hasTriggeredFullyRaised) {
          setHasTriggeredFullyRaised(true);
          onPlateFullyRaised?.();
        }
        return newHeight;
      });
    } else {
      if (isPressed && onRelease) {
        onRelease();
      }
      // Gradually lower the plate when nothing is on it
      setPlateHeight((prev) => {
        const newHeight = Math.max(prev - 0.02, 0); // Gradually lower to min 0
        if (newHeight <= 0) {
          setHasTriggeredFullyRaised(false); // Reset trigger when plate is down
        }
        return newHeight;
      });
    }
  };

  const handleAwardClick = () => {
    if (!canGrabAward || !hasAward) return;

    setIsGrabbing(true);
    onItemGrabbed?.();

    // Reset grabbing state after animation
    setTimeout(() => {
      setIsGrabbing(false);
    }, 1000);
  };

  // Animate plate movement and treasure
  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Update plate position based on height
    if (plateRef.current) {
      const maxPlateHeight = 0.15; // Maximum height the plate can raise
      const currentPlateY = plateHeight * maxPlateHeight;
      plateRef.current.position.y = currentPlateY;
    }

    // Animate treasure floating and rotation (visual only)
    if (treasureVisualRef.current && hasAward && showAward) {
      const floatOffset = Math.sin(time * 2) * 0.05;
      const baseY = 0.2 + plateHeight * 0.15; // Treasure follows plate height

      treasureVisualRef.current.position.y = baseY + floatOffset;
      treasureVisualRef.current.rotation.y = time * 0.5;
    }
  });

  const renderAward = () => {
    if (!hasAward || !showAward) return null;

    switch (awardType) {
      case "bag":
        return (
          <RigidBody
            ref={treasureRef}
            position={[0, 0.2, 0]}
            type="dynamic"
            colliders="hull"
            userData={{ weight: 0.5, isTreasure: true }}
          >
            <group
              ref={treasureVisualRef}
              onClick={handleAwardClick}
              onPointerOver={() => setIsHovered(true)}
              onPointerOut={() => setIsHovered(false)}
            >
              <mesh>
                <boxGeometry args={[0.4, 0.3, 0.2]} />
                <meshStandardMaterial map={awardTexture} />
              </mesh>
              {/* Magical glow around bag */}
              <mesh>
                <boxGeometry args={[0.5, 0.4, 0.3]} />
                <meshStandardMaterial
                  color="#FFD700"
                  transparent
                  opacity={0.2}
                  emissive="#FFD700"
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
          </RigidBody>
        );
      case "coin":
        return (
          <RigidBody
            ref={treasureRef}
            position={[0, 0.2, 0]}
            type="dynamic"
            colliders="hull"
            userData={{ weight: 0.3, isTreasure: true }}
          >
            <group
              ref={treasureVisualRef}
              onPointerOver={() => setIsHovered(true)}
              onPointerOut={() => setIsHovered(false)}
            >
              <mesh>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 12]} />
                <meshStandardMaterial
                  color="#FFD700"
                  emissive="#FFD700"
                  emissiveIntensity={0.5}
                />
              </mesh>
            </group>
          </RigidBody>
        );
      case "gem":
        return (
          <RigidBody
            ref={treasureRef}
            position={[0, 0.2, 0]}
            type="dynamic"
            colliders="hull"
            userData={{ weight: 0.2, isTreasure: true }}
          >
            <group
              ref={treasureVisualRef}
              onPointerOver={() => setIsHovered(true)}
              onPointerOut={() => setIsHovered(false)}
            >
              <mesh>
                <octahedronGeometry args={[0.2]} />
                <meshStandardMaterial
                  color="#FF6B6B"
                  emissive="#FF6B6B"
                  emissiveIntensity={0.4}
                />
              </mesh>
            </group>
          </RigidBody>
        );
      case "scroll":
        return (
          <RigidBody
            ref={treasureRef}
            position={[0, 0.2, 0]}
            type="dynamic"
            colliders="hull"
            userData={{ weight: 0.1, isTreasure: true }}
          >
            <group
              ref={treasureVisualRef}
              onPointerOver={() => setIsHovered(true)}
              onPointerOut={() => setIsHovered(false)}
            >
              <mesh>
                <boxGeometry args={[0.3, 0.4, 0.05]} />
                <meshStandardMaterial color="#F5F5DC" />
              </mesh>
            </group>
          </RigidBody>
        );
      default:
        return null;
    }
  };

  return (
    <group position={position} scale={scale}>
      {/* Fixed Base - Bottom segment */}
      <RigidBody
        type="fixed"
        colliders="hull"
        onCollisionEnter={handleCollision}
      >
        <group>
          {/* Plate base */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.8, 0.8, 0.1, 12]} />
            <meshLambertMaterial color="#654321" />
          </mesh>
        </group>
      </RigidBody>

      {/* Moving Plate - Top segment */}
      <group ref={plateRef}>
        {/* Plate top */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.75, 0.75, 0.05, 12]} />
          <meshLambertMaterial color={color} />
        </mesh>

        {/* Pressure indicator */}
        <mesh position={[0, 0.085, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.02, 12]} />
          <meshLambertMaterial
            color={plateHeight > 0.5 ? "#00FF00" : "#FF0000"}
            emissive={plateHeight > 0.5 ? "#00FF00" : "#FF0000"}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Plate height indicator */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.01, 12]} />
          <meshLambertMaterial
            color={plateHeight >= 1 ? "#FF0000" : "#FFFF00"}
            emissive={plateHeight >= 1 ? "#FF0000" : "#FFFF00"}
            emissiveIntensity={plateHeight >= 1 ? 0.8 : 0.3}
          />
        </mesh>
      </group>

      {/* Physical Treasure */}
      {renderAward()}

      {/* Hover text */}
      {isHovered && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {hasAward && showAward
            ? `${label} - Plate: ${Math.round(
                plateHeight * 100
              )}% - Click to grab!`
            : `${label} - Plate: ${Math.round(plateHeight * 100)}%`}
        </Text>
      )}

      {/* Plate fully raised warning */}
      {plateHeight >= 1 && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.2}
          color="#FF0000"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ⚠️ PLATE FULLY RAISED - DANGER! ⚠️
        </Text>
      )}

      {/* Grabbing animation */}
      {isGrabbing && (
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#FF6B6B"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          ⚠️ TREASURE GRABBED! ⚠️
        </Text>
      )}
    </group>
  );
};

export default EnhancedPressurePlate;

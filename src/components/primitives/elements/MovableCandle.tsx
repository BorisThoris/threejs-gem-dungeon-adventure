import React, { useState, useRef, useEffect } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Candle from "./Candle";
import AnimatedSmoke from "./AnimatedSmoke";

export interface MovableCandleProps {
  position?: [number, number, number];
  isLit?: boolean;
  isMovable?: boolean;
  onMove?: (newPosition: [number, number, number]) => void;
  onLight?: () => void;
  onExtinguish?: () => void;
  weight?: number;
  color?: string;
}

const MovableCandle: React.FC<MovableCandleProps> = ({
  position = [0, 0, 0],
  isLit = true,
  isMovable = false,
  onMove,
  onLight,
  onExtinguish,
  weight = 0.5,
  color = "#8B4513",
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number, number]
  >([
    isNaN(position[0]) ? 0 : position[0],
    isNaN(position[1]) ? 0 : position[1],
    isNaN(position[2]) ? 0 : position[2],
  ]);
  const candleRef = useRef<THREE.Group>(null);
  const rigidBodyRef = useRef<any>(null);

  // Update position when prop changes
  useEffect(() => {
    const validPosition: [number, number, number] = [
      isNaN(position[0]) ? 0 : position[0],
      isNaN(position[1]) ? 0 : position[1],
      isNaN(position[2]) ? 0 : position[2],
    ];
    setCurrentPosition(validPosition);
  }, [position]);

  const handlePointerDown = (event: any) => {
    if (!isMovable) return;

    event.stopPropagation();
    setIsDragging(true);

    // Validate point values
    const point = event.point || { x: 0, y: 0, z: 0 };
    const validPoint = [
      isNaN(point.x) ? 0 : point.x,
      isNaN(point.y) ? 0 : point.y,
      isNaN(point.z) ? 0 : point.z,
    ] as [number, number, number];

    setDragStart(validPoint);

    // Make rigid body kinematic while dragging
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setBodyType(1); // Kinematic
    }
  };

  const handlePointerMove = (event: any) => {
    if (!isDragging || !isMovable) return;

    event.stopPropagation();

    // Validate point values
    const point = event.point || { x: 0, y: 0, z: 0 };
    const validX = isNaN(point.x) ? currentPosition[0] : point.x;
    const validZ = isNaN(point.z) ? currentPosition[2] : point.z;

    const newPosition: [number, number, number] = [
      validX,
      currentPosition[1], // Keep Y position fixed
      validZ,
    ];

    setCurrentPosition(newPosition);

    // Update rigid body position
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setTranslation(newPosition, true);
    }
  };

  const handlePointerUp = (event: any) => {
    if (!isDragging || !isMovable) return;

    event.stopPropagation();
    setIsDragging(false);

    // Restore rigid body type
    if (rigidBodyRef.current) {
      rigidBodyRef.current.setBodyType(0); // Dynamic
    }

    // Notify parent of new position
    onMove?.(currentPosition);
  };

  const handleClick = (event: any) => {
    if (isDragging) return; // Don't trigger click if we were dragging

    event.stopPropagation();
    if (isLit) {
      onExtinguish?.();
    } else {
      onLight?.();
    }
  };

  // Animate while dragging
  useFrame(() => {
    if (candleRef.current && isDragging) {
      // Add slight floating effect while dragging
      const time = Date.now() * 0.001;
      candleRef.current.position.y =
        currentPosition[1] + Math.sin(time * 10) * 0.02;
    }
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={currentPosition}
      type={isDragging ? "kinematicPosition" : "dynamic"}
      colliders={false}
      userData={{ weight }}
    >
      <CuboidCollider args={[0.1, 0.3, 0.1]} />
      <group
        ref={candleRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (isMovable) {
            document.body.style.cursor = isDragging ? "grabbing" : "grab";
          } else {
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          document.body.style.cursor = "default";
        }}
      >
        <Candle position={[0, 0, 0]} isLit={isLit} color={color} />

        {/* Smoke effect */}
        {isLit && (
          <AnimatedSmoke position={[0, 0.8, 0]} isLit={isLit} opacity={0.6} />
        )}

        {/* Dragging indicator */}
        {isDragging && (
          <mesh position={[0, -0.2, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
            <meshStandardMaterial
              color="#FFD700"
              transparent
              opacity={0.5}
              emissive="#FFD700"
              emissiveIntensity={0.3}
            />
          </mesh>
        )}
      </group>
    </RigidBody>
  );
};

export default MovableCandle;

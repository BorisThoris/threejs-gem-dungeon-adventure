import React, { useEffect } from "react";
import Candle from "./Candle";
import AnimatedSmoke from "./AnimatedSmoke";
import DraggableObject from "../../DraggableObject";

export interface MovableCandleProps {
  position?: [number, number, number];
  isLit?: boolean;
  onMove?: (newPosition: [number, number, number]) => void;
  onLight?: () => void;
  onExtinguish?: () => void;
  weight?: number;
  color?: string;
}

const MovableCandle: React.FC<MovableCandleProps> = ({
  position = [0, 0, 0],
  isLit = true,
  onMove,
  onLight,
  onExtinguish,
  weight = 0.5,
  color = "#8B4513",
}) => {
  // Debug when component mounts
  useEffect(() => {
    console.log("🕯️ MovableCandle: Component mounted");
    console.log("🕯️ MovableCandle: Position:", position);
    console.log("🕯️ MovableCandle: isLit:", isLit);
    console.log("🕯️ MovableCandle: Weight:", weight);
  }, [position, isLit, weight]);

  const handleClick = (event: any) => {
    console.log("🕯️ MovableCandle: Click handler called, isLit:", isLit);
    event.stopPropagation();
    if (isLit) {
      console.log("🕯️ MovableCandle: Extinguishing candle");
      onExtinguish?.();
    } else {
      console.log("🕯️ MovableCandle: Lighting candle");
      onLight?.();
    }
  };

  return (
    <DraggableObject
      position={position}
      type="dynamic"
      colliders={true}
      colliderArgs={[0.1, 0.3, 0.1]}
      userData={{ weight }}
      onMove={onMove}
    >
      <group
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "grab";
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
      </group>
    </DraggableObject>
  );
};

export default MovableCandle;

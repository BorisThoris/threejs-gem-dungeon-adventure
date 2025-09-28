import React from "react";
import withOptionalBreaking from "./withOptionalBreaking";
import type { BreakingOptions } from "../hooks/useBreaking";
import * as THREE from "three";
import Door from "./Door";

// Structural breaking options (more durable)
const structuralBreakingOptions: BreakingOptions = {
  fragmentCount: 6,
  fractureImpulse: 1.0,
  minSizeForFracture: 0.3,
  maxSizeForFracture: 0.8,
};

export interface BreakableDoorProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  keyRequired?: boolean;
  keyId?: string;
  isLocked?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  // Breaking props
  enabled?: boolean;
  breakingOptions?: BreakingOptions;
  onBreak?: (impactPoint: THREE.Vector3) => void;
  onFragmentClick?: (fragmentId: string) => void;
  showHoverEffect?: boolean;
  hoverColor?: string;
}

const BreakableDoor = withOptionalBreaking(Door, {
  breakingOptions: structuralBreakingOptions,
});

export default BreakableDoor;

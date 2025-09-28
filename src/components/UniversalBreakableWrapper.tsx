import React from "react";
import withOptionalBreaking from "./withOptionalBreaking";
import type { BreakingOptions } from "../hooks/useBreaking";
import * as THREE from "three";

// Default breaking options for different object types
const defaultBreakingOptions: BreakingOptions = {
  fragmentCount: 4,
  fractureImpulse: 0.8,
  minSizeForFracture: 0.1,
  maxSizeForFracture: 0.3,
};

// Small objects (decorative items, small furniture)
const smallObjectBreakingOptions: BreakingOptions = {
  ...defaultBreakingOptions,
  fragmentCount: 3,
  fractureImpulse: 0.4,
};

// Medium objects (furniture, interactive items)
const mediumObjectBreakingOptions: BreakingOptions = {
  ...defaultBreakingOptions,
  fragmentCount: 6,
  fractureImpulse: 0.6,
};

// Large objects (structural elements, walls, floors)
const largeObjectBreakingOptions: BreakingOptions = {
  ...defaultBreakingOptions,
  fragmentCount: 8,
  fractureImpulse: 1.2,
};

// Breaking size categories
export type BreakingSize = "small" | "medium" | "large";

// Universal wrapper function that makes any component optionally breakable
export function makeBreakable<T extends object>(
  Component: React.ComponentType<T>,
  size: BreakingSize = "medium"
) {
  const breakingOptions =
    size === "small"
      ? smallObjectBreakingOptions
      : size === "large"
      ? largeObjectBreakingOptions
      : mediumObjectBreakingOptions;

  return withOptionalBreaking(Component, {
    breakingOptions,
  });
}

// Pre-configured breakable components for common object types
export const BreakableSmall = makeBreakable;
export const BreakableMedium = makeBreakable;
export const BreakableLarge = makeBreakable;

// Interface for all breakable components
export interface UniversalBreakableProps {
  // Breaking props (from withOptionalBreaking HOC)
  enabled?: boolean;
  breakingOptions?: BreakingOptions;
  onBreak?: (impactPoint: THREE.Vector3) => void;
  onFragmentClick?: (fragmentId: string) => void;
  showHoverEffect?: boolean;
  hoverColor?: string;
}

// Utility function to create breakable versions of existing components
export function createBreakableComponent<T extends object>(
  Component: React.ComponentType<T>,
  size: BreakingSize = "medium"
) {
  return makeBreakable(Component, size);
}

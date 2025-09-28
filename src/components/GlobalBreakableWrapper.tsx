import React from "react";
import { useBreakingContext } from "../contexts/BreakingContext";
import type { BreakingOptions } from "../hooks/useBreaking";
import * as THREE from "three";

interface GlobalBreakableWrapperProps {
  children: React.ReactNode;
  breakingOptions?: BreakingOptions;
  onBreak?: (impactPoint: THREE.Vector3) => void;
  onFragmentClick?: (fragmentId: string) => void;
  showHoverEffect?: boolean;
  hoverColor?: string;
  // Override global breaking for this specific component
  forceEnabled?: boolean;
  forceDisabled?: boolean;
}

const GlobalBreakableWrapper: React.FC<GlobalBreakableWrapperProps> = ({
  children,
  breakingOptions = {},
  onBreak,
  onFragmentClick,
  showHoverEffect = true,
  hoverColor = "#ff6b6b",
  forceEnabled = false,
  forceDisabled = false,
}) => {
  const { globalBreakingEnabled } = useBreakingContext();

  // Determine if breaking should be enabled for this component
  const isBreakingEnabled = forceDisabled
    ? false
    : forceEnabled || globalBreakingEnabled;

  // Clone children and add breaking props
  const childrenWithBreaking = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      // Check if the child is a breakable component by looking for the 'enabled' prop
      if (typeof child.props === "object" && "enabled" in child.props) {
        return React.cloneElement(child as React.ReactElement<any>, {
          enabled: isBreakingEnabled,
          breakingOptions: {
            ...breakingOptions,
            ...child.props.breakingOptions,
          },
          onBreak: onBreak || child.props.onBreak,
          onFragmentClick: onFragmentClick || child.props.onFragmentClick,
          showHoverEffect: showHoverEffect,
          hoverColor: hoverColor,
        });
      }
    }
    return child;
  });

  return <>{childrenWithBreaking}</>;
};

export default GlobalBreakableWrapper;

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { UniversalPrototype, PrototypeRegistry } from "./UniversalPrototype";

// Higher-order component that adds prototype functionality to any 3D object
export const withPrototype = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultType: string = "object"
) => {
  return React.forwardRef<
    THREE.Group,
    P & {
      prototypeId?: string;
      prototypeType?: string;
      onPrototypeAction?: (action: string, data?: unknown) => void;
    }
  >((props, ref) => {
    const {
      prototypeId,
      prototypeType = defaultType,
      onPrototypeAction,
      ...restProps
    } = props;

    const groupRef = useRef<THREE.Group>(null);
    const prototypeRef = useRef<UniversalPrototype | null>(null);

    // Create or get prototype
    useEffect(() => {
      if (prototypeId) {
        let prototype = PrototypeRegistry.get(prototypeId);
        if (!prototype) {
          prototype = new UniversalPrototype(
            prototypeId,
            prototypeType,
            [0, 0, 0],
            "#ffffff"
          );
          PrototypeRegistry.register(prototype);
        }
        prototypeRef.current = prototype;

        // Override updateVisuals to actually update the 3D object
        prototype.updateVisuals = () => {
          if (groupRef.current && prototype) {
            groupRef.current.position.set(...prototype.position);
            groupRef.current.rotation.z = prototype.rotation;
            groupRef.current.scale.setScalar(prototype.scale);
            groupRef.current.visible = prototype.isVisible;

            // Update material color if possible
            groupRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.color.set(prototype.color);
                    }
                  });
                } else if (
                  child.material instanceof THREE.MeshStandardMaterial
                ) {
                  child.material.color.set(prototype.color);
                }
              }
            });
          }
        };
      }
    }, [prototypeId, prototypeType]);

    // Handle clicks and interactions
    const handleClick = (event: React.MouseEvent) => {
      event.stopPropagation();
      if (prototypeRef.current && onPrototypeAction) {
        onPrototypeAction("click", { prototype: prototypeRef.current });
      }
    };

    const handlePointerOver = (event: React.PointerEvent) => {
      event.stopPropagation();
      if (prototypeRef.current && onPrototypeAction) {
        onPrototypeAction("hover", { prototype: prototypeRef.current });
      }
    };

    return (
      <group
        ref={(node) => {
          groupRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
      >
        <WrappedComponent {...(restProps as P)} />
      </group>
    );
  });
};

// Simple hook to get prototype actions
export const usePrototypeActions = (prototypeId: string) => {
  const [prototype, setPrototype] = React.useState<UniversalPrototype | null>(
    null
  );

  useEffect(() => {
    const proto = PrototypeRegistry.get(prototypeId);
    setPrototype(proto || null);
  }, [prototypeId]);

  const executeAction = (action: string, data?: unknown) => {
    if (prototype) {
      switch (action) {
        case "paint":
          prototype.paint((data as { color?: string })?.color || "#ffffff");
          break;
        case "rotate":
          prototype.rotate((data as { angle?: number })?.angle);
          break;
        case "scale": {
          const scaleFactor = (data as { factor?: number })?.factor;
          prototype.setScale(typeof scaleFactor === "number" ? scaleFactor : 1);
          break;
        }
        case "move":
          prototype.move(
            (data as { position?: [number, number, number] })?.position || [
              0, 0, 0,
            ]
          );
          break;
        case "toggle-visibility":
          prototype.toggleVisibility();
          break;
        case "glow":
          prototype.glow((data as { intensity?: number })?.intensity || 1.5);
          break;
        default:
          console.log(`Unknown action: ${action}`);
      }
    }
  };

  return { prototype, executeAction };
};

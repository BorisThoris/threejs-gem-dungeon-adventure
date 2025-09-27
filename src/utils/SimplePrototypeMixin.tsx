import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { ObjectPrototype, PrototypeRegistry } from "./ObjectPrototype";

// Simple mixin that adds prototype functionality to any 3D object
export const withObjectPrototype = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultType: string = "object"
) => {
  return React.forwardRef<
    THREE.Group,
    P & {
      prototypeId?: string;
      onPrototypeAction?: (action: string, data?: unknown) => void;
    }
  >((props, ref) => {
    const { prototypeId, onPrototypeAction, ...restProps } = props;

    const groupRef = useRef<THREE.Group>(null);
    const prototypeRef = useRef<ObjectPrototype | null>(null);

    // Create or get prototype
    useEffect(() => {
      if (prototypeId) {
        let prototype = PrototypeRegistry.get(prototypeId);
        if (!prototype) {
          prototype = new ObjectPrototype(
            prototypeId,
            defaultType,
            [0, 0, 0],
            "#ffffff"
          );
          PrototypeRegistry.register(prototype);
          console.log(
            `Created prototype ${prototypeId} in withObjectPrototype`
          );
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
    }, [prototypeId]);

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
export const useObjectPrototypeActions = (prototypeId: string) => {
  const [prototype, setPrototype] = React.useState<ObjectPrototype | null>(
    null
  );

  useEffect(() => {
    let proto = PrototypeRegistry.get(prototypeId);
    if (!proto) {
      // Create prototype if it doesn't exist
      proto = new ObjectPrototype(prototypeId, "object", [0, 0, 0], "#ffffff");
      PrototypeRegistry.register(proto);
      console.log(
        `Created prototype ${prototypeId} in useObjectPrototypeActions`
      );
    }
    setPrototype(proto);
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
        case "damage": {
          const damageAmount = (data as { amount?: number })?.amount;
          if (typeof damageAmount === "number") {
            prototype.damage(damageAmount);
          }
          break;
        }
        case "break":
          prototype.break();
          break;
        case "breakWithPhysics": {
          const force = (data as { force?: number })?.force || 1.0;
          const direction = (data as { direction?: [number, number, number] })
            ?.direction || [0, 1, 0];
          const impactPoint = (
            data as { impactPoint?: [number, number, number] }
          )?.impactPoint;
          console.log(
            `Mixin: Calling breakWithPhysics on ${prototype.id} with force ${force} and impact point:`,
            impactPoint
          );
          prototype.breakWithPhysics(force, direction, impactPoint);
          break;
        }
        case "breakWithImpact": {
          const impulse = (data as { impulse?: number })?.impulse || 100;
          const impactPoint = (
            data as { impactPoint?: [number, number, number] }
          )?.impactPoint || [0, 0, 0];
          const impactNormal = (
            data as { impactNormal?: [number, number, number] }
          )?.impactNormal || [0, 1, 0];
          console.log(
            `Mixin: Calling breakWithImpact on ${prototype.id} with impulse ${impulse}`
          );
          const wasBroken = prototype.breakWithImpact(
            impulse,
            impactPoint,
            impactNormal
          );
          if (wasBroken) {
            console.log(`${prototype.id} was broken by impact!`);
          }
          break;
        }
        case "breakDynamically": {
          const impactPoint = (
            data as { impactPoint?: [number, number, number] }
          )?.impactPoint || [0, 0, 0];
          const impactNormal = (
            data as { impactNormal?: [number, number, number] }
          )?.impactNormal || [0, 1, 0];
          const fragmentCount =
            (data as { fragmentCount?: number })?.fragmentCount || 4;
          console.log(
            `Mixin: Calling breakDynamically on ${prototype.id} into ${fragmentCount} fragments`
          );
          const wasBroken = prototype.breakDynamically(
            impactPoint,
            impactNormal,
            fragmentCount
          );
          if (wasBroken) {
            console.log(`${prototype.id} prepared for dynamic breaking!`);
          }
          break;
        }
        case "repair":
          prototype.repair();
          break;
        case "makeBreakable": {
          const threshold = (data as { threshold?: number })?.threshold;
          console.log(
            `Mixin: Making ${prototype.id} breakable with threshold ${
              threshold || "auto"
            }`
          );
          prototype.makeBreakable(
            typeof threshold === "number" ? threshold : undefined
          );
          console.log(`Mixin: ${prototype.id} is now breakable:`, {
            isBreakable: prototype.isBreakable,
            health: prototype.breakThreshold,
          });
          break;
        }
        default:
          console.log(`Unknown action: ${action}`);
      }
    }
  };

  return { prototype, executeAction };
};

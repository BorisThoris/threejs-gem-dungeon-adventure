import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";

interface DoorInteractionOptions {
  onDoorEnter: (doorId: string) => void;
  doors: Array<{
    id: string;
    position: [number, number, number];
    type: string;
  }>;
  interactionDistance?: number;
}

export const useDoorInteraction = ({
  onDoorEnter,
  doors,
  interactionDistance = 3,
}: DoorInteractionOptions) => {
  const { camera } = useThree();
  const lastInteractionTime = useRef(0);
  const interactionCooldown = 500; // 500ms cooldown between interactions

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle 'E' key
      if (event.key.toLowerCase() !== "e") return;

      // Cooldown check
      const now = Date.now();
      if (now - lastInteractionTime.current < interactionCooldown) {
        return;
      }

      // Find the closest door
      const cameraPosition = new Vector3();
      camera.getWorldPosition(cameraPosition);

      let closestDoor = null;
      let closestDistance = Infinity;

      for (const door of doors) {
        const doorPosition = new Vector3(...door.position);
        const distance = cameraPosition.distanceTo(doorPosition);

        if (distance < interactionDistance && distance < closestDistance) {
          closestDoor = door;
          closestDistance = distance;
        }
      }

      if (closestDoor) {
        console.log(
          `Door interaction via keyboard: ${closestDoor.type} (${closestDoor.id})`
        );
        lastInteractionTime.current = now;
        onDoorEnter(closestDoor.id);
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [onDoorEnter, doors, interactionDistance, camera]);
};








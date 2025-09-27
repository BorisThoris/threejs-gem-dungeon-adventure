import React, { useEffect } from "react";
import {
  RoomContainer,
  RoomManager,
  PrototypeDebugger,
} from "../components/PrototypeComponents";
import { usePrototypeSystem, useRoom } from "../hooks/usePrototypeSystem";
import {
  createRoom,
  createTile,
  createWall,
  createStair,
  createDoor,
} from "../types/UniversalPrototypeSystem";

// Example: Converting an existing room to use prototypes
export const PrototypeRoomExample: React.FC = () => {
  const { createRoomObject, createObject } = usePrototypeSystem();

  useEffect(() => {
    // Create a room
    const room = createRoom({
      roomType: "puzzle",
      position: [0, 0, 0],
      bounds: {
        min: [-10, -10, -10],
        max: [10, 10, 10],
      },
    });

    // Create floor tiles
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        createObject("tile", [x, 0, z], room.id);
      }
    }

    // Create walls
    for (let x = -5; x <= 5; x++) {
      createObject("wall", [x, 1, -5], room.id); // North wall
      createObject("wall", [x, 1, 5], room.id); // South wall
    }
    for (let z = -5; z <= 5; z++) {
      createObject("wall", [-5, 1, z], room.id); // West wall
      createObject("wall", [5, 1, z], room.id); // East wall
    }

    // Create stairs
    for (let i = 0; i < 5; i++) {
      createObject("stair", [0, i * 0.2, 2 + i * 0.5], room.id);
    }

    // Create doors
    createObject("door", [0, 1, -5], room.id); // North door
    createObject("door", [0, 1, 5], room.id); // South door
  }, [createRoomObject, createObject]);

  return (
    <>
      <RoomContainer roomId="room_1">
        {/* This will automatically render all objects in the room */}
      </RoomContainer>

      <RoomManager roomId="room_1" />
      <PrototypeDebugger />
    </>
  );
};

// Example: Converting existing room components to use prototypes
export const convertExistingRoomToPrototypes = (roomData: any) => {
  // Create room prototype
  const room = createRoom({
    roomType: roomData.type || "custom",
    position: roomData.position || [0, 0, 0],
    bounds: roomData.bounds || {
      min: [-10, -10, -10],
      max: [10, 10, 10],
    },
  });

  // Convert room elements to prototypes
  roomData.elements?.forEach((element: any) => {
    switch (element.type) {
      case "tile":
        createTile(element.position, room.id);
        break;
      case "wall":
        createWall(element.position, room.id);
        break;
      case "stair":
        createStair(element.position, room.id);
        break;
      case "door":
        createDoor(element.position, room.id);
        break;
      default:
        // Create generic game object
        createObject(element.type, element.position, room.id);
    }
  });

  return room;
};

// Example: Room with dynamic object management
export const DynamicRoomExample: React.FC = () => {
  const { room, addObject, removeObject, executeActionOnAllObjects } =
    useRoom("dynamic_room");

  useEffect(() => {
    // Create the room if it doesn't exist
    if (!room) {
      createRoom({
        id: "dynamic_room",
        roomType: "custom",
        position: [0, 0, 0],
      });
    }
  }, [room]);

  const addRandomObject = () => {
    const types = ["tile", "wall", "stair", "door"] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const position: [number, number, number] = [
      Math.random() * 10 - 5,
      Math.random() * 2,
      Math.random() * 10 - 5,
    ];

    const newObject = createObject(type, position, "dynamic_room");
    addObject(newObject);
  };

  const removeRandomObject = () => {
    if (room && room.children.length > 0) {
      const randomIndex = Math.floor(Math.random() * room.children.length);
      const objectId = room.children[randomIndex];
      removeObject(objectId);
    }
  };

  const colorAllObjects = () => {
    const colors = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    executeActionOnAllObjects("paint", { color: randomColor });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <h3>Dynamic Room Manager</h3>
      <p>Objects in room: {room?.children.length || 0}</p>

      <div style={{ display: "flex", gap: "5px", marginTop: "10px" }}>
        <button onClick={addRandomObject}>Add Random Object</button>
        <button onClick={removeRandomObject}>Remove Random Object</button>
        <button onClick={colorAllObjects}>Random Color All</button>
      </div>
    </div>
  );
};

// Example: Room with physics simulation
export const PhysicsRoomExample: React.FC = () => {
  const { room, objects, executeActionOnAllObjects } = useRoom("physics_room");

  useEffect(() => {
    // Create physics room
    if (!room) {
      createRoom({
        id: "physics_room",
        roomType: "custom",
        position: [0, 0, 0],
      });

      // Create some objects with physics
      for (let i = 0; i < 10; i++) {
        const obj = createObject(
          "tile",
          [
            Math.random() * 10 - 5,
            Math.random() * 5 + 5,
            Math.random() * 10 - 5,
          ],
          "physics_room"
        );

        // Enable physics
        obj.physics.enabled = true;
        obj.physics.velocity = [
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
        ];
      }
    }
  }, [room]);

  const enablePhysics = () => {
    executeActionOnAllObjects("toggle-physics");
  };

  const addGravity = () => {
    objects.forEach((obj) => {
      obj.physics.acceleration = [0, -9.8, 0];
    });
  };

  const addRandomForce = () => {
    objects.forEach((obj) => {
      obj.physics.acceleration = [
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
      ];
    });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <h3>Physics Room Manager</h3>
      <p>
        Objects with physics:{" "}
        {objects.filter((obj) => obj.physics.enabled).length}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginTop: "10px",
        }}
      >
        <button onClick={enablePhysics}>Toggle Physics</button>
        <button onClick={addGravity}>Add Gravity</button>
        <button onClick={addRandomForce}>Add Random Force</button>
      </div>
    </div>
  );
};

// Example: Room with interactive objects
export const InteractiveRoomExample: React.FC = () => {
  const { room, objects, executeActionOnType } = useRoom("interactive_room");

  useEffect(() => {
    // Create interactive room
    if (!room) {
      createRoom({
        id: "interactive_room",
        roomType: "custom",
        position: [0, 0, 0],
      });

      // Create interactive doors
      for (let i = 0; i < 4; i++) {
        const door = createObject(
          "door",
          [Math.cos((i * Math.PI) / 2) * 5, 1, Math.sin((i * Math.PI) / 2) * 5],
          "interactive_room"
        );
        door.isInteractive = true;
      }
    }
  }, [room]);

  const toggleDoorInteraction = () => {
    executeActionOnType("door", "toggle-interaction");
  };

  const openAllDoors = () => {
    executeActionOnType("door", "rotate", { angle: Math.PI / 2 });
  };

  const closeAllDoors = () => {
    executeActionOnType("door", "rotate", { angle: -Math.PI / 2 });
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
      }}
    >
      <h3>Interactive Room Manager</h3>
      <p>
        Interactive objects: {objects.filter((obj) => obj.isInteractive).length}
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginTop: "10px",
        }}
      >
        <button onClick={toggleDoorInteraction}>Toggle Door Interaction</button>
        <button onClick={openAllDoors}>Open All Doors</button>
        <button onClick={closeAllDoors}>Close All Doors</button>
      </div>
    </div>
  );
};

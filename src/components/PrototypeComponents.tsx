import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { usePrototype, useRoom } from "../hooks/usePrototypeSystem";
import type {
  GameObjectPrototype,
  RoomPrototype,
} from "../types/UniversalPrototypeSystem";

// Generic prototype mesh component
interface PrototypeMeshProps {
  prototypeId: string;
  geometry?: React.ReactNode;
  material?: React.ReactNode;
  children?: React.ReactNode;
}

export const PrototypeMesh: React.FC<PrototypeMeshProps> = ({
  prototypeId,
  geometry,
  material,
  children,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { prototype, executeAction } = usePrototype(prototypeId);

  useFrame(() => {
    if (meshRef.current && prototype) {
      const gameObject = prototype as GameObjectPrototype;

      // Sync position
      meshRef.current.position.set(...gameObject.position);

      // Sync rotation
      meshRef.current.rotation.z = gameObject.rotation;

      // Sync scale
      meshRef.current.scale.setScalar(gameObject.scale);

      // Sync visibility
      meshRef.current.visible = gameObject.isVisible;
    }
  });

  if (!prototype) return null;

  const gameObject = prototype as GameObjectPrototype;

  return (
    <mesh
      ref={meshRef}
      onClick={() => executeAction("click")}
      onPointerOver={() => executeAction("hover")}
      visible={gameObject.isVisible}
    >
      {geometry || <boxGeometry args={[1, 1, 1]} />}
      {material || <meshStandardMaterial color={gameObject.color} />}
      {children}
    </mesh>
  );
};

// Tile component
export const PrototypeTile: React.FC<{ prototypeId: string }> = ({
  prototypeId,
}) => {
  return (
    <PrototypeMesh prototypeId={prototypeId}>
      <boxGeometry args={[1, 0.1, 1]} />
      <meshStandardMaterial color="#8B4513" />
    </PrototypeMesh>
  );
};

// Wall component
export const PrototypeWall: React.FC<{ prototypeId: string }> = ({
  prototypeId,
}) => {
  return (
    <PrototypeMesh prototypeId={prototypeId}>
      <boxGeometry args={[1, 2, 0.1]} />
      <meshStandardMaterial color="#696969" />
    </PrototypeMesh>
  );
};

// Stair component
export const PrototypeStair: React.FC<{ prototypeId: string }> = ({
  prototypeId,
}) => {
  return (
    <PrototypeMesh prototypeId={prototypeId}>
      <boxGeometry args={[1, 0.2, 0.5]} />
      <meshStandardMaterial color="#A0522D" />
    </PrototypeMesh>
  );
};

// Door component
export const PrototypeDoor: React.FC<{ prototypeId: string }> = ({
  prototypeId,
}) => {
  return (
    <PrototypeMesh prototypeId={prototypeId}>
      <boxGeometry args={[0.1, 2, 1]} />
      <meshStandardMaterial color="#8B4513" />
    </PrototypeMesh>
  );
};

// Room container component
interface RoomContainerProps {
  roomId: string;
  children?: React.ReactNode;
}

export const RoomContainer: React.FC<RoomContainerProps> = ({
  roomId,
  children,
}) => {
  const { room, objects, executeActionOnAllObjects } = useRoom(roomId);
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && room) {
      // Sync room position
      groupRef.current.position.set(...room.position);
      groupRef.current.rotation.z = room.rotation;
      groupRef.current.scale.setScalar(room.scale);
    }
  });

  if (!room) return null;

  return (
    <group ref={groupRef}>
      {children}
      {objects.map((obj) => {
        switch (obj.objectType) {
          case "tile":
            return <PrototypeTile key={obj.id} prototypeId={obj.id} />;
          case "wall":
            return <PrototypeWall key={obj.id} prototypeId={obj.id} />;
          case "stair":
            return <PrototypeStair key={obj.id} prototypeId={obj.id} />;
          case "door":
            return <PrototypeDoor key={obj.id} prototypeId={obj.id} />;
          default:
            return <PrototypeMesh key={obj.id} prototypeId={obj.id} />;
        }
      })}
    </group>
  );
};

// Room management component
interface RoomManagerProps {
  roomId: string;
  onRoomAction?: (actionId: string, context?: unknown) => void;
}

export const RoomManager: React.FC<RoomManagerProps> = ({
  roomId,
  onRoomAction,
}) => {
  const { room, objects, executeActionOnAllObjects, executeActionOnType } =
    useRoom(roomId);

  const handleRoomAction = (actionId: string, context?: unknown) => {
    executeActionOnAllObjects(actionId, context);
    onRoomAction?.(actionId, context);
  };

  const handleTypeAction = (
    objectType: string,
    actionId: string,
    context?: unknown
  ) => {
    executeActionOnType(objectType, actionId, context);
  };

  if (!room) return null;

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
      <h3>Room: {room.id}</h3>
      <p>Type: {room.roomType}</p>
      <p>Objects: {objects.length}</p>

      <div style={{ marginTop: "10px" }}>
        <h4>Room Actions:</h4>
        <button
          onClick={() =>
            handleRoomAction("color-all-objects", { color: "#FF0000" })
          }
        >
          🎨 Color All Red
        </button>
        <button
          onClick={() => handleRoomAction("scale-all-objects", { factor: 1.1 })}
        >
          📏 Scale All Up
        </button>
        <button
          onClick={() =>
            handleRoomAction("move-all-objects", { offset: [0, 0, 1] })
          }
        >
          ↔️ Move All Forward
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <h4>Type Actions:</h4>
        <button onClick={() => handleTypeAction("tile", "toggle-visibility")}>
          👁️ Toggle Tiles
        </button>
        <button onClick={() => handleTypeAction("wall", "toggle-physics")}>
          ⚡ Toggle Wall Physics
        </button>
        <button onClick={() => handleTypeAction("door", "toggle-interaction")}>
          👆 Toggle Door Interaction
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <h4>Objects in Room:</h4>
        {objects.map((obj) => (
          <div key={obj.id} style={{ fontSize: "12px", margin: "2px 0" }}>
            {obj.objectType} - {obj.id} - {obj.isVisible ? "👁️" : "🚫"}
          </div>
        ))}
      </div>
    </div>
  );
};

// Object inspector component
interface ObjectInspectorProps {
  objectId: string;
  onClose?: () => void;
}

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  objectId,
  onClose,
}) => {
  const { prototype, executeAction } = usePrototype(objectId);

  if (!prototype) return null;

  const gameObject = prototype as GameObjectPrototype;

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "15px",
        borderRadius: "5px",
        minWidth: "250px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3>Object Inspector</h3>
        <button
          onClick={onClose}
          style={{
            background: "red",
            color: "white",
            border: "none",
            borderRadius: "3px",
            padding: "5px",
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <p>
          <strong>ID:</strong> {gameObject.id}
        </p>
        <p>
          <strong>Type:</strong> {gameObject.objectType}
        </p>
        <p>
          <strong>Position:</strong> [{gameObject.position.join(", ")}]
        </p>
        <p>
          <strong>Color:</strong> {gameObject.color}
        </p>
        <p>
          <strong>Visible:</strong> {gameObject.isVisible ? "Yes" : "No"}
        </p>
        <p>
          <strong>Interactive:</strong>{" "}
          {gameObject.isInteractive ? "Yes" : "No"}
        </p>
        <p>
          <strong>Physics:</strong>{" "}
          {gameObject.physics.enabled ? "Enabled" : "Disabled"}
        </p>
      </div>

      <div>
        <h4>Actions:</h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "5px",
          }}
        >
          <button onClick={() => executeAction("toggle-visibility")}>
            👁️ Toggle Visibility
          </button>
          <button onClick={() => executeAction("toggle-interaction")}>
            👆 Toggle Interaction
          </button>
          <button onClick={() => executeAction("toggle-physics")}>
            ⚡ Toggle Physics
          </button>
          <button onClick={() => executeAction("toggle-collision")}>
            🛡️ Toggle Collision
          </button>
          <button onClick={() => executeAction("paint", { color: "#FF0000" })}>
            🎨 Paint Red
          </button>
          <button onClick={() => executeAction("rotate")}>🔄 Rotate</button>
          <button onClick={() => executeAction("scale", { factor: 1.1 })}>
            📏 Scale Up
          </button>
          <button onClick={() => executeAction("glow", { intensity: 1.5 })}>
            ✨ Glow
          </button>
        </div>
      </div>
    </div>
  );
};

// Prototype system debugger
export const PrototypeDebugger: React.FC = () => {
  const { prototypes, rooms, executeActionOnAll } = usePrototypeSystem();

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        maxHeight: "300px",
        overflowY: "auto",
      }}
    >
      <h3>Prototype System Debugger</h3>

      <div style={{ marginBottom: "10px" }}>
        <p>
          <strong>Total Objects:</strong> {prototypes.length}
        </p>
        <p>
          <strong>Total Rooms:</strong> {rooms.length}
        </p>
      </div>

      <div style={{ marginBottom: "10px" }}>
        <h4>Global Actions:</h4>
        <button onClick={() => executeActionOnAll("toggle-visibility")}>
          👁️ Toggle All Visibility
        </button>
        <button
          onClick={() => executeActionOnAll("paint", { color: "#00FF00" })}
        >
          🎨 Paint All Green
        </button>
        <button onClick={() => executeActionOnAll("glow", { intensity: 2.0 })}>
          ✨ Glow All
        </button>
      </div>

      <div>
        <h4>Objects by Type:</h4>
        {[
          "tile",
          "wall",
          "stair",
          "door",
          "furniture",
          "decoration",
          "interactive",
        ].map((type) => {
          const count = prototypes.filter(
            (obj) => obj.objectType === type
          ).length;
          return (
            <div key={type} style={{ fontSize: "12px", margin: "2px 0" }}>
              {type}: {count}
            </div>
          );
        })}
      </div>
    </div>
  );
};

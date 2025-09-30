import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import {
  generateAngularEntryPoints,
  AngularEntryPoint,
  connectAngularEntryPoints,
  findEntryPointAtAngle,
  getDoorRotationFromAngle,
} from "../types/angularEntryPoints";

/**
 * Example showing how to integrate angular entry points with the existing system
 * This demonstrates connecting rooms at weird angles
 */
export const AngularEntryPointIntegration: React.FC = () => {
  const [rooms, setRooms] = useState<
    Array<{
      id: string;
      position: { x: number; z: number };
      shape: string;
      entryPoints: AngularEntryPoint[];
      connections: string[];
    }>
  >([]);

  // Create some example rooms with different shapes and angles
  useEffect(() => {
    const newRooms = [
      {
        id: "room_1",
        position: { x: 0, z: 0 },
        shape: "hexagon",
        entryPoints: generateAngularEntryPoints(
          "room_1",
          "normal",
          "hexagon",
          10
        ),
        connections: [],
      },
      {
        id: "room_2",
        position: { x: 15, z: 5 },
        shape: "octagon",
        entryPoints: generateAngularEntryPoints(
          "room_2",
          "normal",
          "octagon",
          10
        ),
        connections: [],
      },
      {
        id: "room_3",
        position: { x: -10, z: 8 },
        shape: "diamond",
        entryPoints: generateAngularEntryPoints(
          "room_3",
          "normal",
          "diamond",
          10
        ),
        connections: [],
      },
      {
        id: "room_4",
        position: { x: 5, z: -12 },
        shape: "circle",
        entryPoints: generateAngularEntryPoints(
          "room_4",
          "normal",
          "circle",
          10,
          [30, 150, 210, 330]
        ), // Custom angles
        connections: [],
      },
    ];

    // Connect rooms at weird angles
    connectRoomsAtAngles(newRooms);
    setRooms(newRooms);
  }, []);

  const connectRoomsAtAngles = (rooms: typeof rooms) => {
    // Connect room_1 to room_2 at 45° angle
    connectRooms(rooms[0], rooms[1], 45, 225);

    // Connect room_1 to room_3 at 120° angle
    connectRooms(rooms[0], rooms[2], 120, 300);

    // Connect room_1 to room_4 at 30° angle
    connectRooms(rooms[0], rooms[3], 30, 210);
  };

  const connectRooms = (
    room1: (typeof rooms)[0],
    room2: (typeof rooms)[0],
    angle1: number,
    angle2: number
  ) => {
    // Find entry points at the specified angles
    const ep1 = findEntryPointAtAngle(room1.entryPoints, angle1, 10);
    const ep2 = findEntryPointAtAngle(room2.entryPoints, angle2, 10);

    if (ep1 && ep2) {
      // Connect the entry points
      connectAngularEntryPoints(ep1, ep2);

      // Add to connections list
      if (!room1.connections.includes(room2.id)) {
        room1.connections.push(room2.id);
      }
      if (!room2.connections.includes(room1.id)) {
        room2.connections.push(room1.id);
      }

      console.log(
        `Connected ${room1.id} at ${angle1}° to ${room2.id} at ${angle2}°`
      );
    } else {
      console.warn(
        `Could not find entry points for angles ${angle1}° and ${angle2}°`
      );
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Info Panel */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "15px",
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "12px",
          zIndex: 1000,
          minWidth: "300px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
          🔄 Angular Connections Demo
        </h3>

        <div style={{ marginBottom: "10px" }}>
          <div>Rooms: {rooms.length}</div>
          <div>
            Total Entry Points:{" "}
            {rooms.reduce((sum, r) => sum + r.entryPoints.length, 0)}
          </div>
          <div>
            Active Connections:{" "}
            {rooms.reduce(
              (sum, r) =>
                sum + r.entryPoints.filter((ep) => ep.isActive).length,
              0
            ) / 2}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #444",
            paddingTop: "10px",
            marginTop: "10px",
          }}
        >
          <div style={{ fontSize: "10px" }}>
            <div>🟡 Yellow = Cardinal (0°, 90°, 180°, 270°)</div>
            <div>🟠 Orange = Diagonal (45°, 135°, 225°, 315°)</div>
            <div>🟢 Green = Active/Connected</div>
            <div>🔵 Blue = Custom angles</div>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 30, 30], fov: 50 }}>
        <color attach="background" args={["#1a1a1a"]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        {/* Grid */}
        <Grid
          args={[100, 100]}
          cellSize={5}
          cellThickness={0.5}
          cellColor="#444444"
          sectionSize={20}
          sectionThickness={1}
          sectionColor="#666666"
          fadeDistance={200}
          fadeStrength={1}
        />

        {/* Render all rooms */}
        {rooms.map((room) => (
          <RoomWithAngularEntryPoints key={room.id} room={room} />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={200}
        />
      </Canvas>
    </div>
  );
};

/**
 * Room component with angular entry points
 */
const RoomWithAngularEntryPoints: React.FC<{
  room: {
    id: string;
    position: { x: number; z: number };
    shape: string;
    entryPoints: AngularEntryPoint[];
    connections: string[];
  };
}> = ({ room }) => {
  return (
    <group position={[room.position.x, 0, room.position.z]}>
      {/* Room outline */}
      <RoomOutline shape={room.shape} size={10} />

      {/* Room label */}
      <Text
        position={[0, 2, 0]}
        fontSize={0.5}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {room.id}
      </Text>

      {/* Entry points */}
      {room.entryPoints.map((entryPoint) => (
        <AngularEntryPointMarker
          key={entryPoint.id}
          entryPoint={entryPoint}
          showAngle={true}
        />
      ))}

      {/* Connection lines */}
      {room.entryPoints
        .filter((ep) => ep.isActive && ep.connectedTo)
        .map((entryPoint) => {
          const connectedRoom = room.connections.find((connId) =>
            entryPoint.connectedTo?.startsWith(connId)
          );
          if (!connectedRoom) return null;

          // Find the connected room's position (simplified)
          const targetPos = getTargetRoomPosition(connectedRoom);
          if (!targetPos) return null;

          return (
            <ConnectionLine
              key={`connection-${entryPoint.id}`}
              from={entryPoint.position}
              to={targetPos}
            />
          );
        })}
    </group>
  );
};

/**
 * Room outline component
 */
const RoomOutline: React.FC<{ shape: string; size: number }> = ({
  shape,
  size,
}) => {
  const halfSize = size / 2;

  switch (shape) {
    case "circle":
      return (
        <mesh>
          <cylinderGeometry args={[halfSize, halfSize, 0.2, 32]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );
    case "hexagon":
      return (
        <mesh>
          <cylinderGeometry args={[halfSize, halfSize, 0.2, 6]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );
    case "octagon":
      return (
        <mesh>
          <cylinderGeometry args={[halfSize, halfSize, 0.2, 8]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );
    case "diamond":
      return (
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[halfSize * 1.4, 0.2, halfSize * 1.4]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );
    default:
      return (
        <mesh>
          <boxGeometry args={[size, 0.2, size]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );
  }
};

/**
 * Individual entry point marker
 */
const AngularEntryPointMarker: React.FC<{
  entryPoint: AngularEntryPoint;
  showAngle: boolean;
}> = ({ entryPoint, showAngle }) => {
  const { position, angle, isActive, isDiagonal, type } = entryPoint;

  // Color based on type and state
  let color = "#ffff00"; // Default yellow
  if (isActive) color = "#00ff00"; // Green for active
  else if (isDiagonal) color = "#ff8800"; // Orange for diagonal
  else if (type === "custom") color = "#0088ff"; // Blue for custom angles

  const emissiveColor = isActive
    ? "#00aa00"
    : isDiagonal
    ? "#aa4400"
    : "#aaaa00";

  // Direction vector for arrow
  const direction = {
    x: Math.sin((angle * Math.PI) / 180),
    z: -Math.cos((angle * Math.PI) / 180),
  };

  return (
    <group position={[position.x, 0.5, position.z]}>
      {/* Entry point sphere */}
      <mesh>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Direction arrow */}
      <mesh
        position={[direction.x * 0.5, 0, direction.z * 0.5]}
        rotation={[0, (angle * Math.PI) / 180, 0]}
      >
        <coneGeometry args={[0.1, 0.3, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Angle label */}
      {showAngle && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {angle}°
        </Text>
      )}
    </group>
  );
};

/**
 * Connection line between rooms
 */
const ConnectionLine: React.FC<{
  from: { x: number; z: number };
  to: { x: number; z: number };
}> = ({ from, to }) => {
  const distance = Math.sqrt(
    Math.pow(to.x - from.x, 2) + Math.pow(to.z - from.z, 2)
  );
  const midX = (from.x + to.x) / 2;
  const midZ = (from.z + to.z) / 2;
  const angle = Math.atan2(to.z - from.z, to.x - from.x);

  return (
    <mesh position={[midX, 0.1, midZ]} rotation={[0, angle, 0]}>
      <boxGeometry args={[distance, 0.05, 0.1]} />
      <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
    </mesh>
  );
};

/**
 * Helper to get target room position (simplified)
 */
function getTargetRoomPosition(
  roomId: string
): { x: number; z: number } | null {
  const positions: Record<string, { x: number; z: number }> = {
    room_1: { x: 0, z: 0 },
    room_2: { x: 15, z: 5 },
    room_3: { x: -10, z: 8 },
    room_4: { x: 5, z: -12 },
  };
  return positions[roomId] || null;
}

export default AngularEntryPointIntegration;

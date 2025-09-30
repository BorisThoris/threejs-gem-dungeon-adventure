import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { RoomFloor } from "../components/primitives/elements";
import type { Room } from "../types/map";

// Test data for different room types and shapes
const testRooms: Room[] = [
  {
    id: "test-square-stone",
    type: "start",
    shape: "square",
    size: [10, 10],
    position: { x: 0, y: 0, z: 0 },
    theme: "dungeon",
    color: "#4a4a4a",
    colorFloor: "#2a2a2a",
    colorWall: "#6a6a6a",
    colorCeiling: "#8a8a8a",
  },
  {
    id: "test-circle-wood",
    type: "library",
    shape: "circle",
    size: [8, 8],
    position: { x: 15, y: 0, z: 0 },
    theme: "medieval",
    color: "#8B4513",
    colorFloor: "#654321",
    colorWall: "#A0522D",
    colorCeiling: "#CD853F",
  },
  {
    id: "test-hexagon-marble",
    type: "treasure",
    shape: "hexagon",
    size: [12, 12],
    position: { x: 30, y: 0, z: 0 },
    theme: "royal",
    color: "#f5f5f5",
    colorFloor: "#e0e0e0",
    colorWall: "#ffffff",
    colorCeiling: "#f8f8f8",
  },
  {
    id: "test-octagon-metal",
    type: "shop",
    shape: "octagon",
    size: [10, 10],
    position: { x: 45, y: 0, z: 0 },
    theme: "industrial",
    color: "#c0c0c0",
    colorFloor: "#a0a0a0",
    colorWall: "#d0d0d0",
    colorCeiling: "#e0e0e0",
  },
  {
    id: "test-triangle-crystal",
    type: "portal",
    shape: "triangle",
    size: [8, 8],
    position: { x: 60, y: 0, z: 0 },
    theme: "mystical",
    color: "#87CEEB",
    colorFloor: "#5F9EA0",
    colorWall: "#B0E0E6",
    colorCeiling: "#E0F6FF",
  },
  {
    id: "test-diamond-brick",
    type: "corridor",
    shape: "diamond",
    size: [6, 6],
    position: { x: 75, y: 0, z: 0 },
    theme: "dungeon",
    color: "#B22222",
    colorFloor: "#8B0000",
    colorWall: "#DC143C",
    colorCeiling: "#FF6347",
  },
];

const FloorTestExample: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex" }}>
      {/* Control Panel */}
      <div
        style={{
          width: "300px",
          padding: "20px",
          backgroundColor: "#2a2a2a",
          color: "white",
          overflowY: "auto",
        }}
      >
        <h2>Floor Test Suite</h2>
        <p>Test different room types and floor implementations</p>

        <div style={{ marginBottom: "20px" }}>
          <label>
            <input
              type="checkbox"
              checked={showDebugInfo}
              onChange={(e) => setShowDebugInfo(e.target.checked)}
            />
            Show Debug Info
          </label>
        </div>

        <h3>Test Rooms:</h3>
        {testRooms.map((room) => (
          <div
            key={room.id}
            style={{
              padding: "10px",
              margin: "5px 0",
              backgroundColor: selectedRoom?.id === room.id ? "#444" : "#333",
              cursor: "pointer",
              borderRadius: "5px",
            }}
            onClick={() => setSelectedRoom(room)}
          >
            <strong>
              {room.type} - {room.shape}
            </strong>
            <br />
            <small>Theme: {room.theme}</small>
            <br />
            <small>
              Size: {room.size[0]}x{room.size[1]}
            </small>
          </div>
        ))}

        {selectedRoom && (
          <div
            style={{
              marginTop: "20px",
              padding: "10px",
              backgroundColor: "#444",
              borderRadius: "5px",
            }}
          >
            <h4>Selected Room:</h4>
            <p>
              <strong>ID:</strong> {selectedRoom.id}
            </p>
            <p>
              <strong>Type:</strong> {selectedRoom.type}
            </p>
            <p>
              <strong>Shape:</strong> {selectedRoom.shape}
            </p>
            <p>
              <strong>Theme:</strong> {selectedRoom.theme}
            </p>
            <p>
              <strong>Size:</strong> {selectedRoom.size[0]}x
              {selectedRoom.size[1]}
            </p>
            <p>
              <strong>Floor Color:</strong> {selectedRoom.colorFloor}
            </p>
            <p>
              <strong>Wall Color:</strong> {selectedRoom.colorWall}
            </p>
            <p>
              <strong>Ceiling Color:</strong> {selectedRoom.colorCeiling}
            </p>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
          <Environment preset="sunset" />

          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          {/* Render all test rooms */}
          {testRooms.map((room) => (
            <RoomFloor
              key={room.id}
              room={room}
              position={[room.position.x, 0, room.position.z]}
              isCollidable={true}
            />
          ))}

          {/* Highlight selected room */}
          {selectedRoom && (
            <mesh
              position={[selectedRoom.position.x, 0.1, selectedRoom.position.z]}
            >
              <ringGeometry
                args={[
                  selectedRoom.size[0] / 2 + 1,
                  selectedRoom.size[0] / 2 + 1.2,
                  32,
                ]}
              />
              <meshBasicMaterial color="#ffff00" transparent opacity={0.5} />
            </mesh>
          )}

          {/* Debug grid */}
          {showDebugInfo && (
            <gridHelper args={[100, 100, "#444444", "#222222"]} />
          )}

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </div>
    </div>
  );
};

export default FloorTestExample;

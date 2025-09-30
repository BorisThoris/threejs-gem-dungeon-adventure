import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import {
  generateAngularEntryPoints,
  AngularEntryPoint,
  directionToAngle,
  angleToDirection,
  getPositionAtAngle,
  findEntryPointAtAngle,
  connectAngularEntryPoints,
  getDoorRotationFromAngle,
} from "../types/angularEntryPoints";

/**
 * Example component demonstrating angular entry points
 */
export const AngularEntryPointExample: React.FC = () => {
  const [selectedShape, setSelectedShape] = useState<string>("hexagon");
  const [customAngles, setCustomAngles] = useState<number[]>([]);
  const [showAngles, setShowAngles] = useState(true);

  // Generate entry points for the selected shape
  const entryPoints = generateAngularEntryPoints(
    "example_room",
    "normal",
    selectedShape,
    10,
    customAngles.length > 0 ? customAngles : undefined
  );

  const addCustomAngle = () => {
    const angle = Math.floor(Math.random() * 360);
    setCustomAngles([...customAngles, angle]);
  };

  const clearCustomAngles = () => {
    setCustomAngles([]);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Controls Panel */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
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
          🔄 Angular Entry Points Demo
        </h3>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Room Shape:
            <select
              value={selectedShape}
              onChange={(e) => setSelectedShape(e.target.value)}
              style={{ marginLeft: "10px", padding: "2px" }}
            >
              <option value="square">Square (4 cardinal)</option>
              <option value="circle">Circle (4 cardinal)</option>
              <option value="hexagon">Hexagon (6 sides)</option>
              <option value="octagon">Octagon (8 sides)</option>
              <option value="triangle">Triangle (3 sides)</option>
              <option value="diamond">Diamond (4 diagonal)</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
            }}
          >
            <input
              type="checkbox"
              checked={showAngles}
              onChange={(e) => setShowAngles(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            Show Angle Labels
          </label>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <button
            onClick={addCustomAngle}
            style={{
              padding: "5px 10px",
              marginRight: "5px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Add Random Angle
          </button>
          <button
            onClick={clearCustomAngles}
            style={{
              padding: "5px 10px",
              background: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Clear Custom
          </button>
        </div>

        <div
          style={{
            borderTop: "1px solid #444",
            paddingTop: "10px",
            marginTop: "10px",
          }}
        >
          <div>Entry Points: {entryPoints.length}</div>
          <div>Custom Angles: {customAngles.length}</div>
          <div style={{ fontSize: "10px", marginTop: "5px" }}>
            {customAngles.map((angle, i) => (
              <span key={i} style={{ marginRight: "5px" }}>
                {angle}°
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas camera={{ position: [0, 20, 20], fov: 50 }}>
        <color attach="background" args={["#1a1a1a"]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        {/* Grid */}
        <Grid
          args={[50, 50]}
          cellSize={2}
          cellThickness={0.5}
          cellColor="#444444"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#666666"
          fadeDistance={100}
          fadeStrength={1}
        />

        {/* Room Outline */}
        <RoomOutline shape={selectedShape} size={10} />

        {/* Entry Points */}
        {entryPoints.map((entryPoint, index) => (
          <AngularEntryPointMarker
            key={entryPoint.id}
            entryPoint={entryPoint}
            showAngle={showAngles}
            index={index}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={100}
        />
      </Canvas>
    </div>
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
          <cylinderGeometry args={[halfSize, halfSize, 0.1, 32]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );

    case "hexagon":
      return (
        <mesh>
          <cylinderGeometry args={[halfSize, halfSize, 0.1, 6]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );

    case "octagon":
      return (
        <mesh>
          <cylinderGeometry args={[halfSize, halfSize, 0.1, 8]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );

    case "triangle":
      return (
        <mesh>
          <cylinderGeometry args={[halfSize, halfSize, 0.1, 3]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );

    case "diamond":
      return (
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[halfSize * 1.4, 0.1, halfSize * 1.4]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
      );

    default: // square
      return (
        <mesh>
          <boxGeometry args={[size, 0.1, size]} />
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
  index: number;
}> = ({ entryPoint, showAngle, index }) => {
  const { position, angle, isActive, isDiagonal } = entryPoint;
  const color = isActive ? "#00ff00" : isDiagonal ? "#ff8800" : "#ffff00";
  const emissiveColor = isActive
    ? "#00aa00"
    : isDiagonal
    ? "#aa4400"
    : "#aaaa00";

  // Direction vector for arrow
  const direction = angleToDirection(angle);

  return (
    <group position={[position.x, 0.5, position.z]}>
      {/* Entry point sphere */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
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
        position={[direction.x * 0.6, 0, direction.z * 0.6]}
        rotation={[0, (angle * Math.PI) / 180, 0]}
      >
        <coneGeometry args={[0.15, 0.4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Vertical line */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 1, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Labels */}
      {showAngle && (
        <>
          <Text
            position={[0, 1.5, 0]}
            fontSize={0.2}
            color="white"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            {angle}°
          </Text>
          <Text
            position={[0, 1.2, 0]}
            fontSize={0.15}
            color={isDiagonal ? "#ff8800" : "#ffff00"}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            {isDiagonal ? "DIAG" : "CARD"}
          </Text>
          <Text
            position={[0, 0.9, 0]}
            fontSize={0.12}
            color="#aaaaaa"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.01}
            outlineColor="#000000"
          >
            #{index}
          </Text>
        </>
      )}
    </group>
  );
};

export default AngularEntryPointExample;

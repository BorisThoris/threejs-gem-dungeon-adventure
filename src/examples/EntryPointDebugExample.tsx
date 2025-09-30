import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import {
  MapEntryPointDebugger,
  validateEntryPoints,
  logEntryPointInfo,
} from "../utils/entryPointDebugger";
import useMapStore from "../store/mapStore";

/**
 * Example component showing how to use the Entry Point Debug system
 * This can be toggled on/off in development mode
 */
export const EntryPointDebugExample: React.FC = () => {
  const { currentMap } = useMapStore();
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [showConnections, setShowConnections] = useState(true);

  const handleValidate = () => {
    if (!currentMap) {
      console.warn("No map loaded to validate");
      return;
    }

    const validation = validateEntryPoints(currentMap.rooms);

    console.group("Entry Point Validation Results");
    console.log(`Valid: ${validation.valid ? "✅" : "❌"}`);

    if (validation.errors.length > 0) {
      console.group("Errors:");
      validation.errors.forEach((error) => console.error(error));
      console.groupEnd();
    }

    if (validation.warnings.length > 0) {
      console.group("Warnings:");
      validation.warnings.forEach((warning) => console.warn(warning));
      console.groupEnd();
    }

    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      console.log("All entry points are valid! ✨");
    }

    console.groupEnd();
  };

  const handleLogAllEntryPoints = () => {
    if (!currentMap) {
      console.warn("No map loaded");
      return;
    }

    console.group("All Entry Points in Map");
    currentMap.rooms.forEach((room) => {
      logEntryPointInfo(room);
    });
    console.groupEnd();
  };

  if (!currentMap) {
    return (
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontFamily: "monospace",
        }}
      >
        No map loaded. Generate a map to see entry points.
      </div>
    );
  }

  return (
    <>
      {/* Debug Controls Panel */}
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
          minWidth: "250px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
          🔍 Entry Point Debugger
        </h3>

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
              checked={debugEnabled}
              onChange={(e) => setDebugEnabled(e.target.checked)}
              style={{ marginRight: "8px" }}
            />
            Show Entry Points
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "5px",
              marginLeft: "20px",
            }}
          >
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              disabled={!debugEnabled}
              style={{ marginRight: "8px" }}
            />
            Show Labels
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              marginLeft: "20px",
            }}
          >
            <input
              type="checkbox"
              checked={showConnections}
              onChange={(e) => setShowConnections(e.target.checked)}
              disabled={!debugEnabled}
              style={{ marginRight: "8px" }}
            />
            Show Connections
          </label>
        </div>

        <div
          style={{
            borderTop: "1px solid #444",
            paddingTop: "10px",
            marginTop: "10px",
          }}
        >
          <button
            onClick={handleValidate}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "5px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Validate Entry Points
          </button>

          <button
            onClick={handleLogAllEntryPoints}
            style={{
              width: "100%",
              padding: "8px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              fontSize: "11px",
            }}
          >
            Log All Entry Points
          </button>
        </div>

        <div
          style={{
            borderTop: "1px solid #444",
            paddingTop: "10px",
            marginTop: "10px",
            fontSize: "10px",
          }}
        >
          <div>Rooms: {currentMap.rooms.length}</div>
          <div>
            Total Entry Points:{" "}
            {currentMap.rooms.reduce(
              (sum, r) => sum + (r.entryPoints?.length || 0),
              0
            )}
          </div>
          <div>
            Active:{" "}
            {currentMap.rooms.reduce(
              (sum, r) =>
                sum + (r.entryPoints?.filter((ep) => ep.isActive).length || 0),
              0
            )}
          </div>
        </div>
      </div>

      {/* Entry Point Visualization in 3D Scene */}
      {debugEnabled && (
        <MapEntryPointDebugger
          rooms={currentMap.rooms}
          enabled={debugEnabled}
          showLabels={showLabels}
          showConnections={showConnections}
        />
      )}
    </>
  );
};

/**
 * Standalone debug scene for testing entry points
 */
export const EntryPointDebugScene: React.FC = () => {
  const { currentMap } = useMapStore();

  return (
    <Canvas camera={{ position: [0, 50, 50], fov: 50 }}>
      <color attach="background" args={["#1a1a1a"]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, 10, -5]} intensity={0.5} />

      {/* Grid for reference */}
      <Grid
        args={[100, 100]}
        cellSize={5}
        cellThickness={0.5}
        cellColor="#444444"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#666666"
        fadeDistance={200}
        fadeStrength={1}
        followCamera={false}
      />

      {/* Entry Point Debugger */}
      {currentMap && (
        <MapEntryPointDebugger
          rooms={currentMap.rooms}
          enabled={true}
          showLabels={true}
          showConnections={true}
        />
      )}

      {/* Room wireframes for context */}
      {currentMap?.rooms.map((room) => (
        <mesh key={room.id} position={[room.position.x, 0, room.position.z]}>
          <boxGeometry args={[room.size, 0.1, room.size]} />
          <meshBasicMaterial color="#333333" wireframe />
        </mesh>
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
  );
};

export default EntryPointDebugExample;

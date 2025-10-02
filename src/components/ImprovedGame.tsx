import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls, Sky, Environment } from "@react-three/drei";
import * as THREE from "three";

// Import improved components
import ImprovedRoomManager from "./ImprovedRoomManager";
import NavigationHistory from "./NavigationHistory";
import RoomPerformanceMonitor from "./RoomPerformanceMonitor";
import { SafeFirstPersonPlayer } from "./SafeFirstPersonPlayer";
import GameUI from "./GameUI";
import DoorStyleSelector, { type DoorStyle } from "./DoorStyleSelector";
import { roomNavigationSystem } from "../systems/RoomNavigationSystem";

interface ImprovedGameProps {
  showDebugInfo?: boolean;
  showPerformanceMonitor?: boolean;
  showNavigationHistory?: boolean;
  showDoorStyleSelector?: boolean;
}

const ImprovedGame: React.FC<ImprovedGameProps> = ({
  showDebugInfo = false,
  showPerformanceMonitor = false,
  showNavigationHistory = true,
  showDoorStyleSelector = true,
}) => {
  const [playerPosition, setPlayerPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [doorStyle, setDoorStyle] = useState<DoorStyle>("wooden");

  // Initialize the game
  useEffect(() => {
    const initializeGame = async () => {
      try {
        // Set up room navigation system event listeners
        const handleRoomChanged = ({
          currentRoomId: roomId,
        }: {
          currentRoomId: string;
        }) => {
          setCurrentRoomId(roomId);
        };

        const handleTransitionStarted = (transition: any) => {};

        const handleTransitionCompleted = ({
          roomId,
        }: {
          roomId: string;
        }) => {};

        // Add event listeners
        roomNavigationSystem.on("roomChanged", handleRoomChanged);
        roomNavigationSystem.on("transitionStarted", handleTransitionStarted);
        roomNavigationSystem.on(
          "transitionCompleted",
          handleTransitionCompleted
        );

        setIsInitialized(true);

        return () => {
          // Cleanup
          roomNavigationSystem.off("roomChanged", handleRoomChanged);
          roomNavigationSystem.off(
            "transitionStarted",
            handleTransitionStarted
          );
          roomNavigationSystem.off(
            "transitionCompleted",
            handleTransitionCompleted
          );
        };
      } catch (error) {
        console.error("Failed to initialize improved game:", error);
      }
    };

    initializeGame();
  }, []);

  // Handle room changes
  const handleRoomChange = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  // Handle door hover
  const handleDoorHover = (doorId: string, isHovered: boolean) => {
    if (showDebugInfo) {
    }
  };

  // Handle navigation history selection
  const handleRoomSelect = (roomId: string) => {};

  // Handle door style change
  const handleDoorStyleChange = (style: DoorStyle) => {
    setDoorStyle(style);
    roomNavigationSystem.setDefaultDoorStyle(style);
  };

  if (!isInitialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#000",
          color: "#fff",
          fontFamily: "monospace",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "24px", marginBottom: "20px" }}>
            🚀 Initializing Improved Game System...
          </div>
          <div style={{ fontSize: "14px", opacity: 0.7 }}>
            Loading room navigation system...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 1.6, 0],
          fov: 75,
          near: 0.1,
          far: 1000,
        }}
        shadows
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ camera }) => {
          camera.position.set(0, 1.6, 0);
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <pointLight position={[0, 10, 0]} intensity={0.5} />

        {/* Environment */}
        <Sky
          distance={450000}
          sunPosition={[0, 1, 0]}
          inclination={0}
          azimuth={0.25}
        />
        <Environment preset="sunset" />

        {/* Physics World */}
        <Physics gravity={[0, -9.81, 0]} debug={showDebugInfo}>
          {/* Improved Room Manager */}
          <ImprovedRoomManager
            playerPosition={playerPosition}
            onRoomChange={handleRoomChange}
            onDoorHover={handleDoorHover}
          />

          {/* Player */}
          <SafeFirstPersonPlayer
            initialSpawnPosition={[0, 0.5, 0]}
            showDebugInfo={showDebugInfo}
          />
        </Physics>

        {/* Orbit Controls for debugging */}
        {showDebugInfo && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            maxPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>

      {/* UI Components */}
      <GameUI
        currentRoomId={currentRoomId}
        playerPosition={playerPosition}
        onPositionUpdate={setPlayerPosition}
      />

      {/* Navigation History */}
      {showNavigationHistory && (
        <NavigationHistory
          onRoomSelect={handleRoomSelect}
          maxHistoryItems={5}
          showRoomNames={true}
        />
      )}

      {/* Performance Monitor */}
      {showPerformanceMonitor && (
        <RoomPerformanceMonitor
          show={true}
          position="top-right"
          updateInterval={1000}
        />
      )}

      {/* Door Style Selector */}
      {showDoorStyleSelector && (
        <DoorStyleSelector
          currentStyle={doorStyle}
          onStyleChange={handleDoorStyleChange}
          show={true}
          position="bottom-left"
        />
      )}

      {/* Debug Info */}
      {showDebugInfo && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "12px",
            zIndex: 1000,
          }}
        >
          <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
            🐛 Debug Info
          </div>
          <div>Current Room: {currentRoomId || "None"}</div>
          <div>
            Player Position:{" "}
            {playerPosition.map((p) => p.toFixed(2)).join(", ")}
          </div>
          <div>Navigation System: ✅ Active</div>
          <div>
            Room Instances: {roomNavigationSystem.getState().roomInstances.size}
          </div>
          <div>Active Doors: {roomNavigationSystem.getState().doors.size}</div>
        </div>
      )}

      {/* Instructions */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          zIndex: 1000,
          maxWidth: "300px",
        }}
      >
        <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
          🎮 Controls
        </div>
        <div>WASD - Move</div>
        <div>Space - Jump</div>
        <div>Shift - Run</div>
        <div>Mouse - Look around</div>
        <div>E - Interact with doors</div>
        <div>Right-click - Enable mouse look</div>
        <div style={{ marginTop: "8px", opacity: 0.7 }}>
          Use navigation history to go back to previous rooms
        </div>
      </div>
    </div>
  );
};

export default ImprovedGame;

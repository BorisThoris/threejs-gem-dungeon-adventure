import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls, Sky, Environment } from "@react-three/drei";

// Import improved components
import { Player } from "./Player";
import GameUI from "./GameUI";
import RoomManager from "./RoomManager";

interface ImprovedGameProps {
  showDebugInfo?: boolean;
}

const ImprovedGame: React.FC<ImprovedGameProps> = ({
  showDebugInfo = false,
}) => {
  const [playerPosition, setPlayerPosition] = useState<
    [number, number, number]
  >([0, 0, 0]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the game
  useEffect(() => {
    setIsInitialized(true);
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
          {/* Simple Room Manager */}
          <RoomManager onRoomChange={handleRoomChange} />

          {/* Player */}
          <Player
            initialSpawnPosition={[0, 1.5, 0]}
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
        playerStats={{
          lives: 3,
          maxLives: 3,
          points: 0,
          keys: 0,
          bombs: 0,
          level: 1,
          experience: 0,
          streak: 0,
          maxStreak: 0,
          size: 1,
          speed: 1,
          strength: 1,
          defense: 1,
          luck: 1,
          buffs: {
            speedBoost: 0,
            strengthBoost: 0,
            defenseBoost: 0,
            luckBoost: 0,
          },
        }}
        inventory={[]}
        currentRoom={currentRoomId || undefined}
      />

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
          <div>Room System: ✅ SimpleRoomManager Active</div>
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

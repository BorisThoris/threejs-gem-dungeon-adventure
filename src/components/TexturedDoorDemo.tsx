import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import TexturedDoor from "./TexturedDoor";
import DoorStyleSelector, { type DoorStyle } from "./DoorStyleSelector";

const TexturedDoorDemo: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<DoorStyle>("wooden");
  const [hoveredDoor, setHoveredDoor] = useState<string | null>(null);

  const doors = [
    {
      id: "north_door",
      position: [0, 0.5, -5] as [number, number, number],
      rotation: [0, 0, 0] as [number, number, number],
      targetRoomId: "north_room",
      direction: "north" as const,
      isLocked: false,
    },
    {
      id: "south_door",
      position: [0, 0.5, 5] as [number, number, number],
      rotation: [0, Math.PI, 0] as [number, number, number],
      targetRoomId: "south_room",
      direction: "south" as const,
      isLocked: true,
      keyRequired: "gold_key",
    },
    {
      id: "east_door",
      position: [5, 0.5, 0] as [number, number, number],
      rotation: [0, Math.PI / 2, 0] as [number, number, number],
      targetRoomId: "east_room",
      direction: "east" as const,
      isLocked: false,
    },
    {
      id: "west_door",
      position: [-5, 0.5, 0] as [number, number, number],
      rotation: [0, -Math.PI / 2, 0] as [number, number, number],
      targetRoomId: "west_room",
      direction: "west" as const,
      isLocked: false,
    },
  ];

  const handleDoorClick = (doorId: string, targetRoomId: string) => {
    // Door clicked
    alert(`You clicked the ${doorId}! This would take you to ${targetRoomId}.`);
  };

  const handleDoorHover = (doorId: string, isHovered: boolean) => {
    setHoveredDoor(isHovered ? doorId : null);
  };

  const handleStyleChange = (style: DoorStyle) => {
    setSelectedStyle(style);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* 3D Canvas */}
      <Canvas
        camera={{
          position: [0, 2, 8],
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
        <Physics gravity={[0, -9.81, 0]}>
          {/* Ground */}
          <mesh position={[0, -2, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshLambertMaterial color="#4A4A4A" />
          </mesh>

          {/* Walls */}
          <mesh position={[0, 1, -6]} receiveShadow>
            <boxGeometry args={[12, 4, 0.2]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 1, 6]} receiveShadow>
            <boxGeometry args={[12, 4, 0.2]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[-6, 1, 0]} receiveShadow>
            <boxGeometry args={[0.2, 4, 12]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>
          <mesh position={[6, 1, 0]} receiveShadow>
            <boxGeometry args={[0.2, 4, 12]} />
            <meshLambertMaterial color="#8B4513" />
          </mesh>

          {/* Textured Doors */}
          {doors.map((door) => (
            <TexturedDoor
              key={door.id}
              id={door.id}
              position={door.position}
              rotation={door.rotation}
              targetRoomId={door.targetRoomId}
              direction={door.direction}
              isLocked={door.isLocked}
              keyRequired={door.keyRequired}
              onDoorClick={handleDoorClick}
              onDoorHover={handleDoorHover}
              playerPosition={[0, 0, 0]}
              interactionDistance={5}
              showLabel={true}
              doorStyle={selectedStyle}
            />
          ))}
        </Physics>

        {/* Orbit Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>

      {/* Door Style Selector */}
      <DoorStyleSelector
        currentStyle={selectedStyle}
        onStyleChange={handleStyleChange}
        show={true}
        position="top-left"
      />

      {/* Instructions */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "12px",
          zIndex: 1000,
          maxWidth: "300px",
        }}
      >
        <div
          style={{ marginBottom: "10px", fontWeight: "bold", color: "#00FFFF" }}
        >
          🚪 Textured Door Demo
        </div>

        <div style={{ marginBottom: "8px" }}>
          <strong>Features:</strong>
        </div>
        <div>• 5 different door styles</div>
        <div>• Procedural textures</div>
        <div>• 3D door frames and handles</div>
        <div>• Locked door support</div>
        <div>• Proximity detection</div>
        <div>• Interactive hover effects</div>

        <div style={{ marginTop: "10px", marginBottom: "8px" }}>
          <strong>Controls:</strong>
        </div>
        <div>• Mouse: Orbit around</div>
        <div>• Click doors to interact</div>
        <div>• E key when near doors</div>
        <div>• Change style with selector</div>

        <div style={{ marginTop: "10px", fontSize: "10px", opacity: 0.7 }}>
          Hover over doors to see interaction prompts
        </div>
      </div>

      {/* Hovered Door Info */}
      {hoveredDoor && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "20px",
            background: "rgba(0, 255, 0, 0.9)",
            color: "black",
            padding: "10px",
            borderRadius: "8px",
            fontFamily: "monospace",
            fontSize: "12px",
            zIndex: 1000,
            fontWeight: "bold",
          }}
        >
          🎯 Hovering: {hoveredDoor}
        </div>
      )}
    </div>
  );
};

export default TexturedDoorDemo;

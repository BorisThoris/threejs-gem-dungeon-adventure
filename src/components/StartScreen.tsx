import React from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import { BasicFirstPersonPlayer } from "./BasicFirstPersonPlayer";
import { SafeSpawnArea } from "./SafeSpawnArea";
import MapContainer from "./MapContainer";
import MapUI from "./MapUI";
import Cursor from "./Cursor";
import PauseMenu from "./PauseMenu";
import EventDrivenActionCards from "./EventDrivenActionCards";
import RoomDetectionDebugger from "./RoomDetectionDebugger";
import SharedNavigation from "./SharedNavigation";
import SimpleDynamicBreaking from "./SimpleDynamicBreaking";
import SimpleBreakableRoomV2 from "./rooms/SimpleBreakableRoomV2";
import useGameStore from "../store/gameStore";
import useMapStore from "../store/mapStore";
import { domUIManager } from "../utils/domUIManager";
import { uiEvents, UI_EVENTS } from "../utils/uiEvents";
import { useObjectPrototypeActions } from "../utils/SimplePrototypeMixin";

// First-person controls handled by FirstPersonPlayer component

// Ground Plane Component with Prototype
const Ground: React.FC = () => {
  const { executeAction } = useObjectPrototypeActions("demo_floor");

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
        onClick={() => {
          console.log("Floor clicked! Prototype actions available.");
          executeAction("glow", { intensity: 1.5 });
        }}
        onPointerOver={() => {
          console.log("Floor hovered!");
        }}
      >
        <planeGeometry args={[50, 50]} />
        <meshLambertMaterial color="#2d5016" />
      </mesh>
    </RigidBody>
  );
};

// Safety Floor - very large invisible catch plane to prevent falling
const SafetyFloor: React.FC = () => {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -10, 0]}
        visible={false}
      >
        <planeGeometry args={[2000, 2000]} />
        <meshBasicMaterial color="#000000" transparent opacity={0} />
      </mesh>
    </RigidBody>
  );
};

// Prototype Demo Component
const PrototypeDemo: React.FC<{
  showBreakingDemo: boolean;
  setShowBreakingDemo: (show: boolean) => void;
  showBreakableRoom: boolean;
  setShowBreakableRoom: (show: boolean) => void;
}> = ({
  showBreakingDemo,
  setShowBreakingDemo,
  showBreakableRoom,
  setShowBreakableRoom,
}) => {
  const { executeAction } = useObjectPrototypeActions("demo_floor");

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        border: "1px solid rgba(255,255,255,0.2)",
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#4CAF50" }}>
        🎯 Prototype System Demo
      </h3>
      <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#ccc" }}>
        Click the floor in the 3D scene to see prototype actions!
      </p>
      <div
        style={{
          display: "flex",
          gap: "5px",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        <button
          onClick={() => executeAction("paint", { color: "#FF0000" })}
          style={{
            padding: "5px 10px",
            background: "#F44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          🔴 Red
        </button>
        <button
          onClick={() => executeAction("paint", { color: "#00FF00" })}
          style={{
            padding: "5px 10px",
            background: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          🟢 Green
        </button>
        <button
          onClick={() => executeAction("rotate")}
          style={{
            padding: "5px 10px",
            background: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          🔄 Rotate
        </button>
        <button
          onClick={() => executeAction("scale", { factor: 1.2 })}
          style={{
            padding: "5px 10px",
            background: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          📏 Scale
        </button>
        <button
          onClick={() => executeAction("glow", { intensity: 2.0 })}
          style={{
            padding: "5px 10px",
            background: "#9C27B0",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          ✨ Glow
        </button>
      </div>

      {/* Breaking System Demo Buttons */}
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
        <button
          onClick={() => setShowBreakingDemo(!showBreakingDemo)}
          style={{
            padding: "5px 10px",
            background: showBreakingDemo ? "#FF5722" : "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          {showBreakingDemo ? "💥 Hide Breaking Demo" : "💥 Show Breaking Demo"}
        </button>
        <button
          onClick={() => setShowBreakableRoom(!showBreakableRoom)}
          style={{
            padding: "5px 10px",
            background: showBreakableRoom ? "#E91E63" : "#9C27B0",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          {showBreakableRoom
            ? "🏠 Hide Breakable Room"
            : "🏠 Show Breakable Room"}
        </button>
      </div>
    </div>
  );
};

// Main Scene Component
const GhostScene: React.FC<{
  showBreakingDemo: boolean;
  showBreakableRoom: boolean;
}> = ({ showBreakingDemo, showBreakableRoom }) => {
  return (
    <>
      {/* Environment */}
      <Environment files="./night.hdr" ground={{ scale: 100 }} />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight
        intensity={0.7}
        castShadow
        shadow-bias={-0.0004}
        position={[-20, 20, 20]}
      >
        <orthographicCamera attach="shadow-camera" args={[-20, 20, 20, -20]} />
      </directionalLight>

      {/* Physics World */}
      <Physics timeStep="vary" gravity={[0, -9.81, 0]}>
        {/* Safe Spawn Area */}
        <SafeSpawnArea position={[0, 0, 0]} size={8} />

        {/* Basic First Person Player */}
        <BasicFirstPersonPlayer />

        {/* Generated Map - Centered by algorithm */}
        <MapContainer centerMap={false} />

        {/* Ground */}
        <Ground />

        {/* Safety catch floor (invisible) */}
        <SafetyFloor />

        {/* Breaking System Demos */}
        {showBreakingDemo && (
          <group position={[0, 0, 0]}>
            <SimpleDynamicBreaking />
          </group>
        )}

        {showBreakableRoom && (
          <group position={[0, 0, 0]}>
            <SimpleBreakableRoomV2 />
          </group>
        )}
      </Physics>
    </>
  );
};

const StartScreen: React.FC = () => {
  console.log("=== STARTSCREEN COMPONENT LOADED ===");
  console.log(
    "Environment:",
    window.navigator.userAgent.toLowerCase().includes("electron")
      ? "Electron"
      : "Web Browser"
  );

  const { inventory, useItem: consumeItem } = useGameStore();
  const { generateMap, currentMap } = useMapStore();
  const [isPaused, setIsPaused] = React.useState(false);
  const [showBreakingDemo, setShowBreakingDemo] = React.useState(false);
  const [showBreakableRoom, setShowBreakableRoom] = React.useState(false);

  // Initialize DOM UI manager
  React.useEffect(() => {
    domUIManager.init();

    // Listen for item use events from DOM UI
    const handleItemUse = (event: CustomEvent) => {
      consumeItem(event.detail.id);
    };

    window.addEventListener("itemUse", handleItemUse as EventListener);

    return () => {
      window.removeEventListener("itemUse", handleItemUse as EventListener);
      domUIManager.destroy();
    };
  }, [consumeItem]);

  // Generate map on component mount
  React.useEffect(() => {
    if (!currentMap) {
      generateMap();
    }
  }, [currentMap, generateMap]);

  // Update UI when inventory changes (throttled)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      uiEvents.emit(UI_EVENTS.INVENTORY_UPDATE, inventory);
    }, 100); // Throttle updates

    return () => clearTimeout(timeoutId);
  }, [inventory]);

  // Player stats are now handled by ref-based state (no React re-renders)

  // Item use is now handled by DOM UI manager

  // Handle pause/unpause
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleUnpause = () => {
    setIsPaused(false);
  };

  // Listen for X key to pause/unpause
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "x" || event.key === "X") {
        if (isPaused) {
          handleUnpause();
        } else {
          handlePause();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isPaused]);

  console.log("=== RENDERING STARTSCREEN ===");
  console.log("Is paused:", isPaused);
  console.log("Current map:", currentMap ? "exists" : "null");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "linear-gradient(to bottom, #87CEEB 0%, #98D8E8 100%)",
        position: "fixed",
        top: 0,
        left: 0,
        cursor: "none", // Hide default cursor
      }}
    >
      {!isPaused &&
        (() => {
          console.log("=== RENDERING CANVAS ===");
          return (
            <Canvas
              shadows
              style={{
                width: "100%",
                height: "100%",
                background: "transparent",
                display: "block",
                cursor: "default", // Show default cursor in free hand mode
              }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
                stencil: false,
                depth: true,
              }}
              camera={{
                fov: 95,
                position: [0, 5, 0],
                rotation: [0, -Math.PI / 2, 0], // Look straight ahead
              }}
              dpr={[1, 2]}
              performance={{ min: 0.5 }}
              frameloop="demand"
              onCreated={({ gl, scene, camera }) => {
                console.log("=== CANVAS ONCREATED CALLBACK FIRED ===");
                // Comprehensive debugging
                console.log("=== THREE.JS CANVAS DEBUG ===");
                console.log("Three.js Canvas created");
                console.log("WebGL Context:", gl.getContext());
                console.log("Renderer Info:", gl.info);
                console.log("Scene children count:", scene.children.length);
                console.log("Camera position:", camera.position);
                console.log("Camera rotation:", camera.rotation);

                // Check if we're in Electron
                const isElectron = window.navigator.userAgent
                  .toLowerCase()
                  .includes("electron");
                console.log(
                  "Environment:",
                  isElectron ? "Electron" : "Web Browser"
                );

                if (isElectron) {
                  console.log("=== ELECTRON-SPECIFIC DEBUG ===");
                  console.log("User Agent:", window.navigator.userAgent);
                  console.log("WebGL Context:", gl.getContext());
                  console.log(
                    "WebGL Extensions:",
                    gl.getContext().getSupportedExtensions()
                  );

                  // Test basic WebGL functionality
                  const canvas = gl.domElement;
                  const context =
                    canvas.getContext("webgl") ||
                    canvas.getContext("experimental-webgl");
                  if (context) {
                    console.log("WebGL Test Results:", {
                      version: context.getParameter(context.VERSION),
                      vendor: context.getParameter(context.VENDOR),
                      renderer: context.getParameter(context.RENDERER),
                      maxTextureSize: context.getParameter(
                        context.MAX_TEXTURE_SIZE
                      ),
                      maxVertexAttribs: context.getParameter(
                        context.MAX_VERTEX_ATTRIBS
                      ),
                    });
                  }
                }

                // Monitor scene changes
                const originalAdd = scene.add.bind(scene);
                scene.add = function (object) {
                  console.log(
                    "Adding object to scene:",
                    object.type,
                    object.name || "unnamed"
                  );
                  return originalAdd(object);
                };
              }}
            >
              <GhostScene
                showBreakingDemo={showBreakingDemo}
                showBreakableRoom={showBreakableRoom}
              />
            </Canvas>
          );
        })()}

      {/* Event-Driven Action Cards */}
      <EventDrivenActionCards />

      {/* Map UI Overlay */}
      <MapUI />

      {/* Cursor - Outside Canvas so it's always visible */}
      {!isPaused && <Cursor />}

      {/* Pause Menu */}
      <PauseMenu isVisible={isPaused} onUnpause={handleUnpause} />

      {/* Room Detection Debugger - Enable with 'D' key */}
      <RoomDetectionDebugger enabled={true} />

      {/* Shared Navigation */}
      <SharedNavigation currentPage="game" />

      {/* Prototype System Demo */}
      <PrototypeDemo
        showBreakingDemo={showBreakingDemo}
        setShowBreakingDemo={setShowBreakingDemo}
        showBreakableRoom={showBreakableRoom}
        setShowBreakableRoom={setShowBreakableRoom}
      />

      {/* UI is now handled by DOM UI Manager - no React re-renders */}
    </div>
  );
};

export default StartScreen;

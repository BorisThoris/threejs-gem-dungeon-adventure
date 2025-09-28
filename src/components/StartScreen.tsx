import React from "react";
import { Canvas } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import { Environment } from "@react-three/drei";
import { SafeFirstPersonPlayer } from "./SafeFirstPersonPlayer";
import { SafeSpawnArea } from "./SafeSpawnArea";
import MapContainer from "./MapContainer";
import MapUI from "./MapUI";
import Cursor from "./Cursor";
import PauseMenu from "./PauseMenu";
import EventDrivenActionCards from "./EventDrivenActionCards";
import RoomDetectionDebugger from "./RoomDetectionDebugger";
import SharedNavigation from "./SharedNavigation";
import CleanBreakableRoom from "./primitives/rooms/CleanBreakableRoom";
import OptionalBreakingDemo from "./primitives/rooms/OptionalBreakingDemo";
import AllBreakableDemo from "./primitives/rooms/AllBreakableDemo";
import UniversalBreakableDemo from "./primitives/rooms/UniversalBreakableDemo";
import useGameStore from "../store/gameStore";
import useMapStore from "../store/mapStore";
import { domUIManager } from "../utils/domUIManager";
import { uiEvents, UI_EVENTS } from "../utils/uiEvents";
import {
  BreakingProvider,
  useBreakingContext,
} from "../contexts/BreakingContext";

// First-person controls handled by FirstPersonPlayer component

// Ground Plane Component
const Ground: React.FC = () => {
  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2, 0]}
        receiveShadow
        onClick={() => {
          console.log("Floor clicked!");
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

// Breaking System Demo Component
const BreakingDemo: React.FC<{
  showBreakableRoom: boolean;
  setShowBreakableRoom: (show: boolean) => void;
  showOptionalBreaking: boolean;
  setShowOptionalBreaking: (show: boolean) => void;
  showAllBreakable: boolean;
  setShowAllBreakable: (show: boolean) => void;
  showUniversalBreakable: boolean;
  setShowUniversalBreakable: (show: boolean) => void;
}> = ({
  showBreakableRoom,
  setShowBreakableRoom,
  showOptionalBreaking,
  setShowOptionalBreaking,
  showAllBreakable,
  setShowAllBreakable,
  showUniversalBreakable,
  setShowUniversalBreakable,
}) => {
  const { globalBreakingEnabled, toggleGlobalBreaking } = useBreakingContext();
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
        💥 Breaking Systems
      </h3>
      <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#ccc" }}>
        Try different breaking systems!
      </p>

      {/* Global Breaking Toggle */}
      <div
        style={{
          marginBottom: "10px",
          padding: "8px",
          background: "rgba(255,255,255,0.1)",
          borderRadius: "4px",
        }}
      >
        <button
          onClick={toggleGlobalBreaking}
          style={{
            padding: "8px 16px",
            background: globalBreakingEnabled ? "#FF5722" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            width: "100%",
          }}
        >
          🌍 Global Breaking: {globalBreakingEnabled ? "ON" : "OFF"}
        </button>
        <p
          style={{
            margin: "5px 0 0 0",
            fontSize: "10px",
            color: "#ccc",
            textAlign: "center",
          }}
        >
          Toggle breaking for ALL 3D objects in the game
        </p>
      </div>

      {/* Breaking System Demo Buttons */}
      <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
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
        <button
          onClick={() => setShowOptionalBreaking(!showOptionalBreaking)}
          style={{
            padding: "5px 10px",
            background: showOptionalBreaking ? "#FF5722" : "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          {showOptionalBreaking
            ? "⚙️ Hide Optional Breaking"
            : "⚙️ Show Optional Breaking"}
        </button>
        <button
          onClick={() => setShowAllBreakable(!showAllBreakable)}
          style={{
            padding: "5px 10px",
            background: showAllBreakable ? "#8BC34A" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          {showAllBreakable ? "🏆 Hide All Breakable" : "🏆 Show All Breakable"}
        </button>
        <button
          onClick={() => setShowUniversalBreakable(!showUniversalBreakable)}
          style={{
            padding: "5px 10px",
            background: showUniversalBreakable ? "#9C27B0" : "#673AB7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "11px",
          }}
        >
          {showUniversalBreakable
            ? "🌍 Hide Universal Breaking"
            : "🌍 Show Universal Breaking"}
        </button>
      </div>
    </div>
  );
};

// Main Scene Component
const GhostScene: React.FC<{
  showBreakableRoom: boolean;
  showOptionalBreaking: boolean;
  showAllBreakable: boolean;
  showUniversalBreakable: boolean;
}> = ({
  showBreakableRoom,
  showOptionalBreaking,
  showAllBreakable,
  showUniversalBreakable,
}) => {
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

        {/* Safe First Person Player */}
        <SafeFirstPersonPlayer
          initialSpawnPosition={[0, 1, 0]}
          showDebugInfo={true}
        />

        {/* Generated Map - Centered by algorithm */}
        <MapContainer centerMap={false} />

        {/* Ground */}
        <Ground />

        {/* Safety catch floor (invisible) */}
        <SafetyFloor />

        {/* Clean Breaking System Demo */}
        {showBreakableRoom && (
          <group position={[0, 0, 0]}>
            <CleanBreakableRoom />
          </group>
        )}

        {/* Optional Breaking System Demo */}
        {showOptionalBreaking && (
          <group position={[0, 0, 0]}>
            <OptionalBreakingDemo />
          </group>
        )}

        {/* All Breakable Objects Demo */}
        {showAllBreakable && (
          <group position={[0, 0, 0]}>
            <AllBreakableDemo />
          </group>
        )}

        {/* Universal Breaking Demo */}
        {showUniversalBreakable && (
          <group position={[0, 0, 0]}>
            <UniversalBreakableDemo />
          </group>
        )}
      </Physics>
    </>
  );
};

const StartScreenContent: React.FC = () => {
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
  const [showBreakableRoom, setShowBreakableRoom] = React.useState(false);
  const [showOptionalBreaking, setShowOptionalBreaking] = React.useState(false);
  const [showAllBreakable, setShowAllBreakable] = React.useState(false);
  const [showUniversalBreakable, setShowUniversalBreakable] =
    React.useState(false);

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
                showBreakableRoom={showBreakableRoom}
                showOptionalBreaking={showOptionalBreaking}
                showAllBreakable={showAllBreakable}
                showUniversalBreakable={showUniversalBreakable}
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

      {/* Breaking System Demo */}
      <BreakingDemo
        showBreakableRoom={showBreakableRoom}
        setShowBreakableRoom={setShowBreakableRoom}
        showOptionalBreaking={showOptionalBreaking}
        setShowOptionalBreaking={setShowOptionalBreaking}
        showAllBreakable={showAllBreakable}
        setShowAllBreakable={setShowAllBreakable}
        showUniversalBreakable={showUniversalBreakable}
        setShowUniversalBreakable={setShowUniversalBreakable}
      />

      {/* UI is now handled by DOM UI Manager - no React re-renders */}
    </div>
  );
};

const StartScreen: React.FC = () => {
  return (
    <BreakingProvider>
      <StartScreenContent />
    </BreakingProvider>
  );
};

export default StartScreen;

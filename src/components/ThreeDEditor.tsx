import React, { useState, useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";

// Import all room components
import StartRoom from "./rooms/StartRoom";
import MeditationRoom from "./rooms/MeditationRoom";
import BenchPressRoom from "./rooms/BenchPressRoom";
import LibraryRoom from "./rooms/LibraryRoom";
import ShopRoom from "./rooms/ShopRoom";
import TreasureRoom from "./rooms/TreasureRoom";
import PuzzleRoom from "./rooms/PuzzleRoom";
import BossRoom from "./rooms/BossRoom";
import CoffeeRoom from "./rooms/CoffeeRoom";
import ChallengeRoom from "./rooms/ChallengeRoom";
import LibraryUpgradeRoom from "./rooms/LibraryUpgradeRoom";
import PortalRoom from "./rooms/PortalRoom";
import ArenaRoom from "./rooms/ArenaRoom";
import EnemyRoom from "./rooms/EnemyRoom";
import EndRoom from "./rooms/EndRoom";
import SpecialRoom from "./rooms/SpecialRoom";
import CorridorRoom from "./rooms/CorridorRoom";
import ColosseumRoom from "./rooms/ColosseumRoom";
import ShapedShell from "./rooms/ShapedShell";

// Import other 3D components
import ItemSprite from "./ItemSprite";
import DestructibleWall from "./DestructibleWall";
import ParticleSystem from "./ParticleSystem";

// Room configuration interface
interface RoomConfig {
  type: string;
  component: React.ComponentType<any>;
  title: string;
  emoji: string;
  description: string;
  props?: any;
}

// Available room configurations
const ROOM_CONFIGS: RoomConfig[] = [
  {
    type: "start",
    component: StartRoom,
    title: "Start Room",
    emoji: "🚀",
    description: "The beginning of your journey",
  },
  {
    type: "corridor",
    component: CorridorRoom,
    title: "Corridor",
    emoji: "🧱",
    description: "A simple connecting passage",
    props: { size: 8 },
  },
  {
    type: "colosseum",
    component: ColosseumRoom,
    title: "Colosseum",
    emoji: "🏟️",
    description: "A grand arena for battles",
    props: { size: 12 },
  },
  {
    type: "meditation",
    component: MeditationRoom,
    title: "Meditation Room",
    emoji: "🧘",
    description: "A peaceful space for reflection",
  },
  {
    type: "bench-press",
    component: BenchPressRoom,
    title: "Gym Room",
    emoji: "💪",
    description: "Train your strength here",
  },
  {
    type: "library",
    component: LibraryRoom,
    title: "Library",
    emoji: "📚",
    description: "Knowledge and wisdom await",
    props: { books: [] },
  },
  {
    type: "shop",
    component: ShopRoom,
    title: "Shop",
    emoji: "🛒",
    description: "Buy and sell items",
  },
  {
    type: "treasure",
    component: TreasureRoom,
    title: "Treasure Room",
    emoji: "💰",
    description: "Riches and rewards",
  },
  {
    type: "puzzle",
    component: PuzzleRoom,
    title: "Puzzle Room",
    emoji: "🧩",
    description: "Test your wits",
    props: { puzzle: null, onPuzzleComplete: () => {} },
  },
  {
    type: "boss",
    component: BossRoom,
    title: "Boss Room",
    emoji: "👹",
    description: "Face the ultimate challenge",
  },
  {
    type: "coffee",
    component: CoffeeRoom,
    title: "Coffee Room",
    emoji: "☕",
    description: "Rest and recharge",
    props: { onRewardClaim: () => {} },
  },
  {
    type: "challenge",
    component: ChallengeRoom,
    title: "Challenge Room",
    emoji: "⚔️",
    description: "Prove your skills",
  },
  {
    type: "library-upgrade",
    component: LibraryUpgradeRoom,
    title: "Library Upgrade",
    emoji: "📖",
    description: "Enhance your knowledge",
  },
  {
    type: "portal",
    component: PortalRoom,
    title: "Portal Room",
    emoji: "🌀",
    description: "Travel between dimensions",
    props: { portalDestination: "unknown" },
  },
  {
    type: "arena",
    component: ArenaRoom,
    title: "Arena",
    emoji: "⚔️",
    description: "Combat training ground",
  },
  {
    type: "enemy",
    component: EnemyRoom,
    title: "Enemy Room",
    emoji: "👹",
    description: "Face dangerous foes",
  },
  {
    type: "end",
    component: EndRoom,
    title: "End Room",
    emoji: "🏁",
    description: "The final destination",
  },
  {
    type: "special",
    component: SpecialRoom,
    title: "Special Room",
    emoji: "✨",
    description: "Unique and mysterious",
  },
];

// 3D Objects configuration
const OBJECT_CONFIGS = [
  {
    type: "shaped-shell",
    component: ShapedShell,
    title: "Shaped Shell",
    emoji: "🔷",
    description: "Geometric room shapes",
    props: { size: 8, shape: "cube" },
  },
  {
    type: "item-sprite",
    component: ItemSprite,
    title: "Item Sprite",
    emoji: "💎",
    description: "Interactive items",
    props: {
      item: {
        id: "test-item",
        name: "Test Item",
        type: "gem",
        value: 100,
        position: [0, 0, 0],
      },
      onCollect: () => {},
    },
  },
  {
    type: "destructible-wall",
    component: DestructibleWall,
    title: "Destructible Wall",
    emoji: "🧱",
    description: "Breakable barriers",
    props: {
      position: [0, 0, 0],
      onDestroy: () => {},
      health: 100,
    },
  },
  {
    type: "particle-system",
    component: ParticleSystem,
    title: "Particle System",
    emoji: "✨",
    description: "Visual effects",
    props: {
      position: [0, 0, 0],
      type: "sparkle",
    },
  },
];

// Ground plane for the editor
const EditorGround: React.FC = () => (
  <RigidBody type="fixed" colliders="trimesh">
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshLambertMaterial color="#2a2a2a" />
    </mesh>
  </RigidBody>
);

// Grid helper for reference
const GridHelper: React.FC = () => (
  <gridHelper args={[50, 50, "#444444", "#444444"]} position={[0, -0.9, 0]} />
);

// Object viewer component
const ObjectViewer: React.FC<{
  config: any;
  position: [number, number, number];
}> = ({ config, position }) => {
  const Component = config.component;
  return (
    <group position={position}>
      <Component {...config.props} />
    </group>
  );
};

// Main 3D Editor Scene
const EditorScene: React.FC<{
  selectedType: string;
  selectedCategory: "rooms" | "objects";
  viewMode: "single" | "grid" | "showcase";
}> = ({ selectedType, selectedCategory, viewMode }) => {
  const configs = selectedCategory === "rooms" ? ROOM_CONFIGS : OBJECT_CONFIGS;
  const selectedConfig = configs.find((config) => config.type === selectedType);

  if (viewMode === "single" && selectedConfig) {
    return (
      <group position={[0, 0, 0]}>
        <ObjectViewer config={selectedConfig} position={[0, 0, 0]} />
      </group>
    );
  }

  if (viewMode === "grid") {
    return (
      <group>
        {configs.map((config, index) => {
          const x = (index % 4) * 15 - 22.5;
          const z = Math.floor(index / 4) * 15 - 22.5;
          return (
            <group key={config.type} position={[x, 0, z]}>
              <ObjectViewer config={config} position={[0, 0, 0]} />
              <Text
                position={[0, 5, 0]}
                fontSize={1}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {config.emoji} {config.title}
              </Text>
            </group>
          );
        })}
      </group>
    );
  }

  if (viewMode === "showcase") {
    return (
      <group>
        {configs.map((config, index) => {
          const angle = (index / configs.length) * Math.PI * 2;
          const radius = 20;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          return (
            <group key={config.type} position={[x, 0, z]}>
              <ObjectViewer config={config} position={[0, 0, 0]} />
              <Text
                position={[0, 8, 0]}
                fontSize={1.5}
                color="white"
                anchorX="center"
                anchorY="middle"
              >
                {config.emoji}
              </Text>
              <Text
                position={[0, 6, 0]}
                fontSize={0.8}
                color="#cccccc"
                anchorX="center"
                anchorY="middle"
              >
                {config.title}
              </Text>
            </group>
          );
        })}
      </group>
    );
  }

  return null;
};

// Main 3D Editor Component
const ThreeDEditor: React.FC = () => {
  const [selectedType, setSelectedType] = useState("start");
  const [selectedCategory, setSelectedCategory] = useState<"rooms" | "objects">(
    "rooms"
  );
  const [viewMode, setViewMode] = useState<"single" | "grid" | "showcase">(
    "single"
  );
  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >([10, 10, 10]);

  // Handle ESC key to return to main app
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.location.href = window.location.pathname;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const configs = selectedCategory === "rooms" ? ROOM_CONFIGS : OBJECT_CONFIGS;
  const selectedConfig = configs.find((config) => config.type === selectedType);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Control Panel */}
      <div
        style={{
          width: "300px",
          background: "linear-gradient(135deg, #1e1e1e, #2d2d2d)",
          padding: "20px",
          overflowY: "auto",
          borderRight: "2px solid #444",
          color: "white",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h2 style={{ margin: "0 0 20px 0", color: "#4CAF50" }}>🎮 3D Editor</h2>

        {/* Category Selection */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Category</h3>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setSelectedCategory("rooms")}
              style={{
                padding: "8px 16px",
                background: selectedCategory === "rooms" ? "#4CAF50" : "#555",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🏠 Rooms
            </button>
            <button
              onClick={() => setSelectedCategory("objects")}
              style={{
                padding: "8px 16px",
                background: selectedCategory === "objects" ? "#4CAF50" : "#555",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🎯 Objects
            </button>
          </div>
        </div>

        {/* View Mode Selection */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>View Mode</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              {
                mode: "single",
                label: "🔍 Single View",
                desc: "View one item at a time",
              },
              {
                mode: "grid",
                label: "📋 Grid View",
                desc: "View all items in a grid",
              },
              {
                mode: "showcase",
                label: "🎪 Showcase",
                desc: "View all items in a circle",
              },
            ].map(({ mode, label, desc }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                style={{
                  padding: "10px",
                  background: viewMode === mode ? "#4CAF50" : "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  textAlign: "left",
                }}
                title={desc}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Item Selection */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
            {selectedCategory === "rooms" ? "🏠 Rooms" : "🎯 Objects"}
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {configs.map((config) => (
              <div
                key={config.type}
                onClick={() => setSelectedType(config.type)}
                style={{
                  padding: "10px",
                  background: selectedType === config.type ? "#4CAF50" : "#333",
                  margin: "5px 0",
                  borderRadius: "4px",
                  cursor: "pointer",
                  border: "1px solid #555",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== config.type) {
                    e.currentTarget.style.background = "#444";
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== config.type) {
                    e.currentTarget.style.background = "#333";
                  }
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                  {config.emoji} {config.title}
                </div>
                <div style={{ fontSize: "12px", color: "#ccc" }}>
                  {config.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Camera Controls */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>Camera</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            {[
              { pos: [10, 10, 10], label: "🎯 Default" },
              { pos: [0, 5, 10], label: "👁️ Front" },
              { pos: [10, 5, 0], label: "👁️ Side" },
              { pos: [0, 20, 0], label: "🦅 Top" },
            ].map(({ pos, label }) => (
              <button
                key={label}
                onClick={() => {
                  setCameraPosition(pos as [number, number, number]);
                }}
                style={{
                  padding: "8px",
                  background: "#555",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Item Info */}
        {selectedConfig && (
          <div
            style={{
              background: "#333",
              padding: "15px",
              borderRadius: "4px",
              border: "1px solid #555",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#4CAF50" }}>
              {selectedConfig.emoji} {selectedConfig.title}
            </h4>
            <p
              style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#ccc" }}
            >
              {selectedConfig.description}
            </p>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Type: {selectedConfig.type}
            </div>
          </div>
        )}
      </div>

      {/* 3D Canvas */}
      <div
        style={{
          flex: 1,
          position: "relative",
          width: "calc(100vw - 300px)",
          height: "100vh",
        }}
      >
        <Canvas
          shadows
          style={{ width: "100%", height: "100%" }}
          camera={{ position: cameraPosition, fov: 60 }}
        >
          <Suspense fallback={null}>
            <Physics timeStep="vary" gravity={[0, -9.81, 0]}>
              {/* Lighting */}
              <ambientLight intensity={0.4} />
              <directionalLight
                intensity={0.8}
                castShadow
                shadow-bias={-0.0004}
                position={[-20, 20, 20]}
              >
                <orthographicCamera
                  attach="shadow-camera"
                  args={[-20, 20, 20, -20]}
                />
              </directionalLight>

              {/* Environment */}
              <Environment files="./night.hdr" ground={{ scale: 100 }} />

              {/* Ground and Grid */}
              <EditorGround />
              <GridHelper />

              {/* Main Content */}
              <EditorScene
                selectedType={selectedType}
                selectedCategory={selectedCategory}
                viewMode={viewMode}
              />

              {/* Controls - Always enabled for mouse */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={5}
                maxDistance={50}
              />
            </Physics>
          </Suspense>
        </Canvas>

        {/* View Mode Indicator */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          {viewMode === "single" && "🔍 Single View"}
          {viewMode === "grid" && "📋 Grid View"}
          {viewMode === "showcase" && "🎪 Showcase View"}
        </div>

        {/* Controls Indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "15px",
            borderRadius: "4px",
            fontSize: "12px",
            lineHeight: "1.4",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
            🎮 Controls:
          </div>
          <div>Mouse - Orbit & Pan</div>
          <div>Mouse Wheel - Zoom</div>
          <div>ESC - Exit editor</div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDEditor;

import React, { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import RoomActionCards, { type ActionCard } from "./RoomActionCards";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
  title: string;
  emoji: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props?: any;
  availableActions?: ActionCard[];
  editableProps?: PropConfig[];
}

interface PropConfig {
  key: string;
  label: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue: any;
  options?: string[];
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
    availableActions: [
      {
        id: "meditate",
        title: "Meditate",
        description: "Practice meditation to gain defense and experience",
        icon: "🧘",
        action: () => console.log("Meditation started"),
      },
    ],
    editableProps: [
      {
        key: "energyRestored",
        label: "Energy Restored",
        type: "number",
        defaultValue: 30,
      },
      {
        key: "defenseBonus",
        label: "Defense Bonus",
        type: "number",
        defaultValue: 5,
      },
    ],
  },
  {
    type: "bench-press",
    component: BenchPressRoom,
    title: "Gym Room",
    emoji: "💪",
    description: "Train your strength here",
    availableActions: [
      {
        id: "lift",
        title: "Lift Weights",
        description: "Train your strength and gain rewards",
        icon: "💪",
        action: () => console.log("Weight lifting started"),
      },
    ],
    editableProps: [
      {
        key: "strengthBonus",
        label: "Strength Bonus",
        type: "number",
        defaultValue: 20,
      },
      {
        key: "experienceGained",
        label: "Experience Gained",
        type: "number",
        defaultValue: 50,
      },
    ],
  },
  {
    type: "library",
    component: LibraryRoom,
    title: "Library",
    emoji: "📚",
    description: "Knowledge and wisdom await",
    props: {
      books: [
        {
          id: "demo-book-1",
          title: "Demo Book 1",
          type: "knowledge",
          value: 10,
        },
        { id: "demo-book-2", title: "Demo Book 2", type: "wisdom", value: 15 },
      ],
    },
    availableActions: [
      {
        id: "study",
        title: "Study",
        description: "Study books to gain knowledge and solve puzzles",
        icon: "📚",
        action: () => console.log("Study session started"),
      },
    ],
    editableProps: [
      { key: "books", label: "Books", type: "array", defaultValue: [] },
      {
        key: "knowledgeGained",
        label: "Knowledge Gained",
        type: "number",
        defaultValue: 15,
      },
    ],
  },
  {
    type: "shop",
    component: ShopRoom,
    title: "Shop",
    emoji: "🛒",
    description: "Buy and sell items",
    availableActions: [
      {
        id: "browse",
        title: "Browse Shop",
        description: "Look at available items for purchase",
        icon: "🛒",
        action: () => console.log("Shop browsing started"),
      },
    ],
    editableProps: [
      {
        key: "shopItems",
        label: "Shop Items",
        type: "array",
        defaultValue: [],
      },
      {
        key: "currency",
        label: "Currency Type",
        type: "string",
        defaultValue: "coins",
      },
    ],
  },
  {
    type: "treasure",
    component: TreasureRoom,
    title: "Treasure Room",
    emoji: "💰",
    description: "Riches and rewards",
    availableActions: [
      {
        id: "loot",
        title: "Loot Treasure",
        description: "Search for valuable items and gold",
        icon: "💰",
        action: () => console.log("Treasure looting started"),
      },
    ],
    editableProps: [
      {
        key: "treasureValue",
        label: "Treasure Value",
        type: "number",
        defaultValue: 100,
      },
      {
        key: "lootChance",
        label: "Loot Chance",
        type: "number",
        defaultValue: 0.8,
      },
    ],
  },
  {
    type: "puzzle",
    component: PuzzleRoom,
    title: "Puzzle Room",
    emoji: "🧩",
    description: "Test your wits",
    props: {
      puzzle: {
        type: "memory-pairs",
        id: "demo-puzzle",
        difficulty: "easy",
        data: {},
      },
      onPuzzleComplete: () => {},
    },
    availableActions: [
      {
        id: "solve_puzzle",
        title: "Solve Puzzle",
        description: "Attempt to solve the room's puzzle",
        icon: "🧩",
        action: () => console.log("Puzzle solving started"),
      },
    ],
    editableProps: [
      { key: "puzzle", label: "Puzzle Data", type: "object", defaultValue: {} },
      {
        key: "difficulty",
        label: "Difficulty",
        type: "string",
        defaultValue: "easy",
        options: ["easy", "medium", "hard"],
      },
    ],
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
    props: {
      onRewardClaim: () => console.log("Coffee reward claimed"),
      energyRestored: 50,
    },
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
    props: {
      portalDestination: "demo-room",
      onPortalActivate: () => console.log("Portal activated"),
    },
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
  config: RoomConfig;
  position: [number, number, number];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentProps?: any;
  showActionCards?: boolean;
}> = ({ config, position, currentProps, showActionCards = false }) => {
  const Component = config.component;
  const propsToUse = currentProps || config.props || {};

  return (
    <group position={position}>
      <Suspense
        fallback={
          <Text position={[0, 0, 0]} fontSize={1} color="white">
            Loading...
          </Text>
        }
      >
        <ErrorBoundary config={config}>
          <Component {...propsToUse} />
        </ErrorBoundary>
      </Suspense>

      {/* Render action cards if available and requested */}
      {showActionCards &&
        config.availableActions &&
        config.availableActions.length > 0 && (
          <Html
            position={[0, 0, 0]}
            center
            style={{
              pointerEvents: "none", // Let the 3D scene handle interactions
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: "-200px", // Position below the room
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                pointerEvents: "auto", // Re-enable interactions for the cards
              }}
            >
              <RoomActionCards
                cards={config.availableActions}
                isVisible={true}
                onCardClick={(card) => {
                  console.log("Action card clicked:", card.title);
                  card.action();
                }}
              />
            </div>
          </Html>
        )}
    </group>
  );
};

// Error boundary component for better error handling
const ErrorBoundary: React.FC<{
  config: RoomConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error("Component error:", config.type, error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [config.type]);

  if (hasError) {
    return (
      <Text
        position={[0, 0, 0]}
        fontSize={1}
        color="red"
        anchorX="center"
        anchorY="middle"
      >
        Error: {config.type}
      </Text>
    );
  }

  return <>{children}</>;
};

// Props Editor Component
const PropsEditor: React.FC<{
  config: RoomConfig | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPropsChange: (props: any) => void;
}> = ({ config, onPropsChange }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localProps, setLocalProps] = useState<any>(config?.props || {});

  React.useEffect(() => {
    setLocalProps(config?.props || {});
  }, [config]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    onPropsChange(newProps);
  };

  if (!config || !config.editableProps) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        width: "300px",
        maxHeight: "80vh",
        overflowY: "auto",
        background: "rgba(0, 0, 0, 0.9)",
        border: "2px solid #333",
        borderRadius: "10px",
        padding: "20px",
        color: "white",
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", color: "#00ff00" }}>
        {config.emoji} {config.title} Props
      </h3>

      {config.editableProps.map((prop) => (
        <div key={prop.key} style={{ marginBottom: "15px" }}>
          <label
            style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}
          >
            {prop.label}:
          </label>

          {prop.type === "string" && (
            <input
              type="text"
              value={localProps[prop.key] || prop.defaultValue || ""}
              onChange={(e) => handlePropChange(prop.key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "white",
              }}
            />
          )}

          {prop.type === "number" && (
            <input
              type="number"
              value={localProps[prop.key] || prop.defaultValue || 0}
              onChange={(e) =>
                handlePropChange(prop.key, Number(e.target.value))
              }
              style={{
                width: "100%",
                padding: "8px",
                background: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "white",
              }}
            />
          )}

          {prop.type === "boolean" && (
            <input
              type="checkbox"
              checked={localProps[prop.key] || prop.defaultValue || false}
              onChange={(e) => handlePropChange(prop.key, e.target.checked)}
              style={{ marginRight: "8px" }}
            />
          )}

          {prop.type === "array" && (
            <textarea
              value={JSON.stringify(
                localProps[prop.key] || prop.defaultValue || [],
                null,
                2
              )}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  handlePropChange(prop.key, parsed);
                } catch {
                  // Invalid JSON, keep the text for editing
                }
              }}
              style={{
                width: "100%",
                height: "80px",
                padding: "8px",
                background: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
                color: "white",
                fontFamily: "monospace",
                fontSize: "12px",
              }}
            />
          )}
        </div>
      ))}

      <button
        onClick={() => onPropsChange(localProps)}
        style={{
          width: "100%",
          padding: "10px",
          background: "linear-gradient(45deg, #4CAF50, #8BC34A)",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Apply Changes
      </button>
    </div>
  );
};

// Room Information Panel
const RoomInfoPanel: React.FC<{
  config: RoomConfig | null;
}> = ({ config }) => {
  if (!config) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        left: "20px",
        width: "300px",
        background: "rgba(0, 0, 0, 0.9)",
        border: "2px solid #333",
        borderRadius: "10px",
        padding: "20px",
        color: "white",
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: "0 0 15px 0", color: "#00ff00" }}>
        {config.emoji} {config.title}
      </h3>

      <p style={{ margin: "0 0 15px 0", fontSize: "14px", opacity: 0.8 }}>
        {config.description}
      </p>

      {config.availableActions && config.availableActions.length > 0 && (
        <div>
          <h4 style={{ margin: "0 0 10px 0", color: "#ffff00" }}>
            Available Actions:
          </h4>
          {config.availableActions.map((action) => (
            <div
              key={action.id}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                padding: "8px",
                background: "rgba(255, 255, 255, 0.1)",
                borderRadius: "5px",
              }}
            >
              <span style={{ fontSize: "20px", marginRight: "10px" }}>
                {action.icon}
              </span>
              <div>
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>
                  {action.title}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.8 }}>
                  {action.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main 3D Editor Scene
const EditorScene: React.FC<{
  selectedType: string;
  selectedCategory: "rooms" | "objects";
  viewMode: "single" | "grid" | "showcase";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentProps?: any;
  showActionCards?: boolean;
}> = ({
  selectedType,
  selectedCategory,
  viewMode,
  currentProps,
  showActionCards = false,
}) => {
  const configs = selectedCategory === "rooms" ? ROOM_CONFIGS : OBJECT_CONFIGS;
  const selectedConfig = configs.find((config) => config.type === selectedType);

  console.log("EditorScene render:", {
    selectedType,
    selectedCategory,
    viewMode,
    configsLength: configs.length,
  });

  if (viewMode === "single" && selectedConfig) {
    return (
      <group position={[0, 0, 0]}>
        <ObjectViewer
          config={selectedConfig}
          position={[0, 0, 0]}
          currentProps={currentProps}
          showActionCards={showActionCards}
        />
      </group>
    );
  }

  if (viewMode === "grid") {
    console.log("Rendering grid view with", configs.length, "configs");
    return (
      <group>
        {configs.map((config, index) => {
          const x = (index % 4) * 15 - 22.5;
          const z = Math.floor(index / 4) * 15 - 22.5;
          console.log(`Grid item ${index}: ${config.type} at [${x}, 0, ${z}]`);
          return (
            <group key={config.type} position={[x, 0, z]}>
              <ObjectViewer
                config={config}
                position={[0, 0, 0]}
                currentProps={currentProps}
                showActionCards={false}
              />
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
    console.log("Rendering showcase view with", configs.length, "configs");
    return (
      <group>
        {configs.map((config, index) => {
          const angle = (index / configs.length) * Math.PI * 2;
          const radius = 20;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;
          console.log(
            `Showcase item ${index}: ${config.type} at [${x}, 0, ${z}]`
          );
          return (
            <group key={config.type} position={[x, 0, z]}>
              <ObjectViewer
                config={config}
                position={[0, 0, 0]}
                currentProps={currentProps}
                showActionCards={false}
              />
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

  // Fallback when no configs or invalid view mode
  console.log("No valid view mode or configs found");
  return (
    <group>
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        No items to display
      </Text>
    </group>
  );
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentProps, setCurrentProps] = useState<any>({});
  const [showPropsEditor, setShowPropsEditor] = useState<boolean>(false);
  const [showRoomInfo, setShowRoomInfo] = useState<boolean>(false);
  const [showActionCards, setShowActionCards] = useState<boolean>(false);

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

  // Update props when selection changes
  React.useEffect(() => {
    const configs =
      selectedCategory === "rooms" ? ROOM_CONFIGS : OBJECT_CONFIGS;
    const selectedConfig = configs.find(
      (config) => config.type === selectedType
    );
    if (selectedConfig) {
      setCurrentProps(selectedConfig.props || {});
    }
  }, [selectedType, selectedCategory]);

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
                onClick={() =>
                  setViewMode(mode as "single" | "grid" | "showcase")
                }
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

        {/* Room Controls */}
        {selectedCategory === "rooms" && selectedConfig && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              Room Controls
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "5px" }}
            >
              <button
                onClick={() => setShowPropsEditor(!showPropsEditor)}
                style={{
                  padding: "10px",
                  background: showPropsEditor
                    ? "linear-gradient(45deg, #FF6B6B, #FF8E8E)"
                    : "linear-gradient(45deg, #4ECDC4, #44A08D)",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {showPropsEditor ? "❌ Hide Props Editor" : "⚙️ Edit Props"}
              </button>

              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                style={{
                  padding: "10px",
                  background: showRoomInfo
                    ? "linear-gradient(45deg, #FF6B6B, #FF8E8E)"
                    : "linear-gradient(45deg, #667eea, #764ba2)",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {showRoomInfo ? "❌ Hide Room Info" : "ℹ️ Show Room Info"}
              </button>

              <button
                onClick={() => setShowActionCards(!showActionCards)}
                style={{
                  padding: "10px",
                  background: showActionCards
                    ? "linear-gradient(45deg, #FF6B6B, #FF8E8E)"
                    : "linear-gradient(45deg, #FFD700, #FFA500)",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {showActionCards
                  ? "❌ Hide Action Cards"
                  : "🎮 Show Action Cards"}
              </button>
            </div>
          </div>
        )}

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
                currentProps={currentProps}
                showActionCards={showActionCards}
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

        {/* Props Editor Panel */}
        {showPropsEditor && selectedConfig && (
          <PropsEditor
            config={selectedConfig}
            onPropsChange={(newProps) => {
              setCurrentProps(newProps);
              // Update the selected config's props
              const configs =
                selectedCategory === "rooms" ? ROOM_CONFIGS : OBJECT_CONFIGS;
              const configIndex = configs.findIndex(
                (config) => config.type === selectedType
              );
              if (configIndex !== -1) {
                configs[configIndex].props = newProps;
              }
            }}
          />
        )}

        {/* Room Info Panel */}
        {showRoomInfo && selectedConfig && (
          <RoomInfoPanel config={selectedConfig} />
        )}

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

import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import RoomActionCards, { type ActionCard } from "./RoomActionCards";

// Import room components from new structure
import StartRoom from "./primitives/game-rooms/StartRoom";
import CoffeeRoom from "./primitives/game-rooms/CoffeeRoom";
import MeditationRoom from "./primitives/game-rooms/MeditationRoom";
import LibraryUpgradeRoom from "./primitives/game-rooms/LibraryUpgradeRoom";
import MiddleStairsRoom from "./primitives/game-rooms/MiddleStairsRoom";
import StairsRoom from "./primitives/game-rooms/StairsRoom";
import RoomFactory from "./primitives/game-rooms/RoomFactory";
import ShapedShell from "./primitives/game-rooms/ShapedShell";
import ComponentShowcaseRoom from "./primitives/demo-rooms/ComponentShowcaseRoom";
import CleanBreakableRoom from "./primitives/demo-rooms/CleanBreakableRoom";
import AllBreakableDemo from "./primitives/demo-rooms/AllBreakableDemo";
import UniversalBreakableDemo from "./primitives/demo-rooms/UniversalBreakableDemo";
// Import room elements directly
import Tile from "./primitives/elements/Tile";
import Wall from "./primitives/elements/Wall";
import Ceiling from "./primitives/elements/Ceiling";
import Plank from "./primitives/elements/Plank";
import Stair from "./primitives/elements/Stair";
import Handrail from "./primitives/elements/Handrail";

// Import other 3D components
import ItemSprite from "./ItemSprite";
import MosaicCreator from "./MosaicCreator";
import DestructibleWall from "./DestructibleWall";
import SharedNavigation from "./SharedNavigation";
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
  type: "string" | "number" | "boolean" | "color" | "select";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

// Demo Room configurations
const DEMO_ROOM_CONFIGS: RoomConfig[] = [
  {
    type: "component-showcase",
    component: ComponentShowcaseRoom,
    title: "Component Showcase Room",
    emoji: "🎨",
    description: "A room showcasing various components",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "clean-breakable",
    component: CleanBreakableRoom,
    title: "Clean Breakable Room",
    emoji: "💥",
    description: "A room with clean breakable objects",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "all-breakable-demo",
    component: AllBreakableDemo,
    title: "All Breakable Demo",
    emoji: "💥",
    description: "A demo of all breakable objects",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "universal-breakable-demo",
    component: UniversalBreakableDemo,
    title: "Universal Breakable Demo",
    emoji: "🌍",
    description: "A demo of universal breakable objects",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
];

// Game Room configurations
const GAME_ROOM_CONFIGS: RoomConfig[] = [
  {
    type: "start",
    component: StartRoom,
    title: "Start Room",
    emoji: "🚀",
    description: "The beginning of your adventure",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "coffee",
    component: CoffeeRoom,
    title: "Coffee Room",
    emoji: "☕",
    description: "A cozy room with coffee and rewards",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "meditation",
    component: MeditationRoom,
    title: "Meditation Room",
    emoji: "🧘",
    description: "A peaceful room for reflection",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "library-upgrade",
    component: LibraryUpgradeRoom,
    title: "Library Upgrade Room",
    emoji: "📚",
    description: "A room for upgrading your library",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "middle-stairs",
    component: MiddleStairsRoom,
    title: "Middle Stairs Room",
    emoji: "🪜",
    description: "A room with stairs in the middle",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "stairs",
    component: StairsRoom,
    title: "Stairs Room",
    emoji: "🪜",
    description: "A room with stairs",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "room-factory",
    component: RoomFactory,
    title: "Room Factory",
    emoji: "🏭",
    description: "A factory for creating rooms",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
  {
    type: "shaped-shell",
    component: ShapedShell,
    title: "Shaped Shell Room",
    emoji: "🐚",
    description: "A room with a unique shell shape",
    props: { size: 10 },
    editableProps: [
      {
        key: "size",
        label: "Room Size",
        type: "number",
        min: 5,
        max: 20,
        step: 1,
      },
    ],
  },
];

// Object configurations
const OBJECT_CONFIGS: RoomConfig[] = [
  {
    type: "tile",
    component: Tile,
    title: "Tile",
    emoji: "🔲",
    description: "Floor tiles with various materials and patterns",
    props: { position: [0, 0, 0], size: 1, height: 0.1 },
    editableProps: [
      {
        key: "size",
        label: "Size",
        type: "number",
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      { key: "color", label: "Color", type: "color" },
      {
        key: "material",
        label: "Material",
        type: "select",
        options: ["stone", "marble", "wood", "metal", "brick", "carpet"],
      },
    ],
  },
  {
    type: "wall",
    component: Wall,
    title: "Wall",
    emoji: "🧱",
    description: "Structural walls for room boundaries",
    props: { position: [0, 0, 0], width: 1, height: 3, depth: 0.2 },
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "ceiling",
    component: Ceiling,
    title: "Ceiling",
    emoji: "🏠",
    description: "Room ceilings with various materials",
    props: { position: [0, 0, 0], width: 10, height: 10, depth: 0.2 },
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 1,
        max: 20,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 20,
        step: 0.1,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "plank",
    component: Plank,
    title: "Plank",
    emoji: "🪵",
    description: "Wooden planks for construction",
    props: { position: [0, 0, 0], length: 2, width: 0.2, height: 0.1 },
    editableProps: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "stair",
    component: Stair,
    title: "Stair",
    emoji: "🪜",
    description: "Stairs for vertical movement",
    props: { position: [0, 0, 0], width: 2, height: 2, depth: 1, steps: 10 },
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "steps",
        label: "Steps",
        type: "number",
        min: 3,
        max: 20,
        step: 1,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "handrail",
    component: Handrail,
    title: "Handrail",
    emoji: "🦯",
    description: "Safety handrails for stairs and platforms",
    props: { position: [0, 0, 0], length: 2, height: 1, thickness: 0.05 },
    editableProps: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.1,
        max: 3,
        step: 0.1,
      },
      {
        key: "thickness",
        label: "Thickness",
        type: "number",
        min: 0.01,
        max: 0.5,
        step: 0.01,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "item-sprite",
    component: ItemSprite,
    title: "Item Sprite",
    emoji: "💎",
    description: "Interactive item sprites",
    props: { position: [0, 0, 0], itemType: "gem", scale: 1 },
    editableProps: [
      {
        key: "itemType",
        label: "Item Type",
        type: "select",
        options: ["gem", "key", "potion", "coin"],
      },
      {
        key: "scale",
        label: "Scale",
        type: "number",
        min: 0.1,
        max: 5,
        step: 0.1,
      },
    ],
  },
  {
    type: "mosaic-creator",
    component: MosaicCreator,
    title: "3D Mosaic Creator",
    emoji: "🧩",
    description: "Create 3D mosaic patterns with shapes and colors",
    props: { position: [0, 0, 0], size: 5 },
    editableProps: [
      {
        key: "size",
        label: "Size",
        type: "number",
        min: 1,
        max: 20,
        step: 0.1,
      },
    ],
  },
  {
    type: "destructible-wall",
    component: DestructibleWall,
    title: "Destructible Wall",
    emoji: "🧱",
    description: "Walls that can be destroyed",
    props: { position: [0, 0, 0], width: 2, height: 3, depth: 0.2 },
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.01,
        max: 2,
        step: 0.01,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
  {
    type: "particle-system",
    component: ParticleSystem,
    title: "Particle System",
    emoji: "✨",
    description: "Visual particle effects",
    props: { position: [0, 0, 0], count: 100, color: "#ffffff" },
    editableProps: [
      {
        key: "count",
        label: "Particle Count",
        type: "number",
        min: 10,
        max: 1000,
        step: 10,
      },
      { key: "color", label: "Color", type: "color" },
    ],
  },
];

// Props Editor Component
const PropsEditor: React.FC<{
  config: RoomConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPropsChange: (props: any) => void;
}> = ({ config, onPropsChange }) => {
  const [localProps, setLocalProps] = useState(config.props || {});

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);
    onPropsChange(newProps);
  };

  if (!config.editableProps || config.editableProps.length === 0) {
    return (
      <div style={{ color: "#888", fontStyle: "italic" }}>
        No editable properties for this component
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ margin: "0 0 15px 0", color: "#4CAF50" }}>
        Edit Properties
      </h3>
      {config.editableProps.map((prop) => (
        <div key={prop.key} style={{ marginBottom: "15px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              color: "#ccc",
              fontSize: "14px",
            }}
          >
            {prop.label}
          </label>
          {prop.type === "string" && (
            <input
              type="text"
              value={localProps[prop.key] || ""}
              onChange={(e) => handlePropChange(prop.key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#333",
                color: "white",
                border: "1px solid #555",
                borderRadius: "4px",
              }}
            />
          )}
          {prop.type === "number" && (
            <input
              type="number"
              value={localProps[prop.key] || 0}
              min={prop.min}
              max={prop.max}
              step={prop.step}
              onChange={(e) =>
                handlePropChange(prop.key, parseFloat(e.target.value))
              }
              style={{
                width: "100%",
                padding: "8px",
                background: "#333",
                color: "white",
                border: "1px solid #555",
                borderRadius: "4px",
              }}
            />
          )}
          {prop.type === "boolean" && (
            <input
              type="checkbox"
              checked={localProps[prop.key] || false}
              onChange={(e) => handlePropChange(prop.key, e.target.checked)}
              style={{ marginRight: "8px" }}
            />
          )}
          {prop.type === "color" && (
            <input
              type="color"
              value={localProps[prop.key] || "#ffffff"}
              onChange={(e) => handlePropChange(prop.key, e.target.value)}
              style={{
                width: "100%",
                height: "40px",
                background: "#333",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            />
          )}
          {prop.type === "select" && prop.options && (
            <select
              value={localProps[prop.key] || prop.options[0]}
              onChange={(e) => handlePropChange(prop.key, e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                background: "#333",
                color: "white",
                border: "1px solid #555",
                borderRadius: "4px",
              }}
            >
              {prop.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
};

// Room Info Panel Component
const RoomInfoPanel: React.FC<{ config: RoomConfig }> = ({ config }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "20px",
        borderRadius: "8px",
        maxWidth: "300px",
        zIndex: 1000,
      }}
    >
      <h3 style={{ margin: "0 0 10px 0", color: "#4CAF50" }}>
        {config.emoji} {config.title}
      </h3>
      <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
        {config.description}
      </p>
      <div style={{ fontSize: "12px", color: "#888" }}>Type: {config.type}</div>
    </div>
  );
};

// Editor Ground Component
const EditorGround: React.FC = () => {
  return (
    <RigidBody type="fixed" position={[0, -0.1, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[50, 0.2, 50]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
    </RigidBody>
  );
};

// Grid Helper Component
const GridHelper: React.FC = () => {
  return (
    <gridHelper
      args={[20, 20, "#444", "#444"]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

// Editor Scene Component
const EditorScene: React.FC<{
  selectedType: string;
  selectedCategory: "rooms" | "objects";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentProps: any;
  showActionCards: boolean;
  activeTab: "demo" | "game";
}> = ({
  selectedType,
  selectedCategory,
  currentProps,
  showActionCards,
  activeTab,
}) => {
  const configs =
    selectedCategory === "rooms"
      ? activeTab === "demo"
        ? DEMO_ROOM_CONFIGS
        : GAME_ROOM_CONFIGS
      : OBJECT_CONFIGS;
  const selectedConfig = configs.find((config) => config.type === selectedType);

  if (!selectedConfig) {
    return (
      <Html position={[0, 0, 0]}>
        <div
          style={{
            color: "white",
            background: "rgba(0,0,0,0.8)",
            padding: "20px",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <h3>Component not found</h3>
          <p>Type: {selectedType}</p>
          <p>Category: {selectedCategory}</p>
        </div>
      </Html>
    );
  }

  const Component = selectedConfig.component;

  return (
    <Suspense
      fallback={
        <Html position={[0, 0, 0]}>
          <div
            style={{
              color: "white",
              background: "rgba(0,0,0,0.8)",
              padding: "20px",
              borderRadius: "8px",
              textAlign: "center",
            }}
          >
            <h3>Loading...</h3>
          </div>
        </Html>
      }
    >
      <Component {...currentProps} />
      {showActionCards && selectedConfig.availableActions && (
        <RoomActionCards
          cards={selectedConfig.availableActions}
          isVisible={true}
        />
      )}
    </Suspense>
  );
};

// Main 3D Editor Component
const ThreeDEditor: React.FC = () => {
  // Initialize state from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const [selectedType, setSelectedType] = useState(
    urlParams.get("type") || "start"
  );
  const [selectedCategory, setSelectedCategory] = useState<"rooms" | "objects">(
    (urlParams.get("category") as "rooms" | "objects") || "rooms"
  );
  const [activeTab, setActiveTab] = useState<"demo" | "game">(
    (urlParams.get("tab") as "demo" | "game") || "game"
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

  // Function to update URL parameters
  const updateURL = (updates: {
    type?: string;
    category?: string;
    tab?: string;
  }) => {
    const newParams = new URLSearchParams(window.location.search);

    if (updates.type !== undefined) newParams.set("type", updates.type);
    if (updates.category !== undefined)
      newParams.set("category", updates.category);
    if (updates.tab !== undefined) newParams.set("tab", updates.tab);

    const newURL = `${window.location.pathname}?${newParams.toString()}`;
    window.history.replaceState({}, "", newURL);
  };

  // Update URL when selections change
  React.useEffect(() => {
    updateURL({
      type: selectedType,
      category: selectedCategory,
      tab: activeTab,
    });
  }, [selectedType, selectedCategory, activeTab]);

  // Update props when selection changes
  React.useEffect(() => {
    const configs =
      selectedCategory === "rooms"
        ? activeTab === "demo"
          ? DEMO_ROOM_CONFIGS
          : GAME_ROOM_CONFIGS
        : OBJECT_CONFIGS;
    const selectedConfig = configs.find(
      (config) => config.type === selectedType
    );
    if (selectedConfig) {
      setCurrentProps(selectedConfig.props || {});
    }
  }, [selectedType, selectedCategory]);

  const configs =
    selectedCategory === "rooms"
      ? activeTab === "demo"
        ? DEMO_ROOM_CONFIGS
        : GAME_ROOM_CONFIGS
      : OBJECT_CONFIGS;
  const selectedConfig = configs.find((config) => config.type === selectedType);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState("");

  // Filter configs based on search query
  const filteredConfigs = configs.filter(
    (config) =>
      config.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group configs by base type for collapsible sections
  const groupedConfigs = filteredConfigs.reduce((groups, config) => {
    const baseType = config.type.split("-")[0];
    if (!groups[baseType]) {
      groups[baseType] = [];
    }
    groups[baseType].push(config);
    return groups;
  }, {} as Record<string, typeof filteredConfigs>);

  // State for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(
    new Set()
  );

  // Auto-collapse groups with multiple variants
  React.useEffect(() => {
    const multiVariantGroups = Object.keys(groupedConfigs).filter(
      (baseType) => groupedConfigs[baseType].length > 1
    );
    setCollapsedGroups(new Set(multiVariantGroups));
  }, [groupedConfigs]);

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
      {/* Shared Navigation */}
      <SharedNavigation currentPage="editor" />
      {/* Enhanced Control Panel */}
      <div
        style={{
          width: "400px",
          height: "100vh",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          borderRight: "2px solid #333",
          overflowY: "auto",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: "30px",
            textAlign: "center",
            borderBottom: "2px solid #444",
            paddingBottom: "20px",
          }}
        >
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "24px",
              color: "#4CAF50",
              fontWeight: "bold",
            }}
          >
            🎨 3D Asset Viewer
          </h1>
          <p
            style={{
              margin: 0,
              color: "#888",
              fontSize: "14px",
            }}
          >
            Explore and configure 3D components
          </p>
        </div>

        {/* Tab Navigation for Rooms */}
        {selectedCategory === "rooms" && (
          <div
            style={{
              display: "flex",
              marginBottom: "20px",
              background: "#222",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => {
                setActiveTab("game");
                const firstRoom = GAME_ROOM_CONFIGS[0];
                if (firstRoom) {
                  setSelectedType(firstRoom.type);
                }
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: activeTab === "game" ? "#4CAF50" : "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
            >
              🎮 Game Rooms
            </button>
            <button
              onClick={() => {
                setActiveTab("demo");
                const firstRoom = DEMO_ROOM_CONFIGS[0];
                if (firstRoom) {
                  setSelectedType(firstRoom.type);
                }
              }}
              style={{
                flex: 1,
                padding: "12px 16px",
                background: activeTab === "demo" ? "#4CAF50" : "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.2s ease",
              }}
            >
              🎨 Demo Rooms
            </button>
          </div>
        )}

        {/* Category Navigation */}
        <div
          style={{
            display: "flex",
            marginBottom: "20px",
            background: "#222",
            borderBottom: "1px solid #333",
          }}
        >
          <button
            onClick={() => {
              setSelectedCategory("rooms");
              const firstRoom = (
                activeTab === "demo" ? DEMO_ROOM_CONFIGS : GAME_ROOM_CONFIGS
              )[0];
              if (firstRoom) {
                setSelectedType(firstRoom.type);
              }
            }}
            style={{
              flex: 1,
              padding: "16px",
              background:
                selectedCategory === "rooms" ? "#4CAF50" : "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              borderBottom:
                selectedCategory === "rooms"
                  ? "3px solid #fff"
                  : "3px solid transparent",
            }}
          >
            🏠 Rooms
          </button>
          <button
            onClick={() => {
              setSelectedCategory("objects");
              const firstObject = OBJECT_CONFIGS[0];
              if (firstObject) {
                setSelectedType(firstObject.type);
              }
            }}
            style={{
              flex: 1,
              padding: "16px",
              background:
                selectedCategory === "objects" ? "#4CAF50" : "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              borderBottom:
                selectedCategory === "objects"
                  ? "3px solid #fff"
                  : "3px solid transparent",
            }}
          >
            🎯 Objects
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
            Search Components
          </h3>
          <input
            type="text"
            placeholder="Search rooms, objects, or components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              background: "#333",
              color: "white",
              border: "1px solid #555",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          />
        </div>

        {/* Item Selection */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
            {selectedCategory === "rooms" ? "🏠 Rooms" : "🎯 Objects"}
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {Object.entries(groupedConfigs).map(([baseType, configs]) => (
              <div key={baseType} style={{ marginBottom: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "#333",
                    borderRadius: "6px",
                    cursor: "pointer",
                    marginBottom: "5px",
                  }}
                  onClick={() => {
                    const newCollapsed = new Set(collapsedGroups);
                    if (newCollapsed.has(baseType)) {
                      newCollapsed.delete(baseType);
                    } else {
                      newCollapsed.add(baseType);
                    }
                    setCollapsedGroups(newCollapsed);
                  }}
                >
                  <span style={{ fontWeight: "600", color: "#4CAF50" }}>
                    {baseType.toUpperCase()} ({configs.length})
                  </span>
                  <span style={{ color: "#888" }}>
                    {collapsedGroups.has(baseType) ? "▶" : "▼"}
                  </span>
                </div>
                {!collapsedGroups.has(baseType) && (
                  <div style={{ paddingLeft: "10px" }}>
                    {configs.map((config) => (
                      <div
                        key={config.type}
                        onClick={() => setSelectedType(config.type)}
                        style={{
                          padding: "10px",
                          margin: "2px 0",
                          background:
                            selectedType === config.type ? "#4CAF50" : "#444",
                          color: "white",
                          borderRadius: "4px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          border: "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedType !== config.type) {
                            e.currentTarget.style.background = "#555";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedType !== config.type) {
                            e.currentTarget.style.background = "#444";
                          }
                        }}
                      >
                        <div
                          style={{ fontWeight: "bold", marginBottom: "4px" }}
                        >
                          {config.emoji} {config.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#ccc" }}>
                          {config.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Selected Item Info */}
        {selectedConfig && (
          <div
            style={{
              background: "#333",
              padding: "15px",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                color: "#4CAF50",
              }}
            >
              {selectedConfig.emoji} {selectedConfig.title}
            </h3>
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

        {/* 3D Object Parameters */}
        {selectedCategory === "objects" && selectedConfig && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              ⚙️ Object Parameters
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
      </div>

      {/* 3D Canvas */}
      <div
        style={{
          flex: 1,
          position: "relative",
          width: "calc(100vw - 400px)",
          height: "100vh",
        }}
      >
        <Canvas
          camera={{
            position: cameraPosition,
            fov: 75,
          }}
          shadows
        >
          <Physics debug={false}>
            <Environment preset="night" />
            <ambientLight intensity={0.4} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />

            {/* Ground and Grid */}
            <EditorGround />
            <GridHelper />

            {/* Main Content */}
            <EditorScene
              selectedType={selectedType}
              selectedCategory={selectedCategory}
              currentProps={currentProps}
              showActionCards={showActionCards}
              activeTab={activeTab}
            />

            {/* Controls - Always enabled for mouse */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
            />
          </Physics>
        </Canvas>

        {/* Props Editor Overlay */}
        {showPropsEditor && selectedConfig && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "rgba(0,0,0,0.9)",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            <PropsEditor
              config={selectedConfig}
              onPropsChange={setCurrentProps}
            />
          </div>
        )}

        {/* Room Info Panel */}
        {showRoomInfo && selectedConfig && (
          <RoomInfoPanel config={selectedConfig} />
        )}
      </div>
    </div>
  );
};

export default ThreeDEditor;

import React, { useState, Suspense, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Text, Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import RoomActionCards, { type ActionCard } from "./RoomActionCards";
import {
  useURLParams,
  parseCameraPosition,
  serializeCameraPosition,
  parseBoolean,
  parseJSON,
  serializeJSON,
} from "../hooks/useURLParams";

// Import configuration arrays
import { ROOM_CONFIGS } from "../configs/roomConfigs";
import { BIOME_CONFIGS } from "../configs/biomeConfigs";
import { OBJECT_CONFIGS } from "../configs/objectConfigs";
import { ELEMENT_CONFIGS } from "../configs/elementConfigs";
import type { RoomConfig } from "../configs/roomConfigs";

// Import room components from new structure
import StartRoom from "./primitives/game-rooms/StartRoom";
import CoffeeBiome from "./primitives/game-rooms/CoffeeBiome";
import MeditationBiome from "./primitives/game-rooms/MeditationBiome";
import LibraryUpgradeBiome from "./primitives/game-rooms/LibraryUpgradeBiome";
import LibraryBiome from "./primitives/game-rooms/LibraryBiome";
import ShopBiome from "./primitives/game-rooms/ShopBiome";
import TreasureBiome from "./primitives/game-rooms/TreasureBiome";
import PuzzleBiome from "./primitives/game-rooms/PuzzleBiome";
import BossBiome from "./primitives/game-rooms/BossBiome";
import ArenaBiome from "./primitives/game-rooms/ArenaBiome";
import EndBiome from "./primitives/game-rooms/EndBiome";
import PortalBiome from "./primitives/game-rooms/PortalBiome";
import TrapBiome from "./primitives/game-rooms/TrapBiome";
import CryptBiome from "./primitives/game-rooms/CryptBiome";
import SpecialBiome from "./primitives/game-rooms/SpecialBiome";
import ChallengeBiome from "./primitives/game-rooms/ChallengeBiome";
import MiddleStairsRoom from "./primitives/game-rooms/MiddleStairsRoom";
import ItemSprite from "./primitives/objects/ItemSprite";
import DestructibleWall from "./primitives/objects/DestructibleWall";
import ParticleSystem from "./primitives/objects/ParticleSystem";
import MosaicCreator from "./primitives/objects/MosaicCreator";
import Lever from "./primitives/objects/Lever";
import Altar from "./primitives/objects/Altar";
import Skeleton from "./primitives/objects/Skeleton";
import PressurePlate from "./primitives/objects/PressurePlate";
import Statue from "./primitives/objects/Statue";
import Switch from "./primitives/objects/Switch";
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
import SharedNavigation from "./SharedNavigation";

// Function to generate action cards for biomes
const generateBiomeActionCards = (biomeType: string): ActionCard[] => {
  const baseCards: ActionCard[] = [];

  switch (biomeType) {
    case "coffee":
      return [
        {
          id: "brew_coffee",
          title: "Brew Coffee",
          description: "Brew a fresh cup of coffee for energy boost",
          icon: "☕",
          action: () => console.log("Brewing coffee..."),
          cost: 0,
        },
        {
          id: "coffee_break",
          title: "Coffee Break",
          description: "Take a relaxing coffee break to restore energy",
          icon: "🛋️",
          action: () => console.log("Taking coffee break..."),
          cost: 10,
        },
      ];

    case "meditation":
      return [
        {
          id: "meditate",
          title: "Meditate",
          description: "Focus your mind and gain defense boost",
          icon: "🧘",
          action: () => console.log("Meditating..."),
          cost: 0,
        },
        {
          id: "deep_meditation",
          title: "Deep Meditation",
          description: "Advanced meditation for greater benefits",
          icon: "🕉️",
          action: () => console.log("Deep meditation..."),
          cost: 50,
        },
      ];

    case "library":
      return [
        {
          id: "read_book",
          title: "Read Book",
          description: "Read a book to gain knowledge and experience",
          icon: "📚",
          action: () => console.log("Reading book..."),
          cost: 0,
        },
        {
          id: "research",
          title: "Research",
          description: "Conduct research to unlock new abilities",
          icon: "🔬",
          action: () => console.log("Researching..."),
          cost: 25,
        },
      ];

    case "shop":
      return [
        {
          id: "browse_items",
          title: "Browse Items",
          description: "Look at available items for purchase",
          icon: "🛒",
          action: () => console.log("Browsing items..."),
          cost: 0,
        },
        {
          id: "buy_item",
          title: "Buy Item",
          description: "Purchase useful items and upgrades",
          icon: "💰",
          action: () => console.log("Buying item..."),
          cost: 100,
        },
      ];

    case "treasure":
      return [
        {
          id: "search_treasure",
          title: "Search Treasure",
          description: "Search for hidden treasures and rewards",
          icon: "💎",
          action: () => console.log("Searching treasure..."),
          cost: 0,
        },
        {
          id: "open_chest",
          title: "Open Chest",
          description: "Open treasure chests for valuable loot",
          icon: "📦",
          action: () => console.log("Opening chest..."),
          cost: 20,
        },
      ];

    case "puzzle":
      return [
        {
          id: "solve_puzzle",
          title: "Solve Puzzle",
          description: "Attempt to solve the room's puzzle",
          icon: "🧩",
          action: () => console.log("Solving puzzle..."),
          cost: 0,
        },
        {
          id: "hint",
          title: "Get Hint",
          description: "Get a hint to help solve the puzzle",
          icon: "💡",
          action: () => console.log("Getting hint..."),
          cost: 15,
        },
      ];

    case "arena":
      return [
        {
          id: "enter_arena",
          title: "Enter Arena",
          description: "Enter the arena for combat challenges",
          icon: "⚔️",
          action: () => console.log("Entering arena..."),
          cost: 0,
        },
        {
          id: "challenge_fighter",
          title: "Challenge Fighter",
          description: "Challenge a fighter to gain experience",
          icon: "🥊",
          action: () => console.log("Challenging fighter..."),
          cost: 30,
        },
      ];

    case "boss":
      return [
        {
          id: "face_boss",
          title: "Face Boss",
          description: "Challenge the boss for ultimate rewards",
          icon: "👹",
          action: () => console.log("Facing boss..."),
          cost: 0,
        },
        {
          id: "prepare_battle",
          title: "Prepare Battle",
          description: "Prepare for the upcoming boss battle",
          icon: "🛡️",
          action: () => console.log("Preparing battle..."),
          cost: 50,
        },
      ];

    case "garden":
      return [
        {
          id: "tend_garden",
          title: "Tend Garden",
          description: "Tend to the garden for peaceful benefits",
          icon: "🌱",
          action: () => console.log("Tending garden..."),
          cost: 0,
        },
        {
          id: "harvest_plants",
          title: "Harvest Plants",
          description: "Harvest plants for useful materials",
          icon: "🌿",
          action: () => console.log("Harvesting plants..."),
          cost: 10,
        },
      ];

    case "kitchen":
      return [
        {
          id: "cook_meal",
          title: "Cook Meal",
          description: "Cook a nutritious meal for health benefits",
          icon: "🍳",
          action: () => console.log("Cooking meal..."),
          cost: 0,
        },
        {
          id: "prepare_food",
          title: "Prepare Food",
          description: "Prepare food items for future use",
          icon: "🥘",
          action: () => console.log("Preparing food..."),
          cost: 15,
        },
      ];

    case "bedroom":
      return [
        {
          id: "rest",
          title: "Rest",
          description: "Rest to restore health and energy",
          icon: "🛏️",
          action: () => console.log("Resting..."),
          cost: 0,
        },
        {
          id: "deep_sleep",
          title: "Deep Sleep",
          description: "Get a deep sleep for maximum restoration",
          icon: "😴",
          action: () => console.log("Deep sleeping..."),
          cost: 20,
        },
      ];

    default:
      return [
        {
          id: "explore",
          title: "Explore",
          description: "Explore this area for potential discoveries",
          icon: "🔍",
          action: () => console.log("Exploring..."),
          cost: 0,
        },
      ];
  }
};

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

// Game Room configurations

// Biome configurations

// Object configurations

// Element configurations

// Props Editor Component
const PropsEditor: React.FC<{
  config: RoomConfig;

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
              {prop.options.map((option: any) => (
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
  selectedCategory: "rooms" | "biomes" | "objects" | "elements";
  currentProps: any;
  showActionCards: boolean;
  activeTab: "demo" | "game";
  configWithActions: any;
}> = ({
  selectedType,
  selectedCategory,
  currentProps,
  showActionCards,
  activeTab,
  configWithActions,
}) => {
  if (!configWithActions) {
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

  const Component = configWithActions.component;

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
      {showActionCards &&
        configWithActions.availableActions &&
        configWithActions.availableActions.length > 0 && (
          <RoomActionCards
            cards={configWithActions.availableActions}
            isVisible={true}
          />
        )}
    </Suspense>
  );
};

// Main 3D Editor Component
const ThreeDEditor: React.FC = () => {
  const { urlParams, updateURL, getParam } = useURLParams();

  // Initialize state from URL parameters
  const [selectedType, setSelectedType] = useState(getParam("type") || "start");
  const [selectedCategory, setSelectedCategory] = useState<
    "rooms" | "biomes" | "objects" | "elements"
  >(
    (getParam("category") as "rooms" | "biomes" | "objects" | "elements") ||
      "rooms"
  );
  const [activeTab, setActiveTab] = useState<"demo" | "game">(
    (getParam("tab") as "demo" | "game") || "game"
  );

  const [cameraPosition, setCameraPosition] = useState<
    [number, number, number]
  >(() =>
    parseCameraPosition(
      getParam("cameraX"),
      getParam("cameraY"),
      getParam("cameraZ")
    )
  );

  const [currentProps, setCurrentProps] = useState<any>(() =>
    parseJSON(getParam("props"), {})
  );
  const [showPropsEditor, setShowPropsEditor] = useState<boolean>(() =>
    parseBoolean(getParam("showPropsEditor"))
  );
  const [showRoomInfo, setShowRoomInfo] = useState<boolean>(() =>
    parseBoolean(getParam("showRoomInfo"))
  );
  const [showActionCards, setShowActionCards] = useState<boolean>(() =>
    parseBoolean(getParam("showActionCards"))
  );

  // Get current config and add action cards if needed
  const getCurrentConfig = () => {
    const configs =
      selectedCategory === "rooms"
        ? ROOM_CONFIGS
        : selectedCategory === "biomes"
        ? BIOME_CONFIGS
        : selectedCategory === "objects"
        ? OBJECT_CONFIGS
        : ELEMENT_CONFIGS;

    const selectedConfig = configs.find(
      (config) => config.type === selectedType
    );

    if (!selectedConfig) return null;

    return {
      ...selectedConfig,
      availableActions:
        selectedConfig.availableActions ||
        (selectedCategory === "biomes"
          ? generateBiomeActionCards(selectedType)
          : selectedConfig.availableActions),
    };
  };

  const configWithActions = getCurrentConfig();

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

  // Update URL when selections change
  useEffect(() => {
    updateURL({
      type: selectedType,
      category: selectedCategory,
      tab: activeTab,
    });
  }, [selectedType, selectedCategory, activeTab, updateURL]);

  // Update URL when camera position changes
  useEffect(() => {
    updateURL(serializeCameraPosition(cameraPosition));
  }, [cameraPosition, updateURL]);

  // Update URL when props change
  useEffect(() => {
    updateURL({
      props: serializeJSON(currentProps),
    });
  }, [currentProps, updateURL]);

  // Update URL when UI state changes
  useEffect(() => {
    updateURL({
      showPropsEditor: showPropsEditor.toString(),
      showRoomInfo: showRoomInfo.toString(),
      showActionCards: showActionCards.toString(),
    });
  }, [showPropsEditor, showRoomInfo, showActionCards, updateURL]);

  // Update props when selection changes
  React.useEffect(() => {
    const configs =
      selectedCategory === "rooms"
        ? activeTab === "demo"
          ? ROOM_CONFIGS
          : ROOM_CONFIGS
        : OBJECT_CONFIGS;
    const selectedConfig = configs.find(
      (config) => config.type === selectedType
    );
    if (selectedConfig) {
      setCurrentProps(selectedConfig.props || {});
    }
  }, [selectedType, selectedCategory, activeTab]);

  const configs =
    selectedCategory === "rooms"
      ? activeTab === "demo"
        ? ROOM_CONFIGS
        : ROOM_CONFIGS
      : OBJECT_CONFIGS;
  const selectedConfig = configs.find((config) => config.type === selectedType);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState(
    () => getParam("searchQuery") || ""
  );

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
    () => new Set(parseJSON(getParam("collapsedGroups"), []))
  );

  // Update URL when search query changes
  useEffect(() => {
    updateURL({
      searchQuery: searchQuery || undefined,
    });
  }, [searchQuery, updateURL]);

  // Update URL when collapsed groups change
  useEffect(() => {
    updateURL({
      collapsedGroups: serializeJSON(Array.from(collapsedGroups)),
    });
  }, [collapsedGroups, updateURL]);

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
                const firstRoom = ROOM_CONFIGS[0];
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
                const firstRoom = ROOM_CONFIGS[0];
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
                activeTab === "demo" ? ROOM_CONFIGS : ROOM_CONFIGS
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
              setSelectedCategory("biomes");
              const firstBiome = BIOME_CONFIGS[0];
              if (firstBiome) {
                setSelectedType(firstBiome.type);
              }
            }}
            style={{
              flex: 1,
              padding: "16px",
              background:
                selectedCategory === "biomes" ? "#4CAF50" : "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              borderBottom:
                selectedCategory === "biomes"
                  ? "3px solid #fff"
                  : "3px solid transparent",
            }}
          >
            🌍 Biomes
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
          <button
            onClick={() => {
              setSelectedCategory("elements");
              const firstElement = ELEMENT_CONFIGS[0];
              if (firstElement) {
                setSelectedType(firstElement.type);
              }
            }}
            style={{
              flex: 1,
              padding: "16px",
              background:
                selectedCategory === "elements" ? "#4CAF50" : "transparent",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              transition: "all 0.2s ease",
              borderBottom:
                selectedCategory === "elements"
                  ? "3px solid #fff"
                  : "3px solid transparent",
            }}
          >
            🧱 Elements
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
            Search Components
          </h3>
          <input
            type="text"
            placeholder="Search rooms, biomes, objects, or elements..."
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
            {selectedCategory === "rooms"
              ? "🏠 Rooms"
              : selectedCategory === "biomes"
              ? "🌍 Biomes"
              : selectedCategory === "objects"
              ? "🎯 Objects"
              : "🧱 Elements"}
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
        {configWithActions && (
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
              {configWithActions.emoji} {configWithActions.title}
            </h3>
            <p
              style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#ccc" }}
            >
              {configWithActions.description}
            </p>
            <div style={{ fontSize: "12px", color: "#888" }}>
              Type: {configWithActions.type}
            </div>
          </div>
        )}

        {/* 3D Component Parameters */}
        {configWithActions && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              ⚙️ Component Parameters
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

              {configWithActions.availableActions &&
                configWithActions.availableActions.length > 0 && (
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
                )}
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
              configWithActions={configWithActions}
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

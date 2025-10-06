import React, { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import SharedNavigation from "./SharedNavigation";
import Door from "./Door";
import { useURLParams, parseJSON, serializeJSON } from "../hooks/useURLParams";

// Import all room components
import StartRoom from "./primitives/game-rooms/StartRoom";
import CoffeeBiome from "./primitives/game-rooms/CoffeeBiome";
import MeditationBiome from "./primitives/game-rooms/MeditationBiome";
import LibraryUpgradeBiome from "./primitives/game-rooms/LibraryUpgradeBiome";
import MiddleStairsRoom from "./primitives/game-rooms/MiddleStairsRoom";
import StairsRoom from "./primitives/game-rooms/StairsRoom";
import ComponentShowcaseRoom from "./primitives/demo-rooms/ComponentShowcaseRoom";
import RoomFactory from "./primitives/game-rooms/RoomFactory";
import ShapedShell from "./primitives/game-rooms/ShapedShell";
import CleanBreakableRoom from "./primitives/demo-rooms/CleanBreakableRoom";
import OptionalBreakingDemo from "./primitives/demo-rooms/OptionalBreakingDemo";
import AllBreakableDemo from "./primitives/demo-rooms/AllBreakableDemo";
import UniversalBreakableDemo from "./primitives/demo-rooms/UniversalBreakableDemo";
import ArenaBiome from "./primitives/game-rooms/ArenaBiome";
import ColosseumRoom from "./primitives/game-rooms/ColosseumRoom";
import BossBiome from "./primitives/game-rooms/BossBiome";
import ChallengeBiome from "./primitives/game-rooms/ChallengeBiome";
import CorridorRoom from "./primitives/game-rooms/CorridorRoom";
import EndBiome from "./primitives/game-rooms/EndBiome";
import LibraryBiome from "./primitives/game-rooms/LibraryBiome";
import PortalBiome from "./primitives/game-rooms/PortalBiome";
import PuzzleBiome from "./primitives/game-rooms/PuzzleBiome";
import ShopBiome from "./primitives/game-rooms/ShopBiome";
import SpecialBiome from "./primitives/game-rooms/SpecialBiome";
import TreasureBiome from "./primitives/game-rooms/TreasureBiome";
import GymBiome from "./primitives/game-rooms/GymBiome";
import GardenBiome from "./primitives/game-rooms/GardenBiome";
import KitchenBiome from "./primitives/game-rooms/KitchenBiome";
import BedroomBiome from "./primitives/game-rooms/BedroomBiome";
import LaboratoryBiome from "./primitives/game-rooms/LaboratoryBiome";
import ObservatoryBiome from "./primitives/game-rooms/ObservatoryBiome";
import WorkshopBiome from "./primitives/game-rooms/WorkshopBiome";
import ArchBiome from "./primitives/game-rooms/ArchBiome";
import PillarBiome from "./primitives/game-rooms/PillarBiome";
import BarrierBiome from "./primitives/game-rooms/BarrierBiome";
import MazeBiome from "./primitives/game-rooms/MazeBiome";
import BridgeBiome from "./primitives/game-rooms/BridgeBiome";
import StatueBiome from "./primitives/game-rooms/StatueBiome";
import MultiBiomeRoom from "./primitives/game-rooms/MultiBiomeRoom";
import CrackedBrickDemo from "./primitives/demo-rooms/CrackedBrickDemo";

// Import object components
import ItemSprite from "./primitives/objects/ItemSprite";
import DestructibleWall from "./primitives/objects/DestructibleWall";
import CrackedDestructibleWall from "./primitives/objects/CrackedDestructibleWall";
import ParticleSystem from "./primitives/objects/ParticleSystem";
import MosaicCreator from "./primitives/objects/MosaicCreator";

// Import element components
import Tile from "./primitives/elements/Tile";
import Wall from "./primitives/elements/Wall";
import Ceiling from "./primitives/elements/Ceiling";
import Plank from "./primitives/elements/Plank";
import Stair from "./primitives/elements/Stair";
import Handrail from "./primitives/elements/Handrail";

// Import dungeon elements
import {
  Torch,
  Barrel,
  Chest,
  SpikeTrap,
  Pillar,
  Chain,
  Brazier,
  Spikes,
  Web,
} from "./primitives/elements";
import {
  Lever,
  Altar,
  Skeleton,
  PressurePlate,
  Statue,
  Switch,
} from "./primitives/objects";
import { CryptBiome, TrapBiome } from "./primitives/game-rooms";

// Import building block primitives
import {
  Brick,
  CrackedBrick,
  Stone,
  WoodPlank,
  MetalBar,
  Glass,
} from "./primitives/elements";

// Import complex primitives
import {
  StoneWall,
  WoodenFence,
  ConcreteSlab,
  MetalGate,
  GlassWall,
  WoodenBridge,
  DungeonCell,
  DungeonAltar,
  DungeonThrone,
  DungeonGate,
} from "./primitives/elements";

// Room configuration interface
interface RoomConfig {
  type: string;
  component: React.ComponentType<any>;
  title: string;
  emoji: string;
  description: string;
  props?: any;
  editableProps?: any[];
  category: "biome" | "object" | "element";
  subcategory?: string;
}

// Static room configurations
const ROOM_CONFIGS: RoomConfig[] = [
  {
    type: "all-breakable",
    component: AllBreakableDemo,
    title: "All Breakable Demo",
    emoji: "💥",
    description: "A demo of all breakable objects",
    props: { size: 10 },
    category: "room",
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
    type: "corridor",
    component: CorridorRoom,
    title: "Corridor Room",
    emoji: "🚪",
    description: "A connecting corridor between rooms",
    props: { size: 10 },
    category: "room",
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
    type: "multi-biome",
    component: MultiBiomeRoom,
    title: "Multi-Biome Room",
    emoji: "🏗️",
    description: "A room built from multiple biomes",
    props: {
      roomSize: 20,
      biomes: [
        { type: "bedroom", position: [-6, 0, -6], size: 8 },
        { type: "kitchen", position: [6, 0, -6], size: 8 },
        { type: "library", position: [-6, 0, 6], size: 8 },
        { type: "garden", position: [6, 0, 6], size: 8 },
      ],
    },
    category: "room",
    editableProps: [
      {
        key: "roomSize",
        label: "Room Size",
        type: "number",
        min: 10,
        max: 40,
        step: 5,
      },
    ],
  },
];

// Biome configurations
const BIOME_CONFIGS: RoomConfig[] = [
  {
    type: "coffee",
    component: CoffeeBiome,
    title: "Coffee Biome",
    emoji: "☕",
    description: "Coffee environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "buff",
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
    component: MeditationBiome,
    title: "Meditation Biome",
    emoji: "🧘",
    description: "Meditation environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "buff",
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
    type: "library",
    component: LibraryBiome,
    title: "Library Biome",
    emoji: "📚",
    description: "Library environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "resource",
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
    type: "shop",
    component: ShopBiome,
    title: "Shop Biome",
    emoji: "🛒",
    description: "Shop environment biome for rooms",
    props: { size: 10, onShopOpen: () => console.log("Shop opened!") },
    category: "biome",
    subcategory: "resource",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "treasure",
    component: TreasureBiome,
    title: "Treasure Biome",
    emoji: "💰",
    description: "Treasure environment biome for rooms",
    props: { size: 10, onTreasureOpen: () => console.log("Treasure opened!") },
    category: "biome",
    subcategory: "resource",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "puzzle",
    component: PuzzleBiome,
    title: "Puzzle Biome",
    emoji: "🧩",
    description: "Puzzle environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "puzzle",
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
    type: "boss",
    component: BossBiome,
    title: "Boss Biome",
    emoji: "👹",
    description: "Boss environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    type: "arena",
    component: ArenaBiome,
    title: "Arena Biome",
    emoji: "⚔️",
    description: "Arena environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    type: "end",
    component: EndBiome,
    title: "End Biome",
    emoji: "🏁",
    description: "End environment biome for rooms",
    props: { onVictory: () => console.log("Victory!") },
    category: "biome",
    subcategory: "special",
    editableProps: [],
  },
  {
    type: "portal",
    component: PortalBiome,
    title: "Portal Biome",
    emoji: "🌀",
    description: "Portal environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "transport",
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
    type: "special",
    component: SpecialBiome,
    title: "Special Biome",
    emoji: "✨",
    description: "Special environment biome for rooms",
    props: {
      roomType: "secret" as const,
      items: [],
    },
    category: "biome",
    subcategory: "special",
    editableProps: [
      {
        key: "roomType",
        label: "Room Type",
        type: "select",
        options: [
          { value: "devil-room", label: "Devil Room" },
          { value: "angel-room", label: "Angel Room" },
          { value: "cursed-room", label: "Cursed Room" },
          { value: "secret", label: "Secret" },
        ],
      },
    ],
  },
  {
    type: "challenge",
    component: ChallengeBiome,
    title: "Challenge Biome",
    emoji: "🎯",
    description: "Challenge environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    component: LibraryUpgradeBiome,
    title: "Library Upgrade Biome",
    emoji: "📖",
    description: "Library upgrade environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "resource",
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
    type: "colosseum",
    component: ColosseumRoom,
    title: "Colosseum Biome",
    emoji: "🏛️",
    description: "A grand colosseum environment biome for epic battles",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    type: "start",
    component: StartRoom,
    title: "Start Biome",
    emoji: "🚀",
    description: "The beginning environment biome of your adventure",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    type: "trap",
    component: TrapBiome,
    title: "Trap Biome",
    emoji: "⚠️",
    description: "Trap environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    type: "crypt",
    component: CryptBiome,
    title: "Crypt Biome",
    emoji: "⚰️",
    description: "Crypt environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "special",
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
    type: "gym",
    component: GymBiome,
    title: "Gym Biome",
    emoji: "💪",
    description: "Gym environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "buff",
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
    type: "bench-press",
    component: GymBiome,
    title: "Bench Press Biome",
    emoji: "🏋️",
    description: "Bench press environment biome for rooms",
    props: { size: 10 },
    category: "biome",
    subcategory: "buff",
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
    title: "Stairs Biome",
    emoji: "🪜",
    description: "Stairs environment biome for rooms",
    props: { direction: "up", roomWidth: 8, roomHeight: 6 },
    category: "biome",
    subcategory: "transport",
    editableProps: [
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { value: "up", label: "Up" },
          { value: "down", label: "Down" },
        ],
      },
      {
        key: "roomWidth",
        label: "Room Width",
        type: "number",
        min: 4,
        max: 16,
        step: 1,
      },
      {
        key: "roomHeight",
        label: "Room Height",
        type: "number",
        min: 3,
        max: 12,
        step: 1,
      },
    ],
  },
  {
    type: "middle-stairs",
    component: MiddleStairsRoom,
    title: "Middle Stairs Biome",
    emoji: "🪜",
    description: "Middle stairs environment biome for rooms",
    props: { position: "middle", roomWidth: 8, roomHeight: 6 },
    category: "biome",
    subcategory: "transport",
    editableProps: [
      {
        key: "position",
        label: "Position",
        type: "select",
        options: [
          { value: "top", label: "Top" },
          { value: "middle", label: "Middle" },
          { value: "bottom", label: "Bottom" },
        ],
      },
      {
        key: "roomWidth",
        label: "Room Width",
        type: "number",
        min: 4,
        max: 16,
        step: 1,
      },
      {
        key: "roomHeight",
        label: "Room Height",
        type: "number",
        min: 3,
        max: 12,
        step: 1,
      },
    ],
  },
  {
    type: "garden",
    component: GardenBiome,
    title: "Garden Biome",
    emoji: "🌿",
    description: "Garden environment biome for rooms",
    props: {
      size: 10,
      onGardenComplete: () => console.log("Garden complete!"),
    },
    category: "biome",
    subcategory: "buff",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "kitchen",
    component: KitchenBiome,
    title: "Kitchen Biome",
    emoji: "🍳",
    description: "Kitchen environment biome for rooms",
    props: {
      size: 10,
      onCookingComplete: () => console.log("Cooking complete!"),
    },
    category: "biome",
    subcategory: "utility",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "bedroom",
    component: BedroomBiome,
    title: "Bedroom Biome",
    emoji: "🛏️",
    description: "Bedroom environment biome for rooms",
    props: { size: 10, onRestComplete: () => console.log("Rest complete!") },
    category: "biome",
    subcategory: "buff",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "laboratory",
    component: LaboratoryBiome,
    title: "Laboratory Biome",
    emoji: "🧪",
    description: "Laboratory environment biome for rooms",
    props: {
      size: 10,
      onExperimentComplete: () => console.log("Experiment complete!"),
    },
    category: "biome",
    subcategory: "resource",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "observatory",
    component: ObservatoryBiome,
    title: "Observatory Biome",
    emoji: "🔭",
    description: "Observatory environment biome for rooms",
    props: {
      size: 10,
      onObservationComplete: () => console.log("Observation complete!"),
    },
    category: "biome",
    subcategory: "puzzle",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "workshop",
    component: WorkshopBiome,
    title: "Workshop Biome",
    emoji: "🔨",
    description: "Workshop environment biome for rooms",
    props: { size: 10, onCraftComplete: () => console.log("Craft complete!") },
    category: "biome",
    subcategory: "resource",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 30,
        step: 5,
      },
    ],
  },
  {
    type: "arch",
    component: ArchBiome,
    title: "Arch Biome",
    emoji: "🏛️",
    description: "Architectural arch structure biome",
    props: {
      size: 10,
      onPassThrough: () => console.log("Passed through arch!"),
    },
    category: "biome",
    subcategory: "obstacle",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 20,
        step: 5,
      },
    ],
  },
  {
    type: "pillar",
    component: PillarBiome,
    title: "Pillar Biome",
    emoji: "🏛️",
    description: "Pillar structure biome with navigation challenges",
    props: {
      size: 10,
      onNavigate: () => console.log("Navigated around pillars!"),
    },
    category: "biome",
    subcategory: "obstacle",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 20,
        step: 5,
      },
    ],
  },
  {
    type: "barrier",
    component: BarrierBiome,
    title: "Barrier Biome",
    emoji: "🚧",
    description: "Barrier obstacle biome with spikes and warnings",
    props: { size: 10, onOvercome: () => console.log("Overcame barrier!") },
    category: "biome",
    subcategory: "obstacle",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 20,
        step: 5,
      },
    ],
  },
  {
    type: "maze",
    component: MazeBiome,
    title: "Maze Biome",
    emoji: "🌀",
    description: "Maze navigation biome with start and end markers",
    props: { size: 15, onNavigate: () => console.log("Navigated maze!") },
    category: "biome",
    subcategory: "puzzle",
    editableProps: [
      {
        key: "size",
        label: "Maze Size",
        type: "number",
        min: 10,
        max: 40,
        step: 5,
      },
    ],
  },
  {
    type: "bridge",
    component: BridgeBiome,
    title: "Bridge Biome",
    emoji: "🌉",
    description: "Bridge crossing biome over water or gap",
    props: { size: 30, onCross: () => console.log("Crossed bridge!") },
    category: "biome",
    subcategory: "transport",
    editableProps: [
      {
        key: "size",
        label: "Bridge Length",
        type: "number",
        min: 10,
        max: 50,
        step: 5,
      },
    ],
  },
  {
    type: "statue",
    component: StatueBiome,
    title: "Statue Biome",
    emoji: "🗿",
    description: "Monumental statue biome with surrounding pillars",
    props: {
      size: 10,
      onInteract: () => console.log("Interacted with statue!"),
    },
    category: "biome",
    subcategory: "obstacle",
    editableProps: [
      {
        key: "size",
        label: "Biome Size",
        type: "number",
        min: 5,
        max: 20,
        step: 5,
      },
    ],
  },
];

// Object configurations
const OBJECT_CONFIGS: RoomConfig[] = [
  {
    type: "item-sprite",
    component: ItemSprite,
    title: "Item Sprite",
    emoji: "💎",
    description: "Interactive item sprites",
    props: {
      position: [0, 0, 0],
      item: {
        id: "test-gem",
        name: "Test Gem",
        type: "gem",
        value: 100,
        rarity: "common",
      },
      scale: 1,
    },
    category: "object",
    editableProps: [
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
    type: "destructible-wall",
    component: DestructibleWall,
    title: "Destructible Wall",
    emoji: "🧱",
    description: "Walls that can be destroyed",
    props: {
      position: [0, 0, 0],
      width: 2,
      height: 3,
      depth: 0.2,
      health: 3,
    },
    category: "object",
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
      {
        key: "health",
        label: "Health",
        type: "number",
        min: 1,
        max: 10,
        step: 1,
      },
    ],
  },
  {
    type: "cracked-destructible-wall",
    component: CrackedDestructibleWall,
    title: "Cracked Destructible Wall",
    emoji: "🧱💥",
    description:
      "Destructible wall made of cracked bricks with breakable system",
    props: {
      position: [0, 1.5, 0],
      health: 3,
      bombRequired: false,
      enabled: true,
    },
    category: "object",
    editableProps: [
      {
        key: "health",
        label: "Health",
        type: "number",
        min: 1,
        max: 10,
        step: 1,
      },
      {
        key: "bombRequired",
        label: "Bomb Required",
        type: "boolean",
      },
      {
        key: "enabled",
        label: "Breaking Enabled",
        type: "boolean",
      },
    ],
  },
  {
    type: "particle-system",
    component: ParticleSystem,
    title: "Particle System",
    emoji: "✨",
    description: "Dynamic particle effects",
    props: {
      particles: [
        {
          position: [0, 0, 0] as [number, number, number],
          velocity: [0, 1, 0] as [number, number, number],
          life: 1.0,
          maxLife: 1.0,
          size: 0.1,
          color: "#ff6b6b",
        },
        {
          position: [1, 0, 0] as [number, number, number],
          velocity: [0, 1, 0] as [number, number, number],
          life: 1.0,
          maxLife: 1.0,
          size: 0.1,
          color: "#4ecdc4",
        },
        {
          position: [-1, 0, 0] as [number, number, number],
          velocity: [0, 1, 0] as [number, number, number],
          life: 1.0,
          maxLife: 1.0,
          size: 0.1,
          color: "#45b7d1",
        },
        {
          position: [0, 0, 1] as [number, number, number],
          velocity: [0, 1, 0] as [number, number, number],
          life: 1.0,
          maxLife: 1.0,
          size: 0.1,
          color: "#96ceb4",
        },
        {
          position: [0, 0, -1] as [number, number, number],
          velocity: [0, 1, 0] as [number, number, number],
          life: 1.0,
          maxLife: 1.0,
          size: 0.1,
          color: "#ffeaa7",
        },
      ],
    },
    category: "object",
    editableProps: [
      {
        key: "particles",
        label: "Particle Count",
        type: "number",
        min: 1,
        max: 50,
        step: 1,
      },
    ],
  },
  {
    type: "mosaic-creator",
    component: MosaicCreator,
    title: "3D Mosaic Creator",
    emoji: "🧩",
    description: "Create 3D mosaic patterns",
    props: {
      position: [0, 0, 0],
      size: 5,
    },
    category: "object",
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
  // Dungeon Objects
  {
    type: "lever",
    component: Lever,
    title: "Lever",
    emoji: "🎛️",
    description: "Interactive control lever",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      isActivated: false,
      label: "Lever",
    },
    category: "object",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "label",
        label: "Label",
        type: "text",
      },
    ],
  },
  {
    type: "altar",
    component: Altar,
    title: "Altar",
    emoji: "⛩️",
    description: "Mystical altar for offerings",
    props: {
      position: [0, 0, 0],
      color: "#2C2C2C",
      scale: 1,
      isActivated: false,
      offering: "Soul",
      glowColor: "#8A2BE2",
    },
    category: "object",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "offering",
        label: "Offering Type",
        type: "text",
      },
      {
        key: "glowColor",
        label: "Glow Color",
        type: "color",
      },
    ],
  },
  {
    type: "skeleton",
    component: Skeleton,
    title: "Skeleton",
    emoji: "💀",
    description: "Animated skeleton enemy",
    props: {
      position: [0, 0, 0],
      color: "#F5F5DC",
      scale: 1,
      isAnimated: true,
      health: 50,
    },
    category: "object",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "isAnimated",
        label: "Animated",
        type: "boolean",
      },
      {
        key: "health",
        label: "Health",
        type: "number",
        min: 1,
        max: 100,
        step: 1,
      },
    ],
  },
  // Additional Dungeon Objects
  {
    type: "pressure-plate",
    component: PressurePlate,
    title: "Pressure Plate",
    emoji: "⚖️",
    description: "Interactive pressure plate",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      isPressed: false,
      label: "Pressure Plate",
      weight: 1,
    },
    category: "object",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "label",
        label: "Label",
        type: "text",
      },
      {
        key: "weight",
        label: "Weight Required",
        type: "number",
        min: 1,
        max: 10,
        step: 1,
      },
    ],
  },
  {
    type: "statue",
    component: Statue,
    title: "Statue",
    emoji: "🗿",
    description: "Decorative statue",
    props: {
      position: [0, 0, 0],
      color: "#C0C0C0",
      scale: 1,
      type: "warrior",
      isAnimated: false,
    },
    category: "object",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "type",
        label: "Type",
        type: "select",
        options: [
          { value: "warrior", label: "Warrior" },
          { value: "mage", label: "Mage" },
          { value: "guardian", label: "Guardian" },
          { value: "deity", label: "Deity" },
        ],
      },
      {
        key: "isAnimated",
        label: "Animated",
        type: "boolean",
      },
    ],
  },
  {
    type: "switch",
    component: Switch,
    title: "Switch",
    emoji: "🔘",
    description: "Interactive switch",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      isOn: false,
      label: "Switch",
      switchType: "toggle",
    },
    category: "object",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "label",
        label: "Label",
        type: "text",
      },
      {
        key: "switchType",
        label: "Switch Type",
        type: "select",
        options: [
          { value: "toggle", label: "Toggle" },
          { value: "momentary", label: "Momentary" },
          { value: "rotary", label: "Rotary" },
        ],
      },
    ],
  },
];

// Element configurations
const ELEMENT_CONFIGS: RoomConfig[] = [
  {
    type: "tile",
    component: Tile,
    title: "Tile",
    emoji: "🔲",
    description: "Basic floor tile",
    props: {
      position: [0, 0, 0],
      size: 1,
      color: "#8B4513",
    },
    category: "element",
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
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "wall",
    component: Wall,
    title: "Wall",
    emoji: "🧱",
    description: "Basic wall segment",
    props: {
      position: [0, 0, 0],
      width: 2,
      height: 3,
      depth: 0.2,
      color: "#696969",
      material: "brick",
    },
    category: "element",
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
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "material",
        label: "Material",
        type: "select",
        options: [
          { value: "stone", label: "Stone" },
          { value: "brick", label: "Brick" },
          { value: "wood", label: "Wood" },
          { value: "plaster", label: "Plaster" },
          { value: "metal", label: "Metal" },
          { value: "concrete", label: "Concrete" },
        ],
      },
    ],
  },
  {
    type: "ceiling",
    component: Ceiling,
    title: "Ceiling",
    emoji: "🏠",
    description: "Basic ceiling tile",
    props: {
      position: [0, 0, 0],
      size: 2,
      color: "#D2B48C",
    },
    category: "element",
    editableProps: [
      {
        key: "size",
        label: "Size",
        type: "number",
        min: 0.1,
        max: 10,
        step: 0.1,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "plank",
    component: Plank,
    title: "Plank",
    emoji: "🪵",
    description: "Wooden plank",
    props: {
      position: [0, 0, 0],
      length: 2,
      color: "#8B4513",
    },
    category: "element",
    editableProps: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "stair",
    component: Stair,
    title: "Stair",
    emoji: "🪜",
    description: "Staircase segment",
    props: {
      position: [0, 0, 0],
      width: 1,
      height: 1,
      depth: 1,
      color: "#8B4513",
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "handrail",
    component: Handrail,
    title: "Handrail",
    emoji: "🪝",
    description: "Safety handrail",
    props: {
      position: [0, 0, 0],
      length: 2,
      height: 1,
      color: "#C0C0C0",
    },
    category: "element",
    editableProps: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 0.1,
        max: 5,
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
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  // Dungeon Elements
  {
    type: "torch",
    component: Torch,
    title: "Torch",
    emoji: "🔥",
    description: "Flickering torch with light",
    props: {
      position: [0, 0, 0],
      color: "#ff6b35",
      intensity: 2,
      flicker: true,
      scale: 1,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "intensity",
        label: "Light Intensity",
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "flicker",
        label: "Flicker",
        type: "boolean",
      },
    ],
  },
  {
    type: "barrel",
    component: Barrel,
    title: "Barrel",
    emoji: "🛢️",
    description: "Wooden barrel container",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      health: 3,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "health",
        label: "Health",
        type: "number",
        min: 1,
        max: 10,
        step: 1,
      },
    ],
  },
  {
    type: "chest",
    component: Chest,
    title: "Treasure Chest",
    emoji: "📦",
    description: "Interactive treasure chest",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      isOpen: false,
      treasure: "Gold",
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "treasure",
        label: "Treasure Type",
        type: "text",
      },
    ],
  },
  {
    type: "door",
    component: Door,
    title: "Door",
    emoji: "🚪",
    description: "Interactive door with lock",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      isOpen: false,
      isLocked: false,
      keyRequired: "iron_key",
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "isLocked",
        label: "Locked",
        type: "boolean",
      },
      {
        key: "keyRequired",
        label: "Key Required",
        type: "text",
      },
    ],
  },
  {
    type: "spike-trap",
    component: SpikeTrap,
    title: "Spike Trap",
    emoji: "⚡",
    description: "Dangerous spike trap",
    props: {
      position: [0, 0, 0],
      color: "#C0C0C0",
      scale: 1,
      isActive: true,
      damage: 10,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "isActive",
        label: "Active",
        type: "boolean",
      },
      {
        key: "damage",
        label: "Damage",
        type: "number",
        min: 1,
        max: 50,
        step: 1,
      },
    ],
  },
  // Additional Dungeon Elements
  {
    type: "pillar",
    component: Pillar,
    title: "Pillar",
    emoji: "🏛️",
    description: "Decorative stone pillar",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      height: 3,
      radius: 0.3,
      hasCap: true,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 10,
        step: 0.1,
      },
      {
        key: "radius",
        label: "Radius",
        type: "number",
        min: 0.1,
        max: 1,
        step: 0.05,
      },
    ],
  },
  {
    type: "chain",
    component: Chain,
    title: "Chain",
    emoji: "⛓️",
    description: "Swinging metal chain",
    props: {
      position: [0, 0, 0],
      color: "#C0C0C0",
      scale: 1,
      length: 3,
      links: 8,
      swing: true,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 1,
        max: 10,
        step: 0.1,
      },
      {
        key: "swing",
        label: "Swing",
        type: "boolean",
      },
    ],
  },
  {
    type: "brazier",
    component: Brazier,
    title: "Brazier",
    emoji: "🔥",
    description: "Large fire brazier with light",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      isLit: true,
      flameColor: "#ff6b35",
      intensity: 2,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "isLit",
        label: "Lit",
        type: "boolean",
      },
      {
        key: "flameColor",
        label: "Flame Color",
        type: "color",
      },
    ],
  },
  {
    type: "spikes",
    component: Spikes,
    title: "Spikes",
    emoji: "⚡",
    description: "Dangerous spike field",
    props: {
      position: [0, 0, 0],
      color: "#C0C0C0",
      scale: 1,
      count: 9,
      height: 0.5,
      damage: 15,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "count",
        label: "Spike Count",
        type: "number",
        min: 1,
        max: 25,
        step: 1,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 0.1,
        max: 2,
        step: 0.1,
      },
    ],
  },
  {
    type: "web",
    component: Web,
    title: "Spider Web",
    emoji: "🕸️",
    description: "Sticky spider web",
    props: {
      position: [0, 0, 0],
      color: "#F5F5DC",
      scale: 1,
      size: 2,
      sticky: true,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "size",
        label: "Size",
        type: "number",
        min: 0.5,
        max: 5,
        step: 0.1,
      },
      {
        key: "sticky",
        label: "Sticky",
        type: "boolean",
      },
    ],
  },
  // Building Block Primitives
  {
    type: "brick",
    component: Brick,
    title: "Brick",
    emoji: "🧱",
    description: "Building brick block",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      brickType: "standard",
      size: [1, 0.5, 0.5],
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "brickType",
        label: "Brick Type",
        type: "select",
        options: [
          { value: "standard", label: "Standard" },
          { value: "weathered", label: "Weathered" },
          { value: "ancient", label: "Ancient" },
          { value: "modern", label: "Modern" },
        ],
      },
    ],
  },
  {
    type: "cracked-brick",
    component: CrackedBrick,
    title: "Cracked Brick",
    emoji: "🧱💥",
    description: "Cracked brick with different damage levels",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      crackIntensity: "medium",
      size: [1, 0.5, 0.5],
      enabled: true,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "crackIntensity",
        label: "Crack Intensity",
        type: "select",
        options: [
          { value: "light", label: "Light" },
          { value: "medium", label: "Medium" },
          { value: "heavy", label: "Heavy" },
        ],
      },
      {
        key: "enabled",
        label: "Breaking Enabled",
        type: "boolean",
      },
    ],
  },
  {
    type: "stone",
    component: Stone,
    title: "Stone",
    emoji: "🪨",
    description: "Stone building block",
    props: {
      position: [0, 0, 0],
      color: "#696969",
      scale: 1,
      stoneType: "cobblestone",
      size: [1, 0.8, 1],
      shape: "cube",
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "stoneType",
        label: "Stone Type",
        type: "select",
        options: [
          { value: "cobblestone", label: "Cobblestone" },
          { value: "marble", label: "Marble" },
          { value: "granite", label: "Granite" },
          { value: "limestone", label: "Limestone" },
          { value: "sandstone", label: "Sandstone" },
        ],
      },
      {
        key: "shape",
        label: "Shape",
        type: "select",
        options: [
          { value: "cube", label: "Cube" },
          { value: "irregular", label: "Irregular" },
          { value: "rounded", label: "Rounded" },
        ],
      },
    ],
  },
  {
    type: "wood-plank",
    component: WoodPlank,
    title: "Wood Plank",
    emoji: "🪵",
    description: "Wooden plank board",
    props: {
      position: [0, 0, 0],
      color: "#8B4513",
      scale: 1,
      woodType: "oak",
      size: [2, 0.2, 0.5],
      grainDirection: "horizontal",
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "woodType",
        label: "Wood Type",
        type: "select",
        options: [
          { value: "oak", label: "Oak" },
          { value: "pine", label: "Pine" },
          { value: "mahogany", label: "Mahogany" },
          { value: "cedar", label: "Cedar" },
          { value: "birch", label: "Birch" },
        ],
      },
      {
        key: "grainDirection",
        label: "Grain Direction",
        type: "select",
        options: [
          { value: "horizontal", label: "Horizontal" },
          { value: "vertical", label: "Vertical" },
        ],
      },
    ],
  },
  {
    type: "metal-bar",
    component: MetalBar,
    title: "Metal Bar",
    emoji: "🔩",
    description: "Metal bar or rod",
    props: {
      position: [0, 0, 0],
      color: "#C0C0C0",
      scale: 1,
      metalType: "iron",
      size: [2, 0.1, 0.1],
      shape: "round",
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "metalType",
        label: "Metal Type",
        type: "select",
        options: [
          { value: "iron", label: "Iron" },
          { value: "steel", label: "Steel" },
          { value: "copper", label: "Copper" },
          { value: "bronze", label: "Bronze" },
          { value: "gold", label: "Gold" },
        ],
      },
      {
        key: "shape",
        label: "Shape",
        type: "select",
        options: [
          { value: "round", label: "Round" },
          { value: "square", label: "Square" },
          { value: "hexagonal", label: "Hexagonal" },
        ],
      },
    ],
  },
  {
    type: "glass",
    component: Glass,
    title: "Glass",
    emoji: "🪟",
    description: "Glass panel or window",
    props: {
      position: [0, 0, 0],
      color: "#E6F3FF",
      scale: 1,
      glassType: "clear",
      size: [1, 1, 0.1],
      thickness: 0.1,
    },
    category: "element",
    editableProps: [
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "glassType",
        label: "Glass Type",
        type: "select",
        options: [
          { value: "clear", label: "Clear" },
          { value: "tinted", label: "Tinted" },
          { value: "frosted", label: "Frosted" },
          { value: "stained", label: "Stained" },
          { value: "safety", label: "Safety" },
        ],
      },
      {
        key: "thickness",
        label: "Thickness",
        type: "number",
        min: 0.01,
        max: 0.5,
        step: 0.01,
      },
    ],
  },
  // Complex primitives made from smaller building blocks
  {
    type: "stone-wall",
    component: StoneWall,
    title: "Stone Wall",
    emoji: "🏛️",
    description: "Wall made from individual stone blocks",
    props: {
      position: [0, 0, 0],
      width: 8,
      height: 4,
      depth: 0.5,
      color: "#8B7355",
      hasWindows: false,
      windowCount: 1,
      hasDoors: false,
      doorWidth: 2,
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 2,
        max: 20,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 10,
        step: 0.5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.1,
        max: 2,
        step: 0.1,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "hasWindows",
        label: "Has Windows",
        type: "checkbox",
      },
      {
        key: "windowCount",
        label: "Window Count",
        type: "number",
        min: 0,
        max: 5,
        step: 1,
      },
      {
        key: "hasDoors",
        label: "Has Doors",
        type: "checkbox",
      },
      {
        key: "doorWidth",
        label: "Door Width",
        type: "number",
        min: 1,
        max: 4,
        step: 0.5,
      },
    ],
  },
  {
    type: "wooden-fence",
    component: WoodenFence,
    title: "Wooden Fence",
    emoji: "🚧",
    description: "Fence made from wooden planks and posts",
    props: {
      position: [0, 0, 0],
      length: 8,
      height: 2,
      color: "#8B4513",
    },
    category: "element",
    editableProps: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 2,
        max: 20,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 5,
        step: 0.5,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "concrete-slab",
    component: ConcreteSlab,
    title: "Concrete Slab",
    emoji: "🏗️",
    description: "Slab made from concrete blocks",
    props: {
      position: [0, 0, 0],
      width: 6,
      length: 8,
      thickness: 0.3,
      color: "#C0C0C0",
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 2,
        max: 20,
        step: 0.5,
      },
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 2,
        max: 20,
        step: 0.5,
      },
      {
        key: "thickness",
        label: "Thickness",
        type: "number",
        min: 0.1,
        max: 2,
        step: 0.1,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "metal-gate",
    component: MetalGate,
    title: "Metal Gate",
    emoji: "🚪",
    description: "Gate made from metal bars",
    props: {
      position: [0, 0, 0],
      width: 4,
      height: 3,
      color: "#C0C0C0",
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 2,
        max: 10,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 8,
        step: 0.5,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
    ],
  },
  {
    type: "glass-wall",
    component: GlassWall,
    title: "Glass Wall",
    emoji: "🪟",
    description: "Wall made from glass panels",
    props: {
      position: [0, 0, 0],
      width: 6,
      height: 3,
      depth: 0.1,
      color: "#E6F3FF",
      opacity: 0.3,
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 2,
        max: 15,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 8,
        step: 0.5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.05,
        max: 0.5,
        step: 0.05,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "opacity",
        label: "Opacity",
        type: "number",
        min: 0.1,
        max: 1,
        step: 0.1,
      },
    ],
  },
  // Additional complex primitives made from smaller building blocks
  {
    type: "wooden-bridge",
    component: WoodenBridge,
    title: "Wooden Bridge",
    emoji: "🌉",
    description: "Bridge made from wooden planks and posts",
    props: {
      position: [0, 0, 0],
      length: 12,
      width: 3,
      height: 2,
      color: "#8B4513",
      hasRails: true,
      hasSupportPillars: true,
    },
    category: "element",
    editableProps: [
      {
        key: "length",
        label: "Length",
        type: "number",
        min: 6,
        max: 30,
        step: 0.5,
      },
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 2,
        max: 8,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 6,
        step: 0.5,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "hasRails",
        label: "Has Rails",
        type: "checkbox",
      },
      {
        key: "hasSupportPillars",
        label: "Has Support Pillars",
        type: "checkbox",
      },
    ],
  },
  // Dungeon-themed complex primitives
  {
    type: "dungeon-cell",
    component: DungeonCell,
    title: "Dungeon Cell",
    emoji: "🔒",
    description: "Prison cell with bars, chains, and straw",
    props: {
      position: [0, 0, 0],
      width: 4,
      height: 3,
      depth: 4,
      color: "#8B7355",
      hasBars: true,
      barCount: 6,
      hasDoor: true,
      doorWidth: 1.5,
      hasChains: true,
      chainCount: 2,
      hasStraw: true,
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 3,
        max: 8,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 2,
        max: 6,
        step: 0.5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 3,
        max: 8,
        step: 0.5,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "hasBars",
        label: "Has Bars",
        type: "checkbox",
      },
      {
        key: "barCount",
        label: "Bar Count",
        type: "number",
        min: 4,
        max: 12,
        step: 1,
      },
      {
        key: "hasDoor",
        label: "Has Door",
        type: "checkbox",
      },
      {
        key: "doorWidth",
        label: "Door Width",
        type: "number",
        min: 1,
        max: 3,
        step: 0.5,
      },
      {
        key: "hasChains",
        label: "Has Chains",
        type: "checkbox",
      },
      {
        key: "chainCount",
        label: "Chain Count",
        type: "number",
        min: 1,
        max: 6,
        step: 1,
      },
      {
        key: "hasStraw",
        label: "Has Straw",
        type: "checkbox",
      },
    ],
  },
  {
    type: "dungeon-altar",
    component: DungeonAltar,
    title: "Dungeon Altar",
    emoji: "⚰️",
    description: "Dark altar with candles, skulls, and runes",
    props: {
      position: [0, 0, 0],
      width: 3,
      height: 2,
      depth: 2,
      color: "#8B7355",
      hasCandles: true,
      candleCount: 4,
      hasSkulls: true,
      skullCount: 2,
      hasRunes: true,
      runeCount: 6,
      hasChains: true,
      chainCount: 4,
      hasBlood: true,
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 2,
        max: 6,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 1,
        max: 4,
        step: 0.5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 2,
        max: 6,
        step: 0.5,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "hasCandles",
        label: "Has Candles",
        type: "checkbox",
      },
      {
        key: "candleCount",
        label: "Candle Count",
        type: "number",
        min: 2,
        max: 8,
        step: 1,
      },
      {
        key: "hasSkulls",
        label: "Has Skulls",
        type: "checkbox",
      },
      {
        key: "skullCount",
        label: "Skull Count",
        type: "number",
        min: 1,
        max: 6,
        step: 1,
      },
      {
        key: "hasRunes",
        label: "Has Runes",
        type: "checkbox",
      },
      {
        key: "runeCount",
        label: "Rune Count",
        type: "number",
        min: 2,
        max: 12,
        step: 1,
      },
      {
        key: "hasChains",
        label: "Has Chains",
        type: "checkbox",
      },
      {
        key: "chainCount",
        label: "Chain Count",
        type: "number",
        min: 2,
        max: 8,
        step: 1,
      },
      {
        key: "hasBlood",
        label: "Has Blood",
        type: "checkbox",
      },
    ],
  },
  {
    type: "dungeon-throne",
    component: DungeonThrone,
    title: "Dungeon Throne",
    emoji: "👑",
    description: "Dark throne with skulls, chains, and spikes",
    props: {
      position: [0, 0, 0],
      width: 2,
      height: 3,
      depth: 2,
      color: "#8B7355",
      hasArmrests: true,
      hasBackrest: true,
      hasSkulls: true,
      skullCount: 4,
      hasChains: true,
      chainCount: 2,
      hasCushion: true,
      hasSpikes: true,
      spikeCount: 6,
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 1.5,
        max: 4,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 2,
        max: 6,
        step: 0.5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 1.5,
        max: 4,
        step: 0.5,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "hasArmrests",
        label: "Has Armrests",
        type: "checkbox",
      },
      {
        key: "hasBackrest",
        label: "Has Backrest",
        type: "checkbox",
      },
      {
        key: "hasSkulls",
        label: "Has Skulls",
        type: "checkbox",
      },
      {
        key: "skullCount",
        label: "Skull Count",
        type: "number",
        min: 2,
        max: 8,
        step: 1,
      },
      {
        key: "hasChains",
        label: "Has Chains",
        type: "checkbox",
      },
      {
        key: "chainCount",
        label: "Chain Count",
        type: "number",
        min: 1,
        max: 4,
        step: 1,
      },
      {
        key: "hasCushion",
        label: "Has Cushion",
        type: "checkbox",
      },
      {
        key: "hasSpikes",
        label: "Has Spikes",
        type: "checkbox",
      },
      {
        key: "spikeCount",
        label: "Spike Count",
        type: "number",
        min: 2,
        max: 12,
        step: 1,
      },
    ],
  },
  {
    type: "dungeon-gate",
    component: DungeonGate,
    title: "Dungeon Gate",
    emoji: "🚪",
    description: "Imposing gate with portcullis, skulls, and runes",
    props: {
      position: [0, 0, 0],
      width: 4,
      height: 6,
      depth: 1,
      color: "#8B7355",
      hasPortcullis: true,
      hasChains: true,
      chainCount: 4,
      hasSkulls: true,
      skullCount: 6,
      hasRunes: true,
      runeCount: 8,
      hasSpikes: true,
      spikeCount: 8,
      hasTorches: true,
      torchCount: 2,
    },
    category: "element",
    editableProps: [
      {
        key: "width",
        label: "Width",
        type: "number",
        min: 3,
        max: 8,
        step: 0.5,
      },
      {
        key: "height",
        label: "Height",
        type: "number",
        min: 4,
        max: 12,
        step: 0.5,
      },
      {
        key: "depth",
        label: "Depth",
        type: "number",
        min: 0.5,
        max: 2,
        step: 0.1,
      },
      {
        key: "color",
        label: "Color",
        type: "color",
      },
      {
        key: "hasPortcullis",
        label: "Has Portcullis",
        type: "checkbox",
      },
      {
        key: "hasChains",
        label: "Has Chains",
        type: "checkbox",
      },
      {
        key: "chainCount",
        label: "Chain Count",
        type: "number",
        min: 2,
        max: 8,
        step: 1,
      },
      {
        key: "hasSkulls",
        label: "Has Skulls",
        type: "checkbox",
      },
      {
        key: "skullCount",
        label: "Skull Count",
        type: "number",
        min: 2,
        max: 12,
        step: 1,
      },
      {
        key: "hasRunes",
        label: "Has Runes",
        type: "checkbox",
      },
      {
        key: "runeCount",
        label: "Rune Count",
        type: "number",
        min: 4,
        max: 16,
        step: 1,
      },
      {
        key: "hasSpikes",
        label: "Has Spikes",
        type: "checkbox",
      },
      {
        key: "spikeCount",
        label: "Spike Count",
        type: "number",
        min: 4,
        max: 16,
        step: 1,
      },
      {
        key: "hasTorches",
        label: "Has Torches",
        type: "checkbox",
      },
      {
        key: "torchCount",
        label: "Torch Count",
        type: "number",
        min: 2,
        max: 6,
        step: 1,
      },
    ],
  },
];

const LoadingFallback: React.FC = () => (
  <Html position={[0, 0, 0]}>
    <div
      style={{
        color: "white",
        background: "rgba(0,0,0,0.8)",
        padding: "20px",
        borderRadius: "8px",
      }}
    >
      Loading components...
    </div>
  </Html>
);

// Main editor component
const AutoThreeDEditor: React.FC = () => {
  const { urlParams, updateURL, getParam } = useURLParams();

  const [selectedCategory, setSelectedCategory] = useState<
    "rooms" | "biomes" | "objects" | "elements"
  >(
    () =>
      (getParam("category") as "rooms" | "biomes" | "objects" | "elements") ||
      "rooms"
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(
    () => getParam("subcategory") || "all"
  );
  const [selectedComponent, setSelectedComponent] = useState<RoomConfig | null>(
    () => {
      const componentType = getParam("componentType");
      const category = getParam("category") as
        | "rooms"
        | "biomes"
        | "objects"
        | "elements";
      console.log(
        "AutoThreeDEditor: Initializing with componentType:",
        componentType,
        "category:",
        category
      );
      if (componentType) {
        let configs = ROOM_CONFIGS;
        if (category === "biomes") configs = BIOME_CONFIGS;
        else if (category === "objects") configs = OBJECT_CONFIGS;
        else if (category === "elements") configs = ELEMENT_CONFIGS;

        console.log(
          "AutoThreeDEditor: Looking in configs:",
          configs.length,
          "items"
        );
        const found = configs.find((config) => config.type === componentType);
        console.log("AutoThreeDEditor: Found component:", found);
        return found || null;
      }
      return null;
    }
  );
  const [selectedObject, setSelectedObject] = useState<RoomConfig | null>(
    () => {
      const objectType = getParam("objectType");
      if (objectType) {
        return (
          OBJECT_CONFIGS.find((config) => config.type === objectType) || null
        );
      }
      return null;
    }
  );
  const [selectedElement, setSelectedElement] = useState<RoomConfig | null>(
    () => {
      const elementType = getParam("elementType");
      if (elementType) {
        return (
          ELEMENT_CONFIGS.find((config) => config.type === elementType) || null
        );
      }
      return null;
    }
  );
  const [componentProps, setComponentProps] = useState<any>(() =>
    parseJSON(getParam("componentProps"), {})
  );
  const [objectProps, setObjectProps] = useState<any>(() =>
    parseJSON(getParam("objectProps"), {})
  );
  const [elementProps, setElementProps] = useState<any>(() =>
    parseJSON(getParam("elementProps"), {})
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load components on mount
  useEffect(() => {
    loadComponents();
  }, []);

  // Update URL when category changes
  useEffect(() => {
    updateURL({
      category: selectedCategory,
    });
  }, [selectedCategory, updateURL]);

  // Update URL when subcategory changes
  useEffect(() => {
    updateURL({
      subcategory: selectedSubcategory,
    });
  }, [selectedSubcategory, updateURL]);

  const loadComponents = async () => {
    try {
      setIsLoading(true);

      // Only set default selections if no URL parameters are present
      const componentType = getParam("componentType");
      const objectType = getParam("objectType");
      const elementType = getParam("elementType");

      if (!componentType && ROOM_CONFIGS.length > 0) {
        setSelectedComponent(ROOM_CONFIGS[0]);
        setComponentProps(ROOM_CONFIGS[0].props || {});
      }
      if (!objectType && OBJECT_CONFIGS.length > 0) {
        setSelectedObject(OBJECT_CONFIGS[0]);
        setObjectProps(OBJECT_CONFIGS[0].props || {});
      }
      if (!elementType && ELEMENT_CONFIGS.length > 0) {
        setSelectedElement(ELEMENT_CONFIGS[0]);
        setElementProps(ELEMENT_CONFIGS[0].props || {});
      }

      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load components:", err);
      setError(
        "Failed to load components. Please check the console for details."
      );
      setIsLoading(false);
    }
  };

  const handleComponentSelect = (component: RoomConfig) => {
    setSelectedComponent(component);
    setComponentProps(component.props || {});
    updateURL({
      componentType: component.type,
      componentProps: serializeJSON(component.props || {}),
    });
  };

  const handleObjectSelect = (object: RoomConfig) => {
    setSelectedObject(object);
    setObjectProps(object.props || {});
    updateURL({
      objectType: object.type,
      objectProps: serializeJSON(object.props || {}),
    });
  };

  const handleElementSelect = (element: RoomConfig) => {
    setSelectedElement(element);
    setElementProps(element.props || {});
    updateURL({
      elementType: element.type,
      elementProps: serializeJSON(element.props || {}),
    });
  };

  const handlePropChange = (key: string, value: any) => {
    const newProps = { ...componentProps, [key]: value };
    setComponentProps(newProps);
    updateURL({
      componentProps: serializeJSON(newProps),
    });
  };

  const handleObjectPropChange = (key: string, value: any) => {
    const newProps = { ...objectProps, [key]: value };
    setObjectProps(newProps);
    updateURL({
      objectProps: serializeJSON(newProps),
    });
  };

  const handleElementPropChange = (key: string, value: any) => {
    const newProps = { ...elementProps, [key]: value };
    setElementProps(newProps);
    updateURL({
      elementProps: serializeJSON(newProps),
    });
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#1a1a1a",
          color: "white",
        }}
      >
        <div>
          <h2>Loading 3D Editor...</h2>
          <p>Please wait while components are being loaded.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#1a1a1a",
          color: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h2>Error Loading 3D Editor</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "10px 20px",
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Get current configs based on selected category and subcategory
  const getCurrentConfigs = () => {
    let configs = [];
    switch (selectedCategory) {
      case "rooms":
        configs = ROOM_CONFIGS;
        break;
      case "biomes":
        configs = BIOME_CONFIGS;
        break;
      case "objects":
        configs = OBJECT_CONFIGS;
        break;
      case "elements":
        configs = ELEMENT_CONFIGS;
        break;
      default:
        return ROOM_CONFIGS;
    }

    // Filter by subcategory if not "all"
    if (selectedCategory === "biomes" && selectedSubcategory !== "all") {
      return configs.filter(
        (config) => config.subcategory === selectedSubcategory
      );
    }

    return configs;
  };

  // Get current selection based on category
  const getCurrentSelection = () => {
    switch (selectedCategory) {
      case "rooms":
        return selectedComponent;
      case "biomes":
        return selectedComponent;
      case "objects":
        return selectedObject;
      case "elements":
        return selectedElement;
      default:
        return selectedComponent;
    }
  };

  // Get current props based on category
  const getCurrentProps = () => {
    switch (selectedCategory) {
      case "rooms":
        return componentProps;
      case "biomes":
        return componentProps;
      case "objects":
        return objectProps;
      case "elements":
        return elementProps;
      default:
        return componentProps;
    }
  };

  // Handle category selection
  const handleCategorySelect = (
    category: "rooms" | "biomes" | "objects" | "elements"
  ) => {
    setSelectedCategory(category);
  };

  // Handle component selection based on category
  const handleItemSelect = (item: RoomConfig) => {
    switch (selectedCategory) {
      case "rooms":
        handleComponentSelect(item);
        break;
      case "biomes":
        handleComponentSelect(item);
        break;
      case "objects":
        handleObjectSelect(item);
        break;
      case "elements":
        handleElementSelect(item);
        break;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#1a1a1a" }}>
      {/* Navigation */}
      <SharedNavigation currentPage="editor" />

      {/* Sidebar */}
      <div
        style={{
          width: "300px",
          background: "#2a2a2a",
          padding: "20px",
          overflowY: "auto",
          borderRight: "1px solid #444",
        }}
      >
        <h2 style={{ color: "white", marginBottom: "20px" }}>3D Editor</h2>

        {/* Category Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "5px", marginBottom: "15px" }}>
            {[
              { key: "rooms", label: "🏠 Rooms", count: ROOM_CONFIGS.length },
              {
                key: "biomes",
                label: "🌍 Biomes",
                count: BIOME_CONFIGS.length,
              },
              {
                key: "objects",
                label: "🎯 Objects",
                count: OBJECT_CONFIGS.length,
              },
              {
                key: "elements",
                label: "🧱 Elements",
                count: ELEMENT_CONFIGS.length,
              },
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => {
                  handleCategorySelect(
                    category.key as "rooms" | "biomes" | "objects" | "elements"
                  );
                  setSelectedSubcategory("all"); // Reset subcategory when changing category
                }}
                style={{
                  padding: "8px 12px",
                  background:
                    selectedCategory === category.key ? "#4CAF50" : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {category.label}
                <span
                  style={{
                    background:
                      selectedCategory === category.key
                        ? "rgba(255,255,255,0.3)"
                        : "rgba(255,255,255,0.1)",
                    padding: "2px 6px",
                    borderRadius: "10px",
                    fontSize: "10px",
                  }}
                >
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Subcategory Filter for Biomes */}
          {selectedCategory === "biomes" && (
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  color: "white",
                  fontSize: "14px",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Subcategory:
              </label>
              <select
                value={selectedSubcategory}
                onChange={(e) => setSelectedSubcategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  background: "#444",
                  color: "white",
                  border: "1px solid #666",
                  borderRadius: "4px",
                  fontSize: "12px",
                }}
              >
                <option value="all">All Biomes</option>
                <option value="buff">💪 Buff/Healing</option>
                <option value="resource">💰 Resource/Economy</option>
                <option value="puzzle">🧩 Puzzle/Interaction</option>
                <option value="transport">🚀 Transportation</option>
                <option value="obstacle">🚧 Obstacle/Architectural</option>
                <option value="special">✨ Special/Unique</option>
                <option value="utility">🔧 Utility</option>
              </select>
            </div>
          )}
        </div>

        {/* Current Category Items */}
        <div style={{ marginBottom: "30px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {getCurrentConfigs().map((item) => (
              <button
                key={item.type}
                onClick={() => handleItemSelect(item)}
                style={{
                  padding: "10px",
                  background:
                    getCurrentSelection()?.type === item.type
                      ? "#4CAF50"
                      : "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span>{item.emoji}</span>
                <div>
                  <div style={{ fontWeight: "bold" }}>{item.title}</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>
                    {item.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Properties Panel */}
        {getCurrentSelection() && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#4CAF50", marginBottom: "15px" }}>
              Properties
            </h3>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {getCurrentSelection()?.editableProps?.map((prop) => (
                <div key={prop.key}>
                  <label
                    style={{
                      display: "block",
                      color: "white",
                      marginBottom: "5px",
                      fontSize: "14px",
                    }}
                  >
                    {prop.label}
                  </label>
                  {prop.type === "number" ? (
                    <input
                      type="number"
                      value={getCurrentProps()[prop.key] || prop.min || 0}
                      min={prop.min}
                      max={prop.max}
                      step={prop.step}
                      onChange={(e) =>
                        handlePropChange(prop.key, parseFloat(e.target.value))
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#444",
                        color: "white",
                        border: "1px solid #666",
                        borderRadius: "4px",
                      }}
                    />
                  ) : prop.type === "color" ? (
                    <input
                      type="color"
                      value={getCurrentProps()[prop.key] || "#ffffff"}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "4px",
                        background: "#444",
                        border: "1px solid #666",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    />
                  ) : prop.type === "boolean" ? (
                    <input
                      type="checkbox"
                      checked={getCurrentProps()[prop.key] || false}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.checked)
                      }
                      style={{ marginRight: "8px" }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={getCurrentProps()[prop.key] || ""}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        background: "#444",
                        color: "white",
                        border: "1px solid #666",
                        borderRadius: "4px",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main 3D Viewport */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas camera={{ position: [10, 10, 10], fov: 60 }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />

          <Physics>
            <Suspense fallback={<LoadingFallback />}>
              {getCurrentSelection() &&
                (() => {
                  const Component = getCurrentSelection()!.component;
                  return <Component {...getCurrentProps()} />;
                })()}
            </Suspense>
          </Physics>
        </Canvas>
      </div>
    </div>
  );
};

export default AutoThreeDEditor;

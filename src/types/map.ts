export interface Position {
  x: number;
  z: number;
}

export interface Room {
  id: string;
  position: Position;
  type: string;
  connections: string[]; // IDs of connected rooms
  size: number; // Room size in units
  isVisited: boolean;
  isCurrent: boolean;
  // Enhanced room properties
  items?: Item[]; // Demo items for special rooms
  specialProperties?: Record<string, unknown>; // Special room properties
  // New advanced properties
  shape?: 'square' | 'circle' | 'triangle' | 'hexagon' | 'octagon' | 'diamond' | 'star' | 'cross' | 'spiral';
  width?: number; // For non-square rooms
  height?: number; // For non-square rooms
  rotation?: number; // Room rotation in radians
  isPortal?: boolean; // Portal room flag
  portalDestination?: string; // Where portal leads
  isMultiTile?: boolean; // Multi-tile room flag
  tilePositions?: Position[]; // Positions of all tiles for multi-tile rooms
  theme?: string; // Room theme/atmosphere
  difficulty?: number; // Room difficulty (1-10)
  level?: number; // Required level to enter
  isLocked?: boolean; // Requires key/item to enter
  requiredItem?: string; // Required item ID
  timeLimit?: number; // Time limit in seconds
  maxOccupants?: number; // Max players/NPCs
  ambientSound?: string; // Ambient sound file
  lighting?: 'bright' | 'dim' | 'dark' | 'mystical' | 'neon' | 'fire' | 'candle';
  temperature?: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold' | 'freezing';
  humidity?: 'dry' | 'normal' | 'humid' | 'wet';
  airQuality?: 'fresh' | 'stale' | 'toxic' | 'magical' | 'ethereal';
}

export const RoomType = {
  START: 'start',
  END: 'end',
  NORMAL: 'normal',
  TREASURE: 'treasure',
  ENEMY: 'enemy',
  PUZZLE: 'puzzle',
  BOSS: 'boss',
  SECRET: 'secret',
  // Enhanced room types from React Native game
  MEMORY_CHAMBER: 'memory-chamber',
  SHOP: 'shop',
  TRAP: 'trap',
  CHALLENGE: 'challenge',
  LIBRARY: 'library',
  CURSED_ROOM: 'cursed-room',
  DEVIL_ROOM: 'devil-room',
  ANGEL_ROOM: 'angel-room',
  // Upgrade rooms
  BENCH_PRESS: 'bench-press',
  COFFEE: 'coffee',
  LIBRARY_UPGRADE: 'library-upgrade',
  MEDITATION: 'meditation',
  // New advanced room types
  PORTAL: 'portal',
  ARENA: 'arena',
  CORRIDOR: 'corridor',
  COLOSSEUM: 'colosseum',
  LABORATORY: 'laboratory',
  OBSERVATORY: 'observatory',
  VAULT: 'vault',
  SHRINE: 'shrine',
  GARDEN: 'garden',
  WORKSHOP: 'workshop',
  THRONE_ROOM: 'throne-room',
  DUNGEON: 'dungeon',
  CRYPT: 'crypt',
  SANCTUARY: 'sanctuary',
  FORGE: 'forge',
  ALCHEMY: 'alchemy',
  MUSEUM: 'museum',
  THEATER: 'theater',
  BALLROOM: 'ballroom',
  KITCHEN: 'kitchen',
  BEDROOM: 'bedroom',
  BATHROOM: 'bathroom',
  CLOSET: 'closet',
  ATTIC: 'attic',
  BASEMENT: 'basement',
  TOWER: 'tower',
  BRIDGE: 'bridge',
  GATEHOUSE: 'gatehouse',
  BARRACKS: 'barracks',
  STABLE: 'stable',
  ARMORY: 'armory',
  TREASURY: 'treasury',
  COURTROOM: 'courtroom',
  CHAPEL: 'chapel',
  TEMPLE: 'temple',
  MONASTERY: 'monastery',
  CATHEDRAL: 'cathedral',
  MOSQUE: 'mosque',
  SYNAGOGUE: 'synagogue',
  PAGODA: 'pagoda',
  ZIGGURAT: 'ziggurat',
  PYRAMID: 'pyramid',
  COLOSSEUM: 'colosseum',
  AMPHITHEATER: 'amphitheater',
  AQUEDUCT: 'aqueduct',
  SEWER: 'sewer',
  TUNNEL: 'tunnel',
  CAVE: 'cave',
  GROTTO: 'grotto',
  UNDERGROUND: 'underground',
  SUBTERRANEAN: 'subterranean',
  ABYSS: 'abyss',
  VOID: 'void',
  NEXUS: 'nexus',
  CROSSROADS: 'crossroads',
  INTERSECTION: 'intersection',
  ROTUNDA: 'rotunda',
  PAVILION: 'pavilion',
  GAZEBOS: 'gazebo',
  PERGOLA: 'pergola',
  VERANDA: 'veranda',
  BALCONY: 'balcony',
  TERRACE: 'terrace',
  PATIO: 'patio',
  COURTYARD: 'courtyard',
  PLAZA: 'plaza',
  SQUARE: 'square',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle',
  HEXAGON: 'hexagon',
  OCTAGON: 'octagon',
  PENTAGON: 'pentagon',
  DIAMOND: 'diamond',
  STAR: 'star',
  CROSS: 'cross',
  SPIRAL: 'spiral',
  MAZE: 'maze',
  LABYRINTH: 'labyrinth'
} as const;

export type RoomType = typeof RoomType[keyof typeof RoomType];

export interface MapConfig {
  width: number;
  height: number;
  roomSize: number;
  minRooms: number;
  maxRooms: number;
  specialRoomChance: number;
  connectionChance: number;
}

export interface GameMap {
  id: string;
  rooms: Room[];
  startRoomId: string;
  endRoomId: string;
  config: MapConfig;
  generatedAt: number;
}

export interface MapState {
  currentMap: GameMap | null;
  currentRoomId: string | null;
  visitedRooms: Set<string>;
  isGenerating: boolean;
  error: string | null;
}

export interface MapActions {
  generateMap: (config?: Partial<MapConfig>) => void;
  setCurrentRoom: (roomId: string) => void;
  markRoomVisited: (roomId: string) => void;
  clearMap: () => void;
  setError: (error: string | null) => void;
}

// Item system types
export interface ItemEffect {
  type: string;
  value: number;
  duration?: number;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'passive' | 'active' | 'trinket';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  cost: number;
  effects: ItemEffect[];
  icon: string;
  maxUses?: number;
  currentUses?: number;
  floorRequirement?: number;
  roomTypeRequirement?: string[];
}

// Puzzle system types
export interface PuzzleTile {
  id: string;
  shape: string;
  x: number;
  y: number;
  state: 'hidden' | 'flipped' | 'matched' | 'mismatched' | 'preview';
  pairId: string | null;
}

export interface Puzzle {
  id: string;
  type: 'memory-pairs' | 'sequence' | 'pattern' | 'color' | 'number';
  difficulty: number;
  tiles: PuzzleTile[];
  gridSize: number;
  completed: boolean;
  timeLimit?: number;
}

// Enhanced room interface
export interface EnhancedRoom extends Room {
  puzzle?: Puzzle;
  items: Item[];
  specialProperties?: { [key: string]: any };
  rewards: Item[];
  isLocked?: boolean;
  requiresKey?: boolean;
  timeLimit?: number;
}

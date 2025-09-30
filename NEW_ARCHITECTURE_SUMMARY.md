# New Architecture: Rooms, Biomes, Objects, Elements

## 🏗️ **Architecture Overview**

We've reorganized the codebase into a clear hierarchy that better reflects the actual purpose of each component:

### **1. 🏠 Rooms** (Complete structures with walls/shells)
Complete architectural structures that define the physical space:

- `StartRoom` - Starting room with walls
- `CorridorRoom` - Corridor with internal structure  
- `ColosseumRoom` - Arena with complete structure
- `StairsRoom` - Staircase room
- `MiddleStairsRoom` - Middle staircase room

**Purpose**: These are complete rooms that provide the physical boundaries and structure.

### **2. 🌍 Biomes** (Environmental segments/areas)
Environmental themes and functional areas that get placed inside rooms:

- `LibraryBiome` - Library environment (books, shelves, study areas)
- `ShopBiome` - Shop environment (counters, items, merchant areas)
- `TreasureBiome` - Treasure environment (chests, gold, valuables)
- `PuzzleBiome` - Puzzle environment (puzzle elements, challenges)
- `BossBiome` - Boss environment (boss elements, battle areas)
- `CoffeeBiome` - Coffee environment (coffee machines, seating)
- `MeditationBiome` - Meditation environment (cushions, peaceful elements)
- `GymBiome` - Gym environment (equipment, weights, exercise areas)
- `PortalBiome` - Portal environment (portal elements, teleportation)
- `ArenaBiome` - Arena environment (battle elements, spectator areas)
- `EnemyBiome` - Enemy environment (enemy spawns, combat areas)
- `EndBiome` - End environment (completion elements, victory areas)
- `SpecialBiome` - Special environment (unique elements, special areas)
- `ChallengeBiome` - Challenge environment (challenge elements, tests)
- `LibraryUpgradeBiome` - Library upgrade environment (upgrade elements)
- `TrapBiome` - Trap environment (trap elements, hazards)
- `CryptBiome` - Crypt environment (crypt elements, burial areas)

**Purpose**: These define the environmental theme and functionality of a room.

### **3. 🎯 Objects** (Interactive items/furniture)
Interactive items and furniture that can be placed in biomes:

- `ItemSprite` - Item sprites
- `DestructibleWall` - Breakable walls
- `ParticleSystem` - Particle effects
- `MosaicCreator` - Mosaic creator
- `Lever`, `Altar`, `Skeleton`, `PressurePlate`, `Statue`, `Switch` - Interactive objects

**Purpose**: These are interactive elements that players can interact with.

### **4. 🧱 Elements** (Basic building blocks)
Basic building materials and structural elements:

- `Tile`, `Wall`, `Ceiling`, `Plank`, `Stair`, `Handrail` - Basic elements
- `Brick`, `CrackedBrick`, `Stone`, `WoodPlank`, `MetalBar`, `Glass` - Building materials
- `Torch`, `Barrel`, `Chest`, `Door`, `SpikeTrap`, `Pillar`, `Chain`, `Brazier`, `Spikes`, `Web` - Dungeon elements

**Purpose**: These are the basic building blocks used to construct rooms and biomes.

## 🔄 **Renaming Summary**

### **Files Renamed:**
- `LibraryContent.tsx` → `LibraryBiome.tsx`
- `ShopContent.tsx` → `ShopBiome.tsx`
- `TreasureContent.tsx` → `TreasureBiome.tsx`
- `PuzzleContent.tsx` → `PuzzleBiome.tsx`
- `BossContent.tsx` → `BossBiome.tsx`
- `CoffeeContent.tsx` → `CoffeeBiome.tsx`
- `MeditationContent.tsx` → `MeditationBiome.tsx`
- `BenchPressContent.tsx` → `GymBiome.tsx`
- `PortalContent.tsx` → `PortalBiome.tsx`
- `ArenaContent.tsx` → `ArenaBiome.tsx`
- `EnemyContent.tsx` → `EnemyBiome.tsx`
- `EndContent.tsx` → `EndBiome.tsx`
- `SpecialContent.tsx` → `SpecialBiome.tsx`
- `ChallengeContent.tsx` → `ChallengeBiome.tsx`
- `LibraryUpgradeContent.tsx` → `LibraryUpgradeBiome.tsx`
- `TrapContent.tsx` → `TrapBiome.tsx`
- `CryptContent.tsx` → `CryptBiome.tsx`

### **Components Renamed:**
- `LibraryContent` → `LibraryBiome`
- `ShopContent` → `ShopBiome`
- `TreasureContent` → `TreasureBiome`
- `PuzzleContent` → `PuzzleBiome`
- `BossContent` → `BossBiome`
- `CoffeeContent` → `CoffeeBiome`
- `MeditationContent` → `MeditationBiome`
- `BenchPressContent` → `GymBiome`
- `PortalContent` → `PortalBiome`
- `ArenaContent` → `ArenaBiome`
- `EnemyContent` → `EnemyBiome`
- `EndContent` → `EndBiome`
- `SpecialContent` → `SpecialBiome`
- `ChallengeContent` → `ChallengeBiome`
- `LibraryUpgradeContent` → `LibraryUpgradeBiome`
- `TrapContent` → `TrapBiome`
- `CryptContent` → `CryptBiome`

### **Interfaces Renamed:**
- `LibraryContentProps` → `LibraryBiomeProps`
- `ShopContentProps` → `ShopBiomeProps`
- `TreasureContentProps` → `TreasureBiomeProps`
- `PuzzleContentProps` → `PuzzleBiomeProps`
- `BossContentProps` → `BossBiomeProps`
- `CoffeeContentProps` → `CoffeeBiomeProps`
- `MeditationContentProps` → `MeditationBiomeProps`
- `BenchPressContentProps` → `GymBiomeProps`
- `PortalContentProps` → `PortalBiomeProps`
- `ArenaContentProps` → `ArenaBiomeProps`
- `EnemyContentProps` → `EnemyBiomeProps`
- `EndContentProps` → `EndBiomeProps`
- `SpecialContentProps` → `SpecialBiomeProps`
- `ChallengeContentProps` → `ChallengeBiomeProps`
- `LibraryUpgradeContentProps` → `LibraryUpgradeBiomeProps`
- `TrapContentProps` → `TrapBiomeProps`
- `CryptContentProps` → `CryptBiomeProps`

## 📁 **Files Updated:**
- All biome component files renamed and updated
- `RoomFactory.tsx` - Updated imports and component references
- `ThreeDEditor.tsx` - Updated imports and component references
- `AutoThreeDEditor.tsx` - Updated imports and component references
- `Room.tsx` - Updated component references
- `RoomDemo.tsx` - Updated component references
- `index.ts` files - Updated exports with clear categorization
- `map.ts` - Updated RoomType enum with clear categorization
- `useRoomActions.ts` - Updated type definitions

## 🎉 **Benefits:**
1. **Clear Hierarchy**: Obvious distinction between rooms, biomes, objects, and elements
2. **Accurate Naming**: Names reflect the actual purpose and function
3. **Better Organization**: Logical grouping of related components
4. **Easier Development**: Clear understanding of what each component does
5. **Scalable Architecture**: Easy to add new biomes, objects, or elements
6. **Intuitive Usage**: Developers can easily understand the system

## 🏗️ **Usage Pattern:**
```
Room (with walls/shells)
├── ShapedShell (walls, floor, ceiling)
└── Biome (environmental theme)
    ├── Objects (interactive items)
    └── Elements (building blocks)
```

This new architecture makes the codebase much more intuitive and maintainable!

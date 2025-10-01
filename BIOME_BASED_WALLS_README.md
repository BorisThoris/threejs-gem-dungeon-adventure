# Biome-Based Wall System

## 🎯 Overview

The game now uses a biome-based wall system instead of fixed-size rooms. Each biome defines its own walls, decorations, lighting, and entry points, creating more varied and interesting room layouts.

## 🏗️ Architecture

### Core Components

1. **BiomeWallConfig** - Defines wall layouts for each biome type
2. **BiomeWallRenderer** - Renders walls based on biome configuration
3. **Updated Room Generation** - Creates rooms with biome-based walls
4. **Dynamic Scaling** - Each room can have unique dimensions

### Key Features

- **No Fixed Sizes**: Each biome defines its own wall layout
- **Dynamic Scaling**: Rooms can be scaled individually (0.8x - 1.2x)
- **Rich Decorations**: Each biome includes appropriate decorations
- **Custom Lighting**: Biomes define their own lighting setup
- **Entry Points**: Biomes define where doors/connections should be
- **Material Variety**: Different materials and textures per biome

## 🌍 Available Biomes

### 1. Corridor
- **Description**: A connecting passage between areas
- **Walls**: Stone walls with cobblestone texture
- **Features**: Torches, pillars, cobwebs, drains
- **Size**: 4x8 units (scalable)
- **Entry Points**: North and South

### 2. Library
- **Description**: A quiet space filled with knowledge
- **Walls**: Wooden walls with wood texture
- **Features**: Bookshelves, desk, warm lighting
- **Size**: 8x8 units (scalable)
- **Entry Points**: North (with door)

### 3. Shop
- **Description**: A place of commerce and trade
- **Walls**: Stone walls with brick texture
- **Features**: Counter, shelves, bright lighting
- **Size**: 8x8 units (scalable)
- **Entry Points**: North (with door)

### 4. Treasure
- **Description**: A vault filled with precious items
- **Walls**: Stone walls with cobblestone texture (breakable)
- **Features**: Chest, gold piles, dim lighting
- **Size**: 8x8 units (scalable)
- **Entry Points**: North (narrow door)

## 🔧 Technical Implementation

### BiomeWallConfig Interface

```typescript
interface BiomeWallConfig {
  id: string;
  name: string;
  description: string;
  walls: WallDefinition[];
  floor?: FloorDefinition;
  ceiling?: CeilingDefinition;
  decorations?: DecorationDefinition[];
  entryPoints?: EntryPointDefinition[];
  lighting?: LightingDefinition;
}
```

### WallDefinition Interface

```typescript
interface WallDefinition {
  position: [number, number, number];
  size: [number, number, number];
  rotation: [number, number, number];
  material: string;
  texture?: string;
  color?: string;
  opacity?: number;
  hasDoor?: boolean;
  doorWidth?: number;
  doorPosition?: [number, number, number];
  isBreakable?: boolean;
  breakingOptions?: Record<string, unknown>;
}
```

### Room Interface Updates

```typescript
interface Room {
  // ... existing properties
  biomeId?: string; // ID of the biome that defines this room's walls
  useBiomeWalls?: boolean; // Whether to use biome-based walls
  biomeScale?: [number, number, number]; // Scale factor for biome walls
}
```

## 🎮 Usage

### Map Generation

The map generation algorithm now:

1. **Checks for Biome Config**: Determines if a room type has biome wall configuration
2. **Creates Biome Room**: If available, creates room with biome-based walls
3. **Fallback to Traditional**: If no biome config, uses traditional fixed-size walls
4. **Random Scaling**: Applies random scale (0.8x - 1.2x) to biome walls
5. **Entry Points**: Uses biome-defined entry points or falls back to shape-based

### Room Rendering

The Room component now:

1. **Checks Biome Config**: Looks for biome wall configuration
2. **Renders Biome Walls**: Uses BiomeWallRenderer if available
3. **Fallback Rendering**: Uses traditional wall rendering if no biome config
4. **Dynamic Scaling**: Applies room-specific scale to biome walls

## 🎨 Customization

### Adding New Biomes

1. **Define Biome Config**: Add new configuration to `BIOME_WALL_CONFIGS`
2. **Create Wall Definitions**: Define walls, floor, ceiling, decorations
3. **Set Entry Points**: Define where doors/connections should be
4. **Configure Lighting**: Set appropriate lighting for the biome
5. **Add to Categories**: Include in appropriate biome category

### Example: Adding a Kitchen Biome

```typescript
kitchen: {
  id: 'kitchen',
  name: 'Kitchen',
  description: 'A place for cooking and food preparation',
  walls: [
    // Define walls with appropriate materials
  ],
  floor: {
    position: [0, 0, 0],
    size: [8, 0.2, 8],
    material: 'tile',
    texture: 'tile',
    color: '#F5F5F5',
  },
  decorations: [
    {
      type: 'stove',
      position: [0, 0.5, 2],
      size: [1, 1, 1],
      material: 'metal',
      color: '#C0C0C0',
    },
    // More decorations...
  ],
  entryPoints: [
    { direction: 'north', position: [0, 0, -4], width: 2, height: 3 },
  ],
  lighting: {
    type: 'point',
    position: [0, 3, 0],
    intensity: 1.0,
    color: '#FFFFFF',
  },
},
```

## 🔄 Migration from Fixed-Size Rooms

### What Changed

- **Room Size**: `size` property is now deprecated but kept for compatibility
- **Wall Rendering**: Now uses biome-based walls when available
- **Entry Points**: Now defined by biome configuration
- **Scaling**: Each room can have unique dimensions

### Backward Compatibility

- **Existing Rooms**: Still work with traditional wall rendering
- **Room Size**: Still used for grid positioning and compatibility
- **Entry Points**: Fallback to shape-based generation if no biome config

## 🚀 Benefits

### For Players

1. **More Variety**: Each biome has unique wall layouts and decorations
2. **Better Immersion**: Rooms feel more authentic to their purpose
3. **Visual Interest**: Different materials, textures, and lighting per biome
4. **Dynamic Sizing**: Rooms can vary in size for more natural layouts

### For Developers

1. **Easy Extension**: Simple to add new biome types
2. **Modular Design**: Each biome is self-contained
3. **Flexible Scaling**: Rooms can be scaled individually
4. **Rich Configuration**: Full control over walls, decorations, lighting

### For Content Creators

1. **Theme Consistency**: Each biome maintains its visual theme
2. **Easy Customization**: Modify biome configs to change appearance
3. **Scalable Content**: Biomes work at different sizes
4. **Rich Details**: Add decorations and lighting per biome

## 🔮 Future Enhancements

### Planned Features

1. **More Biomes**: Add kitchen, bedroom, bathroom, etc.
2. **Dynamic Decorations**: Procedural decoration placement
3. **Weather Effects**: Biome-specific weather and atmosphere
4. **Interactive Elements**: Biome-specific interactive objects
5. **Sound Design**: Biome-specific ambient sounds

### Technical Improvements

1. **Performance Optimization**: Better texture loading and caching
2. **LOD System**: Level-of-detail for distant rooms
3. **Procedural Generation**: Generate biome configs procedurally
4. **Mod Support**: Allow modders to add custom biomes
5. **Visual Editor**: GUI for creating biome configurations

## 📊 Performance Impact

### Positive Changes

- **Reduced Redundancy**: No duplicate wall rendering code
- **Better Caching**: Textures loaded per biome type
- **Modular Rendering**: Only render what's needed per biome

### Considerations

- **Texture Loading**: More textures to load per biome
- **Memory Usage**: Slightly higher due to richer content
- **Initial Load**: May take longer to load all biome textures

## 🎯 Usage Examples

### Creating a Custom Biome

```typescript
// 1. Define the biome configuration
const customBiome: BiomeWallConfig = {
  id: 'custom-room',
  name: 'Custom Room',
  description: 'A custom room with unique walls',
  walls: [
    {
      position: [-4, 2, 0],
      size: [0.2, 4, 8],
      rotation: [0, 0, 0],
      material: 'stone',
      texture: 'brick',
      color: '#8B4513',
    },
    // More walls...
  ],
  // ... other properties
};

// 2. Add to BIOME_WALL_CONFIGS
BIOME_WALL_CONFIGS['custom-room'] = customBiome;

// 3. Use in map generation
// The room will automatically use biome-based walls when type is 'custom-room'
```

### Scaling Biome Walls

```typescript
// Rooms are automatically scaled (0.8x - 1.2x) during generation
// You can also manually set scale in room properties
room.biomeScale = [1.5, 1.0, 1.2]; // 1.5x width, 1.0x height, 1.2x depth
```

The biome-based wall system provides much more flexibility and variety in room generation, making each biome feel unique and authentic to its purpose!

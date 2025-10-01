# Biome Categories and Wall Toggle System

## 🌍 Biome Categories

The game now includes a comprehensive biome category system that organizes all available biomes into logical groups for better map generation control.

### Categories

1. **💪 Buff & Healing** (Weight: 0.25)
   - `coffee`, `meditation`, `gym`, `bench-press`, `garden`, `bedroom`, `kitchen`, `sanctuary`, `shrine`
   - Biomes that provide positive effects and healing

2. **💰 Resource & Economy** (Weight: 0.2)
   - `shop`, `treasure`, `library`, `library-upgrade`, `workshop`, `laboratory`, `vault`, `treasury`, `armory`, `forge`
   - Biomes focused on resources, trading, and upgrades

3. **⚔️ Combat & Challenge** (Weight: 0.2)
   - `arena`, `boss`, `enemy`, `challenge`, `trap`, `crypt`, `dungeon`, `barracks`, `colosseum`, `amphitheater`
   - Biomes designed for combat and challenging encounters

4. **🧩 Puzzle & Interaction** (Weight: 0.15)
   - `puzzle`, `maze`, `observatory`, `museum`, `theater`, `ballroom`, `special`, `secret`, `cursed-room`, `devil-room`, `angel-room`, `memory-chamber`
   - Biomes with puzzles, mysteries, and interactive elements

5. **🚀 Transportation & Movement** (Weight: 0.1)
   - `portal`, `corridor`, `stairs`, `middle-stairs`, `bridge`, `tunnel`, `cave`, `grotto`, `sewer`, `aqueduct`
   - Biomes that facilitate movement and transportation

6. **🚧 Obstacle & Architectural** (Weight: 0.05)
   - `arch`, `pillar`, `barrier`, `statue`, `tower`, `gatehouse`, `basement`, `attic`, `closet`, `bathroom`
   - Biomes that create obstacles and architectural challenges

7. **✨ Special & Unique** (Weight: 0.05)
   - `end`, `start`, `nexus`, `crossroads`, `void`, `abyss`, `underground`, `subterranean`, `pyramid`, `ziggurat`, `pagoda`
   - Unique and special biomes with distinctive characteristics

### Usage

- **Biome Category Selector**: Located in the top-right corner of the game
- **Toggle Categories**: Click on any category to enable/disable it
- **Enable/Disable All**: Use the "Enable All" or "Disable All" button
- **Real-time Updates**: Map generation will use only enabled categories
- **Visual Feedback**: Categories show enabled/disabled state with colors and borders

## 🧱 Wall Toggle System

The game now includes a global wall toggle system that allows you to show or hide all walls throughout the game.

### Features

- **Global Control**: Toggle affects all walls in the game simultaneously
- **Persistent Setting**: Wall state is saved to localStorage
- **Visual Indicator**: Shows current wall state (ON/OFF) with emoji
- **Easy Access**: Click the wall toggle control to switch states
- **Real-time Updates**: Changes apply immediately without restart

### Controls

- **Wall Toggle Button**: Located in the top-right corner
- **Click to Toggle**: Click the button to switch between ON and OFF
- **Visual Feedback**: Button shows current state with 🧱 (ON) or 🚫 (OFF)
- **Hover Effects**: Button has hover animations for better UX

### Technical Implementation

- **Context Provider**: `WallToggleProvider` wraps the entire game
- **Hook**: `useWallToggle()` provides access to wall state
- **Component Updates**: All wall components check the global state
- **Performance**: Walls are completely removed from render when disabled

## 🎮 Integration

### Map Generation

The map generation algorithm now uses the biome category system:

1. **Category Selection**: Only biomes from enabled categories are used
2. **Weighted Selection**: Biomes are selected based on category weights
3. **Fallback System**: Falls back to old system if no categories enabled
4. **Real-time Updates**: New maps use current category selection

### Wall Rendering

All wall components now respect the global toggle:

- `Wall.tsx` - Main wall component
- `StoneWall.tsx` - Stone wall variant
- Other wall components can be easily updated

### UI Components

- `BiomeCategorySelector.tsx` - Category selection interface
- `WallToggleControls.tsx` - Wall toggle button
- `WallToggleContext.tsx` - Context for wall state management

## 🔧 Configuration

### Biome Categories

```typescript
// Enable specific categories
const enabledCategories = ['buff', 'combat', 'puzzle'];

// Get biomes from categories
const weightedBiomes = getWeightedBiomes(enabledCategories);

// Generate map with categories
generateMap(config, enabledCategories);
```

### Wall Toggle

```typescript
// Use the hook in components
const { wallsEnabled, toggleWalls, setWallsEnabled } = useWallToggle();

// Check wall state
if (!wallsEnabled) {
  return null; // Don't render walls
}
```

## 📊 Benefits

### Biome Categories

1. **Organized Generation**: Biomes are logically grouped
2. **Better Control**: Choose which types of content to generate
3. **Balanced Maps**: Weighted selection ensures good distribution
4. **Easy Management**: Simple UI for category selection
5. **Extensible**: Easy to add new categories and biomes

### Wall Toggle

1. **Performance**: Disable walls for better performance
2. **Debugging**: Hide walls to see map structure
3. **Accessibility**: Remove visual barriers
4. **Customization**: Personal preference for wall visibility
5. **Development**: Easier to work with map layouts

## 🚀 Future Enhancements

### Planned Features

1. **Category Presets**: Save/load category combinations
2. **Individual Biome Weights**: Override category weights for specific biomes
3. **Wall Types**: Toggle different types of walls separately
4. **Visual Modes**: Different rendering modes for walls
5. **Advanced Filters**: More granular control over generation

### Technical Improvements

1. **Performance Optimization**: Better handling of large biome lists
2. **Caching**: Cache biome selections for faster generation
3. **Analytics**: Track which categories are most popular
4. **Export/Import**: Save configuration to files
5. **API Integration**: Remote configuration management

## 🎯 Usage Tips

### For Players

1. **Start with All Categories**: Enable all categories for maximum variety
2. **Disable Unwanted Types**: Turn off categories you don't enjoy
3. **Experiment**: Try different combinations to find your preference
4. **Use Wall Toggle**: Hide walls when exploring or debugging
5. **Save Settings**: Your preferences are automatically saved

### For Developers

1. **Add New Biomes**: Update the `BIOME_CATEGORIES` array
2. **Create Wall Components**: Use `useWallToggle()` hook
3. **Extend Categories**: Add new category types as needed
4. **Optimize Performance**: Consider wall rendering impact
5. **Test Thoroughly**: Ensure all wall types respect the toggle

This system provides much better control over map generation and wall visibility, making the game more customizable and user-friendly!

# ThreeJS Gem Game

A 3D dungeon exploration game built with Three.js and React, featuring advanced texture creation tools and interactive 3D environments.

## 🎮 Game Features

- **3D Dungeon Exploration** - Navigate through immersive 3D environments
- **Interactive Puzzles** - Solve various types of puzzles and challenges
- **Breakable Objects** - Destructible walls, doors, and items
- **First-Person Controls** - Smooth movement and camera controls
- **Room System** - Dynamic room loading and management

## 🛠️ Creative Tools

### 🎨 Texture Painter
A professional-grade texture painting tool with advanced features:
- **Layer System** - Multiple layers with blend modes and opacity controls
- **Advanced Brushes** - Round, square, soft, and hard brushes with customizable settings
- **Filter Effects** - Blur, sharpen, grayscale, sepia, and more
- **Real-time 3D Preview** - See your textures in 3D as you paint
- **High-resolution Export** - Export textures as PNG files

### 🧩 3D Mosaic Creator
A creative mosaic design tool for pattern creation:
- **Shape Tools** - Square, circle, triangle, diamond, and hexagon shapes
- **Color Palette** - 30+ vibrant colors to choose from
- **Grid System** - Configurable grid dimensions and cell spacing
- **3D Visualization** - Real-time 3D preview of your mosaic patterns

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Yarn or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd threejs-gem-game

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts
- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn electron` - Run as Electron app
- `yarn electron-dev` - Run in development mode with Electron

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── TexturePainter.tsx    # Advanced texture painting tool
│   ├── MosaicCreator.tsx     # 3D mosaic creation tool
│   ├── ThreeDEditor.tsx      # 3D scene editor
│   └── ...                   # Other game components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── store/              # State management
```

## 🎯 Usage

### Texture Painter
1. Navigate to `?texture-painter=true` or use the main menu
2. Select brush tools and adjust settings
3. Paint on the canvas with multiple layers
4. Apply filters and blend modes
5. Export your texture as PNG

### 3D Mosaic Creator
1. Navigate to `?mosaic-creator=true` or use the main menu
2. Choose shape tools and colors
3. Paint on the grid to create mosaic patterns
4. Adjust brush size and grid settings
5. Export your mosaic as PNG

### 3D Editor
1. Navigate to `?editor=true` or use the main menu
2. Add objects from the component library
3. Position and configure objects in 3D space
4. Use the texture tools to create materials
5. Save and load your scenes

## 🛠️ Development

This project uses:
- **React 19** - UI framework
- **Three.js** - 3D graphics
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Electron** - Desktop app support

## 📚 Documentation

- [Texture Painter Guide](TEXTURE_PAINTER_README.md)
- [3D Mosaic Creator Guide](MOSAIC_CREATOR_README.md)
- [3D Editor Guide](3D_EDITOR_README.md)
- [Component System](COMPONENT_SYSTEM.md)
- [Prototype System](PROTOTYPE_SYSTEM_README.md)
# 🎨 Texture Painter

A powerful 3D texture painting tool that allows you to create mosaic-like patterns on a square grid using various shapes and colors.

## Features

### 🎯 Multiple Brush Tools
- **Square** ⬜ - Paint square shapes
- **Circle** ⭕ - Paint circular shapes  
- **Triangle** 🔺 - Paint triangular shapes
- **Diamond** 💎 - Paint diamond shapes
- **Hexagon** ⬡ - Paint hexagonal shapes

### 🌈 Rich Color Palette
- 30+ vibrant colors to choose from
- Easy color selection with visual palette
- Real-time color preview

### 🎛️ Advanced Controls
- **Brush Size** - Adjustable from 0.5x to 2x
- **Grid Size** - Configurable grid dimensions (8x8 to 32x32)
- **Cell Size** - Adjustable cell spacing
- **Grid Toggle** - Show/hide grid lines
- **Preview Mode** - Real-time texture preview

### 💾 Export Functionality
- Export textures as PNG images
- High-resolution output
- Automatic download

## How to Use

### Accessing the Texture Painter

1. **From Main Menu**: Click the "🎨 Texture Painter" button in the top-right corner
2. **From 3D Editor**: Select "Texture Painter" from the Objects category
3. **Direct URL**: Navigate to `?texture-painter=true`

### Painting Controls

1. **Select a Brush Tool**: Choose from the available shape tools
2. **Pick a Color**: Click on any color in the palette
3. **Adjust Brush Size**: Use the slider to change brush size
4. **Paint**: Click and drag on the grid to paint cells
5. **Export**: Click "💾 Export Texture" to download your creation

### Keyboard Shortcuts

- **ESC** - Return to launcher screen (when in standalone mode)
- **Mouse Drag** - Paint multiple cells continuously

## Technical Details

### Grid System
- Square grid layout (default 16x16)
- Centered coordinate system
- Configurable cell size and spacing
- Visual grid lines for precision

### Shape Rendering
- Each cell can have different shapes
- Random rotation for organic feel
- Size scaling based on brush settings
- 3D visualization with proper lighting

### Export Process
- Canvas-based rendering
- High-resolution output (32px per cell)
- PNG format with transparency support
- Automatic file download

## Integration

The Texture Painter is fully integrated with the existing 3D Editor system:

- **Component System**: Uses the same component architecture
- **Props Editor**: Editable properties for grid size and cell size
- **3D Rendering**: Built with React Three Fiber
- **State Management**: React hooks for state management

## File Structure

```
src/components/
├── TexturePainter.tsx          # Main texture painter component
├── TexturePainterLauncher.tsx  # Launcher screen with instructions
└── ThreeDEditor.tsx           # Integration with 3D editor
```

## Future Enhancements

- **Pattern Library**: Pre-made patterns and templates
- **Layer System**: Multiple layers for complex textures
- **Animation**: Animated texture sequences
- **Import/Export**: Load and save texture projects
- **Advanced Brushes**: Gradient, pattern, and texture brushes
- **Real-time Preview**: Live preview on 3D objects

## Usage Examples

### Creating a Mosaic Pattern
1. Start with a 16x16 grid
2. Use different shapes for variety
3. Apply a consistent color scheme
4. Add random rotations for organic feel
5. Export as high-resolution texture

### Making a Pixel Art Texture
1. Use square brush exclusively
2. Work with a limited color palette
3. Create pixel-perfect patterns
4. Use smaller grid for detailed work

### Building a Tile Set
1. Create multiple 8x8 textures
2. Use consistent styling
3. Ensure seamless tiling
4. Export as separate files

---

**Enjoy creating beautiful textures! 🎨✨**

# 🎨 Texture Painter

A professional-grade texture painting tool with advanced features for creating high-quality textures with layers, filters, and real-time 3D preview.

## Features

### 🎨 Professional Brush System
- **Round Brush** ● - Soft circular brush with adjustable hardness
- **Square Brush** ■ - Hard-edged square brush
- **Soft Brush** ○ - Airbrush-style soft brush
- **Hard Brush** ● - Precise hard-edged brush
- **Customizable Settings** - Size, opacity, hardness, and spacing controls

### 🎯 Paint Modes
- **Free Paint Mode** 🎨 - Smooth, continuous painting with gradients
- **Grid Paint Mode** 🔲 - Pixelated painting with grid snapping
- **Pixel Size Control** - Adjustable pixel size from 4px to 64px
- **Grid Visualization** - Toggle grid lines for precise pixel art

### 🌈 Advanced Color System
- 40+ color palette with easy selection
- Real-time color preview
- Custom color support
- Color picker integration

### 📚 Layer System
- **Multiple Layers** - Create complex textures with layer stacking
- **Layer Visibility** - Toggle layers on/off
- **Layer Opacity** - Adjust individual layer transparency
- **Blend Modes** - 12 different blending modes (normal, multiply, screen, etc.)
- **Layer Locking** - Prevent accidental edits
- **Layer Management** - Add, delete, and reorder layers

### 🎛️ Advanced Filters
- **Blur** - Soften and smooth textures
- **Sharpen** - Enhance texture details
- **Grayscale** - Convert to black and white
- **Sepia** - Vintage photo effect
- **Invert** - Color inversion
- **Brightness/Contrast** - Adjust lighting and contrast
- **Filter Intensity** - Adjustable filter strength

### 🎮 Real-time 3D Preview
- Live 3D preview of your texture
- Interactive 3D model rotation
- Real-time updates as you paint
- Toggle preview on/off

### 💾 Professional Export
- High-resolution PNG export
- Preserves all layer information
- Custom export settings
- Automatic download functionality

### 🔧 Programmatic Access
- **JavaScript API** - Control the painter programmatically
- **Real-time Updates** - Get notified when textures change
- **Method Library** - Complete set of methods for automation
- **Integration Ready** - Easy to embed in other applications

## Programmatic API

### Basic Usage
```javascript
// Enable programmatic access
<TexturePainter programmaticAccess={true} onTextureChange={handleChange} />

// Access the API
const painter = window.texturePainter;

// Set paint mode
painter.setMode("grid"); // or "free"
painter.setPixelSize(16);

// Paint programmatically
painter.setColor("#ff0000");
painter.paintAt(100, 100);

// Layer management
painter.addLayer();
painter.setActiveLayer("layer_id");
painter.clearLayer();

// Get current texture
const textureData = painter.getCurrentTexture();
```

### Available Methods
- `setMode(mode)` - Set paint mode ("free" or "grid")
- `setPixelSize(size)` - Set pixel size for grid mode
- `setColor(color)` - Set brush color
- `setBrushSize(size)` - Set brush size
- `setBrushOpacity(opacity)` - Set brush opacity
- `setBrushHardness(hardness)` - Set brush hardness
- `addLayer()` - Add new layer
- `deleteLayer(layerId)` - Delete layer
- `setActiveLayer(layerId)` - Set active layer
- `getCurrentTexture()` - Get current texture as data URL
- `paintAt(x, y, color?)` - Paint at specific coordinates
- `clearLayer(layerId?)` - Clear layer

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

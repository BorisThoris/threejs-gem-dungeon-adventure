# 🎮 3D Editor

A comprehensive 3D editor for viewing and exploring all your Three.js game components, rooms, and objects.

## 🚀 How to Access

1. **Start the development server:**
   ```bash
   yarn dev
   # or
   npx vite
   ```

2. **Open your browser to:**
   - Main game: `http://localhost:5173`
   - 3D Editor: `http://localhost:5173?editor=true`

3. **Or click the "🎮 3D Editor" button** in the top-right corner of the main game

## ✨ Features

### 🏠 Room Gallery
- **18 Different Room Types** including:
  - 🚀 Start Room
  - 🧘 Meditation Room
  - 💪 Gym Room
  - 📚 Library
  - 🛒 Shop
  - 💰 Treasure Room
  - 🧩 Puzzle Room
  - 👹 Boss Room
  - ☕ Coffee Room
  - And many more!

### 🎯 3D Objects
- **Shaped Shells** - Geometric room shapes
- **Item Sprites** - Interactive game items
- **Destructible Walls** - Breakable barriers
- **Particle Systems** - Visual effects

### 🔍 View Modes

#### Single View
- Focus on one room/object at a time
- Perfect for detailed inspection
- Full orbit controls

#### Grid View
- See all rooms/objects in a 4x4 grid
- Compare different components side by side
- Great for overview and selection

#### Showcase View
- All items arranged in a circle
- Cinematic presentation
- Perfect for demonstrations

### 🎮 Controls

- **Mouse Orbit** - Rotate around objects
- **Mouse Pan** - Move the view
- **Mouse Wheel** - Zoom in/out
- **ESC Key** - Return to main game

### 🎯 Camera Presets
- **Default** - Standard 3D view
- **Front** - Direct front view
- **Side** - Side profile view
- **Top** - Bird's eye view

## 🛠️ Technical Details

### Built With
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers and components
- **React Three Rapier** - Physics engine
- **TypeScript** - Type safety

### Architecture
- **Modular Design** - Easy to add new rooms/objects
- **Type-Safe** - Full TypeScript support
- **Responsive UI** - Works on different screen sizes
- **Performance Optimized** - Efficient rendering

## 🔧 Adding New Components

To add a new room or object to the editor:

1. **Add to Room Configs** (in `ThreeDEditor.tsx`):
   ```typescript
   {
     type: "your-room-type",
     component: YourRoomComponent,
     title: "Your Room",
     emoji: "🏠",
     description: "Description of your room",
     props: { /* any required props */ }
   }
   ```

2. **Import the component** at the top of the file

3. **The editor will automatically include it** in the gallery

## 🎨 Customization

The editor is highly customizable:

- **UI Colors** - Modify the color scheme in the component styles
- **Camera Settings** - Adjust default camera positions and controls
- **Grid Layout** - Change the grid arrangement for different view modes
- **Lighting** - Modify the 3D scene lighting setup

## 🚀 Future Enhancements

- **Export Functionality** - Export selected rooms as assets
- **Animation Controls** - Play/pause room animations
- **Material Editor** - Modify textures and materials
- **Collision Visualization** - Show physics boundaries
- **Performance Metrics** - Display rendering statistics

## 🐛 Troubleshooting

### Common Issues

1. **Black Screen** - Check browser console for WebGL errors
2. **Slow Performance** - Try reducing the number of objects in grid/showcase view
3. **Missing Textures** - Ensure all assets are properly loaded
4. **Controls Not Working** - Make sure the canvas has focus

### Performance Tips

- Use **Single View** for best performance
- **Grid View** may be slower with many objects
- **Showcase View** is optimized for presentation

## 📝 Notes

- The editor runs in the same environment as your main game
- All physics and lighting are active in the editor
- Changes to room components will be reflected immediately
- The editor is perfect for development, testing, and showcasing your work

---

**Happy 3D Editing! 🎮✨**

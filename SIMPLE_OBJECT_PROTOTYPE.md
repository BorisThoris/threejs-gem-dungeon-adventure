# Simple Object Prototype System

## Overview
A simplified universal prototype system that gives every 3D object the same basic functionality without overcomplicating things.

## Core Files
- `src/utils/ObjectPrototype.ts` - The one universal prototype class
- `src/utils/SimplePrototypeMixin.tsx` - Simple mixin to add prototype functionality to any component

## How It Works

### 1. One Universal Class
```typescript
// Every 3D object uses the same ObjectPrototype class
const prototype = new ObjectPrototype("my_tile", "tile", [0, 0, 0], "#ffffff");
```

### 2. Simple Mixin
```typescript
// Wrap any component with prototype functionality
const PrototypeTile = withObjectPrototype(Tile, "tile");
```

### 3. Component-Level Customization
Each component can add its own specific functionality while using the universal prototype as a base.

## Universal Actions
Every prototype object supports these basic actions:
- `paint(color)` - Change color
- `rotate(angle?)` - Rotate object
- `scale(factor)` - Scale object
- `move(position)` - Move object
- `toggleVisibility()` - Show/hide object
- `glow(intensity)` - Make object glow

## Usage Example
```typescript
import { PrototypeTile } from "../roomElements";

// Use any prototype object
<PrototypeTile 
  prototypeId="floor_1" 
  position={[0, 0, 0]} 
  color="#4CAF50"
  onPrototypeAction={(action, data) => {
    console.log(`Action: ${action}`, data);
  }}
/>
```

## Benefits
- ✅ **Simple** - One class, one mixin
- ✅ **Universal** - Works on any 3D object
- ✅ **Extensible** - Add component-specific functionality as needed
- ✅ **Type Safe** - Full TypeScript support
- ✅ **No Overcomplication** - Just the basics, component-level customization

## All 3D Objects Now Have Prototype Support
- Tiles, Walls, Stairs, Ceilings, Planks, Handrails
- Torches, Candles, Tables, Chairs, Bookshelves
- Any future 3D object can easily get prototype functionality

This gives you the "backdoor" functionality you wanted without overcomplicating the system!

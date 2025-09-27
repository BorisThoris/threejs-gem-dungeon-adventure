# 🎯 Simple Universal Prototype System

## Overview

This is a simplified prototype system that adds universal functionality to all your existing 3D objects. Every object can now be controlled, modified, and extended with just 1-2 simple classes.

## 🏗️ **What We Built**

1. **UniversalPrototype** - A simple class that can be added to any 3D object
2. **withPrototype** - A higher-order component that wraps any existing component with prototype functionality
3. **PrototypeMixin** - Utilities for React integration

## 🎮 **How It Works**

### Step 1: Use Prototype-Enabled Components

Instead of regular components, use the prototype versions:

```typescript
// Before
<Tile position={[0, 0, 0]} color="#4CAF50" />

// After
<PrototypeTile 
  prototypeId="my_tile" 
  position={[0, 0, 0]} 
  color="#4CAF50"
  onPrototypeAction={(action, data) => {
    console.log(`Tile action: ${action}`, data);
  }}
/>
```

### Step 2: Access Prototype Actions

```typescript
import { usePrototypeActions } from "../utils/PrototypeMixin";

const MyComponent = () => {
  const { prototype, executeAction } = usePrototypeActions("my_tile");

  const handleColorChange = () => {
    executeAction("paint", { color: "#FF0000" });
  };

  const handleRotate = () => {
    executeAction("rotate", { angle: Math.PI / 4 });
  };

  const handleScale = () => {
    executeAction("scale", { factor: 1.5 });
  };

  return (
    <div>
      <button onClick={handleColorChange}>Paint Red</button>
      <button onClick={handleRotate}>Rotate</button>
      <button onClick={handleScale}>Scale Up</button>
    </div>
  );
};
```

## 🎨 **Available Actions**

Every prototype object supports these universal actions:

- **`paint(color)`** - Change object color
- **`rotate(angle?)`** - Rotate object (default: 45 degrees)
- **`scale(factor)`** - Scale object
- **`move(position)`** - Move object
- **`toggleVisibility()`** - Show/hide object
- **`glow(intensity)`** - Make object glow

## 🔧 **Adding to Existing Objects**

### Method 1: Use Prototype Versions

```typescript
// Import prototype versions
import { PrototypeTile, PrototypeWall, PrototypeStair } from "../roomElements";

// Use them with prototypeId
<PrototypeTile 
  prototypeId="floor_1" 
  position={[0, 0, 0]} 
  color="#4CAF50"
  onPrototypeAction={(action, data) => {
    // Handle prototype actions
    console.log(action, data);
  }}
/>
```

### Method 2: Wrap Existing Components

```typescript
import { withPrototype } from "../utils/PrototypeMixin";
import MyCustomComponent from "./MyCustomComponent";

// Create prototype-enabled version
const PrototypeMyCustom = withPrototype(MyCustomComponent, "custom");

// Use it
<PrototypeMyCustom 
  prototypeId="custom_1" 
  // ... other props
  onPrototypeAction={(action, data) => {
    console.log(action, data);
  }}
/>
```

## 🎯 **Example: StartRoom with Prototypes**

```typescript
const StartRoom = () => {
  const { executeAction: executeFloorAction } = usePrototypeActions("start_floor");

  return (
    <group>
      <PrototypeTile
        prototypeId="start_floor"
        position={[0, -0.5, 0]}
        size={8}
        height={1}
        color="#4CAF50"
        onPrototypeAction={(action, data) => {
          console.log(`Floor action: ${action}`, data);
          executeFloorAction(action, data);
        }}
      />
      
      <PrototypeTile
        prototypeId="start_platform"
        position={[0, 0.1, 0]}
        size={6}
        height={0.2}
        color="#66BB6A"
        onPrototypeAction={(action, data) => {
          console.log(`Platform action: ${action}`, data);
        }}
      />
    </group>
  );
};
```

## 🚀 **Benefits**

1. **Universal Control** - Every object can be controlled and modified
2. **Simple Integration** - Just add `prototypeId` and `onPrototypeAction` props
3. **Backward Compatible** - Original components still work
4. **Extensible** - Easy to add new actions
5. **Type Safe** - Full TypeScript support

## 🎮 **This is Your "Backdoor"**

Now every 3D object in your game can be:
- **Controlled** through the prototype system
- **Modified** with universal actions
- **Extended** with custom functionality
- **Managed** programmatically

The system is simple, universal, and works with all your existing components! 🎯✨

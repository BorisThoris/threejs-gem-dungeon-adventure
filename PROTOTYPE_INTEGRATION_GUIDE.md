# 🏗️ Prototype System Integration Guide

## Overview

This guide shows you how to integrate the Universal Prototype System into your existing rooms and objects. Every room becomes a prototype parent, and every object becomes a prototype child with full action support.

## 🎯 **What This Gives You**

- **Every Room is a Prototype Parent** - Can control all child objects
- **Every Object is a Prototype Child** - Full action support and control
- **Universal Actions** - Paint, rotate, scale, glow, visibility, physics, etc.
- **Room Management** - Rooms can manage all their objects
- **React Integration** - Seamless with your existing React Three Fiber setup

## 🔧 **Step 1: Wrap Your Room**

Replace your existing room component with `PrototypeRoomWrapper`:

```typescript
// Before
const MyRoom: React.FC = () => {
  return (
    <group>
      {/* Your room content */}
    </group>
  );
};

// After
const MyRoom: React.FC = () => {
  return (
    <PrototypeRoomWrapper
      roomId="my_room"
      roomType="custom"
      position={[0, 0, 0]}
      bounds={{
        min: [-10, -10, -10],
        max: [10, 10, 10],
      }}
    >
      {/* Your room content */}
    </PrototypeRoomWrapper>
  );
};
```

## 🎨 **Step 2: Convert Objects to Prototypes**

Replace your existing objects with prototype-enabled versions:

### Tiles
```typescript
// Before
<Tile
  position={[0, 0, 0]}
  color="#4CAF50"
  size={1}
/>

// After
<PrototypeTile
  elementId="floor_tile_1"
  roomId="my_room"
  position={[0, 0, 0]}
  color="#4CAF50"
  size={1}
  isInteractive={true}
/>
```

### Walls
```typescript
// Before
<Wall
  position={[0, 2, -5]}
  width={10}
  height={4}
  color="#8B8B8B"
/>

// After
<PrototypeWall
  elementId="north_wall"
  roomId="my_room"
  position={[0, 2, -5]}
  width={10}
  height={4}
  color="#8B8B8B"
  isInteractive={true}
/>
```

### Stairs
```typescript
// Before
<Stair
  position={[0, 0, 2]}
  width={2}
  height={0.2}
  depth={1}
/>

// After
<PrototypeStair
  elementId="main_stairs"
  roomId="my_room"
  position={[0, 0, 2]}
  width={2}
  height={0.2}
  depth={1}
  isInteractive={true}
/>
```

## 🎮 **Step 3: Add Room Controls**

Use the `useRoomPrototypeActions` hook to add room-level controls:

```typescript
import { useRoomPrototypeActions } from "../PrototypeRoomWrapper";

const MyRoom: React.FC = () => {
  const {
    colorAllObjects,
    scaleAllObjects,
    toggleVisibility,
    glowAllObjects,
  } = useRoomPrototypeActions("my_room");

  return (
    <PrototypeRoomWrapper roomId="my_room" roomType="custom">
      {/* Your room content */}
      
      {/* Room Controls UI */}
      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.8)", color: "white", padding: "15px" }}>
        <h3>Room Controls</h3>
        <button onClick={() => colorAllObjects("#FF0000")}>
          🔴 Color All Red
        </button>
        <button onClick={() => scaleAllObjects(1.2)}>
          📏 Scale All Up
        </button>
        <button onClick={() => toggleVisibility("wall")}>
          👁️ Toggle Walls
        </button>
        <button onClick={() => glowAllObjects(2.0)}>
          ✨ Glow All
        </button>
      </div>
    </PrototypeRoomWrapper>
  );
};
```

## 🎯 **Step 4: Object-Level Actions**

Each object can have individual actions:

```typescript
import { useElementPrototypeActions } from "../PrototypeElementWrapper";

const ObjectController: React.FC<{ elementId: string }> = ({ elementId }) => {
  const { paint, rotate, scale, glow, toggleVisibility } = useElementPrototypeActions(elementId);

  return (
    <div>
      <button onClick={() => paint("#FF0000")}>🎨 Paint Red</button>
      <button onClick={() => rotate()}>🔄 Rotate</button>
      <button onClick={() => scale(1.1)}>📏 Scale Up</button>
      <button onClick={() => glow(1.5)}>✨ Glow</button>
      <button onClick={() => toggleVisibility()}>👁️ Toggle Visibility</button>
    </div>
  );
};
```

## 🏠 **Complete Example: Converting StartRoom**

Here's how to convert your existing StartRoom to use prototypes:

```typescript
// Before: src/components/rooms/StartRoom.tsx
const StartRoom: React.FC = () => {
  return (
    <group>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.5, 0]} receiveShadow>
          <boxGeometry args={[8, 1, 8]} />
          <meshStandardMaterial color="#4CAF50" />
        </mesh>
      </RigidBody>
      {/* More objects... */}
    </group>
  );
};

// After: src/components/rooms/PrototypeStartRoom.tsx
const PrototypeStartRoom: React.FC = () => {
  const { colorAllObjects, scaleAllObjects, toggleVisibility } = useRoomPrototypeActions("start_room");

  return (
    <PrototypeRoomWrapper roomId="start_room" roomType="start">
      <PrototypeTile
        elementId="start_floor"
        roomId="start_room"
        position={[0, -0.5, 0]}
        size={8}
        height={1}
        color="#4CAF50"
        isInteractive={true}
      />
      {/* More prototype objects... */}
      
      {/* Room Controls */}
      <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,0.8)", color: "white", padding: "15px" }}>
        <button onClick={() => colorAllObjects("#FF0000")}>🔴 All Red</button>
        <button onClick={() => scaleAllObjects(1.2)}>📏 Scale Up</button>
        <button onClick={() => toggleVisibility("wall")}>👁️ Toggle Walls</button>
      </div>
    </PrototypeRoomWrapper>
  );
};
```

## 🎨 **Available Actions**

### Room-Level Actions
- `colorAllObjects(color)` - Color all objects in room
- `scaleAllObjects(factor)` - Scale all objects in room
- `moveAllObjects(offset)` - Move all objects in room
- `toggleVisibility(objectType?)` - Toggle visibility of objects
- `togglePhysics(objectType?)` - Toggle physics of objects
- `toggleInteraction(objectType?)` - Toggle interaction of objects
- `glowAllObjects(intensity)` - Make all objects glow
- `rotateAllObjects(angle)` - Rotate all objects

### Object-Level Actions
- `paint(color)` - Change object color
- `rotate(angle?)` - Rotate object
- `scale(factor)` - Scale object
- `move(position)` - Move object
- `toggleVisibility()` - Toggle object visibility
- `togglePhysics()` - Toggle object physics
- `toggleInteraction()` - Toggle object interaction
- `toggleCollision()` - Toggle object collision
- `glow(intensity)` - Make object glow
- `duplicate(onDuplicate)` - Duplicate object
- `remove(onDelete)` - Remove object

## 🔧 **Migration Strategy**

### Phase 1: Create Prototype Versions
1. Create `PrototypeTile`, `PrototypeWall`, `PrototypeStair` components
2. Keep original components for backward compatibility
3. Test prototype components in isolation

### Phase 2: Convert Rooms One by One
1. Start with simple rooms (StartRoom, EndRoom)
2. Wrap room with `PrototypeRoomWrapper`
3. Replace objects with prototype versions
4. Add room-level controls

### Phase 3: Advanced Features
1. Add custom actions to specific objects
2. Implement room-to-room object management
3. Add physics and collision controls
4. Create object inspectors and debuggers

## 🎯 **Benefits After Migration**

1. **Universal Control** - Every object can be controlled and modified
2. **Room Management** - Rooms can manage all their child objects
3. **Action System** - Universal actions that work on any object
4. **Extensibility** - Easy to add new actions and functionality
5. **Debugging** - Built-in debugging tools and inspectors
6. **Type Safety** - Full TypeScript support
7. **React Integration** - Seamless with React Three Fiber

## 🚀 **Next Steps**

1. **Start Small** - Convert one room at a time
2. **Test Thoroughly** - Ensure all actions work correctly
3. **Add Custom Actions** - Create room-specific actions
4. **Build Tools** - Create inspectors and debuggers
5. **Scale Up** - Convert all rooms to use prototypes

This gives you the "backdoor" you wanted - complete control over every object in your game! 🎮✨

# Universal Prototype System

## Overview

The Universal Prototype System extends the base prototype system to work with **every 3D object** in your game. Every tile, wall, stair, door, and room is now a prototype with full action support and room-based management.

## 🏗️ **Architecture**

### Core Types

1. **GameObjectPrototype** - Every 3D object (tiles, walls, stairs, doors, etc.)
2. **RoomPrototype** - Rooms that can manage their child objects
3. **UniversalPrototypeManager** - Central registry for all prototypes

### Key Features

- **Universal Coverage**: Every 3D object is a prototype
- **Room Management**: Rooms can see and control all objects within them
- **Parent-Child Relationships**: Objects know their room and can have children
- **Physics Integration**: Built-in physics properties for all objects
- **Collision System**: Collision detection and management
- **Visibility Control**: Show/hide objects individually or by type
- **Interactive Objects**: Mark objects as interactive for user interaction

## 🎯 **Object Types**

### Built-in Object Types
- **tile** - Floor tiles
- **wall** - Walls and barriers
- **stair** - Stairs and steps
- **door** - Doors and gates
- **furniture** - Furniture and decorations
- **decoration** - Decorative elements
- **interactive** - Interactive objects

### Room Types
- **start** - Starting rooms
- **puzzle** - Puzzle rooms
- **enemy** - Enemy encounter rooms
- **treasure** - Treasure rooms
- **boss** - Boss fight rooms
- **custom** - Custom room types

## 🚀 **Usage Examples**

### 1. Creating Objects

```typescript
import { createTile, createWall, createStair, createDoor, createRoom } from '../types/UniversalPrototypeSystem';

// Create a room
const room = createRoom({
  roomType: 'puzzle',
  position: [0, 0, 0],
  bounds: { min: [-10, -10, -10], max: [10, 10, 10] }
});

// Create objects in the room
const tile = createTile([0, 0, 0], room.id);
const wall = createWall([5, 1, 0], room.id);
const stair = createStair([0, 0, 2], room.id);
const door = createDoor([0, 1, -5], room.id);
```

### 2. Room Management

```typescript
import { useRoom } from '../hooks/usePrototypeSystem';

const MyRoom: React.FC = () => {
  const { room, objects, executeActionOnAllObjects, executeActionOnType } = useRoom('room_1');

  const colorAllObjects = () => {
    executeActionOnAllObjects('paint', { color: '#FF0000' });
  };

  const toggleTiles = () => {
    executeActionOnType('tile', 'toggle-visibility');
  };

  return (
    <div>
      <p>Objects in room: {objects.length}</p>
      <button onClick={colorAllObjects}>Color All Red</button>
      <button onClick={toggleTiles}>Toggle Tiles</button>
    </div>
  );
};
```

### 3. React Three Fiber Integration

```typescript
import { RoomContainer, PrototypeTile, PrototypeWall } from '../components/PrototypeComponents';

const My3DRoom: React.FC = () => {
  return (
    <RoomContainer roomId="room_1">
      {/* All objects in the room are automatically rendered */}
      {/* You can also add custom objects */}
    </RoomContainer>
  );
};
```

### 4. Object Actions

```typescript
import { usePrototype } from '../hooks/usePrototypeSystem';

const ObjectController: React.FC<{ objectId: string }> = ({ objectId }) => {
  const { prototype, executeAction } = usePrototype(objectId);

  const handleClick = () => {
    executeAction('paint', { color: '#00FF00' });
    executeAction('rotate');
    executeAction('glow', { intensity: 1.5 });
  };

  return (
    <button onClick={handleClick}>
      Transform Object
    </button>
  );
};
```

## 🔧 **Built-in Actions**

### Object Actions
- **toggle-visibility** - Show/hide object
- **toggle-interaction** - Enable/disable interaction
- **toggle-physics** - Enable/disable physics
- **toggle-collision** - Enable/disable collision
- **move-to-room** - Move object to another room
- **duplicate** - Create a copy of the object

### Room Actions
- **add-object** - Add object to room
- **remove-object** - Remove object from room
- **list-objects** - List all objects in room
- **move-all-objects** - Move all objects in room
- **scale-all-objects** - Scale all objects in room
- **color-all-objects** - Change color of all objects in room

## 🎮 **Game Integration**

### Converting Existing Rooms

```typescript
// Convert existing room data to prototypes
const convertRoomToPrototypes = (roomData: any) => {
  const room = createRoom({
    roomType: roomData.type,
    position: roomData.position,
    bounds: roomData.bounds
  });

  roomData.elements.forEach(element => {
    switch (element.type) {
      case 'tile':
        createTile(element.position, room.id);
        break;
      case 'wall':
        createWall(element.position, room.id);
        break;
      // ... other types
    }
  });

  return room;
};
```

### Room Component Integration

```typescript
// In your existing room components
const MyExistingRoom: React.FC = () => {
  const { room, objects } = useRoom('my_room');

  return (
    <group>
      {/* Your existing room geometry */}
      <RoomContainer roomId="my_room">
        {/* All objects are automatically rendered */}
      </RoomContainer>
    </group>
  );
};
```

## 🎨 **React Hooks**

### usePrototype
Manages a single prototype object
```typescript
const { prototype, updatePrototype, executeAction } = usePrototype(objectId);
```

### useRoom
Manages a room and its objects
```typescript
const { room, objects, addObject, removeObject, executeActionOnAllObjects } = useRoom(roomId);
```

### usePrototypeSystem
Manages all prototypes globally
```typescript
const { prototypes, rooms, createObject, createRoomObject } = usePrototypeSystem();
```

### useObjectType
Manages objects of a specific type
```typescript
const { objects, executeActionOnType } = useObjectType('tile');
```

### useObjectVisibility
Manages object visibility
```typescript
const { visibleObjects, toggleVisibility, showAll, hideAll } = useObjectVisibility();
```

### useObjectPhysics
Manages object physics
```typescript
const { physicsEnabled, togglePhysics, enablePhysicsForType } = useObjectPhysics();
```

## 🎯 **React Components**

### PrototypeMesh
Generic mesh component that syncs with prototypes
```typescript
<PrototypeMesh prototypeId={objectId} />
```

### Specific Object Components
```typescript
<PrototypeTile prototypeId={tileId} />
<PrototypeWall prototypeId={wallId} />
<PrototypeStair prototypeId={stairId} />
<PrototypeDoor prototypeId={doorId} />
```

### RoomContainer
Container that renders all objects in a room
```typescript
<RoomContainer roomId={roomId}>
  {/* Custom room content */}
</RoomContainer>
```

### RoomManager
UI component for managing room actions
```typescript
<RoomManager roomId={roomId} onRoomAction={handleRoomAction} />
```

### ObjectInspector
UI component for inspecting and controlling objects
```typescript
<ObjectInspector objectId={objectId} onClose={handleClose} />
```

### PrototypeDebugger
Debug component for the entire system
```typescript
<PrototypeDebugger />
```

## 🔄 **State Synchronization**

The system automatically syncs with React state:

1. **Prototype Changes** → **React State Updates** → **3D Scene Updates**
2. **Action Execution** → **Prototype Updates** → **Component Re-renders**
3. **Room Management** → **Object Updates** → **Visual Changes**

## 🎮 **Game Features**

### Physics Simulation
```typescript
// Enable physics for an object
object.physics.enabled = true;
object.physics.velocity = [0, 0, 0];
object.physics.acceleration = [0, -9.8, 0];
```

### Collision Detection
```typescript
// Configure collision
object.collision.enabled = true;
object.collision.shape = 'box';
object.collision.size = [1, 1, 1];
```

### Interactive Objects
```typescript
// Make object interactive
object.isInteractive = true;
```

### Room Boundaries
```typescript
// Set room boundaries
room.bounds = {
  min: [-10, -10, -10],
  max: [10, 10, 10]
};
```

## 🚀 **Advanced Features**

### Custom Object Types
```typescript
const customObject = createGameObject({
  objectType: 'custom',
  position: [0, 0, 0],
  color: '#FF0000',
  // ... other properties
});
```

### Room Transitions
```typescript
// Move object between rooms
universalPrototypeManager.moveObjectToRoom(objectId, newRoomId);
```

### Batch Operations
```typescript
// Execute action on all objects in room
universalPrototypeManager.executeActionInRoom(roomId, 'paint', { color: '#FF0000' });

// Execute action on all objects of a type
universalPrototypeManager.executeActionOnType('tile', 'toggle-visibility');
```

## 🎯 **Benefits**

1. **Universal Control**: Every object can be controlled and modified
2. **Room Management**: Rooms can manage all their child objects
3. **React Integration**: Seamless integration with React Three Fiber
4. **Type Safety**: Full TypeScript support
5. **Extensibility**: Easy to add new object types and actions
6. **Performance**: Efficient state management and updates
7. **Debugging**: Built-in debugging tools and inspectors

## 🔧 **Migration Guide**

### From Existing Objects
1. Convert existing objects to prototypes
2. Update room components to use RoomContainer
3. Replace manual object management with prototype actions
4. Use hooks for state management

### Example Migration
```typescript
// Before
const [tiles, setTiles] = useState([]);
const addTile = (position) => {
  setTiles(prev => [...prev, { position, color: '#8B4513' }]);
};

// After
const { createObject } = usePrototypeSystem();
const addTile = (position) => {
  createObject('tile', position, roomId);
};
```

This system gives you complete control over every 3D object in your game while maintaining clean architecture and React integration! 🎮✨

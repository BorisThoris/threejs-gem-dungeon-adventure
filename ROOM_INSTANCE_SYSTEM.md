# Room Instance System

This document describes the new room-instance based architecture that replaces the full 3D map rendering system.

## Overview

The game has been refactored from rendering the entire map at once to a room-instance system where:
- Only one room is rendered at a time
- Room transitions show a loading screen (like The Binding of Isaac)
- Doors provide navigation between rooms
- Each room is loaded/unloaded as needed

## Architecture

### Core Components

1. **RoomManagerStore** (`src/store/roomManagerStore.ts`)
   - Manages room instances and transitions
   - Handles loading/unloading of rooms
   - Tracks current active room

2. **RoomInstanceManager** (`src/components/RoomInstanceManager.tsx`)
   - Main component that orchestrates room rendering
   - Manages door placement and interactions
   - Handles room transitions

3. **RoomInstanceRenderer** (`src/components/RoomInstanceRenderer.tsx`)
   - Renders the current active room
   - Shows loading screen during transitions

4. **LoadingScreen** (`src/components/LoadingScreen.tsx`)
   - Binding of Isaac style loading screen
   - Shows progress and transition messages

5. **Door** (`src/components/Door.tsx`)
   - Interactive doors for room navigation
   - Supports locked doors and key requirements

### Key Features

#### Room Loading
- Rooms are loaded on-demand when needed
- Loading progress is tracked and displayed
- Rooms can be unloaded to save memory

#### Room Transitions
- **Instant transitions** between rooms (like The Binding of Isaac)
- Player gets teleported to entrance door of new room
- Previous room gets unloaded immediately
- No loading screens - seamless experience

#### Door System
- Doors are placed based on room connections
- Support for locked doors requiring keys
- Visual indicators for door states

#### Memory Management
- Only active room is kept in memory
- Previous rooms can be unloaded
- Efficient resource usage

## Usage

### Basic Room Navigation

```typescript
import useRoomManagerStore from '../store/roomManagerStore';

const { startTransition, loadRoom, setActiveRoom } = useRoomManagerStore();

// Start an instant room transition (teleports player)
await startTransition('room1', 'room2', 'north');

// Load a specific room
await loadRoom('room3');

// Set active room
setActiveRoom('room3');
```

### Door Interaction

```typescript
// In your component
<Door
  position={[0, 1.5, 5]}
  rotation={[0, 0, 0]}
  targetRoomId="room2"
  direction="north"
  isLocked={false}
  onDoorClick={(roomId, direction) => {
    console.log(`Moving to ${roomId} via ${direction}`);
  }}
/>
```

## Migration from Full Map System

The old system rendered all rooms simultaneously:
```typescript
// OLD: All rooms rendered at once
<MapContainer centerMap={false} />
```

The new system renders one room at a time:
```typescript
// NEW: Single room instance
<RoomInstanceManager />
```

## Benefits

1. **Performance**: Only renders one room at a time
2. **Memory**: Efficient memory usage with room loading/unloading
3. **Scalability**: Can handle much larger maps
4. **User Experience**: Clear room boundaries and transitions
5. **Debugging**: Easier to debug individual rooms

## Testing

Use the `RoomTransitionTest` component to test room transitions:
- Shows current room status
- Provides test transition button
- Displays loading and transition states

## Future Enhancements

- Room preloading for smoother transitions
- Room state persistence
- Dynamic room generation
- Room-specific physics settings
- Advanced door mechanics (puzzles, timers, etc.)

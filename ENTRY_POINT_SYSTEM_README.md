# Entry Point System for Room Generation

## Overview

The Entry Point System is a refined approach to dungeon/room generation that ensures proper alignment between rooms, hallways, and corridors. Instead of relying solely on relative positions, rooms now define explicit **entry points** where doors and connections can be placed.

## Key Concepts

### Entry Points

An **Entry Point** is a defined location on a room where a door or hallway connection can exist. Each entry point has:

- **ID**: Unique identifier
- **Direction**: Cardinal direction (north, south, east, west)
- **Position**: Local position relative to room center
- **Type**: Connection type (door, corridor, portal)
- **Active State**: Whether the entry point is currently in use
- **Connection**: ID of the entry point it connects to (in another room)

### Benefits

1. **Proper Alignment**: Doors on adjacent rooms automatically align
2. **Shape-Aware**: Different room shapes (circle, hexagon, etc.) have appropriate entry points
3. **Multi-Door Support**: Multiple connections on the same wall are handled correctly
4. **Type-Specific**: Corridors, portals, and rooms can have different entry configurations

## Architecture

### Type Definitions (`src/types/map.ts`)

```typescript
export type EntryDirection = 'north' | 'south' | 'east' | 'west';

export interface EntryPoint {
  id: string;
  direction: EntryDirection;
  position: Position;
  connectedTo?: string;
  type?: 'door' | 'corridor' | 'portal';
  isActive?: boolean;
}

export interface Room {
  // ... other properties
  entryPoints?: EntryPoint[];
}
```

### Entry Point Generator (`src/utils/entryPointGenerator.ts`)

Handles creation of entry points based on room shape and type:

- **Square rooms**: 4 cardinal entry points
- **Circular rooms**: 4 cardinal entry points (positioned on circle perimeter)
- **Hexagonal rooms**: 6 entry points (cardinal + 2 diagonal)
- **Octagonal rooms**: 8 entry points
- **Triangular rooms**: 3 entry points
- **Corridors**: 2 opposing entry points (north/south)

Key functions:
- `generateEntryPoints()`: Creates entry points for a room
- `getOppositeDirection()`: Gets the opposite cardinal direction
- `getDirectionBetweenRooms()`: Determines direction from one room to another
- `findAvailableEntryPoint()`: Finds an unused entry point in a direction
- `connectEntryPoints()`: Links two entry points together

### Map Generator (`src/algorithms/simpleMapGenerator.ts`)

Updated to use entry points:

1. **Room Creation**: `createRoomAt()` now generates entry points for each room
2. **Room Connection**: `connectRooms()` finds matching entry points and links them
3. **Start/End Rooms**: Also have entry points generated

When connecting two rooms:
```typescript
// 1. Determine direction from room1 to room2
const direction = getDirectionBetweenRooms(room1Pos, room2Pos);

// 2. Find available entry points
const entry1 = findAvailableEntryPoint(room1, direction);
const entry2 = findAvailableEntryPoint(room2, oppositeDirection);

// 3. Connect them
connectEntryPoints(entry1, entry2);
```

### Door Positioning (`src/utils/doorPositionFromEntryPoint.ts`)

Converts entry points to 3D door positions:

```typescript
export function calculateDoorPositionFromEntryPoints(
  currentRoom: Room,
  targetRoomId: string,
  connectionIndex: number
): { pos: [number, number, number]; rot: [number, number, number] } | null
```

This function:
1. Finds the active entry point for the connection
2. Converts entry point position to world coordinates
3. Determines door rotation based on direction
4. Returns position and rotation for rendering

#### Advanced Door Positioning Functions

**Get Room Doors With Spacing**: Automatically handles multiple doors on the same wall

```typescript
export function getRoomDoorsWithSpacing(
  currentRoom: Room,
  connections: string[]
): Array<{
  targetRoomId: string;
  position: [number, number, number];
  rotation: [number, number, number];
  direction: EntryDirection;
}>
```

This function:
- Groups doors by wall direction
- Applies automatic spacing for multiple doors on the same wall
- Returns complete door configuration for rendering

**Apply Door Spacing**: Fine-tune door positions

```typescript
export function applyDoorSpacing(
  basePosition: [number, number, number],
  direction: EntryDirection,
  doorIndex: number,
  totalDoorsOnWall: number
): [number, number, number]
```

**Get Active Entry Points By Direction**: Group entry points by wall

```typescript
export function getActiveEntryPointsByDirection(
  room: Room
): Map<EntryDirection, EntryPoint[]>
```

### Room Factory (`src/components/primitives/game-rooms/RoomFactory.tsx`)

Updated to use entry point system with fallback to old system:

```typescript
// Try entry point system first
const doorPositionFromEntry = calculateDoorPositionFromEntryPoints(
  currentRoom,
  connectionId,
  index
);

// Fallback to relative positioning if no entry points
const doorPosition = doorPositionFromEntry || calculateDoorPosition(
  currentRoom,
  targetRoom,
  roomSize
);
```

## Usage Examples

### Generating a Room with Entry Points

```typescript
const room = {
  id: 'room_1',
  type: RoomType.NORMAL,
  shape: 'hexagon',
  size: 10,
  // Entry points are automatically generated
  entryPoints: generateEntryPoints('room_1', RoomType.NORMAL, 'hexagon', 10)
};
```

### Connecting Two Rooms

```typescript
// The generator handles this automatically
connectRooms(room1, room2);

// Internally:
// 1. Finds direction between rooms
// 2. Locates available entry points
// 3. Links them together
// 4. Marks entry points as active
```

### Custom Entry Point Configuration

```typescript
// For corridors - only 2 opposing entry points
if (roomType === 'corridor') {
  return entryPoints.filter(
    ep => ep.direction === 'north' || ep.direction === 'south'
  );
}
```

## Algorithm Flow

### Room Generation with Entry Points

1. **Initialize**: Create start room with entry points
2. **Expand**: For each iteration:
   - Select a random existing room
   - Choose a random direction
   - Check if an entry point is available in that direction
   - Create new room with entry points
   - Connect entry points between rooms
3. **Corridors**: When inserting corridors:
   - Create corridor with 2 opposing entry points
   - Connect source room → corridor
   - Connect corridor → target room
4. **Validation**: Ensure all connections have matching entry points

### Entry Point Alignment

```
Room A (East wall entry)  →  [Hallway]  →  Room B (West wall entry)
    Entry: [5, 0]                              Entry: [-5, 0]
         ↓                                          ↓
    Door Position                            Door Position
    [5, 1.5, 0]                              [-5, 1.5, 0]
```

Both doors face each other and align perfectly.

## Backward Compatibility

The system maintains backward compatibility:

- Old maps without entry points fall back to relative positioning
- The `calculateDoorPosition()` function is still available
- Connections array is still populated alongside entry point connections

## Debugging

### Console Logging

Enable console logging to see entry point connections:

```typescript
console.log(`Connected entry points: ${room1.id}[${direction}] <-> ${room2.id}[${opposite}]`);
```

In the browser console, you'll see:
- Which entry points are being connected
- Whether doors are using entry points or fallback positioning
- Entry point directions and positions

### Visual Debugging

Use the Entry Point Debugger components for visual feedback:

```typescript
import { EntryPointDebugger, MapEntryPointDebugger } from '../utils/entryPointDebugger';

// Debug a single room
<EntryPointDebugger
  room={currentRoom}
  showLabels={true}
  showConnections={true}
/>

// Debug all rooms in the map
<MapEntryPointDebugger
  rooms={allRooms}
  enabled={true}
  showLabels={true}
  showConnections={true}
/>
```

Visual indicators:
- **Green spheres**: Active entry points (in use)
- **Yellow spheres**: Inactive entry points (available)
- **Cones**: Direction indicators showing which way the entry point faces
- **Labels**: Direction name, status, and connected room ID

### Validation Tools

Validate entry points programmatically:

```typescript
import { validateEntryPoints, logEntryPointInfo } from '../utils/entryPointDebugger';

// Validate all entry points in the map
const validation = validateEntryPoints(allRooms);
console.log('Valid:', validation.valid);
console.log('Errors:', validation.errors);
console.log('Warnings:', validation.warnings);

// Log detailed info for a specific room
logEntryPointInfo(currentRoom);
```

### Debug Example Component

Use the example component for interactive debugging:

```typescript
import { EntryPointDebugExample } from '../examples/EntryPointDebugExample';

// Add to your app with a toggle
<EntryPointDebugExample />
```

Features:
- Toggle entry point visualization on/off
- Show/hide labels and connection info
- Validate all entry points with one click
- View statistics about entry points in the map

## Future Enhancements

Potential improvements:

1. **Multi-level Entry Points**: Support for stairs/ladders between floors
2. **Angled Connections**: Diagonal corridors using intermediate entry points
3. **Dynamic Entry Points**: Add/remove entry points based on gameplay
4. **Entry Point Types**: Secret doors, locked doors, breakable walls
5. **Visual Indicators**: Show available entry points in editor mode
6. **Entry Point Groups**: Multiple doors on same wall using entry point groups

## Configuration

You can configure entry point behavior in `SimpleMapConfig`:

```typescript
const config: SimpleMapConfig = {
  roomSize: 10,              // Affects entry point spacing
  useShapedRooms: true,      // Use shape-specific entry points
  corridorChance: 0.5,       // Chance to use corridors (2-point entries)
  // ... other options
};
```

## Testing

### Manual Testing

To verify the system is working:

1. Generate a new map
2. Check console for "Connected entry points" messages
3. Verify "usingEntryPoints: true" in door debug logs
4. Ensure doors align perfectly when moving between rooms
5. Test with different room shapes (hexagon, octagon, etc.)

### Automated Testing

Run the automated test suite:

```typescript
import { runEntryPointTests } from '../utils/entryPointTests';

// In browser console or during development
runEntryPointTests();
```

The test suite validates:
- ✅ Entry point generation for all room shapes
- ✅ Direction helper functions
- ✅ Entry point connection logic
- ✅ Door positioning calculations
- ✅ Multiple doors on same wall handling
- ✅ Validation and error detection
- ✅ Edge cases and error handling

### Test Coverage

The test suite includes:

**Entry Point Generation**
- Square rooms (4 points)
- Hexagonal rooms (6 points)
- Octagonal rooms (8 points)
- Corridors (2 points)
- All room shapes have correct properties

**Direction Helpers**
- Opposite direction calculation
- Direction between adjacent rooms
- Direction offsets for movement
- Handles non-adjacent rooms

**Connection Logic**
- Finding available entry points
- Connecting two entry points
- Activating connections
- World position calculation

**Door Positioning**
- Door position from entry points
- Rotation based on direction
- Fallback to default positioning
- Multiple doors with spacing

**Validation**
- Detects missing entry points
- Finds broken connections
- Validates mutual connections
- Reports warnings and errors

### Performance Testing

Check entry point performance:

```typescript
// In browser console
console.time('Entry Point Generation');
const points = generateEntryPoints('test', 'normal', 'hexagon', 10);
console.timeEnd('Entry Point Generation');

console.time('Room Connection');
connectRooms(room1, room2);
console.timeEnd('Room Connection');
```

Expected performance:
- Entry point generation: < 1ms per room
- Room connection: < 1ms per connection
- Door calculation: < 1ms per door
- Validation: < 10ms for 50 rooms

## Technical Notes

- Entry points use **local coordinates** relative to room center
- Door positions are converted to **world coordinates** during rendering
- The system works with both the grid-based generation and free-form placement
- Entry points are immutable once connected (until room is regenerated)
- Corridors always use north/south entry points for consistency

## Summary

The Entry Point System provides a robust foundation for:
- ✅ Properly aligned room connections
- ✅ Shape-aware door placement
- ✅ Flexible corridor generation
- ✅ Backward compatibility
- ✅ Extensible for future features

This system ensures that all rooms, hallways, and connections align perfectly, creating a more polished and professional dungeon generation experience.


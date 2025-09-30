# Entry Point System - Quick Reference

A handy reference for working with the Entry Point System.

## Core Concepts

```typescript
// Entry Point = A defined location where doors/hallways connect
// Each entry point has: ID, Direction, Position, Connection Status

EntryPoint {
  id: 'room_1_entry_north_0',
  direction: 'north' | 'south' | 'east' | 'west',
  position: { x: 0, z: -5 },
  connectedTo?: 'room_2_entry_south_0',
  isActive: true | false
}
```

## Quick Tasks

### Generate Entry Points for a Room

```typescript
import { generateEntryPoints } from './utils/entryPointGenerator';

const entryPoints = generateEntryPoints(
  roomId,        // 'room_1'
  roomType,      // RoomType.NORMAL
  roomShape,     // 'square' | 'hexagon' | 'circle' | etc.
  roomSize       // 10
);
```

### Connect Two Rooms

```typescript
import { 
  findAvailableEntryPoint,
  connectEntryPoints,
  getOppositeDirection 
} from './utils/entryPointGenerator';

// Find available entry points
const entry1 = findAvailableEntryPoint(room1, 'east');
const entry2 = findAvailableEntryPoint(room2, 'west');

// Connect them
if (entry1 && entry2) {
  connectEntryPoints(entry1, entry2);
  // Now both are active and linked
}
```

### Get Door Position from Entry Point

```typescript
import { calculateDoorPositionFromEntryPoints } from './utils/doorPositionFromEntryPoint';

const doorData = calculateDoorPositionFromEntryPoints(
  currentRoom,
  targetRoomId,
  connectionIndex  // 0 for first connection, 1 for second, etc.
);

// Returns: { pos: [x, y, z], rot: [rx, ry, rz] }
```

### Handle Multiple Doors on Same Wall

```typescript
import { getRoomDoorsWithSpacing } from './utils/doorPositionFromEntryPoint';

const doors = getRoomDoorsWithSpacing(currentRoom, currentRoom.connections);

doors.forEach(door => {
  // door = { targetRoomId, position, rotation, direction }
  renderDoor(door.position, door.rotation);
});
```

### Enable Visual Debugging

```tsx
import { MapEntryPointDebugger } from './utils/entryPointDebugger';

<MapEntryPointDebugger
  rooms={allRooms}
  enabled={true}
  showLabels={true}
  showConnections={true}
/>
```

### Validate Entry Points

```typescript
import { validateEntryPoints } from './utils/entryPointDebugger';

const validation = validateEntryPoints(allRooms);

if (!validation.valid) {
  console.error('Errors:', validation.errors);
  console.warn('Warnings:', validation.warnings);
}
```

### Run Tests

```typescript
import { runEntryPointTests } from './utils/entryPointTests';

runEntryPointTests();  // Runs all tests and logs results
```

### Log Entry Point Info

```typescript
import { logEntryPointInfo } from './utils/entryPointDebugger';

logEntryPointInfo(room);  // Detailed console output
```

## Common Patterns

### Creating a Room with Entry Points

```typescript
const room: Room = {
  id: 'room_1',
  position: { x: 0, z: 0 },
  type: RoomType.NORMAL,
  connections: [],
  size: 10,
  isVisited: false,
  isCurrent: false,
  entryPoints: generateEntryPoints('room_1', RoomType.NORMAL, 'square', 10)
};
```

### Connecting Adjacent Rooms

```typescript
import { getDirectionBetweenRooms } from './utils/entryPointGenerator';

// Get direction from room1 to room2
const direction = getDirectionBetweenRooms(
  room1GridX, room1GridZ,
  room2GridX, room2GridZ
);

if (direction) {
  const opposite = getOppositeDirection(direction);
  const ep1 = findAvailableEntryPoint(room1, direction);
  const ep2 = findAvailableEntryPoint(room2, opposite);
  
  if (ep1 && ep2) {
    connectEntryPoints(ep1, ep2);
  }
}
```

### Check if Entry Point is Available

```typescript
const hasAvailableNorth = room.entryPoints?.some(
  ep => ep.direction === 'north' && !ep.isActive
);
```

### Get All Active Entry Points

```typescript
const activeEntryPoints = room.entryPoints?.filter(ep => ep.isActive) || [];
```

### Group Entry Points by Direction

```typescript
import { getActiveEntryPointsByDirection } from './utils/doorPositionFromEntryPoint';

const byDirection = getActiveEntryPointsByDirection(room);
const northDoors = byDirection.get('north') || [];
```

## Debugging Checklist

When doors aren't aligning:

1. ✅ Check entry points exist: `room.entryPoints?.length > 0`
2. ✅ Check entry points are active: `ep.isActive === true`
3. ✅ Check connections match: `ep.connectedTo` points to correct room
4. ✅ Validate with: `validateEntryPoints([room1, room2])`
5. ✅ Log info: `logEntryPointInfo(room)`
6. ✅ Enable visual debug: `<MapEntryPointDebugger ... />`

## Function Reference

### entryPointGenerator.ts

| Function | Purpose |
|----------|---------|
| `generateEntryPoints(id, type, shape, size)` | Create entry points for a room |
| `getOppositeDirection(dir)` | Get opposite cardinal direction |
| `getDirectionBetweenRooms(x1, z1, x2, z2)` | Get direction between two rooms |
| `findAvailableEntryPoint(room, dir)` | Find unused entry point |
| `connectEntryPoints(ep1, ep2)` | Link two entry points |
| `getEntryPointWorldPosition(room, ep)` | Convert to world coordinates |
| `getDirectionOffset(dir)` | Get grid offset for direction |

### doorPositionFromEntryPoint.ts

| Function | Purpose |
|----------|---------|
| `calculateDoorPositionFromEntryPoints(room, targetId, index)` | Get door pos/rot |
| `getRoomDoorsWithSpacing(room, connections)` | Get all doors with spacing |
| `applyDoorSpacing(pos, dir, index, total)` | Space doors on same wall |
| `getActiveEntryPointsByDirection(room)` | Group by direction |
| `getDoorPositionFromEntryPoint(room, targetId)` | Simple door lookup |

### entryPointDebugger.tsx

| Function/Component | Purpose |
|-------------------|---------|
| `<EntryPointDebugger room={} />` | Visual debug single room |
| `<MapEntryPointDebugger rooms={} />` | Visual debug all rooms |
| `validateEntryPoints(rooms)` | Validate all entry points |
| `logEntryPointInfo(room)` | Log room details to console |

### entryPointTests.ts

| Function | Purpose |
|----------|---------|
| `runEntryPointTests()` | Run full test suite |
| `EntryPointTestSuite` | Test runner class |

## Room Shape Entry Point Counts

| Shape | Entry Points |
|-------|--------------|
| Square | 4 (N, S, E, W) |
| Circle | 4 (N, S, E, W) |
| Hexagon | 6 (N, S, E, W + 2 diagonals) |
| Octagon | 8 (Cardinals + 4 diagonals) |
| Triangle | 3 |
| Diamond | 4 |
| Cross | 4 |
| Corridor | 2 (N, S only) |

## Entry Point States

| State | Color (Debug) | Meaning |
|-------|---------------|---------|
| `isActive: false` | Yellow | Available for connection |
| `isActive: true` | Green | Currently connected |
| `connectedTo: undefined` | - | Not connected to anything |
| `connectedTo: 'room_2_entry_...'` | - | Connected to another room |

## Troubleshooting

### "No entry points available"
- Check if room has `entryPoints` property
- Verify entry points were generated: `generateEntryPoints(...)`
- Check if all entry points are already active

### "Doors not aligned"
- Use `validateEntryPoints()` to find issues
- Check entry points are mutually connected
- Verify opposite directions are correct
- Enable visual debugging to see positions

### "Multiple doors overlap"
- Use `getRoomDoorsWithSpacing()` instead of individual calculations
- Check spacing is applied: `applyDoorSpacing()`
- Verify doors are grouped by direction

### "Connection count mismatch"
- Active entry points should match `room.connections.length`
- Use validation to detect: `validateEntryPoints()`
- Check for orphaned connections

## Best Practices

1. **Always generate entry points** when creating rooms
2. **Use validation** after map generation
3. **Enable debug mode** during development
4. **Run tests** after making changes
5. **Check console logs** for warnings
6. **Use spacing functions** for multiple doors
7. **Validate before saving** maps

## Performance Tips

- Entry point operations are O(n) where n = number of entry points
- Typical room has 4-8 entry points
- Validation is O(n*m) where n = rooms, m = entry points per room
- Cache `getRoomDoorsWithSpacing()` results if possible
- Disable visual debugging in production

## Links

- Full Documentation: `ENTRY_POINT_SYSTEM_README.md`
- Improvements Log: `ENTRY_POINT_SYSTEM_IMPROVEMENTS.md`
- Type Definitions: `src/types/map.ts`

---

**Tip**: Press `Ctrl+F` to search this reference quickly!



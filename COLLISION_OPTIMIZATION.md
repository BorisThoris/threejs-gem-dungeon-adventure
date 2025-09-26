# Collision System Optimization

## Overview
The collision detection system has been completely optimized to move from individual room-based detection to a centralized player-based system. This provides significant performance improvements and smarter room detection.

## What Changed

### Before (Inefficient)
- **Individual RoomCollisionDetector components** on every room
- **Every room** running collision detection in `useFrame()` 
- **No threshold-based recalculation** - constant checking
- **Multiple collision detectors** competing and causing race conditions
- **O(n) complexity** where n = number of rooms

### After (Optimized)
- **Single PlayerRoomManager** component handling all detection
- **Threshold-based recalculation** - only checks when player moves significantly
- **Pre-computed room bounds** stored when map is generated
- **Centralized state management** with no race conditions
- **O(1) complexity** for most operations

## Key Components

### 1. PlayerRoomDetection (`src/utils/playerRoomDetection.ts`)
- **Singleton class** managing all room detection logic
- **Pre-computes room bounds** when map is generated
- **Threshold-based detection** (default 2.0 units movement)
- **Efficient bounds checking** with tolerance for edge cases
- **Debug information** and state management

### 2. PlayerRoomManager (`src/components/PlayerRoomManager.tsx`)
- **Single component** replacing all individual room detectors
- **Throttled updates** (10fps max) to prevent excessive calculations
- **Event-driven** room enter/exit notifications
- **Game state integration** with proper phase management

### 3. RoomDetectionDebugger (`src/components/RoomDetectionDebugger.tsx`)
- **Visual debugging** showing current room, player position, bounds
- **Performance metrics** and detection status
- **Real-time updates** every 500ms

## Performance Benefits

### Memory Usage
- **Reduced component count**: From N room detectors to 1 manager
- **Pre-computed bounds**: No runtime calculations for room dimensions
- **Efficient data structures**: Map-based room lookup

### CPU Usage
- **Threshold-based detection**: Only recalculates when player moves >2 units
- **Throttled updates**: Maximum 10fps for collision detection
- **Single detection loop**: Instead of N parallel loops

### Network/State Management
- **Centralized state**: No race conditions between multiple detectors
- **Event-driven updates**: Only triggers when room actually changes
- **Clean state management**: Proper cleanup and initialization

## Configuration

### Detection Threshold
```typescript
// Adjust sensitivity (default: 2.0 units)
playerRoomDetection.setDetectionThreshold(1.5); // More sensitive
playerRoomDetection.setDetectionThreshold(3.0); // Less sensitive
```

### Enable/Disable Detection
```typescript
// Temporarily disable detection
playerRoomDetection.setDetectionEnabled(false);
```

## Usage

The system is now automatically initialized when:
1. **Map is generated** - Room bounds are pre-computed
2. **PlayerRoomManager mounts** - Detection starts
3. **Player moves** - Threshold-based recalculation triggers

## Debug Information

The debugger shows:
- **Player position** (x, y, z)
- **Current room ID**
- **Detection status** (enabled/disabled)
- **Detection threshold**
- **Total room count**
- **Current room bounds** (if in a room)
- **Last update timestamp**

## Migration Notes

### Removed Components
- `RoomCollisionDetector` - No longer needed
- Individual room collision detection in `Room.tsx`

### Updated Components
- `MapRenderer.tsx` - Now uses `PlayerRoomManager`
- `mapStore.ts` - Initializes room bounds on map generation
- `StartScreen.tsx` - Added debugger for monitoring

### Backward Compatibility
- All existing room types and interactions remain unchanged
- Game events (`ROOM_ENTER`, `ROOM_EXIT`) still work the same
- Room state management continues as before

## Future Enhancements

1. **Spatial partitioning** for very large maps
2. **Predictive room loading** based on player movement direction
3. **Dynamic threshold adjustment** based on player speed
4. **Room transition animations** with detection timing
5. **Multi-player support** with shared room state

This optimization provides a solid foundation for scalable room-based gameplay with minimal performance overhead.

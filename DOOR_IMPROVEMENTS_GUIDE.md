# Door System - Clean & Optimized

## Overview
This is the streamlined door system for your ThreeJS project. It provides essential door functionality with smooth animations, state management, and visual effects while keeping the codebase lean and maintainable.

## Core Features

### 1. Fixed Critical Bug
- **Issue**: `setDoorType` was incorrectly using `doorStates` instead of `doorTypes`
- **Fix**: Corrected the state management in `doorProgressionStore.ts`

### 2. Enhanced State Machine
- **New States**: Added `opening` and `closing` states for smooth animations
- **State Validation**: Implemented `canTransition()` function to prevent invalid state changes
- **Auto-transitions**: Doors automatically transition from `opening` → `open` and `closing` → `closed`

### 3. Animation System
- **Smooth Animations**: Doors now rotate smoothly when opening/closing
- **Configurable Speed**: Animation speed can be adjusted per door
- **Visual Feedback**: Different colors and effects for different states

### 4. Door Types (Simplified)
- **Standard**: Basic door with open/close functionality
- **Secret**: Requires key and has special visual effects
- **Locked**: Requires key to unlock

### 5. Performance Monitoring
- **Performance Tracking**: Real-time FPS and render time monitoring
- **Essential Only**: Kept only the core `DoorPerformanceMonitor` class

### 6. Visual Enhancements
- **State Indicators**: Different colors for opening/closing states
- **Type Indicators**: Visual cues for secret doors
- **Glow Effects**: Pulsing effects for secret doors
- **Animation Feedback**: Visual feedback during state transitions

## Files Structure

### Core Components
- `src/components/Door.tsx` - Main door component with animations
- `src/store/doorProgressionStore.ts` - State management
- `src/utils/doorPerformance.ts` - Performance monitoring (simplified)

## Migration Guide

### For Existing Door Usage

#### Before (Old System)
```typescript
<Door
  position={[0, 0, 0]}
  rotation={[0, 0, 0]}
  targetRoomId="room_2"
  onDoorClick={() => handleRoomChange("room_2")}
  state="closed"
  type="standard"
/>
```

#### After (Enhanced System)
```typescript
<EnhancedDoorManager
  doors={[
    {
      id: 'door_1',
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      targetRoomId: 'room_2',
      type: 'standard',
      state: 'closed',
      size: [2, 3, 0.2],
      material: 'wood',
      animationSpeed: 1,
      autoCloseDelay: 5000,
      visualEffects: {
        glow: false,
        particles: false,
        outline: '#8B4513'
      }
    }
  ]}
  config={{
    enableAnimations: true,
    enableSoundEffects: true,
    enableVisualEffects: true,
    performanceMode: 'high',
    cullingDistance: 50,
    lodDistances: [10, 25, 50]
  }}
  playerPosition={[0, 0, 0]}
  onDoorClick={(doorId, targetRoomId) => handleRoomChange(targetRoomId)}
  onDoorStateChange={(doorId, newState) => console.log(`Door ${doorId}: ${newState}`)}
/>
```

### For State Management

#### Before
```typescript
// Direct state setting without validation
setDoorState(doorId, "open");
```

#### After
```typescript
// State changes with validation and auto-transitions
setDoorState(doorId, "opening"); // Automatically transitions to "open"
```

### For Door Groups

#### New Feature
```typescript
const doorGroups: DoorGroup[] = [
  {
    id: 'group_1',
    doors: ['door_1', 'door_2'],
    behavior: 'all_open', // All doors open together
    triggers: ['door_1']
  },
  {
    id: 'group_2',
    doors: ['door_3', 'door_4', 'door_5'],
    behavior: 'sequence', // Doors open in sequence
    triggers: ['door_3']
  }
];
```

## Configuration Options

### Door Configuration
```typescript
interface DoorConfig {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
  targetRoomId: string;
  type: DoorType;
  state: DoorState;
  size: [number, number, number];
  material: string;
  animationSpeed: number;
  autoCloseDelay?: number;
  requiredKey?: string;
  puzzleId?: string;
  soundEffects?: {
    open: string;
    close: string;
    locked: string;
  };
  visualEffects?: {
    glow: boolean;
    particles: boolean;
    outline: string;
  };
}
```

### Manager Configuration
```typescript
interface DoorManagerConfig {
  enableAnimations: boolean;
  enableSoundEffects: boolean;
  enableVisualEffects: boolean;
  performanceMode: "high" | "medium" | "low";
  cullingDistance: number;
  lodDistances: number[];
}
```

## Performance Considerations

### High Performance Mode
- All features enabled
- Full animation system
- Complete visual effects
- Recommended for < 50 doors

### Medium Performance Mode
- Reduced visual effects
- Simplified animations
- Basic culling
- Recommended for 50-100 doors

### Low Performance Mode
- Minimal visual effects
- No animations
- Aggressive culling
- Recommended for > 100 doors

## Backward Compatibility

The original `Door` component remains fully functional and backward compatible. The enhanced features are opt-in through the `EnhancedDoorManager` component.

## Next Steps

1. **Test the enhanced system** with your existing doors
2. **Migrate gradually** by replacing individual doors with the enhanced system
3. **Configure performance settings** based on your door count
4. **Add door groups** for complex door interactions
5. **Customize visual effects** to match your game's aesthetic

## Troubleshooting

### Common Issues

1. **Doors not animating**: Check that `enableAnimations` is true in config
2. **Performance issues**: Reduce `performanceMode` or enable culling
3. **State transition errors**: Check that transitions are valid using `canTransition()`
4. **Visual effects not showing**: Ensure `enableVisualEffects` is true

### Debug Mode

Enable debug mode to see performance indicators:
```typescript
<EnhancedDoorManager
  // ... other props
  showDebugInfo={true}
/>
```

This will show a colored indicator (green/yellow/red) representing current performance level.

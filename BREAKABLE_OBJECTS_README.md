# Breakable Objects System

## Overview
Added break functionality to the universal ObjectPrototype system, allowing any 3D object to become breakable with visual damage feedback.

## New Break Properties
- `isBreakable: boolean` - Whether the object can be broken
- `isBroken: boolean` - Whether the object is currently broken
- `breakThreshold: number` - Damage threshold before breaking (default: 100)
- `currentDamage: number` - Current damage accumulated

## New Break Actions
- `makeBreakable(threshold)` - Make object breakable with damage threshold
- `damage(amount)` - Deal damage to the object
- `break()` - Instantly break the object
- `repair()` - Repair the object back to original state

## Visual Damage Feedback
Objects change color as they take damage:
- **0-30% damage**: Original color
- **30-60% damage**: Orange (#ffaa00)
- **60-90% damage**: Red-orange (#ff6600)
- **90%+ damage**: Red (#ff0000)
- **Broken**: Object becomes invisible

## Breakable Room Demo
Created `BreakableRoom` component that demonstrates the break system:

### Features
- **7 Breakable Objects**: Floor, 2 walls, stair, candle, table, chair
- **Click to Damage**: Click any object to deal 25 damage
- **Visual Progress**: Shows broken count (e.g., "Broken: 3/7")
- **Completion Goal**: Break all objects to complete the room
- **Success Message**: Shows completion celebration

### How to Access
1. Go to the 3D Editor (`http://localhost:5173?editor=true`)
2. Select "Rooms" category
3. Choose "💥 Breakable Room"
4. Click objects to damage them!

## Usage Example
```typescript
import { PrototypeTile } from "../roomElements";
import { useObjectPrototypeActions } from "../utils/SimplePrototypeMixin";

// Make a tile breakable
<PrototypeTile
  prototypeId="breakable_tile"
  position={[0, 0, 0]}
  color="#4CAF50"
  onPrototypeAction={(action, data) => {
    if (action === "break") {
      console.log("Tile broken!");
    }
  }}
  onClick={() => {
    // Deal damage when clicked
    executeAction("damage", { amount: 25 });
  }}
/>

// Or use the hook directly
const { executeAction } = useObjectPrototypeActions("breakable_tile");
executeAction("makeBreakable", { threshold: 100 });
executeAction("damage", { amount: 25 });
```

## Technical Details
- **Damage System**: Accumulative damage with threshold-based breaking
- **Visual Feedback**: Color changes based on damage percentage
- **State Management**: Broken objects become invisible but remain in scene
- **Repair System**: Can restore objects to original state
- **Serialization**: Break state is saved/loaded with object data

## Benefits
- ✅ **Universal**: Works on any 3D object with prototype system
- ✅ **Visual**: Clear damage feedback through color changes
- ✅ **Interactive**: Click to damage, easy to implement
- ✅ **Flexible**: Configurable damage thresholds
- ✅ **Reversible**: Can repair broken objects
- ✅ **Game Ready**: Perfect for destructible environments

This gives you a complete destructible environment system that works with any 3D object! 🎮💥

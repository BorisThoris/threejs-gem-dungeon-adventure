# Door Positioning & Navigation Fix

## Problems Fixed

### 1. **Door Positioning Issue**
- **Problem**: All doors were placed on one side of the room (north wall) stacked on top of each other
- **Cause**: UnifiedRoomManager was using a simple positioning system that only placed doors on the north wall
- **Fix**: Updated `calculateDoorPosition` function to use proper room-relative positioning based on target room direction

### 2. **Door Navigation Issue**  
- **Problem**: Door clicks weren't working for navigation in instance mode
- **Cause**: Door click handler only called `handleDoorClick` in full mode, just logged in instance mode
- **Fix**: Added `handleDoorClick(room.id)` call to instance mode as well

## Changes Made

### ✅ **1. Fixed Door Positioning Logic**
**File**: `src/components/UnifiedRoomManager.tsx`

**Before** (lines 80-85):
```typescript
} else {
  // Instance/full mode: position doors on walls (north wall for now)
  return {
    position: [0, 0, -roomSize / 2],
    rotation: [0, 0, 0],
  };
}
```

**After** (lines 83-131):
```typescript
} else {
  // Instance/full mode: use proper door positioning based on room positions
  if (currentRoom && targetRoom) {
    const dx = targetRoom.position.x - currentRoom.position.x;
    const dz = targetRoom.position.z - currentRoom.position.z;
    
    const roomHalfSize = roomSize / 2;
    
    if (Math.abs(dx) > Math.abs(dz)) {
      // East or West
      if (dx > 0) {
        return {
          position: [roomHalfSize, 0.5, 0],
          rotation: [0, -Math.PI / 2, 0],
        };
      } else {
        return {
          position: [-roomHalfSize, 0.5, 0],
          rotation: [0, Math.PI / 2, 0],
        };
      }
    } else {
      // North or South
      if (dz > 0) {
        return {
          position: [0, 0.5, roomHalfSize],
          rotation: [0, 0, 0],
        };
      } else {
        return {
          position: [0, 0.5, -roomHalfSize],
          rotation: [0, Math.PI, 0],
        };
      }
    }
  } else {
    // Fallback: distribute doors around perimeter
    // ... fallback logic
  }
}
```

### ✅ **2. Fixed Door Navigation**
**File**: `src/components/UnifiedRoomManager.tsx`

**Before** (lines 385-387):
```typescript
} else {
  console.log(`🚪 UnifiedRoomManager: Door clicked -> ${room.id}`);
}
```

**After** (lines 385-389):
```typescript
} else {
  // Instance mode: also handle door clicks for navigation
  console.log(`🚪 UnifiedRoomManager: Door clicked -> ${room.id}`);
  handleDoorClick(room.id);
}
```

### ✅ **3. Updated Function Signature**
- Added `currentRoom` and `targetRoom` parameters to `calculateDoorPosition`
- Updated function call to pass these parameters

## Result

### ✅ **Door Positioning**
- Doors now appear on the correct walls based on target room direction
- North rooms → doors on north wall
- South rooms → doors on south wall  
- East rooms → doors on east wall
- West rooms → doors on west wall
- No more stacking on one side

### ✅ **Door Navigation**
- Door clicks now work in both full and instance modes
- Clicking doors properly triggers room transitions
- Navigation flow is restored

### ✅ **Maintained Functionality**
- All door animations still work
- State management preserved
- No duplicate doors (from previous fix)
- All door types (standard, locked, secret) work correctly

The door system now has proper positioning and working navigation while maintaining all the improvements from the cleanup!

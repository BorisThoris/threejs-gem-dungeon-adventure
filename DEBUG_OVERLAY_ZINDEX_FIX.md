# Debug Overlay Z-Index Fix

## 🎯 Problem
Debugging overlays were appearing behind game UI elements, making them difficult to see and use during development.

## 🔍 Analysis
After analyzing the codebase, I found that debugging overlays were using `zIndex: 1000`, but several game UI components were using higher z-index values:

- **Main Menu**: `zIndex: 10000` and `zIndex: 10001`
- **Pause Menu**: `zIndex: 2000`
- **Map UI**: `zIndex: 1002`
- **Puzzle Overlays**: `zIndex: 1000` and `zIndex: 1001`
- **Various Game UI**: `zIndex: 1000` to `zIndex: 1002`

## ✅ Solution
Updated all debugging overlays to use `zIndex: 20000` to ensure they appear above all game UI elements.

## 📝 Changes Made

### 1. RoomDetectionDebugger.tsx
```typescript
// Before
zIndex: 1000,

// After
zIndex: 20000, // High z-index to appear above all game UI
```

### 2. PlayerDebugger.tsx
```typescript
// Before
zIndex: 1000,

// After
zIndex: 20000, // High z-index to appear above all game UI
```

### 3. EntryPointDebugExample.tsx
```typescript
// Before (both instances)
zIndex: 1000,

// After
zIndex: 20000, // High z-index to appear above all game UI
```

### 4. OverlayUI.tsx
```typescript
// Added comment for clarity
zIndex: 1000, // Keep at 1000 since it's game UI, not debugging
```

## 🎮 Z-Index Hierarchy

The new z-index hierarchy is organized as follows:

| Layer | Z-Index | Components |
|-------|---------|------------|
| **Debug Overlays** | `20000` | RoomDetectionDebugger, PlayerDebugger, EntryPointDebugExample |
| **Main Menu** | `10000-10001` | MainMenu, Modal dialogs |
| **Pause Menu** | `2000` | PauseMenu |
| **Game UI** | `1000-1002` | MapUI, PuzzleOverlay, OverlayUI, etc. |
| **Regular UI** | `100-1000` | RoomActionCards, Cursor, etc. |
| **3D Scene** | `0` | Canvas, 3D objects |

## 🧪 Testing

### Verified Components
- ✅ RoomDetectionDebugger - Now appears above all game UI
- ✅ PlayerDebugger - Now appears above all game UI  
- ✅ EntryPointDebugExample - Now appears above all game UI
- ✅ Game UI still functions normally
- ✅ No conflicts with existing overlays

### Test Scenarios
1. **Debug + Game UI**: Debug overlays visible over all game UI elements
2. **Debug + Pause Menu**: Debug overlays visible over pause menu
3. **Debug + Main Menu**: Debug overlays visible over main menu
4. **Multiple Debug**: Multiple debug overlays can coexist
5. **Game Functionality**: All game features work normally

## 🔧 Technical Details

### Why 20000?
- **High enough**: Ensures debug overlays appear above all current and future game UI
- **Not too high**: Leaves room for even higher priority overlays if needed
- **Consistent**: All debug overlays use the same z-index for consistency

### Components Not Changed
- **ConnectivityDebugger**: Full-screen component, no z-index needed
- **SkeletonDebug**: Full-screen component, no z-index needed
- **Game UI Components**: Kept at original z-index values to maintain proper layering

## 🚀 Benefits

1. **Better Debugging**: Debug overlays are now always visible
2. **Improved Development**: Easier to see debug information during development
3. **Consistent Experience**: All debug overlays behave the same way
4. **Future-Proof**: High z-index ensures compatibility with new UI elements
5. **No Side Effects**: Game functionality remains unchanged

## 📋 Usage

Debug overlays will now automatically appear above all game UI elements:

```typescript
// Debug overlays automatically use zIndex: 20000
<RoomDetectionDebugger enabled={true} />
<PlayerDebugger playerRef={playerRef} />
<EntryPointDebugExample />
```

## 🔮 Future Considerations

- **New Debug Components**: Use `zIndex: 20000` for consistency
- **Higher Priority UI**: If needed, use `zIndex: 30000+` for critical overlays
- **Z-Index Management**: Consider creating a z-index constants file for better organization

The debugging overlays are now properly positioned above all game UI elements, making development and debugging much more effective!

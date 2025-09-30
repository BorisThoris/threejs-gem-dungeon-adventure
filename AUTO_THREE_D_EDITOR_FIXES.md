# AutoThreeDEditor Import Fixes

## 🎯 **Issue Fixed**
Fixed the import error: `The requested module '/src/components/primitives/game-rooms/index.ts' does not provide an export named 'SpiderLair'`

## 🔧 **Root Cause**
The `AutoThreeDEditor.tsx` was trying to import `SpiderLair` and `TreasureVault` components that don't exist in the codebase.

## ✅ **Changes Made**

### **1. Removed Non-Existent Imports**
```typescript
// Before
import {
  CryptContent,
  TrapContent,
  TreasureVault,    // ❌ File doesn't exist
  SpiderLair,       // ❌ File doesn't exist
} from "./primitives/game-rooms";

// After
import {
  CryptContent,
  TrapContent,
} from "./primitives/game-rooms";
```

### **2. Removed Component Configurations**
Removed the entire configuration blocks for non-existent components:

**TreasureVault Configuration (Removed):**
```typescript
{
  type: "treasure-vault",
  component: TreasureVault,  // ❌ Component doesn't exist
  title: "Treasure Vault",
  emoji: "💰",
  description: "Golden vault filled with treasure chests",
  props: { size: 10 },
  category: "room",
  editableProps: [...]
}
```

**SpiderLair Configuration (Removed):**
```typescript
{
  type: "spider-lair",
  component: SpiderLair,     // ❌ Component doesn't exist
  title: "Spider Lair",
  emoji: "🕷️",
  description: "Dark lair filled with spider webs",
  props: { size: 10 },
  category: "room",
  editableProps: [...]
}
```

## 🎉 **Result**
- ✅ No more import errors
- ✅ Build completes successfully
- ✅ AutoThreeDEditor loads without errors
- ✅ All existing components work correctly

## 📁 **Files Updated**
- `src/components/AutoThreeDEditor.tsx` - Removed non-existent imports and configurations

The AutoThreeDEditor should now work correctly without any import errors!

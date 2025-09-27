# Enhanced Breakable Objects System

## Overview
Enhanced the breakable system inspired by the [Three.js physics_ammo_break.html example](https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_break.html) to include physics-based breaking with realistic debris simulation.

## New Physics-Based Breaking Features

### Enhanced ObjectPrototype Methods
- **`breakWithPhysics(force, direction)`** - Break object with physics simulation
- **`createDebris(force, direction)`** - Generate realistic debris pieces
- **`getDebris()`** - Get current debris pieces for rendering

### Debris System
- **Realistic Physics**: Debris pieces fly in random directions with gravity
- **Visual Effects**: Pieces fade out over time (3-5 seconds)
- **Dynamic Rendering**: Debris is collected and rendered in real-time
- **Particle-like Behavior**: Each piece has velocity, rotation, and lifetime

## New Break Actions
- **`breakWithPhysics`** - Physics-based breaking with debris
- **`damage`** - Traditional damage accumulation (existing)
- **`break`** - Instant breaking (existing)
- **`repair`** - Repair broken objects (existing)

## Enhanced Breakable Room Demo

### New Controls
- **Left Click**: Damage objects (25 damage per click)
- **Right Click**: Physics break with debris explosion
- **R Key**: Repair all objects

### Physics Breaking Features
- **Force-based**: Different force values for different break directions
- **Directional**: Objects break in realistic directions (walls outward, etc.)
- **Debris Simulation**: 3-7 pieces per broken object
- **Gravity Effects**: Debris falls naturally with physics

### Visual Enhancements
- **Real-time Debris**: Flying pieces with rotation and gravity
- **Fade Effects**: Debris pieces fade out over time
- **Color Preservation**: Debris maintains original object color
- **Size Variation**: Random debris piece sizes for realism

## Technical Implementation

### Debris Component
```typescript
// New Debris component for rendering broken pieces
<Debris 
  pieces={allDebris} 
  onPieceExpired={(pieceId) => console.log(`Piece ${pieceId} expired`)}
/>
```

### Physics Breaking Usage
```typescript
// Break with physics simulation
executeAction("breakWithPhysics", { 
  force: 1.5, 
  direction: [0, 1, 0] // Upward force
});

// Traditional damage
executeAction("damage", { amount: 25 });
```

### Debris Properties
Each debris piece has:
- **Position**: 3D coordinates with random offset
- **Velocity**: Random directional movement with gravity
- **Rotation**: Continuous rotation animation
- **Color**: Inherited from original object
- **Size**: Random size variation (0.2-0.7 scale)
- **Lifetime**: 3-5 seconds before disappearing

## Enhanced Room Demo Features

### Interactive Controls
- **Dual Interaction**: Left click for damage, right click for physics
- **Visual Feedback**: Clear instructions and progress tracking
- **Real-time Updates**: Debris collection and rendering every 100ms
- **Completion Goal**: Break all 7 objects to win

### Realistic Physics
- **Directional Breaking**: Walls break outward, objects break upward
- **Force Variation**: Different force values for different object types
- **Gravity Simulation**: Debris falls naturally over time
- **Collision-like Effects**: Pieces scatter in realistic patterns

## Benefits Over Simple Breaking

### Visual Appeal
- ✅ **Realistic Debris**: Flying pieces with physics
- ✅ **Dynamic Effects**: Continuous animation and fading
- ✅ **Directional Breaking**: Objects break in logical directions
- ✅ **Particle System**: Multiple pieces per broken object

### Gameplay Enhancement
- ✅ **Satisfying Feedback**: Physics breaking feels more impactful
- ✅ **Visual Variety**: Two different breaking methods
- ✅ **Realistic Simulation**: Gravity and physics effects
- ✅ **Performance Optimized**: Debris auto-cleanup after lifetime

### Technical Advantages
- ✅ **Modular Design**: Debris system works with any breakable object
- ✅ **Memory Efficient**: Automatic cleanup of expired debris
- ✅ **Extensible**: Easy to add more physics effects
- ✅ **Universal**: Works with all prototype-enabled objects

## Usage Examples

### Basic Physics Breaking
```typescript
// Make object breakable
executeAction("makeBreakable", { threshold: 100 });

// Break with physics
executeAction("breakWithPhysics", { 
  force: 2.0, 
  direction: [1, 0, 0] // Rightward force
});
```

### Debris Collection
```typescript
// Get debris from broken objects
const allPrototypes = PrototypeRegistry.getAll();
const debrisPieces = allPrototypes
  .filter(proto => proto.isBroken)
  .flatMap(proto => proto.getDebris());
```

## Access the Enhanced Demo

1. **Go to 3D Editor**: `http://localhost:5173?editor=true`
2. **Select "Rooms"** category
3. **Choose "💥 Breakable Room"**
4. **Try both breaking methods**:
   - Left click for gradual damage
   - Right click for physics explosion
5. **Watch the debris fly!** 🎮💥

This enhanced system provides a much more satisfying and realistic breaking experience inspired by professional physics simulations! ✨

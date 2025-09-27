# Prototype System Architecture

## Overview

The Prototype System is a powerful, extensible architecture that provides a "backdoor" for adding functionality to every object in the application. It's designed to be flexible, maintainable, and easily extensible.

## Core Concepts

### 1. Base Prototype
Every object in the system extends from `BasePrototype`, which provides:
- **Unique ID**: Each object has a unique identifier
- **Type System**: Objects are categorized by type
- **Position/Rotation/Scale**: Basic 3D transformation properties
- **Color & Texture**: Visual properties
- **Actions**: Dynamic functionality that can be added/removed
- **Properties**: Custom data storage
- **Metadata**: Additional information

### 2. Actions
Actions are the core of the extensibility system. They provide:
- **Dynamic Functionality**: Add/remove features at runtime
- **Context Support**: Actions can receive parameters
- **Conditional Execution**: Actions can have prerequisites
- **History Tracking**: Actions are logged for undo/redo
- **Categorization**: Actions are organized by type

### 3. Prototype Manager
Central registry for all prototypes:
- **Registration**: Add new prototypes
- **Retrieval**: Find prototypes by ID
- **Action Management**: Add/remove actions from prototypes
- **Property Updates**: Modify prototype properties
- **Action Execution**: Execute actions on prototypes

## Architecture

```
BasePrototype
├── GridCellPrototype (extends BasePrototype)
├── AnimatedGridCell (extends GridCellPrototype)
├── PhysicsGridCell (extends GridCellPrototype)
├── TexturedGridCell (extends GridCellPrototype)
└── Custom Prototypes...

Action System
├── Built-in Actions (paint, rotate, scale, etc.)
├── Custom Actions (user-defined)
├── Action Categories (visual, animation, interaction, etc.)
└── Action Factory (create new actions)

Texture System
├── Texture Manager
├── Procedural Textures
├── Image Textures
└── Texture Actions

Plugin System
├── Plugin Manager
├── Animation Plugin
├── Sound Plugin
└── Custom Plugins...
```

## Usage Examples

### 1. Basic Prototype Creation

```typescript
import { createGridCell } from '../types/PrototypeSystem';

// Create a basic grid cell
const cell = createGridCell({
  position: [0, 0, 0],
  color: '#FF6B6B',
  shape: 'square',
  size: 1
});
```

### 2. Adding Custom Actions

```typescript
import { createCustomAction } from '../types/PrototypeSystem';

// Create a custom action
const rainbowAction = createCustomAction(
  'rainbow',
  'Rainbow',
  'Cycle through rainbow colors',
  '🌈',
  (target, context) => {
    const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF'];
    const currentIndex = colors.indexOf(target.color);
    const nextIndex = (currentIndex + 1) % colors.length;
    target.color = colors[nextIndex];
  }
);

// Add to prototype
cell.addAction(rainbowAction);
```

### 3. Creating Custom Prototype Classes

```typescript
export class AnimatedGridCell extends GridCellPrototype {
  public animationSpeed: number = 1.0;
  public animationType: 'rotate' | 'scale' | 'bounce' = 'rotate';

  constructor(config: any = {}) {
    super(config);
    this.type = 'animated-grid-cell';
    this.addAnimationActions();
  }

  private addAnimationActions(): void {
    this.addAction(createCustomAction(
      'start-animation',
      'Start Animation',
      'Start the cell animation',
      '▶️',
      (target, context) => {
        (target as AnimatedGridCell).animationType = context?.type || 'rotate';
        console.log(`Started ${(target as AnimatedGridCell).animationType} animation`);
      }
    ));
  }
}
```

### 4. Using the Action Manager

```typescript
import { actionManager } from '../types/ActionSystem';

// Execute an action
actionManager.executeAction(cell.id, 'paint', { color: '#FF0000' });

// Undo last action
actionManager.undoLastAction();

// Get action history
const history = actionManager.getActionHistory();
```

### 5. Working with Textures

```typescript
import { textureManager } from '../types/TextureSystem';

// Create a procedural texture
const texture = textureManager.createProceduralTexture({
  type: 'noise',
  size: [256, 256],
  colors: ['#FF6B6B', '#4ECDC4'],
  parameters: { intensity: 0.5 }
});

// Apply texture to prototype
cell.setTexture(texture);
```

### 6. Plugin System

```typescript
import { pluginManager, animationPlugin } from '../types/PrototypeSystem';

// Register a plugin
pluginManager.registerPlugin(animationPlugin);

// Install plugin on a prototype
pluginManager.installPlugin('animation', cell);

// Uninstall plugin
pluginManager.uninstallPlugin('animation', cell);
```

## Built-in Actions

### Visual Actions
- **Paint**: Change object color
- **Rotate**: Rotate object
- **Scale**: Scale object
- **Move**: Move object
- **Glow**: Add glow effect
- **Shadow**: Toggle shadow

### Animation Actions
- **Pulse**: Make object pulse
- **Fade**: Fade object in/out

### Interaction Actions
- **Click**: Handle click events
- **Hover**: Handle hover events

### Utility Actions
- **Duplicate**: Create copy
- **Delete**: Remove object
- **Group**: Group objects
- **Ungroup**: Ungroup objects

### Physics Actions
- **Gravity**: Toggle gravity
- **Bounce**: Make object bouncy

## Extending the System

### 1. Create New Prototype Classes

```typescript
export class MyCustomPrototype extends BasePrototypeClass {
  constructor(config: any = {}) {
    super(config);
    this.type = 'my-custom';
    this.addCustomActions();
  }

  private addCustomActions(): void {
    // Add your custom actions here
  }
}
```

### 2. Create New Actions

```typescript
const myAction = createCustomAction(
  'my-action',
  'My Action',
  'Does something cool',
  '⭐',
  (target, context) => {
    // Your action logic here
  }
);
```

### 3. Create New Plugins

```typescript
export const myPlugin: PrototypePlugin = {
  name: 'my-plugin',
  version: '1.0.0',
  install: (prototype: BasePrototype) => {
    // Add functionality to prototype
  },
  uninstall: (prototype: BasePrototype) => {
    // Remove functionality from prototype
  }
};
```

## Benefits

1. **Extensibility**: Easy to add new functionality
2. **Maintainability**: Clean separation of concerns
3. **Reusability**: Actions can be shared across prototypes
4. **Flexibility**: Runtime modification of object behavior
5. **Debugging**: Action history and logging
6. **Modularity**: Plugin system for organized features
7. **Type Safety**: Full TypeScript support

## Integration with Texture Painter

The Texture Painter now uses the prototype system for:
- **Grid Cells**: Each cell is a `GridCellPrototype`
- **Actions**: Right-click context menu with actions
- **Textures**: Texture application through actions
- **Animation**: Future animation support
- **Physics**: Future physics simulation

## Future Enhancements

1. **Animation System**: Built-in animation support
2. **Physics Engine**: Real physics simulation
3. **Sound System**: Audio feedback for actions
4. **Network Sync**: Multi-user collaboration
5. **Scripting**: Custom script execution
6. **AI Integration**: Smart object behavior
7. **Performance Optimization**: Efficient action execution

## Conclusion

The Prototype System provides a powerful foundation for building extensible, maintainable applications. It's designed to grow with your needs while maintaining clean architecture and type safety. Whether you're adding simple visual effects or complex interactive behaviors, the system provides the tools you need to implement them cleanly and efficiently.

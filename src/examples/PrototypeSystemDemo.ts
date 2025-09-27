// Demo file showing how to extend the prototype system
import { 
  GridCellPrototype, 
  createGridCell, 
  prototypeManager,
  createCustomAction 
} from '../types/PrototypeSystem';
import { textureManager } from '../types/TextureSystem';
import { actionManager, ActionFactory } from '../types/ActionSystem';

// Example 1: Adding custom actions to existing prototypes
export const addCustomActions = () => {
  // Get all grid cell prototypes
  const prototypes = prototypeManager.getAllPrototypes();
  
  prototypes.forEach(prototype => {
    if (prototype.type === 'grid-cell') {
      // Add a custom "rainbow" action
      const rainbowAction = createCustomAction(
        'rainbow',
        'Rainbow',
        'Cycle through rainbow colors',
        '🌈',
        (target, context) => {
          const colors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
          const currentIndex = colors.indexOf(target.color);
          const nextIndex = (currentIndex + 1) % colors.length;
          target.color = colors[nextIndex];
        }
      );

      // Add a custom "pulse" action
      const pulseAction = createCustomAction(
        'pulse',
        'Pulse',
        'Make the cell pulse with animation',
        '💓',
        (target, context) => {
          // This would integrate with an animation system
          console.log(`Pulsing ${target.id} with intensity ${context?.intensity || 1.0}`);
          target.properties.pulse = { enabled: true, intensity: context?.intensity || 1.0 };
        }
      );

      // Add a custom "teleport" action
      const teleportAction = createCustomAction(
        'teleport',
        'Teleport',
        'Move to a random position',
        '🌀',
        (target, context) => {
          const gridSize = context?.gridSize || 10;
          target.position = [
            Math.floor(Math.random() * gridSize) - Math.floor(gridSize / 2),
            Math.floor(Math.random() * gridSize) - Math.floor(gridSize / 2),
            0
          ];
        }
      );

      // Add actions to the prototype
      prototype.addAction(rainbowAction);
      prototype.addAction(pulseAction);
      prototype.addAction(teleportAction);
    }
  });
};

// Example 2: Creating a custom prototype class
export class AnimatedGridCell extends GridCellPrototype {
  public animationSpeed: number = 1.0;
  public animationType: 'rotate' | 'scale' | 'bounce' | 'none' = 'none';

  constructor(config: any = {}) {
    super(config);
    this.type = 'animated-grid-cell';
    this.animationSpeed = config.animationSpeed || 1.0;
    this.animationType = config.animationType || 'none';
    
    // Add animation-specific actions
    this.addAnimationActions();
  }

  private addAnimationActions(): void {
    // Start animation action
    this.addAction(createCustomAction(
      'start-animation',
      'Start Animation',
      'Start the cell animation',
      '▶️',
      (target, context) => {
        (target as AnimatedGridCell).animationType = context?.type || 'rotate';
        (target as AnimatedGridCell).animationSpeed = context?.speed || 1.0;
        console.log(`Started ${(target as AnimatedGridCell).animationType} animation`);
      }
    ));

    // Stop animation action
    this.addAction(createCustomAction(
      'stop-animation',
      'Stop Animation',
      'Stop the cell animation',
      '⏹️',
      (target) => {
        (target as AnimatedGridCell).animationType = 'none';
        console.log('Stopped animation');
      }
    ));

    // Change animation speed
    this.addAction(createCustomAction(
      'change-speed',
      'Change Speed',
      'Change animation speed',
      '⚡',
      (target, context) => {
        const newSpeed = context?.speed || 1.0;
        (target as AnimatedGridCell).animationSpeed = Math.max(0.1, Math.min(5.0, newSpeed));
        console.log(`Animation speed changed to ${(target as AnimatedGridCell).animationSpeed}`);
      }
    ));
  }
}

// Example 3: Creating a physics-enabled prototype
export class PhysicsGridCell extends GridCellPrototype {
  public mass: number = 1.0;
  public velocity: [number, number, number] = [0, 0, 0];
  public acceleration: [number, number, number] = [0, 0, 0];
  public friction: number = 0.9;
  public bounce: number = 0.8;

  constructor(config: any = {}) {
    super(config);
    this.type = 'physics-grid-cell';
    this.mass = config.mass || 1.0;
    this.velocity = config.velocity || [0, 0, 0];
    this.acceleration = config.acceleration || [0, 0, 0];
    this.friction = config.friction || 0.9;
    this.bounce = config.bounce || 0.8;
    
    // Add physics actions
    this.addPhysicsActions();
  }

  private addPhysicsActions(): void {
    // Apply force action
    this.addAction(createCustomAction(
      'apply-force',
      'Apply Force',
      'Apply a force to the cell',
      '💨',
      (target, context) => {
        const force = context?.force || [0, 0, 0];
        const mass = (target as PhysicsGridCell).mass;
        (target as PhysicsGridCell).acceleration = [
          force[0] / mass,
          force[1] / mass,
          force[2] / mass
        ];
        console.log(`Applied force ${force} to ${target.id}`);
      }
    ));

    // Set velocity action
    this.addAction(createCustomAction(
      'set-velocity',
      'Set Velocity',
      'Set the cell velocity',
      '🏃',
      (target, context) => {
        const velocity = context?.velocity || [0, 0, 0];
        (target as PhysicsGridCell).velocity = velocity;
        console.log(`Set velocity ${velocity} for ${target.id}`);
      }
    ));

    // Bounce action
    this.addAction(createCustomAction(
      'bounce',
      'Bounce',
      'Make the cell bounce',
      '⚡',
      (target, context) => {
        const intensity = context?.intensity || 1.0;
        (target as PhysicsGridCell).velocity = [
          (target as PhysicsGridCell).velocity[0] * intensity,
          (target as PhysicsGridCell).velocity[1] * intensity,
          Math.abs((target as PhysicsGridCell).velocity[2]) * intensity
        ];
        console.log(`Bounced ${target.id} with intensity ${intensity}`);
      }
    ));
  }

  // Physics update method
  public updatePhysics(deltaTime: number): void {
    // Update velocity based on acceleration
    this.velocity = [
      this.velocity[0] + this.acceleration[0] * deltaTime,
      this.velocity[1] + this.acceleration[1] * deltaTime,
      this.velocity[2] + this.acceleration[2] * deltaTime
    ];

    // Apply friction
    this.velocity = [
      this.velocity[0] * this.friction,
      this.velocity[1] * this.friction,
      this.velocity[2] * this.friction
    ];

    // Update position based on velocity
    this.position = [
      this.position[0] + this.velocity[0] * deltaTime,
      this.position[1] + this.velocity[1] * deltaTime,
      this.position[2] + this.velocity[2] * deltaTime
    ];

    // Reset acceleration
    this.acceleration = [0, 0, 0];
  }
}

// Example 4: Creating a texture-enabled prototype
export class TexturedGridCell extends GridCellPrototype {
  public textureId?: string;
  public textureProperties: any = {};

  constructor(config: any = {}) {
    super(config);
    this.type = 'textured-grid-cell';
    this.textureId = config.textureId;
    this.textureProperties = config.textureProperties || {};
    
    // Add texture actions
    this.addTextureActions();
  }

  private addTextureActions(): void {
    // Apply texture action
    this.addAction(createCustomAction(
      'apply-texture',
      'Apply Texture',
      'Apply a texture to the cell',
      '🖼️',
      (target, context) => {
        const textureId = context?.textureId;
        if (textureId) {
          const texture = textureManager.getTexture(textureId);
          if (texture) {
            (target as TexturedGridCell).textureId = textureId;
            (target as TexturedGridCell).textureProperties = texture.properties;
            target.texture = texture.url;
            console.log(`Applied texture ${textureId} to ${target.id}`);
          }
        }
      }
    ));

    // Random texture action
    this.addAction(createCustomAction(
      'random-texture',
      'Random Texture',
      'Apply a random texture',
      '🎲',
      (target) => {
        const textures = textureManager.getAllTextures();
        if (textures.length > 0) {
          const randomTexture = textures[Math.floor(Math.random() * textures.length)];
          (target as TexturedGridCell).textureId = randomTexture.id;
          (target as TexturedGridCell).textureProperties = randomTexture.properties;
          target.texture = randomTexture.url;
          console.log(`Applied random texture ${randomTexture.id} to ${target.id}`);
        }
      }
    ));

    // Remove texture action
    this.addAction(createCustomAction(
      'remove-texture',
      'Remove Texture',
      'Remove texture from the cell',
      '🚫',
      (target) => {
        (target as TexturedGridCell).textureId = undefined;
        (target as TexturedGridCell).textureProperties = {};
        target.texture = undefined;
        console.log(`Removed texture from ${target.id}`);
      }
    ));
  }
}

// Example 5: Creating a group of prototypes
export class PrototypeGroup {
  public id: string;
  public name: string;
  public prototypes: BasePrototype[] = [];
  public groupActions: any[] = [];

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.addGroupActions();
  }

  public addPrototype(prototype: BasePrototype): void {
    this.prototypes.push(prototype);
  }

  public removePrototype(prototypeId: string): void {
    this.prototypes = this.prototypes.filter(p => p.id !== prototypeId);
  }

  private addGroupActions(): void {
    // Move all action
    this.groupActions.push(createCustomAction(
      'move-all',
      'Move All',
      'Move all prototypes in the group',
      '↔️',
      (target, context) => {
        const offset = context?.offset || [0, 0, 0];
        this.prototypes.forEach(prototype => {
          prototype.position = [
            prototype.position[0] + offset[0],
            prototype.position[1] + offset[1],
            prototype.position[2] + offset[2]
          ];
        });
        console.log(`Moved group ${this.name} by ${offset}`);
      }
    ));

    // Scale all action
    this.groupActions.push(createCustomAction(
      'scale-all',
      'Scale All',
      'Scale all prototypes in the group',
      '📏',
      (target, context) => {
        const factor = context?.factor || 1.1;
        this.prototypes.forEach(prototype => {
          prototype.scale = Math.max(0.1, Math.min(3, prototype.scale * factor));
        });
        console.log(`Scaled group ${this.name} by factor ${factor}`);
      }
    ));

    // Color all action
    this.groupActions.push(createCustomAction(
      'color-all',
      'Color All',
      'Change color of all prototypes in the group',
      '🎨',
      (target, context) => {
        const color = context?.color || '#ffffff';
        this.prototypes.forEach(prototype => {
          prototype.color = color;
        });
        console.log(`Colored group ${this.name} with ${color}`);
      }
    ));
  }

  public executeGroupAction(actionId: string, context?: any): void {
    const action = this.groupActions.find(a => a.id === actionId);
    if (action) {
      action.execute(this, context);
    }
  }
}

// Example 6: Creating a custom action that works across all prototypes
export const createGlobalAction = (id: string, name: string, description: string, icon: string, execute: (prototypes: BasePrototype[], context?: any) => void) => {
  return createCustomAction(
    id,
    name,
    description,
    icon,
    (target, context) => {
      const allPrototypes = prototypeManager.getAllPrototypes();
      execute(allPrototypes, context);
    }
  );
};

// Example usage of global actions
export const addGlobalActions = () => {
  // Reset all action
  const resetAllAction = createGlobalAction(
    'reset-all',
    'Reset All',
    'Reset all prototypes to default state',
    '🔄',
    (prototypes) => {
      prototypes.forEach(prototype => {
        prototype.color = '#2a2a2a';
        prototype.rotation = 0;
        prototype.scale = 1;
        prototype.position = [0, 0, 0];
      });
      console.log('Reset all prototypes');
    }
  );

  // Randomize all action
  const randomizeAllAction = createGlobalAction(
    'randomize-all',
    'Randomize All',
    'Randomize all prototype properties',
    '🎲',
    (prototypes) => {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
      prototypes.forEach(prototype => {
        prototype.color = colors[Math.floor(Math.random() * colors.length)];
        prototype.rotation = Math.random() * Math.PI * 2;
        prototype.scale = 0.5 + Math.random() * 1.5;
      });
      console.log('Randomized all prototypes');
    }
  );

  // Add to all prototypes
  prototypeManager.getAllPrototypes().forEach(prototype => {
    prototype.addAction(resetAllAction);
    prototype.addAction(randomizeAllAction);
  });
};

// Example 7: Creating a plugin system
export interface PrototypePlugin {
  name: string;
  version: string;
  install(prototype: BasePrototype): void;
  uninstall(prototype: BasePrototype): void;
}

export class PluginManager {
  private plugins: Map<string, PrototypePlugin> = new Map();

  public registerPlugin(plugin: PrototypePlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  public installPlugin(pluginName: string, prototype: BasePrototype): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.install(prototype);
    }
  }

  public uninstallPlugin(pluginName: string, prototype: BasePrototype): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      plugin.uninstall(prototype);
    }
  }
}

// Example plugin: Animation plugin
export const animationPlugin: PrototypePlugin = {
  name: 'animation',
  version: '1.0.0',
  install: (prototype: BasePrototype) => {
    prototype.addAction(createCustomAction(
      'animate',
      'Animate',
      'Start animation',
      '🎬',
      (target, context) => {
        console.log(`Starting animation for ${target.id}`);
        target.properties.animation = { enabled: true, type: context?.type || 'rotate' };
      }
    ));
  },
  uninstall: (prototype: BasePrototype) => {
    prototype.actions = prototype.actions.filter(action => action.id !== 'animate');
  }
};

// Example plugin: Sound plugin
export const soundPlugin: PrototypePlugin = {
  name: 'sound',
  version: '1.0.0',
  install: (prototype: BasePrototype) => {
    prototype.addAction(createCustomAction(
      'play-sound',
      'Play Sound',
      'Play a sound effect',
      '🔊',
      (target, context) => {
        const sound = context?.sound || 'click';
        console.log(`Playing sound ${sound} for ${target.id}`);
        // This would integrate with a sound system
      }
    ));
  },
  uninstall: (prototype: BasePrototype) => {
    prototype.actions = prototype.actions.filter(action => action.id !== 'play-sound');
  }
};

// Export the plugin manager
export const pluginManager = new PluginManager();
pluginManager.registerPlugin(animationPlugin);
pluginManager.registerPlugin(soundPlugin);

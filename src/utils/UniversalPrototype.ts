import * as THREE from "three";

// Simple universal prototype class that can be added to any 3D object
export class UniversalPrototype {
  public id: string;
  public type: string;
  public position: [number, number, number];
  public rotation: number;
  public scale: number;
  public color: string;
  public isVisible: boolean;
  public isInteractive: boolean;
  public properties: Record<string, any>;
  public actions: string[];

  constructor(
    id: string,
    type: string,
    position: [number, number, number] = [0, 0, 0],
    color: string = "#ffffff"
  ) {
    this.id = id;
    this.type = type;
    this.position = position;
    this.rotation = 0;
    this.scale = 1;
    this.color = color;
    this.isVisible = true;
    this.isInteractive = false;
    this.properties = {};
    this.actions = ["paint", "rotate", "scale", "move", "toggle-visibility"];
  }

  // Universal actions that work on any object
  paint(color: string) {
    this.color = color;
    this.updateVisuals();
  }

  rotate(angle?: number) {
    this.rotation = angle !== undefined ? angle : this.rotation + Math.PI / 4;
    this.updateVisuals();
  }

  setScale(factor: number) {
    this.scale = factor;
    this.updateVisuals();
  }

  move(position: [number, number, number]) {
    this.position = position;
    this.updateVisuals();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.updateVisuals();
  }

  glow(intensity: number = 1.5) {
    this.properties.glow = intensity;
    this.updateVisuals();
  }

  // Override this method in your 3D objects to update their visuals
  updateVisuals() {
    // This will be called by the 3D object to update its appearance
    console.log(`Updating visuals for ${this.id}:`, {
      color: this.color,
      rotation: this.rotation,
      scale: this.scale,
      position: this.position,
      isVisible: this.isVisible,
    });
  }

  // Serialize for saving
  serialize() {
    return {
      id: this.id,
      type: this.type,
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
      color: this.color,
      isVisible: this.isVisible,
      isInteractive: this.isInteractive,
      properties: this.properties,
      actions: this.actions,
    };
  }

  // Deserialize from saved data
  static deserialize(data: any): UniversalPrototype {
    const prototype = new UniversalPrototype(data.id, data.type, data.position, data.color);
    prototype.rotation = data.rotation;
    prototype.scale = data.scale;
    prototype.isVisible = data.isVisible;
    prototype.isInteractive = data.isInteractive;
    prototype.properties = data.properties || {};
    prototype.actions = data.actions || [];
    return prototype;
  }
}

// Global registry to keep track of all prototypes
export class PrototypeRegistry {
  private static prototypes: Map<string, UniversalPrototype> = new Map();

  static register(prototype: UniversalPrototype) {
    this.prototypes.set(prototype.id, prototype);
  }

  static get(id: string): UniversalPrototype | undefined {
    return this.prototypes.get(id);
  }

  static getAll(): UniversalPrototype[] {
    return Array.from(this.prototypes.values());
  }

  static remove(id: string) {
    this.prototypes.delete(id);
  }

  static clear() {
    this.prototypes.clear();
  }
}

// Hook for React components to use prototypes
export const useUniversalPrototype = (id: string, type: string, position: [number, number, number], color: string = "#ffffff") => {
  const [prototype, setPrototype] = React.useState<UniversalPrototype | null>(null);

  React.useEffect(() => {
    let existingPrototype = PrototypeRegistry.get(id);
    if (!existingPrototype) {
      existingPrototype = new UniversalPrototype(id, type, position, color);
      PrototypeRegistry.register(existingPrototype);
    }
    setPrototype(existingPrototype);
  }, [id, type, position, color]);

  return prototype;
};

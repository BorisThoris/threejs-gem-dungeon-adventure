import * as THREE from "three";
import { ConvexObjectBreaker } from "three/examples/jsm/misc/ConvexObjectBreaker.js";
import { ConvexGeometry } from "three/examples/jsm/geometries/ConvexGeometry.js";

// Global ConvexObjectBreaker instance (like Three.js example)
const convexBreaker = new ConvexObjectBreaker();

// Simple universal object prototype that every 3D object can use
export class ObjectPrototype {
  public id: string;
  public type: string;
  public position: [number, number, number];
  public rotation: number;
  public scale: number;
  public color: string;
  public isVisible: boolean;
  public isInteractive: boolean;
  public isBreakable: boolean;
  public isBroken: boolean;
  public breakThreshold: number;
  public currentDamage: number;
  public fractureImpulse: number; // Force required to break (like Three.js example)
  public mass: number; // Object mass for physics calculations
  public collided: boolean; // Prevent multiple breaks in one frame
  public properties: Record<string, unknown>;
  public actions: string[];
  
  // Three.js objects for breaking
  public threeMesh?: THREE.Mesh;
  public originalGeometry?: THREE.BufferGeometry;
  public originalMaterial?: THREE.Material;

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
    this.isBreakable = false;
    this.isBroken = false;
    this.breakThreshold = 100;
    this.currentDamage = 0;
    this.fractureImpulse = 250; // Default force threshold (like Three.js example)
    this.mass = this.calculateMass();
    this.collided = false;
    this.properties = {};
    this.actions = ["paint", "rotate", "scale", "move", "toggle-visibility", "glow", "damage", "break", "breakWithPhysics", "repair", "makeBreakable"];
  }

  // Set up Three.js mesh for breaking (like Three.js example)
  prepareForBreaking(mesh: THREE.Mesh, geometry?: THREE.BufferGeometry, material?: THREE.Material) {
    this.threeMesh = mesh;
    this.originalGeometry = geometry || mesh.geometry;
    this.originalMaterial = material || mesh.material;
    
    // Prepare the mesh for breaking using ConvexObjectBreaker
    if (this.originalGeometry && this.originalMaterial) {
      convexBreaker.prepareBreakableObject(
        mesh,
        this.mass,
        new THREE.Vector3(), // velocity
        new THREE.Vector3(), // angularVelocity
        true // enable breaking
      );
      console.log(`${this.id} prepared for breaking with ConvexObjectBreaker`);
    }
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

  // Break functionality with health scaling
  makeBreakable(threshold?: number) {
    this.isBreakable = true;
    
    // Calculate health based on object type and size
    const baseHealth = this.calculateHealth();
    this.breakThreshold = threshold || baseHealth;
    this.currentDamage = 0;
    this.isBroken = false;
    this.collided = false;
    
    // Set fracture impulse based on mass (like Three.js example)
    this.fractureImpulse = Math.max(50, this.mass * 0.5); // Minimum 50, scales with mass
    console.log(`${this.id} made breakable - Mass: ${this.mass}, Fracture Impulse: ${this.fractureImpulse}`);
    
    this.updateVisuals();
  }

  // Calculate health based on object type and size
  private calculateHealth(): number {
    // Demo mode: All objects have 1 health for instant breaking
    const demoHealth = 1;
    console.log(`${this.id} health: ${demoHealth} (DEMO MODE - instant break)`);
    return demoHealth;
  }

  // Calculate mass based on object type and scale (like Three.js example)
  private calculateMass(): number {
    const baseMass = this.getBaseMassForType();
    return baseMass * Math.pow(this.scale, 3); // Mass scales with volume
  }

  // Get base mass for different object types
  private getBaseMassForType(): number {
    switch (this.type.toLowerCase()) {
      case 'floor': return 1000;
      case 'wall': return 500;
      case 'stair': return 200;
      case 'table': return 100;
      case 'chair': return 50;
      case 'candle': return 10;
      case 'platform': return 300;
      case 'symbol': return 20;
      default: return 100;
    }
  }

  damage(amount: number) {
    if (!this.isBreakable || this.isBroken) return;
    
    this.currentDamage += amount;
    console.log(`${this.id} took ${amount} damage. Current damage: ${this.currentDamage}/${this.breakThreshold}`);
    
    if (this.currentDamage >= this.breakThreshold) {
      this.break();
    } else {
      // Don't change colors for breakable objects - keep original color
      // this.color = this.getDamageColor();
      this.updateVisuals();
    }
  }

  // Physics-based breaking (like Three.js example)
  breakWithPhysics(force: number = 1.0, direction: [number, number, number] = [0, 1, 0], impactPoint?: [number, number, number]) {
    if (!this.isBreakable || this.isBroken) return;
    
    console.log(`Breaking ${this.id} with physics force ${force} at impact point:`, impactPoint);
    
    // Set to broken state immediately
    this.isBroken = true;
    this.isVisible = false;
    this.currentDamage = this.breakThreshold;
    this.collided = true; // Prevent multiple breaks
    
    // Create debris pieces from impact point
    this.createDebris(force, direction, impactPoint);
    console.log(`${this.id} has been broken with physics!`);
    this.updateVisuals();
  }

  // Impact-based breaking with force threshold (like Three.js example)
  breakWithImpact(impulse: number, impactPoint: [number, number, number], impactNormal: [number, number, number]) {
    if (!this.isBreakable || this.isBroken || this.collided) return;
    
    console.log(`Impact on ${this.id}: Impulse ${impulse}, Required: ${this.fractureImpulse}`);
    
    // Check if impact force exceeds fracture threshold
    if (impulse > this.fractureImpulse) {
      console.log(`Impact force ${impulse} exceeds fracture threshold ${this.fractureImpulse} - BREAKING!`);
      
      this.isBroken = true;
      this.isVisible = false;
      this.currentDamage = this.breakThreshold;
      this.collided = true;
      
      // Create debris with impact direction
      this.createDebris(impulse / 100, impactNormal, impactPoint);
      console.log(`${this.id} broken by impact!`);
      this.updateVisuals();
      
      return true; // Object was broken
    } else {
      console.log(`Impact force ${impulse} too weak to break ${this.id}`);
      return false; // Object not broken
    }
  }

  // Dynamic breaking that creates new interactive fragments using ConvexObjectBreaker
  breakDynamically(impactPoint: [number, number, number], impactNormal: [number, number, number], fragmentCount: number = 4) {
    if (!this.isBreakable || this.isBroken || this.collided) return;
    
    console.log(`Dynamically breaking ${this.id} into ${fragmentCount} fragments using ConvexObjectBreaker`);
    
    // Use ConvexObjectBreaker to create real fragments (like Three.js example)
    if (this.threeMesh && this.originalGeometry && this.originalMaterial) {
      try {
        // Create debris using ConvexObjectBreaker
        const debris = convexBreaker.subdivideByImpact(
          this.threeMesh,
          new THREE.Vector3(...impactPoint),
          new THREE.Vector3(...impactNormal),
          1, // minSizeForFracture
          2, // maxSizeForFracture  
          1.5 // fractureImpulse
        );
        
        console.log(`ConvexObjectBreaker created ${debris.length} fragments for ${this.id}`);
        
        // Store the debris for rendering
        this.properties.breakingData = {
          impactPoint,
          impactNormal,
          fragmentCount,
          debris: debris,
          originalId: this.id,
          originalType: this.type,
          originalColor: this.color,
          originalScale: this.scale,
          timestamp: Date.now()
        };
        
        this.isBroken = true;
        this.isVisible = false;
        this.currentDamage = this.breakThreshold;
        this.collided = true;
        
        console.log(`${this.id} broken into ${debris.length} real fragments!`);
        this.updateVisuals();
        
        return true;
      } catch (error) {
        console.error(`Error breaking ${this.id} with ConvexObjectBreaker:`, error);
        // Fallback to simple breaking
        return this.breakWithPhysics(1.0, impactNormal, impactPoint);
      }
    } else {
      console.warn(`${this.id} not prepared for breaking - no Three.js mesh available`);
      // Fallback to simple breaking
      return this.breakWithPhysics(1.0, impactNormal, impactPoint);
    }
  }

  // Get debris from broken object (like Three.js example)
  getDebris(): THREE.Mesh[] {
    if (!this.isBroken || !this.properties.breakingData?.debris) {
      return [];
    }
    
    const debris = this.properties.breakingData.debris as THREE.Mesh[];
    console.log(`Getting ${debris.length} debris pieces from ${this.id}`);
    return debris;
  }

  // Create debris pieces when object breaks (enhanced like Three.js example)
  private createDebris(force: number, direction: [number, number, number], impactPoint?: [number, number, number]) {
    // More debris for larger objects
    const debrisCount = Math.floor(Math.random() * 8) + 4; // 4-11 pieces
    const debrisPieces: any[] = [];
    
    // Use impact point if provided, otherwise use object center
    const centerPoint = impactPoint || this.position;
    
    // Calculate impact direction vector
    const impactDir = new THREE.Vector3(direction[0], direction[1], direction[2]).normalize();
    
    for (let i = 0; i < debrisCount; i++) {
      // Create debris in a more realistic pattern
      const angle = (i / debrisCount) * Math.PI * 2;
      const radius = Math.random() * 2 + 0.5;
      const height = (Math.random() - 0.5) * 3;
      
      // Position debris around impact point
      const piecePosition = [
        centerPoint[0] + Math.cos(angle) * radius,
        centerPoint[1] + height,
        centerPoint[2] + Math.sin(angle) * radius
      ] as [number, number, number];
      
      // Calculate velocity based on impact direction and debris position
      const pieceDir = new THREE.Vector3(
        piecePosition[0] - centerPoint[0],
        piecePosition[1] - centerPoint[1],
        piecePosition[2] - centerPoint[2]
      ).normalize();
      
      // Add impact direction influence
      const velocityMultiplier = force * (0.5 + Math.random() * 0.5);
      const impactInfluence = impactDir.clone().multiplyScalar(velocityMultiplier * 0.3);
      const radialVelocity = pieceDir.clone().multiplyScalar(velocityMultiplier * 0.7);
      
      const finalVelocity = radialVelocity.add(impactInfluence);
      
      const piece = {
        id: `${this.id}_debris_${i}`,
        position: piecePosition,
        velocity: [
          finalVelocity.x + (Math.random() - 0.5) * force * 2,
          finalVelocity.y + Math.random() * force * 3 + 2, // Always some upward velocity
          finalVelocity.z + (Math.random() - 0.5) * force * 2
        ] as [number, number, number],
        rotation: [
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ] as [number, number, number],
        color: this.color,
        size: Math.random() * 0.8 + 0.3, // Larger debris pieces
        lifetime: 4000 + Math.random() * 3000 // 4-7 seconds
      };
      
      debrisPieces.push(piece);
    }
    
    // Store debris for rendering
    this.properties.debris = debrisPieces;
    this.properties.debrisCreated = Date.now();
    console.log(`Created ${debrisCount} debris pieces for ${this.id}`);
  }

  // Get debris pieces for rendering
  getDebris() {
    const debris = this.properties.debris as any[];
    const created = this.properties.debrisCreated as number;
    const now = Date.now();
    
    if (!debris || !created) return [];
    
    // Remove expired debris
    const aliveDebris = debris.filter(piece => 
      (now - created) < piece.lifetime
    );
    
    this.properties.debris = aliveDebris;
    return aliveDebris;
  }

  break() {
    if (!this.isBreakable) return;
    
    this.isBroken = true;
    this.isVisible = false;
    this.currentDamage = this.breakThreshold;
    console.log(`${this.id} has been broken!`);
    this.updateVisuals();
  }

  repair() {
    if (!this.isBreakable) return;
    
    this.isBroken = false;
    this.isVisible = true;
    this.currentDamage = 0;
    this.color = this.getOriginalColor();
    console.log(`${this.id} has been repaired!`);
    this.updateVisuals();
  }

  private getDamageColor(): string {
    const damagePercent = this.currentDamage / this.breakThreshold;
    if (damagePercent < 0.3) return this.color;
    if (damagePercent < 0.6) return "#ffaa00"; // Orange
    if (damagePercent < 0.9) return "#ff6600"; // Red-orange
    return "#ff0000"; // Red
  }

  private getOriginalColor(): string {
    // Store original color in properties
    return (this.properties.originalColor as string) || this.color;
  }

  setOriginalColor(color: string) {
    this.properties.originalColor = color;
    this.color = color;
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
      isBroken: this.isBroken,
    });
    
    // Force a visual update by triggering the prototype system
    if (this.isBroken) {
      console.log(`${this.id} is now broken and should be invisible!`);
    }
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
      isBreakable: this.isBreakable,
      isBroken: this.isBroken,
      breakThreshold: this.breakThreshold,
      currentDamage: this.currentDamage,
      properties: this.properties,
      actions: this.actions,
    };
  }

  // Deserialize from saved data
  static deserialize(data: any): ObjectPrototype {
    const prototype = new ObjectPrototype(data.id, data.type, data.position, data.color);
    prototype.rotation = data.rotation;
    prototype.scale = data.scale;
    prototype.isVisible = data.isVisible;
    prototype.isInteractive = data.isInteractive;
    prototype.isBreakable = data.isBreakable || false;
    prototype.isBroken = data.isBroken || false;
    prototype.breakThreshold = data.breakThreshold || 100;
    prototype.currentDamage = data.currentDamage || 0;
    prototype.properties = data.properties || {};
    prototype.actions = data.actions || [];
    return prototype;
  }
}

// Global registry to keep track of all prototypes
export class PrototypeRegistry {
  private static prototypes: Map<string, ObjectPrototype> = new Map();

  static register(prototype: ObjectPrototype) {
    this.prototypes.set(prototype.id, prototype);
  }

  static get(id: string): ObjectPrototype | undefined {
    return this.prototypes.get(id);
  }

  static getAll(): ObjectPrototype[] {
    return Array.from(this.prototypes.values());
  }

  static remove(id: string) {
    this.prototypes.delete(id);
  }

  static clear() {
    this.prototypes.clear();
  }
}

// Simple hook for React components to use prototypes
export const useObjectPrototype = (id: string, type: string, position: [number, number, number], color: string = "#ffffff") => {
  const [prototype, setPrototype] = React.useState<ObjectPrototype | null>(null);

  React.useEffect(() => {
    let existingPrototype = PrototypeRegistry.get(id);
    if (!existingPrototype) {
      existingPrototype = new ObjectPrototype(id, type, position, color);
      PrototypeRegistry.register(existingPrototype);
    }
    setPrototype(existingPrototype);
  }, [id, type, position, color]);

  return prototype;
};

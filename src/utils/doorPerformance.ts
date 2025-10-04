import * as THREE from 'three';
import type { DoorProps } from '../components/Door';

export interface DoorCullingOptions {
  renderDistance: number;
  lodDistances: number[];
  enableFrustumCulling: boolean;
  enableOcclusionCulling: boolean;
}

export interface DoorLOD {
  level: number;
  distance: number;
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

/**
 * Door culling system for performance optimization
 */
export class DoorCullingSystem {
  private camera: THREE.Camera;
  private frustum: THREE.Frustum;
  private options: DoorCullingOptions;
  
  constructor(camera: THREE.Camera, options: Partial<DoorCullingOptions> = {}) {
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.options = {
      renderDistance: 50,
      lodDistances: [10, 25, 50],
      enableFrustumCulling: true,
      enableOcclusionCulling: false,
      ...options
    };
  }
  
  /**
   * Update camera and frustum
   */
  updateCamera(camera: THREE.Camera) {
    this.camera = camera;
    this.frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
  }
  
  /**
   * Check if door should be rendered based on distance and frustum
   */
  shouldRenderDoor(
    doorPosition: [number, number, number],
    playerPosition: THREE.Vector3
  ): boolean {
    const doorPos = new THREE.Vector3(...doorPosition);
    const distance = playerPosition.distanceTo(doorPos);
    
    // Distance culling
    if (distance > this.options.renderDistance) {
      return false;
    }
    
    // Frustum culling
    if (this.options.enableFrustumCulling) {
      const doorBox = new THREE.Box3().setFromCenterAndSize(
        doorPos,
        new THREE.Vector3(2, 3, 0.2)
      );
      
      if (!this.frustum.intersectsBox(doorBox)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get LOD level for door based on distance
   */
  getLODLevel(doorPosition: [number, number, number], playerPosition: THREE.Vector3): number {
    const doorPos = new THREE.Vector3(...doorPosition);
    const distance = playerPosition.distanceTo(doorPos);
    
    for (let i = 0; i < this.options.lodDistances.length; i++) {
      if (distance <= this.options.lodDistances[i]) {
        return i;
      }
    }
    
    return this.options.lodDistances.length; // Lowest LOD
  }
}

/**
 * Door preloader for assets
 */
export class DoorPreloader {
  private loadedAssets: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  
  /**
   * Preload door assets
   */
  async preloadDoorAssets(doorTypes: string[]): Promise<void> {
    const loadPromises = doorTypes.map(type => this.loadDoorAssets(type));
    await Promise.all(loadPromises);
  }
  
  /**
   * Load assets for specific door type
   */
  private async loadDoorAssets(doorType: string): Promise<void> {
    if (this.loadedAssets.has(doorType)) {
      return;
    }
    
    if (this.loadingPromises.has(doorType)) {
      return this.loadingPromises.get(doorType);
    }
    
    const loadPromise = this.loadAssetsForType(doorType);
    this.loadingPromises.set(doorType, loadPromise);
    
    try {
      const assets = await loadPromise;
      this.loadedAssets.set(doorType, assets);
      this.loadingPromises.delete(doorType);
    } catch (error) {
      this.loadingPromises.delete(doorType);
      throw error;
    }
  }
  
  /**
   * Load specific assets for door type
   */
  private async loadAssetsForType(doorType: string): Promise<any> {
    // Simulate asset loading
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          geometry: new THREE.BoxGeometry(2, 3, 0.2),
          materials: {
            standard: new THREE.MeshStandardMaterial({ color: '#8B4513' }),
            locked: new THREE.MeshStandardMaterial({ color: '#B22222' }),
            secret: new THREE.MeshStandardMaterial({ 
              color: '#00FFFF',
              metalness: 0.9,
              roughness: 0.1
            })
          }
        });
      }, 100);
    });
  }
  
  /**
   * Get loaded assets for door type
   */
  getAssets(doorType: string): any {
    return this.loadedAssets.get(doorType);
  }
  
  /**
   * Check if assets are loaded
   */
  isLoaded(doorType: string): boolean {
    return this.loadedAssets.has(doorType);
  }
}

/**
 * Door batch renderer for performance
 */
export class DoorBatchRenderer {
  private instancedMeshes: Map<string, THREE.InstancedMesh> = new Map();
  private doorData: Map<string, any> = new Map();
  
  /**
   * Add door to batch
   */
  addDoor(doorId: string, doorProps: DoorProps): void {
    this.doorData.set(doorId, doorProps);
    this.updateInstancedMesh();
  }
  
  /**
   * Remove door from batch
   */
  removeDoor(doorId: string): void {
    this.doorData.delete(doorId);
    this.updateInstancedMesh();
  }
  
  /**
   * Update instanced mesh
   */
  private updateInstancedMesh(): void {
    const doorCount = this.doorData.size;
    if (doorCount === 0) return;
    
    const geometry = new THREE.BoxGeometry(2, 3, 0.2);
    const material = new THREE.MeshStandardMaterial({ color: '#8B4513' });
    
    const instancedMesh = new THREE.InstancedMesh(geometry, material, doorCount);
    
    let index = 0;
    this.doorData.forEach((doorProps, doorId) => {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(...doorProps.position);
      matrix.makeRotationFromEuler(new THREE.Euler(...doorProps.rotation));
      instancedMesh.setMatrixAt(index, matrix);
      index++;
    });
    
    instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMeshes.set('doors', instancedMesh);
  }
  
  /**
   * Get instanced meshes for rendering
   */
  getInstancedMeshes(): THREE.InstancedMesh[] {
    return Array.from(this.instancedMeshes.values());
  }
  
  /**
   * Clear all doors
   */
  clear(): void {
    this.doorData.clear();
    this.instancedMeshes.clear();
  }
}

/**
 * Performance monitoring for doors
 */
export class DoorPerformanceMonitor {
  private renderTimes: number[] = [];
  private doorCounts: number[] = [];
  private maxSamples = 100;
  
  /**
   * Record render performance
   */
  recordRender(doorCount: number, renderTime: number): void {
    this.doorCounts.push(doorCount);
    this.renderTimes.push(renderTime);
    
    if (this.doorCounts.length > this.maxSamples) {
      this.doorCounts.shift();
      this.renderTimes.shift();
    }
  }
  
  /**
   * Get performance stats
   */
  getStats(): {
    averageRenderTime: number;
    averageDoorCount: number;
    fps: number;
    performance: 'excellent' | 'good' | 'fair' | 'poor';
  } {
    const avgRenderTime = this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length;
    const avgDoorCount = this.doorCounts.reduce((a, b) => a + b, 0) / this.doorCounts.length;
    const fps = avgRenderTime > 0 ? 1000 / avgRenderTime : 0;
    
    let performance: 'excellent' | 'good' | 'fair' | 'poor';
    if (fps >= 60) performance = 'excellent';
    else if (fps >= 45) performance = 'good';
    else if (fps >= 30) performance = 'fair';
    else performance = 'poor';
    
    return {
      averageRenderTime: avgRenderTime,
      averageDoorCount: avgDoorCount,
      fps,
      performance
    };
  }
  
  /**
   * Reset stats
   */
  reset(): void {
    this.renderTimes = [];
    this.doorCounts = [];
  }
}

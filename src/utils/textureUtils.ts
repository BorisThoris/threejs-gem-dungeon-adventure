import { Texture, TextureLoader, RepeatWrapping, CanvasTexture } from 'three';

export interface TextureDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  width: number;
  height: number;
  pixels: string[];
}

// Load texture from image file
export const loadTextureFromImage = (textureId: string): Promise<Texture> => {
  return new Promise((resolve, reject) => {
    const loader = new TextureLoader();
    const texturePath = `/textures/${textureId}.png`;
    
    loader.load(
      texturePath,
      (texture) => {
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      (error) => {
        console.error(`Failed to load texture ${textureId}:`, error);
        reject(error);
      }
    );
  });
};

// Convert pixel array to canvas texture (fallback)
export const createTextureFromPixels = (textureDef: TextureDefinition): Texture => {
  const canvas = document.createElement('canvas');
  canvas.width = textureDef.width;
  canvas.height = textureDef.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  
  const imageData = ctx.createImageData(textureDef.width, textureDef.height);
  
  for (let i = 0; i < textureDef.pixels.length; i++) {
    const pixelIndex = i * 4;
    const color = textureDef.pixels[i];
    
    // Convert hex color to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    imageData.data[pixelIndex] = r;     // Red
    imageData.data[pixelIndex + 1] = g; // Green
    imageData.data[pixelIndex + 2] = b; // Blue
    imageData.data[pixelIndex + 3] = 255; // Alpha
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  const texture = new CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.needsUpdate = true;
  
  return texture;
};

// Get texture by ID from definitions
export const getTextureById = (textureId: string, definitions: TextureDefinition[]): TextureDefinition | null => {
  return definitions.find(def => def.id === textureId) || null;
};

// Create material with texture
export const createTexturedMaterial = (
  textureDef: TextureDefinition,
  baseColor: string = '#ffffff',
  roughness: number = 0.5,
  metalness: number = 0.0
) => {
  const texture = createTextureFromPixels(textureDef);
  
  return {
    map: texture,
    color: baseColor,
    roughness,
    metalness,
  };
};

// Predefined texture mappings for building blocks
export const BUILDING_BLOCK_TEXTURES = {
  // Brick textures
  brick_standard: 'brick_standard',
  brick_weathered: 'brick_weathered',
  brick_ancient: 'brick_ancient',
  brick_modern: 'brick_modern',
  
  // Stone textures
  stone_cobblestone: 'cobblestone',
  stone_marble: 'marble',
  stone_granite: 'granite',
  stone_limestone: 'limestone',
  stone_sandstone: 'sandstone',
  
  // Wood textures
  wood_oak: 'wood',
  wood_pine: 'wood_pine',
  wood_mahogany: 'wood_mahogany',
  wood_cedar: 'wood_cedar',
  wood_birch: 'wood_birch',
  
  // Metal textures
  metal_iron: 'metal_iron',
  metal_steel: 'metal_steel',
  metal_copper: 'metal_copper',
  metal_bronze: 'metal_bronze',
  metal_gold: 'metal_gold',
  
  // Concrete textures
  concrete_standard: 'concrete_standard',
  concrete_reinforced: 'concrete_reinforced',
  concrete_precast: 'concrete_precast',
  concrete_exposed: 'concrete_exposed',
  concrete_polished: 'concrete_polished',
  
  // Glass textures
  glass_clear: 'glass',
  glass_tinted: 'glass_tinted',
  glass_frosted: 'glass_frosted',
  glass_stained: 'glass_stained',
  glass_safety: 'glass_safety',
} as const;

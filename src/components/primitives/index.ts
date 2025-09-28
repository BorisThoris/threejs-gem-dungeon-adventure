// Export all primitives organized by category
export * as Rooms from './rooms';
export * as Objects from './objects';
export * as Elements from './elements';

// Re-export commonly used components for convenience
export { StartRoom, CoffeeRoom, MeditationRoom } from './rooms';
export { ItemSprite, DestructibleWall, ParticleSystem } from './objects';
export { Tile, Wall, Ceiling, Plank, Stair, Handrail } from './elements';
export { Torch, Barrel, Chest, Brick, Stone, WoodPlank } from './elements';

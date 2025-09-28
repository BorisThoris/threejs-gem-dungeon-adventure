// Export all primitives organized by category
export * as Rooms from './rooms';
export * as Elements from './elements';

// Re-export commonly used components for convenience
export { StartRoom, CoffeeRoom, MeditationRoom } from './rooms';
export { Tile, Wall, Ceiling, Plank, Stair, Handrail } from './elements';
export { Torch, Candle, Barrel, Chest, Table, Chair, Bookshelf } from './elements';

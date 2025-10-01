// Test utility for biome categories
import { getWeightedBiomes, getAllBiomes, BIOME_CATEGORIES } from '../types/biomeCategories';

export const testBiomeCategories = () => {
  console.log('🧪 Testing Biome Category System');
  
  // Test 1: Get all biomes
  const allBiomes = getAllBiomes();
  console.log(`✅ Total biomes available: ${allBiomes.length}`);
  console.log('📋 All biomes:', allBiomes);
  
  // Test 2: Get biomes from specific categories
  const combatBiomes = getWeightedBiomes(['combat']);
  console.log(`⚔️ Combat biomes: ${combatBiomes.length}`);
  console.log('Combat biomes:', combatBiomes.map(b => b.biome));
  
  // Test 3: Get biomes from multiple categories
  const buffAndResource = getWeightedBiomes(['buff', 'resource']);
  console.log(`💪💰 Buff + Resource biomes: ${buffAndResource.length}`);
  console.log('Buff + Resource biomes:', buffAndResource.map(b => b.biome));
  
  // Test 4: Test with no categories (should return all)
  const allWeighted = getWeightedBiomes([]);
  console.log(`🌍 All weighted biomes: ${allWeighted.length}`);
  
  // Test 5: Test with invalid categories
  const invalidCategories = getWeightedBiomes(['invalid1', 'invalid2']);
  console.log(`❌ Invalid categories result: ${invalidCategories.length}`);
  
  // Test 6: Show category information
  console.log('\n📊 Category Information:');
  BIOME_CATEGORIES.forEach(category => {
    console.log(`${category.icon} ${category.name}: ${category.biomes.length} biomes (weight: ${category.weight})`);
  });
  
  console.log('\n✅ Biome category system test completed!');
};

// Export for use in development
export default testBiomeCategories;

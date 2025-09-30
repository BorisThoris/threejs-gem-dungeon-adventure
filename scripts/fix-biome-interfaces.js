const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Biome interface mappings
const interfaceMappings = {
  'CryptContentProps': 'CryptBiomeProps',
  'TrapContentProps': 'TrapBiomeProps',
  'LibraryUpgradeContentProps': 'LibraryUpgradeBiomeProps',
  'ChallengeContentProps': 'ChallengeBiomeProps',
  'SpecialContentProps': 'SpecialBiomeProps',
  'EndContentProps': 'EndBiomeProps',
  'EnemyContentProps': 'EnemyBiomeProps',
  'ArenaContentProps': 'ArenaBiomeProps',
  'PortalContentProps': 'PortalBiomeProps',
  'CoffeeContentProps': 'CoffeeBiomeProps',
  'BossContentProps': 'BossBiomeProps',
  'PuzzleContentProps': 'PuzzleBiomeProps',
  'ShopContentProps': 'ShopBiomeProps',
  'TreasureContentProps': 'TreasureBiomeProps'
};

console.log('🔧 Fixing biome interface names...\n');

// Find all biome files
const biomeFiles = glob.sync('src/components/primitives/game-rooms/*Biome.tsx');

biomeFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Update interface names
    Object.entries(interfaceMappings).forEach(([oldInterface, newInterface]) => {
      const pattern = new RegExp(`\\b${oldInterface}\\b`, 'g');
      if (pattern.test(content)) {
        content = content.replace(pattern, newInterface);
        hasChanges = true;
        console.log(`✅ ${path.basename(filePath)}: ${oldInterface} → ${newInterface}`);
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
    } else {
      console.log(`⚪ ${path.basename(filePath)}: No changes needed`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Biome interface fixes complete!');

import { promises as fs } from 'fs';

async function targetedFix() {
  try {
    console.log('🔍 Reading items file...');
    const itemsData = await fs.readFile('./public/osrs_items.json', 'utf8');
    const items = JSON.parse(itemsData);
    
    console.log(`📦 Found ${items.length} items`);
    
    // Find and fix specific items
    const itemsToFix = [
      { name: "Amethyst arrow", price: 150 },
      { name: "Bandos tassets", price: 28000000 },
      { name: "Dragon dagger", price: 17000 },
      { name: "Lockpick", price: 50 },
      { name: "Runite bar", price: 12000 },
      { name: "Runite ore", price: 11000 }
    ];
    
    let updatedCount = 0;
    
    const updatedItems = items.map((item, index) => {
      const itemToFix = itemsToFix.find(fix => fix.name === item.name);
      
      if (itemToFix) {
        console.log(`📍 Found ${item.name} at index ${index}`);
        console.log(`   Current price: ${item.current_price}`);
        
        if (item.current_price === 0 || item.current_price !== itemToFix.price) {
          console.log(`💰 Updating ${item.name}: ${item.current_price} → ${itemToFix.price} GP`);
          updatedCount++;
          return {
            ...item,
            current_price: itemToFix.price,
            high_price: itemToFix.price,
            low_price: Math.floor(itemToFix.price * 0.95),
            last_updated: new Date().toISOString()
          };
        } else {
          console.log(`✅ ${item.name} already has correct price: ${item.current_price}`);
        }
      }
      
      return item;
    });
    
    console.log(`\n🔧 Updated ${updatedCount} items`);
    
    if (updatedCount > 0) {
      await fs.writeFile('./public/osrs_items.json', JSON.stringify(updatedItems, null, 2));
      console.log('📝 Items file updated successfully!');
    }
    
    // Create/update metadata
    const itemsWithPrices = updatedItems.filter(item => item.current_price > 0).length;
    const metadata = {
      last_updated: new Date().toISOString(),
      total_items: updatedItems.length,
      items_with_prices: itemsWithPrices,
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    await fs.writeFile('./public/osrs_items_metadata.json', JSON.stringify(metadata, null, 2));
    console.log('📊 Metadata file updated!');
    
    // Final verification
    console.log('\n🔍 Final Verification:');
    itemsToFix.forEach(itemToFix => {
      const item = updatedItems.find(i => i.name === itemToFix.name);
      if (item) {
        console.log(`✅ ${item.name}: ${item.current_price.toLocaleString()} GP`);
      } else {
        console.log(`❌ ${itemToFix.name}: NOT FOUND`);
      }
    });
    
    console.log('\n🎉 Fix completed! Refresh your browser to see changes.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

targetedFix(); 
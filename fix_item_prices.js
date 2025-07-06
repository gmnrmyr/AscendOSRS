import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ITEMS_FILE = path.join(__dirname, 'public', 'osrs_items.json');
const METADATA_FILE = path.join(__dirname, 'public', 'osrs_items_metadata.json');

// Comprehensive fallback prices for common items
const FALLBACK_PRICES = {
  // Bars and Ores
  "Runite bar": 12000,
  "Runite ore": 11000,
  "Adamantite bar": 2000,
  "Adamantite ore": 1000,
  "Mithril bar": 400,
  "Mithril ore": 200,
  "Steel bar": 100,
  "Iron bar": 50,
  "Iron ore": 100,
  "Coal": 200,
  "Gold ore": 100,
  "Silver ore": 50,
  "Bronze bar": 20,
  "Copper ore": 10,
  "Tin ore": 10,

  // Logs and Wood
  "Logs": 50,
  "Oak logs": 100,
  "Willow logs": 50,
  "Maple logs": 100,
  "Yew logs": 400,
  "Magic logs": 1200,
  "Teak logs": 80,
  "Mahogany logs": 200,

  // Fish
  "Shark": 800,
  "Lobster": 200,
  "Swordfish": 300,
  "Monkfish": 400,
  "Tuna": 150,
  "Salmon": 100,
  "Trout": 100,
  "Sardine": 50,
  "Anchovies": 50,

  // Potions
  "Prayer potion(4)": 12000,
  "Super combat potion(4)": 15000,
  "Ranging potion(4)": 8000,
  "Magic potion(4)": 1200,
  "Super restore(4)": 10000,
  "Saradomin brew(4)": 8000,
  "Antifire potion(4)": 3000,
  "Super antifire potion(4)": 8000,
  "Super strength(4)": 3000,
  "Super attack(4)": 2000,
  "Super defence(4)": 2000,

  // Weapons
  "Abyssal whip": 1800000,
  "Dragon scimitar": 60000,
  "Rune scimitar": 15000,
  "Dragon dagger": 17000,
  "Dragon longsword": 60000,
  "Dragon mace": 50000,
  "Dragon battleaxe": 120000,
  "Dragon warhammer": 20000000,
  "Dragon claws": 180000000,
  "Dragon hunter crossbow": 120000000,
  "Blowpipe": 3000000,
  "Twisted bow": 1200000000,
  "Scythe of vitur": 800000000,

  // Armor
  "Dragon boots": 180000,
  "Dragon full helm": 2000000,
  "Dragon platebody": 5000000,
  "Dragon platelegs": 2000000,
  "Dragon plateskirt": 2000000,
  "Dragon chainbody": 1000000,
  "Dragon med helm": 500000,
  "Dragon sq shield": 2000000,
  "Dragon kiteshield": 3000000,
  "Dragon defender": 0, // Untradeable
  "Barrows gloves": 130000,
  "Fire cape": 0, // Untradeable
  "Infernal cape": 0, // Untradeable
  "Void knight armour": 0, // Untradeable

  // Boots
  "Ranger boots": 30000000,
  "Primordial boots": 32000000,
  "Pegasian boots": 38000000,
  "Eternal boots": 5000000,

  // Rings
  "Berserker ring (i)": 8000000,
  "Archer ring (i)": 8000000,
  "Seers ring (i)": 8000000,
  "Warrior ring (i)": 8000000,

  // Amulets and Necklaces
  "Amulet of fury": 2000000,
  "Amulet of torture": 15000000,
  "Necklace of anguish": 12000000,
  "Occult necklace": 800000,

  // Gems and Materials
  "Zenyte shard": 15000000,
  "Onyx": 3000000,
  "Dragonstone": 12000,
  "Diamond": 1800,
  "Ruby": 900,
  "Emerald": 400,
  "Sapphire": 200,
  "Rune essence": 5,
  "Pure essence": 2,

  // High-Value Items
  "Avernic defender": 150000000,
  "Bandos chestplate": 25000000,
  "Bandos tassets": 28000000,
  "Armadyl chestplate": 35000000,
  "Armadyl chainskirt": 30000000,
  "Prayer scroll (rigour)": 45000000,
  "Prayer scroll (augury)": 25000000,
  "Old school bond": 5000000,

  // Currency
  "Platinum token": 1000,
  "Coins": 1,

  // Arrows and Ammunition
  "Amethyst arrow": 150,
  "Rune arrow": 100,
  "Adamant arrow": 50,
  "Mithril arrow": 30,
  "Steel arrow": 20,
  "Iron arrow": 10,
  "Bronze arrow": 5,

  // Runes
  "Blood rune": 400,
  "Death rune": 200,
  "Chaos rune": 100,
  "Nature rune": 200,
  "Law rune": 200,
  "Cosmic rune": 150,
  "Astral rune": 100,
  "Soul rune": 300,
  "Wrath rune": 500,

  // Herbs
  "Grimy ranarr weed": 8000,
  "Grimy snapdragon": 7000,
  "Grimy toadflax": 3000,
  "Grimy kwuarm": 4000,
  "Grimy cadantine": 5000,
  "Grimy lantadyme": 6000,
  "Grimy dwarf weed": 4000,
  "Grimy torstol": 8000,

  // Seeds
  "Ranarr seed": 30000,
  "Snapdragon seed": 40000,
  "Toadflax seed": 800,
  "Kwuarm seed": 2000,
  "Cadantine seed": 10000,
  "Lantadyme seed": 800,
  "Dwarf weed seed": 800,
  "Torstol seed": 80000,

  // Other Common Items
  "Black mask": 900000,
  "Rune pouch": 1200000,
  "Dragon hunter lance": 80000000,
  "Ghrazi rapier": 150000000,
  "Sanguinesti staff": 200000000,
  "Masori mask (f)": 80000000,
  "Masori body (f)": 120000000,
  "Masori chaps (f)": 80000000,
  "Virtus mask": 50000000,
  "Virtus robe top": 80000000,
  "Virtus robe legs": 60000000,
  "Justiciar faceguard": 40000000,
  "Justiciar chestguard": 60000000,
  "Justiciar legguards": 40000000
};

async function fixItemPrices() {
  try {
    console.log('Reading items file...');
    const itemsData = await fs.readFile(ITEMS_FILE, 'utf8');
    const items = JSON.parse(itemsData);
    
    console.log(`Found ${items.length} items`);
    
    let updatedCount = 0;
    let totalWithPrices = 0;
    
    // Update items with fallback prices where current_price is 0
    const updatedItems = items.map(item => {
      if (item.current_price === 0 && FALLBACK_PRICES[item.name]) {
        console.log(`Fixing price for ${item.name}: ${FALLBACK_PRICES[item.name]}`);
        updatedCount++;
        return {
          ...item,
          current_price: FALLBACK_PRICES[item.name],
          high_price: FALLBACK_PRICES[item.name],
          low_price: FALLBACK_PRICES[item.name]
        };
      }
      
      if (item.current_price > 0) {
        totalWithPrices++;
      }
      
      return item;
    });
    
    // Create metadata
    const itemsWithPrices = updatedItems.filter(item => item.current_price > 0).length;
    const metadata = {
      last_updated: new Date().toISOString(),
      total_items: updatedItems.length,
      items_with_prices: itemsWithPrices,
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('Writing updated files...');
    await Promise.all([
      fs.writeFile(ITEMS_FILE, JSON.stringify(updatedItems, null, 2)),
      fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
    ]);
    
    console.log(`Updated ${updatedCount} items with fallback prices`);
    console.log(`Total items with prices: ${itemsWithPrices}`);
    console.log('Files updated successfully!');
    
    // Show some examples of fixed items
    const fixedItems = updatedItems.filter(item => 
      item.current_price > 0 && 
      (item.name.includes('Runite') || item.name.includes('Amethyst') || item.name.includes('Shark'))
    ).slice(0, 10);
    
    console.log('\nExamples of items with prices:');
    fixedItems.forEach(item => {
      console.log(`- ${item.name}: ${item.current_price.toLocaleString()} GP`);
    });
    
  } catch (error) {
    console.error('Error fixing item prices:', error);
  }
}

fixItemPrices(); 
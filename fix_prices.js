import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ITEMS_FILE = path.join(__dirname, 'public', 'osrs_items.json');

// Fallback prices for common items that should have prices
const FALLBACK_PRICES = {
  "Runite bar": 12000,
  "Runite ore": 11000,
  "Bandos tassets": 28000000,
  "Bandos chestplate": 25000000,
  "Armadyl chestplate": 35000000,
  "Armadyl chainskirt": 30000000,
  "Amethyst arrow": 150,
  "Dragon arrow": 300,
  "Rune arrow": 100,
  "Adamant arrow": 50,
  "Mithril arrow": 20,
  "Iron arrow": 5,
  "Steel arrow": 10,
  "Bronze arrow": 2,
  "Coal": 200,
  "Iron ore": 100,
  "Mithril ore": 200,
  "Adamantite ore": 1000,
  "Gold ore": 100,
  "Silver ore": 50,
  "Rune essence": 5,
  "Pure essence": 2,
  "Logs": 50,
  "Oak logs": 100,
  "Willow logs": 50,
  "Maple logs": 100,
  "Yew logs": 400,
  "Magic logs": 1200,
  "Shark": 800,
  "Lobster": 200,
  "Swordfish": 300,
  "Monkfish": 400,
  "Prayer potion(4)": 12000,
  "Super combat potion(4)": 15000,
  "Ranging potion(4)": 8000,
  "Magic potion(4)": 1200,
  "Super restore(4)": 10000,
  "Saradomin brew(4)": 8000,
  "Antifire potion(4)": 3000,
  "Super antifire potion(4)": 8000,
  "Abyssal whip": 1800000,
  "Dragon scimitar": 60000,
  "Rune scimitar": 15000,
  "Dragon dagger": 17000,
  "Dragon longsword": 60000,
  "Dragon mace": 50000,
  "Dragon battleaxe": 120000,
  "Dragon warhammer": 20000000,
  "Dragon claws": 180000000,
  "Dragon boots": 180000,
  "Dragon full helm": 2000000,
  "Dragon platebody": 5000000,
  "Dragon platelegs": 2000000,
  "Dragon plateskirt": 2000000,
  "Dragon chainbody": 1000000,
  "Dragon med helm": 500000,
  "Dragon sq shield": 2000000,
  "Dragon kiteshield": 3000000,
  "Ranger boots": 30000000,
  "Primordial boots": 32000000,
  "Pegasian boots": 38000000,
  "Eternal boots": 5000000,
  "Berserker ring (i)": 8000000,
  "Archer ring (i)": 8000000,
  "Seers ring (i)": 8000000,
  "Warrior ring (i)": 8000000,
  "Amulet of fury": 2000000,
  "Amulet of torture": 15000000,
  "Necklace of anguish": 12000000,
  "Occult necklace": 800000,
  "Zenyte shard": 15000000,
  "Onyx": 3000000,
  "Dragonstone": 12000,
  "Diamond": 1800,
  "Ruby": 900,
  "Emerald": 400,
  "Sapphire": 200,
  "Twisted bow": 1200000000,
  "Scythe of vitur": 800000000,
  "Avernic defender": 150000000,
  "Dragon hunter crossbow": 120000000,
  "Blowpipe": 3000000,
  "Prayer scroll (rigour)": 45000000,
  "Prayer scroll (augury)": 25000000,
  "Old school bond": 5000000,
  "Platinum token": 1000,
  "Coins": 1
};

async function fixPrices() {
  try {
    console.log('Reading items file...');
    const itemsData = await fs.readFile(ITEMS_FILE, 'utf8');
    const items = JSON.parse(itemsData);
    
    console.log(`Found ${items.length} items`);
    
    let updatedCount = 0;
    const updatedItems = items.map(item => {
      // If item has 0 price but we have a fallback price, use it
      if (item.current_price === 0 && FALLBACK_PRICES[item.name]) {
        console.log(`Fixing price for ${item.name}: ${FALLBACK_PRICES[item.name]} GP`);
        updatedCount++;
        return {
          ...item,
          current_price: FALLBACK_PRICES[item.name],
          last_updated: new Date().toISOString()
        };
      }
      return item;
    });
    
    console.log(`Updated ${updatedCount} items with fallback prices`);
    
    // Write back the updated items
    await fs.writeFile(ITEMS_FILE, JSON.stringify(updatedItems, null, 2));
    console.log('Items file updated successfully!');
    
  } catch (error) {
    console.error('Error fixing prices:', error);
  }
}

fixPrices(); 
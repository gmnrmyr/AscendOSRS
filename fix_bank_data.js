import { promises as fs } from 'fs';

async function fixBankData() {
  try {
    console.log('🔍 Loading OSRS items data...');
    const itemsData = await fs.readFile('./public/osrs_items.json', 'utf8');
    const osrsItems = JSON.parse(itemsData);
    
    // Create a price lookup map
    const priceMap = new Map();
    osrsItems.forEach(item => {
      if (item.current_price > 0) {
        priceMap.set(item.name.toLowerCase(), item.current_price);
      }
    });
    
    // Enhanced fallback prices for common items
    const fallbackPrices = {
      "amethyst arrow": 150,
      "bandos tassets": 28000000,
      "dragon dagger": 17000,
      "lockpick": 50,
      "ancient rune armour set (lg)": 500000,
      "runite bar": 12000,
      "runite ore": 11000,
      "bandos chestplate": 25000000,
      "armadyl chestplate": 35000000,
      "armadyl chainskirt": 30000000,
      "dragon arrow": 300,
      "rune arrow": 100,
      "adamant arrow": 50,
      "mithril arrow": 25,
      "steel arrow": 15,
      "iron arrow": 10,
      "bronze arrow": 5,
      "abyssal whip": 2500000,
      "dragon scimitar": 100000,
      "dragon longsword": 60000,
      "dragon boots": 220000,
      "dragon gloves": 130000,
      "berserker ring": 2500000,
      "warrior ring": 65000,
      "seers ring": 50000,
      "archers ring": 45000,
      "dragon defender": 0, // Untradeable
      "fire cape": 0, // Untradeable
      "barrows gloves": 0, // Untradeable
      "void knight top": 0, // Untradeable
      "void knight bottom": 0, // Untradeable
      "void knight gloves": 0, // Untradeable
      "void knight helm": 0, // Untradeable
      "granite maul": 35000,
      "dragon warhammer": 45000000,
      "twisted bow": 1200000000,
      "scythe of vitur": 800000000,
      "sang staff": 120000000,
      "avernic defender": 120000000,
      "primordial boots": 32000000,
      "pegasian boots": 35000000,
      "eternal boots": 4500000,
      "dragon hunter lance": 85000000,
      "dragon hunter crossbow": 130000000,
      "toxic blowpipe": 4500000,
      "trident of the seas": 180000,
      "trident of the swamp": 800000,
      "occult necklace": 1200000,
      "anguish": 15000000,
      "tormented bracelet": 12000000,
      "zenyte": 12000000,
      "onyx": 2700000,
      "zenyte shard": 200000,
      "dragon bones": 2800,
      "superior dragon bones": 8500,
      "prayer potion(4)": 10000,
      "super combat potion(4)": 15000,
      "ranging potion(4)": 8000,
      "magic potion(4)": 1200,
      "stamina potion(4)": 12000,
      "saradomin brew(4)": 6000,
      "super restore(4)": 12000,
      "antifire potion(4)": 2000,
      "extended antifire(4)": 8000,
      "shark": 800,
      "manta ray": 1400,
      "karambwan": 1200,
      "anglerfish": 1800,
      "dark crab": 1100,
      "tuna potato": 2500,
      "monkfish": 400,
      "lobster": 180,
      "swordfish": 320,
      "tuna": 120,
      "salmon": 80,
      "trout": 25,
      "coal": 150,
      "iron ore": 100,
      "gold ore": 300,
      "mithril ore": 180,
      "adamantite ore": 1000,
      "runite ore": 11000,
      "tin ore": 50,
      "copper ore": 60,
      "silver ore": 80,
      "clay": 150,
      "limestone": 10,
      "sandstone": 50,
      "granite": 50,
      "pure essence": 4,
      "rune essence": 20,
      "nature rune": 180,
      "law rune": 200,
      "death rune": 220,
      "blood rune": 350,
      "soul rune": 180,
      "cosmic rune": 120,
      "chaos rune": 100,
      "air rune": 5,
      "water rune": 5,
      "earth rune": 5,
      "fire rune": 5,
      "mind rune": 4,
      "body rune": 4,
      "astral rune": 150,
      "wrath rune": 400,
      "logs": 100,
      "oak logs": 50,
      "willow logs": 15,
      "maple logs": 25,
      "yew logs": 300,
      "magic logs": 1000,
      "redwood logs": 400,
      "teak logs": 120,
      "mahogany logs": 400,
      "raw shark": 600,
      "raw manta ray": 1200,
      "raw karambwan": 800,
      "raw anglerfish": 1500,
      "raw dark crab": 900,
      "raw monkfish": 300,
      "raw lobster": 150,
      "raw swordfish": 250,
      "raw tuna": 100,
      "raw salmon": 60,
      "raw trout": 20
    };
    
    console.log('💾 Creating browser console script...');
    
    // Generate the browser console script
    const consoleScript = `
// === BROWSER CONSOLE SCRIPT ===
// Copy and paste this entire script into your browser console

console.log('🔧 Starting Bank Data Fix...');

const fallbackPrices = ${JSON.stringify(fallbackPrices, null, 2)};

function getItemPrice(itemName) {
  const name = itemName.toLowerCase();
  return fallbackPrices[name] || 0;
}

// Load current data
const savedData = localStorage.getItem('osrs-dashboard-data');
if (!savedData) {
  console.log('❌ No saved data found in localStorage');
} else {
  console.log('📦 Found saved data, processing...');
  const data = JSON.parse(savedData);
  let totalUpdated = 0;
  let totalItems = 0;
  
  // Update bank items with correct prices
  if (data.bankData) {
    Object.keys(data.bankData).forEach(character => {
      const items = data.bankData[character];
      if (Array.isArray(items)) {
        console.log(\`🔍 Processing \${items.length} items for \${character}\`);
        items.forEach(item => {
          totalItems++;
          if (item.estimatedPrice === 0 || item.estimatedPrice === null || item.estimatedPrice === undefined) {
            const newPrice = getItemPrice(item.name);
            if (newPrice > 0) {
              item.estimatedPrice = newPrice;
              totalUpdated++;
              console.log(\`✅ Updated \${item.name}: \${newPrice.toLocaleString()} GP\`);
            } else {
              console.log(\`⚠️  No price found for: \${item.name}\`);
            }
          } else {
            console.log(\`ℹ️  \${item.name} already has price: \${item.estimatedPrice.toLocaleString()} GP\`);
          }
        });
      }
    });
  }
  
  // Save updated data
  localStorage.setItem('osrs-dashboard-data', JSON.stringify(data));
  console.log(\`🎉 COMPLETED! Updated \${totalUpdated} out of \${totalItems} items with prices!\`);
  console.log('🔄 Refresh the page to see the changes!');
  
  // Show summary
  console.log('📊 Summary:');
  console.log(\`   Total items processed: \${totalItems}\`);
  console.log(\`   Items updated: \${totalUpdated}\`);
  console.log(\`   Items with existing prices: \${totalItems - totalUpdated}\`);
}
`;

    // Write the console script to a file
    await fs.writeFile('./browser_console_fix.js', consoleScript);
    
    console.log('✅ Browser console script created: browser_console_fix.js');
    console.log('');
    console.log('🚀 INSTRUCTIONS:');
    console.log('1. Open your browser where the app is running');
    console.log('2. Press F12 to open Developer Tools');
    console.log('3. Go to the Console tab');
    console.log('4. Copy the content from browser_console_fix.js and paste it');
    console.log('5. Press Enter to run it');
    console.log('6. Refresh the page to see updated prices!');
    console.log('');
    console.log('OR copy this directly:');
    console.log('=====================================');
    console.log(consoleScript);
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixBankData();
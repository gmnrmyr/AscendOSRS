// osrs_wiki_full_item_dump.js
// Node.js script to fetch and parse the full OSRS Wiki item dump and prices
// Usage: node osrs_wiki_full_item_dump.js

import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API endpoints
const DUMP_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const PRICES_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const OUTPUT_FILE = path.join(__dirname, 'public', 'osrs_items.json');
const METADATA_FILE = path.join(__dirname, 'public', 'osrs_items_metadata.json');

// Your app name and contact - PLEASE REPLACE THESE
const APP_NAME = 'AscendOSRS';
const CONTACT = 'your@email.com'; // Replace with your contact info

// Fallback prices for common items (when API fails)
const FALLBACK_PRICES = {
  "Runite bar": 12000,
  "Runite ore": 11000,
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
  "Dragon defender": 0, // Untradeable
  "Barrows gloves": 130000,
  "Fire cape": 0, // Untradeable
  "Infernal cape": 0, // Untradeable
  "Void knight armour": 0, // Untradeable
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
  "Bandos chestplate": 25000000,
  "Bandos tassets": 28000000,
  "Armadyl chestplate": 35000000,
  "Armadyl chainskirt": 30000000,
  "Dragon hunter crossbow": 120000000,
  "Blowpipe": 3000000,
  "Prayer scroll (rigour)": 45000000,
  "Prayer scroll (augury)": 25000000,
  "Old school bond": 5000000,
  "Platinum token": 1000,
  "Coins": 1
};

async function fetchWithRetry(url, options = {}, retries = 3) {
  console.log(`Fetching ${url}...`);
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Attempt ${i + 1} with headers:`, options.headers);
      const res = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': `${APP_NAME} (${CONTACT})`,
          ...options.headers
        }
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error(`HTTP error! status: ${res.status}`);
        console.error('Response:', text);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log(`Successfully fetched data from ${url}`);
      return data;
    } catch (err) {
      console.error(`Attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      console.log(`Retrying in ${(i + 1)}s...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function fetchItemDetails() {
  try {
    // First fetch the item list from OSRS Wiki
    const itemsRes = await fetch('https://oldschool.runescape.wiki/w/Special:Lookup?type=item&id=all&format=json', {
      headers: {
        'User-Agent': `${APP_NAME} (${CONTACT})`,
      }
    });
    const itemsData = await itemsRes.json();
    return itemsData;
  } catch (err) {
    console.error('Failed to fetch item details:', err);
    return {};
  }
}

async function fetchPrices() {
  try {
    console.log('Fetching current prices...');
    const data = await fetchWithRetry(PRICES_URL);
    console.log(`Got prices for ${Object.keys(data.data || {}).length} items`);
    return data.data || {};
  } catch (err) {
    console.error('Failed to fetch prices:', err);
    return {};
  }
}

async function main() {
  try {
    console.log('Starting item dump process...');
    
    // Fetch items and prices in parallel
    console.log('Fetching items and prices...');
    const [items, priceData] = await Promise.all([
      fetchWithRetry(DUMP_URL),
      fetchPrices()
    ]);

    console.log('Processing items...');
    console.log(`Found ${items.length} items`);
    
    // Map to desired format with prices
    const mapped = items.map(item => {
      const prices = priceData[item.id] || {};
      let currentPrice = prices.high || prices.low || 0;
      
      // If no price from API, try fallback prices
      if (currentPrice === 0 && FALLBACK_PRICES[item.name]) {
        currentPrice = FALLBACK_PRICES[item.name];
        console.log(`Using fallback price for ${item.name}: ${currentPrice}`);
      }
      
      return {
        id: item.id,
        name: item.name,
        examine: item.examine || '',
        members: item.members || false,
        tradeable: item.tradeable || false,
        tradeable_on_ge: item.tradeable_on_ge || false,
        stackable: item.stackable || false,
        noted: item.noted || false,
        noteable: item.noteable || false,
        linked_id_item: item.linked_id_item,
        linked_id_noted: item.linked_id_noted,
        linked_id_placeholder: item.linked_id_placeholder,
        placeholder: item.placeholder || false,
        buy_limit: item.buy_limit || 0,
        high_alch: item.highalch || 0,
        low_alch: item.lowalch || 0,
        value: item.value || 0,
        current_price: currentPrice,
        high_price: prices.high || 0,
        low_price: prices.low || 0,
        last_updated: new Date().toISOString(),
      };
    });

    // Sort by name for consistency
    mapped.sort((a, b) => a.name.localeCompare(b.name));

    console.log('Creating output directory...');
    // Ensure output directory exists
    await fs.mkdir(path.dirname(OUTPUT_FILE), { recursive: true });

    // Create metadata
    const itemsWithPrices = mapped.filter(item => item.current_price > 0).length;
    const metadata = {
      last_updated: new Date().toISOString(),
      total_items: mapped.length,
      items_with_prices: itemsWithPrices,
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };

    console.log('Writing output files...');
    // Write items and metadata
    await Promise.all([
      fs.writeFile(OUTPUT_FILE, JSON.stringify(mapped, null, 2)),
      fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
    ]);

    console.log(`Successfully wrote ${mapped.length} items to ${OUTPUT_FILE}`);
    console.log(`Items with prices: ${itemsWithPrices}`);
    console.log('Metadata written to', METADATA_FILE);
  } catch (err) {
    console.error('Failed to process items:', err);
    console.error('Error details:', err.stack);
    process.exit(1);
  }
}

main();

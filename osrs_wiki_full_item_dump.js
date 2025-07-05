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
const DUMP_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';  // Changed to mapping endpoint
const PRICES_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const OUTPUT_FILE = path.join(__dirname, 'public', 'osrs_items.json');
const METADATA_FILE = path.join(__dirname, 'public', 'osrs_items_metadata.json');

// Your app name and contact - PLEASE REPLACE THESE
const APP_NAME = 'GE Alt Tracker';
const CONTACT = 'your@email.com'; // Replace with your contact info

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
        current_price: prices.high || prices.low || 0,
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
    const metadata = {
      last_updated: new Date().toISOString(),
      total_items: mapped.length,
      items_with_prices: Object.keys(priceData).length,
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };

    console.log('Writing output files...');
    // Write items and metadata
    await Promise.all([
      fs.writeFile(OUTPUT_FILE, JSON.stringify(mapped, null, 2)),
      fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2))
    ]);

    console.log(`Successfully wrote ${mapped.length} items to ${OUTPUT_FILE}`);
    console.log('Metadata written to', METADATA_FILE);
  } catch (err) {
    console.error('Failed to process items:', err);
    console.error('Error details:', err.stack);
    process.exit(1);
  }
}

main();

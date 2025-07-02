// osrs_wiki_items_scraper.js
// Node.js script to fetch and parse OSRS Wiki item list
// Usage: node osrs_wiki_items_scraper.js > osrs_items.json

const fetch = require('node-fetch');

const API_URL = 'https://oldschool.runescape.wiki/api.php?action=query&format=json&list=allpages&apnamespace=0&aplimit=5000';
const ITEM_DETAILS_URL = 'https://oldschool.runescape.wiki/api.php?action=query&format=json&prop=pageprops|pageimages&titles=';
const ITEM_DATA_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

async function fetchAllItems() {
  const res = await fetch(ITEM_DATA_URL);
  if (!res.ok) throw new Error('Failed to fetch item data');
  return await res.json();
}

async function main() {
  const items = await fetchAllItems();
  // Filter out items with no name or id
  const filtered = items.filter(item => item.name && item.id);
  // Map to desired format
  const mapped = filtered.map(item => ({
    id: item.id,
    name: item.name,
    is_member: item.members,
    image_url: item.icon ? `https://oldschool.runescape.wiki${item.icon}` : '',
    examine: item.examine || '',
    // Add more fields as needed
  }));
  // Output as JSON
  console.log(JSON.stringify(mapped, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

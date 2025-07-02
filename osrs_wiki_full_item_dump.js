// osrs_wiki_full_item_dump.js
// Node.js script to fetch and parse the full OSRS Wiki item dump
// Usage: node osrs_wiki_full_item_dump.js > osrs_items_full.json

const fetch = require('node-fetch');

const DUMP_URL = 'https://oldschool.runescape.wiki/api.php?action=rsitemdump&format=json';

async function main() {
  const res = await fetch(DUMP_URL);
  if (!res.ok) throw new Error('Failed to fetch item dump');
  const data = await res.json();
  // The dump is an array of item objects
  const items = data.items || data;
  // Map to desired format
  const mapped = items.map(item => ({
    id: item.id,
    name: item.name,
    is_member: !!item.members,
    image_url: item.icon ? `https://oldschool.runescape.wiki${item.icon}` : '',
    examine: item.examine || '',
    tradeable: !!item.tradeable,
    stackable: !!item.stackable,
    // Add more fields as needed
  }));
  // Output as JSON
  console.log(JSON.stringify(mapped, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

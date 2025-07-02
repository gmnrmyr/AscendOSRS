// osrs_wiki_money_methods_scraper.js
// Node.js script to fetch and parse OSRS Wiki money making methods
// Usage: node osrs_wiki_money_methods_scraper.js > money_methods.json

const fetch = require('node-fetch');
const cheerio = require('cheerio');

const WIKI_URL = 'https://oldschool.runescape.wiki/w/Money_making_guide';

async function fetchWikiPage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${url}`);
  return await res.text();
}

function parseMethodRow($, row, isMember) {
  const cols = $(row).find('td');
  if (cols.length < 4) return null;
  const name = $(cols[0]).text().trim();
  const gpHour = parseInt($(cols[1]).text().replace(/[^\d]/g, '')) || 0;
  const requirements = $(cols[2]).text().trim();
  const notes = $(cols[3]).text().trim();
  // Try to get image URL if present
  const img = $(cols[0]).find('img').attr('src');
  const image_url = img ? (img.startsWith('http') ? img : `https://oldschool.runescape.wiki${img}`) : '';
  return {
    name,
    gpHour,
    requirements,
    notes,
    is_member: isMember,
    image_url,
    // You can add more fields as needed
  };
}

async function main() {
  const html = await fetchWikiPage(WIKI_URL);
  const $ = cheerio.load(html);
  const methods = [];

  // Parse F2P and Members tables
  $('h2, h3').each((_, el) => {
    const heading = $(el).text().toLowerCase();
    let isMember = false;
    if (heading.includes('free-to-play')) isMember = false;
    if (heading.includes('members')) isMember = true;
    const table = $(el).nextAll('table.wikitable').first();
    if (table.length) {
      table.find('tbody > tr').each((i, row) => {
        if (i === 0) return; // skip header
        const method = parseMethodRow($, row, isMember);
        if (method && method.name) methods.push(method);
      });
    }
  });

  // Output as JSON
  console.log(JSON.stringify(methods, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

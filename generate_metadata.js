import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ITEMS_FILE = path.join(__dirname, 'public', 'osrs_items.json');
const METADATA_FILE = path.join(__dirname, 'public', 'osrs_items_metadata.json');

async function generateMetadata() {
  try {
    console.log('Reading items file...');
    const itemsData = await fs.readFile(ITEMS_FILE, 'utf8');
    const items = JSON.parse(itemsData);
    
    console.log(`Found ${items.length} items`);
    
    // Count items with prices
    const itemsWithPrices = items.filter(item => item.current_price > 0).length;
    
    // Create metadata
    const metadata = {
      last_updated: new Date().toISOString(),
      total_items: items.length,
      items_with_prices: itemsWithPrices,
      next_update: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    
    console.log('Creating metadata...');
    console.log(`Total items: ${metadata.total_items}`);
    console.log(`Items with prices: ${metadata.items_with_prices}`);
    
    // Write metadata file
    await fs.writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
    console.log('Metadata file created successfully!');
    
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
}

generateMetadata(); 
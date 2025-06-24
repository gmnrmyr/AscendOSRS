
import { OSRSItem, MoneyMakingGuide } from './api/types';

const OSRS_WIKI_API_BASE = 'https://prices.runescape.wiki/api/v1/osrs';
const OSRS_MAPPING_API = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

// Cache for item mappings
let itemMappingCache: { [key: string]: number } | null = null;

interface OSRSItemData {
  id: number;
  name: string;
}

export const osrsApi = {
  // Get item price and details
  async getItemDetails(itemName: string): Promise<OSRSItem | null> {
    try {
      // Get item mapping if not cached
      if (!itemMappingCache) {
        const mappingResponse = await fetch(OSRS_MAPPING_API);
        if (!mappingResponse.ok) throw new Error('Failed to fetch item mapping');
        const mappingData = await mappingResponse.json();
        
        // Create a reverse mapping from name to id
        itemMappingCache = {};
        mappingData.forEach((item: OSRSItemData) => {
          if (itemMappingCache) {
            itemMappingCache[item.name.toLowerCase()] = item.id;
          }
        });
      }

      // Find item ID by name
      const itemId = itemMappingCache[itemName.toLowerCase()];
      if (!itemId) {
        console.log(`Item not found: ${itemName}`);
        return null;
      }

      // Get current prices
      const priceResponse = await fetch(`${OSRS_WIKI_API_BASE}/latest?id=${itemId}`);
      if (!priceResponse.ok) throw new Error('Failed to fetch item prices');
      const priceData = await priceResponse.json();

      const itemPrices = priceData.data[itemId];
      if (!itemPrices) return null;

      return {
        id: itemId,
        name: itemName,
        icon: `https://oldschool.runescape.wiki/images/${encodeURIComponent(itemName.replace(/ /g, '_'))}.png`,
        value: itemPrices.high || itemPrices.low || 0,
        high: itemPrices.high || 0,
        low: itemPrices.low || 0,
        current_price: itemPrices.high || itemPrices.low || 0,
        today_trend: 'neutral'
      };
    } catch (error) {
      console.error('Error fetching item details:', error);
      return null;
    }
  },

  // Search items by name
  async searchItems(query: string): Promise<OSRSItem[]> {
    try {
      if (!itemMappingCache) {
        const mappingResponse = await fetch(OSRS_MAPPING_API);
        if (!mappingResponse.ok) throw new Error('Failed to fetch item mapping');
        const mappingData = await mappingResponse.json();
        
        itemMappingCache = {};
        mappingData.forEach((item: OSRSItemData) => {
          if (itemMappingCache) {
            itemMappingCache[item.name.toLowerCase()] = item.id;
          }
        });
      }

      // Find matching items
      const matchingItems = Object.keys(itemMappingCache)
        .filter(name => name.includes(query.toLowerCase()))
        .slice(0, 10) // Limit results
        .map(name => ({
          id: itemMappingCache![name],
          name: name.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          icon: `https://oldschool.runescape.wiki/images/${encodeURIComponent(name.replace(/ /g, '_'))}.png`,
          value: 0,
          high: 0,
          low: 0
        }));

      return matchingItems;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  },

  // Get money making methods from OSRS Wiki
  async getMoneyMakingMethods(query?: string): Promise<MoneyMakingGuide[]> {
    try {
      // Static list of popular OSRS money making methods
      const staticMethods: MoneyMakingGuide[] = [
        {
          id: 'brutal-black-dragons',
          name: 'Brutal Black Dragons',
          profit: 1000000,
          skill: 'Ranged',
          requirements: ['High Ranged level', 'Twisted Bow recommended'],
          description: 'Killing Brutal Black Dragons with ranged',
          category: 'combat',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'vorkath',
          name: 'Vorkath',
          profit: 3000000,
          skill: 'Combat',
          requirements: ['Dragon Slayer II', 'High combat stats'],
          description: 'Fighting the dragon boss Vorkath',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'zulrah',
          name: 'Zulrah',
          profit: 2500000,
          skill: 'Combat',
          requirements: ['Regicide quest', 'High Magic/Ranged'],
          description: 'Fighting the snake boss Zulrah',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },
        {
          id: 'gargoyles',
          name: 'Gargoyles',
          profit: 600000,
          skill: 'Slayer',
          requirements: ['75 Slayer', 'Good melee gear'],
          description: 'Killing Gargoyles for consistent profit',
          category: 'combat',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'cannonballs',
          name: 'Making Cannonballs',
          profit: 150000,
          skill: 'Smithing',
          requirements: ['35 Smithing', 'Dwarf Cannon quest'],
          description: 'AFK smithing cannonballs',
          category: 'skilling',
          difficulty: 1,
          membership: 'p2p'
        },
        {
          id: 'runecrafting-natures',
          name: 'Nature Runes',
          profit: 800000,
          skill: 'Runecrafting',
          requirements: ['44 Runecrafting', 'Abyss access'],
          description: 'Crafting Nature runes through Abyss',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'blast-furnace',
          name: 'Blast Furnace',
          profit: 1200000,
          skill: 'Smithing',
          requirements: ['60+ Smithing', 'Good starting capital'],
          description: 'Smelting bars at Blast Furnace',
          category: 'skilling',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'barrows',
          name: 'Barrows',
          profit: 800000,
          skill: 'Combat',
          requirements: ['Medium-high combat', 'Morytania Hard Diary'],
          description: 'Completing Barrows runs for unique items',
          category: 'bossing',
          difficulty: 3,
          membership: 'p2p'
        }
      ];

      if (query) {
        return staticMethods.filter(method => 
          method.name.toLowerCase().includes(query.toLowerCase())
        );
      }

      return staticMethods;
    } catch (error) {
      console.error('Error fetching money making methods:', error);
      return [];
    }
  }
};

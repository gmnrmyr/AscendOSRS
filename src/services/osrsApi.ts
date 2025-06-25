import type { OSRSItem, MoneyMakingGuide } from './api/types';

const OSRS_WIKI_API_BASE = 'https://prices.runescape.wiki/api/v1/osrs';
const OSRS_MAPPING_API = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

// Cache for item mappings
let itemMappingCache: { [key: string]: number } | null = null;

interface OSRSItemData {
  id: number;
  name: string;
}

export type { OSRSItem, MoneyMakingGuide };

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
          low: 0,
          current_price: 0,
          today_trend: 'neutral'
        }));

      return matchingItems;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  },

  // Get money making methods from OSRS Wiki
  async getMoneyMakingMethods(query?: string): Promise<MoneyMakingGuide[]> {
    return this.getDefaultMoneyMakers(query);
  },

  async getDefaultMoneyMakers(query?: string): Promise<MoneyMakingGuide[]> {
    try {
      // Comprehensive list of OSRS money making methods from the wiki
      const staticMethods: MoneyMakingGuide[] = [
        // High-tier PvM
        {
          id: 'tob-challenge-mode',
          name: 'Theatre of Blood: Entry Mode',
          profit: 4200000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Good team coordination'],
          description: 'Completing Theatre of Blood raids',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },
        {
          id: 'chambers-of-xeric',
          name: 'Chambers of Xeric',
          profit: 3800000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Prayer', 'Herblore'],
          description: 'Completing Chambers of Xeric raids',
          category: 'bossing',
          difficulty: 5,
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
          id: 'nightmare',
          name: 'The Nightmare',
          profit: 2800000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Good gear'],
          description: 'Fighting The Nightmare boss',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },
        {
          id: 'cerberus',
          name: 'Cerberus',
          profit: 2100000,
          skill: 'Slayer',
          requirements: ['91 Slayer', 'High combat stats'],
          description: 'Killing Cerberus on slayer task',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'hydra',
          name: 'Alchemical Hydra',
          profit: 1800000,
          skill: 'Slayer',
          requirements: ['95+ Slayer', 'Karuulm Slayer Dungeon'],
          description: 'Killing Alchemical Hydra',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },

        // Mid-tier PvM
        {
          id: 'brutal-black-dragons',
          name: 'Brutal Black Dragons',
          profit: 1000000,
          skill: 'Ranged',
          requirements: ['High Ranged level', 'Anti-dragon shield'],
          description: 'Killing Brutal Black Dragons with ranged',
          category: 'combat',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'demonic-gorillas',
          name: 'Demonic Gorillas',
          profit: 1200000,
          skill: 'Combat',
          requirements: ['Monkey Madness II', 'High combat stats'],
          description: 'Killing Demonic Gorillas',
          category: 'combat',
          difficulty: 4,
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
          id: 'barrows',
          name: 'Barrows',
          profit: 800000,
          skill: 'Combat',
          requirements: ['Medium-high combat', 'Morytania Hard Diary'],
          description: 'Completing Barrows runs for unique items',
          category: 'bossing',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'dagannoth-kings',
          name: 'Dagannoth Kings',
          profit: 1400000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Mixed combat styles'],
          description: 'Killing the three Dagannoth Kings',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },

        // Skilling methods
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
          id: 'runecrafting-bloods',
          name: 'Blood Runes',
          profit: 450000,
          skill: 'Runecrafting',
          requirements: ['77 Runecrafting', 'Sins of the Father'],
          description: 'Crafting Blood runes in Zeah',
          category: 'skilling',
          difficulty: 1,
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
          id: 'fishing-karambwans',
          name: 'Karambwan Fishing',
          profit: 400000,
          skill: 'Fishing',
          requirements: ['65+ Fishing', 'Tai Bwo Wannai Trio'],
          description: 'Fishing and cooking karambwans',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'hunting-chinchompas',
          name: 'Hunting Red Chinchompas',
          profit: 700000,
          skill: 'Hunter',
          requirements: ['63+ Hunter'],
          description: 'Hunting red chinchompas in the wilderness',
          category: 'skilling',
          difficulty: 3,
          membership: 'p2p'
        },

        // F2P methods
        {
          id: 'green-dragons',
          name: 'Green Dragons',
          profit: 400000,
          skill: 'Combat',
          requirements: ['Medium combat stats', 'Wilderness access'],
          description: 'Killing Green Dragons in Wilderness',
          category: 'combat',
          difficulty: 2,
          membership: 'f2p'
        },
        {
          id: 'hill-giants',
          name: 'Hill Giants',
          profit: 200000,
          skill: 'Combat',
          requirements: ['Low combat stats'],
          description: 'Killing Hill Giants for big bones',
          category: 'combat',
          difficulty: 1,
          membership: 'f2p'
        },

        // Other methods
        {
          id: 'farming-herbs',
          name: 'Herb Farming',
          profit: 600000,
          skill: 'Farming',
          requirements: ['32+ Farming', 'Magic secateurs'],
          description: 'Growing and harvesting herbs',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'flipping-items',
          name: 'Grand Exchange Flipping',
          profit: 500000,
          skill: 'Trading',
          requirements: ['Starting capital', 'Market knowledge'],
          description: 'Buying low and selling high on GE',
          category: 'other',
          difficulty: 2,
          membership: 'p2p'
        }
      ];

      if (query) {
        return staticMethods.filter(method => 
          method.name.toLowerCase().includes(query.toLowerCase()) ||
          method.skill.toLowerCase().includes(query.toLowerCase()) ||
          method.description.toLowerCase().includes(query.toLowerCase())
        );
      }

      return staticMethods;
    } catch (error) {
      console.error('Error fetching money making methods:', error);
      return [];
    }
  },

  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    return this.getDefaultMoneyMakers(query);
  },

  async fetchPlayerStats(username: string) {
    try {
      // Mock implementation for now - would connect to OSRS hiscores API
      return {
        username,
        total_level: 1500 + Math.floor(Math.random() * 1000),
        combat_level: 80 + Math.floor(Math.random() * 46),
        account_type: 'regular' as const
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  async fetchPopularItems(): Promise<OSRSItem[]> {
    const popularItemNames = [
      'Twisted bow', 'Scythe of vitur', 'Bandos chestplate', 'Armadyl crossbow',
      'Dragon claws', 'Abyssal whip', 'Barrows gloves', 'Fire cape'
    ];
    
    const items: OSRSItem[] = [];
    for (const itemName of popularItemNames) {
      const item = await this.getItemDetails(itemName);
      if (item) items.push(item);
    }
    return items;
  },

  async fetchSingleItemPrice(itemId: number): Promise<number> {
    try {
      const priceResponse = await fetch(`${OSRS_WIKI_API_BASE}/latest?id=${itemId}`);
      if (!priceResponse.ok) throw new Error('Failed to fetch item price');
      const priceData = await priceResponse.json();

      const itemPrices = priceData.data[itemId];
      if (!itemPrices) return 0;

      return itemPrices.high || itemPrices.low || 0;
    } catch (error) {
      console.error('Error fetching item price:', error);
      return 0;
    }
  },

  getItemIdByName(itemName: string): number {
    if (!itemMappingCache) return 995; // Default to coins
    return itemMappingCache[itemName.toLowerCase()] || 995;
  },

  getItemIcon(itemId: number): string {
    return `https://oldschool.runescape.wiki/images/thumb/${itemId}.png`;
  },

  async getEstimatedItemValue(itemName: string): Promise<number> {
    const item = await this.getItemDetails(itemName);
    return item?.current_price || 0;
  },

  async parseBankCSV(csvText: string): Promise<Array<{name: string; quantity: number; value: number}>> {
    try {
      // Try to parse as JSON first (Data Exporter format)
      const jsonData = JSON.parse(csvText);
      if (Array.isArray(jsonData)) {
        return jsonData.map(item => ({
          name: item.name,
          quantity: item.quantity,
          value: item.value || 0
        }));
      }
    } catch (e) {
      // If JSON parsing fails, try CSV parsing
      const lines = csvText.trim().split('\n');
      const items: Array<{name: string; quantity: number; value: number}> = [];
      
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 3) {
          const name = parts[0].replace(/"/g, '').trim();
          const quantity = parseInt(parts[1]) || 0;
          const value = parseInt(parts[2]) || 0;
          
          if (name && quantity > 0) {
            items.push({ name, quantity, value });
          }
        }
      }
      
      return items;
    }
    
    return [];
  }
};

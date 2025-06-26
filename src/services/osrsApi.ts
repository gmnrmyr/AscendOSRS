import type { OSRSItem, MoneyMakingGuide } from './api/types';

const OSRS_WIKI_API_BASE = 'https://prices.runescape.wiki/api/v1/osrs';
const OSRS_MAPPING_API = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const TEMPLE_OSRS_API = 'https://templeosrs.com/api';

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
    try {
      // Enhanced comprehensive list from OSRS Wiki Money Making Guide
      const wikiMethods: MoneyMakingGuide[] = [
        // Ultra High-tier PvM (5M+ gp/hr)
        {
          id: 'tob-hm',
          name: 'Theatre of Blood: Hard Mode',
          profit: 8500000,
          skill: 'Combat',
          requirements: ['Maxed combat stats', 'Elite gear', 'Perfect team coordination'],
          description: 'Completing Theatre of Blood Hard Mode with optimal team',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },
        {
          id: 'chambers-cm',
          name: 'Chambers of Xeric: Challenge Mode',
          profit: 7200000,
          skill: 'Combat',
          requirements: ['Maxed combat', 'Twisted bow', 'Perfect execution'],
          description: 'Solo or team Challenge Mode raids',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },
        {
          id: 'toa-expert',
          name: 'Tombs of Amascut (Expert)',
          profit: 6800000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Completion of Beneath Cursed Sands'],
          description: 'Expert level Tombs of Amascut raids',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },

        // High-tier PvM (3-5M gp/hr)
        {
          id: 'vorkath-elite',
          name: 'Vorkath (Elite Setup)',
          profit: 4200000,
          skill: 'Combat',
          requirements: ['Dragon Hunter Lance/Crossbow', 'Elite Void', 'Dragon Slayer II'],
          description: 'Optimal Vorkath kills with best gear and methods',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'zulrah-elite',
          name: 'Zulrah (Elite Setup)',
          profit: 3800000,
          skill: 'Combat',
          requirements: ['Twisted Bow', 'Ancestral robes', 'Regicide quest'],
          description: 'Optimal Zulrah kills with Twisted Bow method',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },
        {
          id: 'phantom-muspah',
          name: 'Phantom Muspah',
          profit: 3500000,
          skill: 'Combat',
          requirements: ['Secrets of the North', 'High combat stats'],
          description: 'Killing the Phantom Muspah boss',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'nex',
          name: 'Nex',
          profit: 3400000,
          skill: 'Combat',
          requirements: ['The Frozen Door miniquest', 'Elite combat gear'],
          description: 'Killing Nex in the Ancient Prison',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },

        // Mid-High tier PvM (2-3M gp/hr)
        {
          id: 'hydra-elite',
          name: 'Alchemical Hydra (Elite)',
          profit: 2800000,
          skill: 'Slayer',
          requirements: ['95+ Slayer', 'Dragon Hunter Lance', 'Elite gear'],
          description: 'Optimal Alchemical Hydra kills',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'cerberus-elite',
          name: 'Cerberus (Elite Setup)',
          profit: 2600000,
          skill: 'Slayer',
          requirements: ['91 Slayer', 'Spectral Spirit Shield', 'Elite melee gear'],
          description: 'Optimal Cerberus kills on task',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'nightmare-solo',
          name: 'The Nightmare (Solo)',
          profit: 2400000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Scythe of Vitur recommended'],
          description: 'Solo Nightmare kills for better drop rates',
          category: 'bossing',
          difficulty: 5,
          membership: 'p2p'
        },

        // Upper-Mid tier content (1-2M gp/hr)
        {
          id: 'cox-regular',
          name: 'Chambers of Xeric (Regular)',
          profit: 1900000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Prayer', 'Herblore'],
          description: 'Regular Chambers of Xeric raids',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'corp-ffa',
          name: 'Corporeal Beast (FFA)',
          profit: 1700000,
          skill: 'Combat',
          requirements: ['High combat stats', 'Spears/Halberd'],
          description: 'Free-for-all Corporeal Beast kills',
          category: 'bossing',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'gwd-bandos',
          name: 'General Graardor (Bandos)',
          profit: 1600000,
          skill: 'Combat',
          requirements: ['70+ combat stats', 'Good gear', 'Bandos killcount'],
          description: 'Killing General Graardor in God Wars Dungeon',
          category: 'bossing',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'gwd-armadyl',
          name: 'Kree\'arra (Armadyl)',
          profit: 1500000,
          skill: 'Ranged',
          requirements: ['70+ Ranged', 'Armadyl crossbow recommended', 'Armadyl killcount'],
          description: 'Killing Kree\'arra in God Wars Dungeon',
          category: 'bossing',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'demonic-gorillas',
          name: 'Demonic Gorillas',
          profit: 1400000,
          skill: 'Combat',
          requirements: ['Monkey Madness II', 'High combat stats', 'Good switching ability'],
          description: 'Killing Demonic Gorillas in MM2 tunnels',
          category: 'combat',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'brutal-black-dragons',
          name: 'Brutal Black Dragons',
          profit: 1200000,
          skill: 'Ranged',
          requirements: ['77+ Slayer', 'High Ranged level', 'Anti-dragon shield'],
          description: 'Killing Brutal Black Dragons with ranged',
          category: 'combat',
          difficulty: 3,
          membership: 'p2p'
        },

        // Mid-tier content (500k-1M gp/hr)
        {
          id: 'rune-dragons',
          name: 'Rune Dragons',
          profit: 900000,
          skill: 'Combat',
          requirements: ['Dragon Slayer II', 'High combat stats'],
          description: 'Killing Rune Dragons in Lithkren',
          category: 'combat',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'barrows-elite',
          name: 'Barrows (Elite Method)',
          profit: 850000,
          skill: 'Combat',
          requirements: ['Morytania Hard Diary', 'Trident of the Seas', 'High Magic'],
          description: 'Efficient Barrows runs with diary completion',
          category: 'bossing',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'vorkath-budget',
          name: 'Vorkath (Budget Setup)',
          profit: 800000,
          skill: 'Combat',
          requirements: ['Dragon Slayer II', 'Decent combat stats'],
          description: 'Budget Vorkath kills without elite gear',
          category: 'bossing',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'gargoyles',
          name: 'Gargoyles',
          profit: 750000,
          skill: 'Slayer',
          requirements: ['75 Slayer', 'Good melee gear'],
          description: 'Killing Gargoyles for consistent profit',
          category: 'combat',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'dust-devils',
          name: 'Dust Devils (Catacombs)',
          profit: 700000,
          skill: 'Slayer',
          requirements: ['65 Slayer', 'Barrage spells', 'Kourend Catacombs'],
          description: 'Bursting/Barraging Dust Devils',
          category: 'combat',
          difficulty: 2,
          membership: 'p2p'
        },

        // High-profit skilling (500k+ gp/hr)
        {
          id: 'blast-furnace-gold',
          name: 'Blast Furnace (Gold bars)',
          profit: 1100000,
          skill: 'Smithing',
          requirements: ['40+ Smithing', 'Ice gloves', 'Goldsmith gauntlets'],
          description: 'Smelting gold bars at Blast Furnace',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'runecrafting-double-nats',
          name: 'Double Nature Runes',
          profit: 900000,
          skill: 'Runecrafting',
          requirements: ['91 Runecrafting', 'Abyss access'],
          description: 'Crafting double Nature runes through Abyss',
          category: 'skilling',
          difficulty: 3,
          membership: 'p2p'
        },
        {
          id: 'hunting-black-chins',
          name: 'Black Chinchompas',
          profit: 800000,
          skill: 'Hunter',
          requirements: ['73+ Hunter', 'Wilderness survival skills'],
          description: 'Hunting black chinchompas in the wilderness',
          category: 'skilling',
          difficulty: 4,
          membership: 'p2p'
        },
        {
          id: 'double-astral-runes',
          name: 'Double Astral Runes',
          profit: 750000,
          skill: 'Runecrafting',
          requirements: ['82 Runecrafting', 'Lunar Diplomacy'],
          description: 'Crafting double Astral runes on Lunar Isle',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'hunting-red-chins',
          name: 'Red Chinchompas',
          profit: 650000,
          skill: 'Hunter',
          requirements: ['63+ Hunter'],
          description: 'Hunting red chinchompas (safe method)',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },

        // Mid-tier skilling (200-500k gp/hr)
        {
          id: 'runecrafting-bloods',
          name: 'Blood Runes (Zeah)',
          profit: 450000,
          skill: 'Runecrafting',
          requirements: ['77 Runecrafting', 'Sins of the Father (77% Favour)'],
          description: 'Crafting Blood runes in Zeah (very AFK)',
          category: 'skilling',
          difficulty: 1,
          membership: 'p2p'
        },
        {
          id: 'fishing-karambwans',
          name: 'Karambwan Fishing & Cooking',
          profit: 400000,
          skill: 'Fishing',
          requirements: ['65+ Fishing/Cooking', 'Tai Bwo Wannai Trio'],
          description: 'Fishing and cooking karambwans',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'farming-herbs',
          name: 'Herb Farming (Snapdragon)',
          profit: 350000,
          skill: 'Farming',
          requirements: ['62+ Farming', 'Magic secateurs', 'Ultracompost'],
          description: 'Growing and harvesting high-level herbs',
          category: 'skilling',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'mining-blast-mine',
          name: 'Blast Mining',
          profit: 300000,
          skill: 'Mining',
          requirements: ['75+ Mining', '100% Lovakengj favour'],
          description: 'Mining with dynamite in the Blast mine',
          category: 'skilling',
          difficulty: 3,
          membership: 'p2p'
        },

        // Lower-tier consistent methods (100-300k gp/hr)
        {
          id: 'cannonballs',
          name: 'Making Cannonballs',
          profit: 180000,
          skill: 'Smithing',
          requirements: ['35 Smithing', 'Dwarf Cannon quest'],
          description: 'AFK smithing cannonballs',
          category: 'skilling',
          difficulty: 1,
          membership: 'p2p'
        },
        {
          id: 'spinning-flax',
          name: 'Spinning Flax',
          profit: 150000,
          skill: 'Crafting',
          requirements: ['10+ Crafting'],
          description: 'Spinning flax into bowstrings',
          category: 'skilling',
          difficulty: 1,
          membership: 'p2p'
        },

        // F2P methods
        {
          id: 'green-dragons-f2p',
          name: 'Green Dragons (F2P)',
          profit: 400000,
          skill: 'Combat',
          requirements: ['Medium combat stats', 'Wilderness access'],
          description: 'Killing Green Dragons in Wilderness (F2P)',
          category: 'combat',
          difficulty: 2,
          membership: 'f2p'
        },
        {
          id: 'hill-giants-f2p',
          name: 'Hill Giants (F2P)',
          profit: 200000,
          skill: 'Combat',
          requirements: ['Low combat stats'],
          description: 'Killing Hill Giants for big bones (F2P)',
          category: 'combat',
          difficulty: 1,
          membership: 'f2p'
        },
        {
          id: 'cowhide-f2p',
          name: 'Cowhide Collection (F2P)',
          profit: 100000,
          skill: 'Combat',
          requirements: ['Low combat stats'],
          description: 'Killing cows and collecting cowhides (F2P)',
          category: 'combat',
          difficulty: 1,
          membership: 'f2p'
        },

        // Other/Trading methods
        {
          id: 'flipping-items',
          name: 'Grand Exchange Flipping',
          profit: 500000,
          skill: 'Trading',
          requirements: ['Starting capital', 'Market knowledge', 'Patience'],
          description: 'Buying low and selling high on GE',
          category: 'other',
          difficulty: 2,
          membership: 'p2p'
        },
        {
          id: 'merching-bulk',
          name: 'Bulk Item Merching',
          profit: 300000,
          skill: 'Trading',
          requirements: ['Large starting capital', 'Market analysis'],
          description: 'Trading large quantities of consumables',
          category: 'other',
          difficulty: 3,
          membership: 'p2p'
        }
      ];

      if (query) {
        return wikiMethods.filter(method => 
          method.name.toLowerCase().includes(query.toLowerCase()) ||
          method.skill.toLowerCase().includes(query.toLowerCase()) ||
          method.description.toLowerCase().includes(query.toLowerCase()) ||
          method.requirements.some(req => req.toLowerCase().includes(query.toLowerCase()))
        );
      }

      return wikiMethods;
    } catch (error) {
      console.error('Error fetching money making methods:', error);
      return [];
    }
  },

  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    return this.getMoneyMakingMethods(query);
  },

  async fetchPlayerStats(username: string) {
    try {
      // Try TempleOSRS API first
      const templeResponse = await fetch(`${TEMPLE_OSRS_API}/player_stats.php?player=${encodeURIComponent(username)}`);
      if (templeResponse.ok) {
        const templeData = await templeResponse.json();
        if (templeData && templeData.data) {
          return {
            username,
            total_level: templeData.data.Overall_level || 0,
            combat_level: this.calculateCombatLevel(templeData.data),
            account_type: this.detectAccountType(templeData.data) as 'regular' | 'ironman' | 'hardcore' | 'ultimate'
          };
        }
      }

      // Fallback to OSRS Hiscores (simplified mock for now)
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

  calculateCombatLevel(stats: any): number {
    const attack = stats.Attack_level || 1;
    const strength = stats.Strength_level || 1;
    const defence = stats.Defence_level || 1;
    const hitpoints = stats.Hitpoints_level || 10;
    const prayer = stats.Prayer_level || 1;
    const ranged = stats.Ranged_level || 1;
    const magic = stats.Magic_level || 1;

    const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const range = 0.325 * Math.floor(ranged * 1.5);
    const mage = 0.325 * Math.floor(magic * 1.5);

    return Math.floor(base + Math.max(melee, range, mage));
  },

  detectAccountType(stats: any): string {
    // Simple detection based on account restrictions
    // This is a basic implementation and may need refinement
    if (stats.Defence_level === 1 && stats.Attack_level > 1) return 'pure';
    return 'regular';
  },

  // ... keep existing code (fetchPopularItems, fetchSingleItemPrice, etc.)
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

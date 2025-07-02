// OSRS Wiki API integration for real-time prices and item data
export interface OSRSWikiItem {
  id: number;
  name: string;
  price: number;
  icon?: string;
  high?: number;
  low?: number;
  examine?: string;
}

export interface MoneyMakingMethod {
  name: string;
  hourlyProfit: number;
  requirements: string[];
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  intensity: 1 | 2 | 3 | 4 | 5;
  members: boolean;
  description?: string;
}

class OSRSWikiAPI {
  private readonly BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs';
  private readonly MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
  
  // Popular OSRS money making methods from wiki data
  private readonly MONEY_MAKING_METHODS: MoneyMakingMethod[] = [
    // High-level PvM
    {
      name: "Theatre of Blood",
      hourlyProfit: 13474000,
      requirements: ["95+ Attack", "99 Strength", "95+ Defence", "95+ Hitpoints", "99 Ranged", "94+ Magic", "77+ Prayer"],
      category: "combat",
      intensity: 5,
      members: true,
      description: "High-level team raid content"
    },
    {
      name: "Killing Nex (Duo)",
      hourlyProfit: 11248000,
      requirements: ["95+ Attack", "95+ Strength", "90+ Defence", "90+ Ranged", "90+ Magic", "74+ Prayer"],
      category: "combat",
      intensity: 5,
      members: true
    },
    {
      name: "Tombs of Amascut (545 raid level)",
      hourlyProfit: 10743000,
      requirements: ["95+ Attack", "95+ Strength", "90+ Defence", "95+ Hitpoints", "90+ Ranged", "94+ Magic", "77+ Prayer"],
      category: "combat",
      intensity: 5,
      members: true
    },
    {
      name: "Killing Vardorvis",
      hourlyProfit: 9340000,
      requirements: ["90+ Strength", "90+ Attack", "90+ Defence", "70+ Prayer"],
      category: "combat",
      intensity: 4,
      members: true
    },
    {
      name: "Chambers of Xeric",
      hourlyProfit: 9186000,
      requirements: ["90+ Attack", "High combat stats", "74+ Prayer", "55+ Farming", "78+ Herblore"],
      category: "combat",
      intensity: 4,
      members: true
    },
    {
      name: "Killing Duke Sucellus",
      hourlyProfit: 7834000,
      requirements: ["90+ Strength", "90+ Attack", "90+ Defence", "70+ Prayer"],
      category: "combat",
      intensity: 4,
      members: true
    },
    {
      name: "Killing The Whisperer",
      hourlyProfit: 7786000,
      requirements: ["90+ Magic", "77+ Prayer"],
      category: "combat",
      intensity: 4,
      members: true
    },
    {
      name: "Killing The Leviathan",
      hourlyProfit: 7183000,
      requirements: ["90+ Ranged", "70+ Defence", "74+ Prayer"],
      category: "combat",
      intensity: 4,
      members: true
    },
    
    // High-level skilling
    {
      name: "Blast Furnace (Runite bars)",
      hourlyProfit: 1200000,
      requirements: ["85 Smithing", "Completion of Giant Dwarf"],
      category: "skilling",
      intensity: 2,
      members: true
    },
    {
      name: "Mining Amethyst",
      hourlyProfit: 400000,
      requirements: ["92 Mining"],
      category: "skilling",
      intensity: 1,
      members: true,
      description: "AFK mining with good profits"
    },
    {
      name: "Crafting Nature Runes (Abyss)",
      hourlyProfit: 800000,
      requirements: ["44 Runecrafting", "Completion of Enter the Abyss"],
      category: "skilling",
      intensity: 3,
      members: true
    },
    {
      name: "Fletching Magic Longbows",
      hourlyProfit: 300000,
      requirements: ["85 Fletching"],
      category: "skilling",
      intensity: 2,
      members: true
    },
    {
      name: "Cooking Karambwans",
      hourlyProfit: 250000,
      requirements: ["30 Cooking", "Completion of Tai Bwo Wannai Trio"],
      category: "skilling",
      intensity: 2,
      members: true
    },
    {
      name: "Cutting Yew Logs",
      hourlyProfit: 180000,
      requirements: ["60 Woodcutting"],
      category: "skilling",
      intensity: 1,
      members: false,
      description: "AFK woodcutting"
    },
    {
      name: "Fishing Sharks",
      hourlyProfit: 150000,
      requirements: ["76 Fishing"],
      category: "skilling",
      intensity: 1,
      members: true,
      description: "AFK fishing"
    },
    
    // Mid-level bossing
    {
      name: "Killing Zulrah",
      hourlyProfit: 3500000,
      requirements: ["75+ Magic", "75+ Ranged", "43+ Prayer"],
      category: "bossing",
      intensity: 4,
      members: true
    },
    {
      name: "Killing Vorkath",
      hourlyProfit: 4200000,
      requirements: ["Completion of Dragon Slayer II", "High combat stats"],
      category: "bossing",
      intensity: 3,
      members: true
    },
    {
      name: "Killing Grotesque Guardians",
      hourlyProfit: 2800000,
      requirements: ["75 Slayer", "High combat stats"],
      category: "bossing",
      intensity: 3,
      members: true
    },
    {
      name: "Killing Cerberus",
      hourlyProfit: 2600000,
      requirements: ["91 Slayer", "High combat stats"],
      category: "bossing",
      intensity: 3,
      members: true
    },
    
    // Other methods
    {
      name: "Barrows Runs",
      hourlyProfit: 1400000,
      requirements: ["70+ combat stats", "43+ Prayer"],
      category: "other",
      intensity: 2,
      members: true
    },
    {
      name: "Battlestaff Running",
      hourlyProfit: 900000,
      requirements: ["Completion of Varrock Medium Diary"],
      category: "other",
      intensity: 1,
      members: true
    }
  ];

  // Popular goal items from OSRS
  private readonly POPULAR_GOAL_ITEMS = [
    "Twisted bow", "Scythe of vitur", "Ghrazi rapier", "Avernic defender",
    "Bandos chestplate", "Bandos tassets", "Armadyl chestplate", "Armadyl chainskirt",
    "Dragon hunter crossbow", "Blowpipe", "Abyssal whip", "Dragon defender",
    "Barrows gloves", "Fire cape", "Infernal cape", "Void knight armour",
    "Ranger boots", "Primordial boots", "Pegasian boots", "Eternal boots",
    "Berserker ring (i)", "Archer ring (i)", "Seers ring (i)", "Warrior ring (i)",
    "Amulet of fury", "Amulet of torture", "Necklace of anguish", "Occult necklace",
    "Zenyte shard", "Onyx", "Dragonstone", "Diamond",
    "Prayer potion(4)", "Super combat potion(4)", "Ranging potion(4)", "Magic potion(4)",
    "Shark", "Karambwan", "Saradomin brew(4)", "Super restore(4)"
  ];

  async getItemPrice(itemId: number): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/latest?id=${itemId}`);
      const data = await response.json();
      return data.data?.[itemId]?.high || 0;
    } catch (error) {
      console.error('Error fetching item price:', error);
      return 0;
    }
  }

  async getMultipleItemPrices(itemIds: number[]): Promise<Record<number, number>> {
    try {
      const idsString = itemIds.join(',');
      const response = await fetch(`${this.BASE_URL}/latest?id=${idsString}`);
      const data = await response.json();
      
      const prices: Record<number, number> = {};
      for (const id of itemIds) {
        prices[id] = data.data?.[id]?.high || 0;
      }
      return prices;
    } catch (error) {
      console.error('Error fetching multiple item prices:', error);
      return {};
    }
  }

  async searchItems(query: string): Promise<OSRSWikiItem[]> {
    try {
      // Get item mapping first
      const mappingResponse = await fetch(this.MAPPING_URL);
      const mapping = await mappingResponse.json();
      
      // Filter items by name
      const filteredItems = mapping.filter((item: any) => 
        item.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20);

      if (filteredItems.length === 0) return [];

      // Get prices for filtered items
      const itemIds = filteredItems.map((item: any) => item.id);
      const prices = await this.getMultipleItemPrices(itemIds);

      return filteredItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: prices[item.id] || 0,
        icon: `https://oldschool.runescape.wiki/images/${encodeURIComponent(item.name.replace(/ /g, '_'))}.png`,
        examine: item.examine
      }));
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  async getPopularGoalItems(): Promise<OSRSWikiItem[]> {
    try {
      // Get mapping for popular items
      const mappingResponse = await fetch(this.MAPPING_URL);
      const mapping = await mappingResponse.json();
      
      const popularItems = mapping.filter((item: any) => 
        this.POPULAR_GOAL_ITEMS.some(popularName => 
          item.name.toLowerCase().includes(popularName.toLowerCase())
        )
      );

      const itemIds = popularItems.map((item: any) => item.id);
      const prices = await this.getMultipleItemPrices(itemIds);

      return popularItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        price: prices[item.id] || 0,
        icon: `https://oldschool.runescape.wiki/images/${encodeURIComponent(item.name.replace(/ /g, '_'))}.png`
      }));
    } catch (error) {
      console.error('Error fetching popular goal items:', error);
      return [];
    }
  }

  getMoneyMakingMethods(): MoneyMakingMethod[] {
    return this.MONEY_MAKING_METHODS;
  }

  getMoneyMakingMethodsByCategory(category: string): MoneyMakingMethod[] {
    return this.MONEY_MAKING_METHODS.filter(method => method.category === category);
  }

  searchMoneyMakingMethods(query: string): MoneyMakingMethod[] {
    const searchTerm = query.toLowerCase();
    return this.MONEY_MAKING_METHODS.filter(method =>
      method.name.toLowerCase().includes(searchTerm) ||
      method.requirements.some(req => req.toLowerCase().includes(searchTerm)) ||
      method.description?.toLowerCase().includes(searchTerm)
    );
  }

  getItemIcon(itemName: string): string {
    return `https://oldschool.runescape.wiki/images/${encodeURIComponent(itemName.replace(/ /g, '_'))}.png`;
  }
}

export const osrsWikiApi = new OSRSWikiAPI();

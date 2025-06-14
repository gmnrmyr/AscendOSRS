
export interface OSRSItem {
  id: number;
  name: string;
  current_price?: number;
  today_trend?: string;
  day30_trend?: string;
  day90_trend?: string;
  day180_trend?: string;
  icon?: string;
  wiki_url?: string;
}

export interface MoneyMakingGuide {
  name: string;
  profit: number;
  category: string;
  requirements: string[];
  description: string;
  difficulty: number;
}

class OSRSApiService {
  private readonly WIKI_BASE_URL = 'https://oldschool.runescape.wiki/api.php';
  private readonly PRICES_BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs';
  
  async fetchItemPrices(): Promise<Record<string, OSRSItem>> {
    try {
      const response = await fetch(`${this.PRICES_BASE_URL}/latest`);
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching item prices:', error);
      return {};
    }
  }

  async searchItems(query: string): Promise<OSRSItem[]> {
    try {
      // Use the OSRS Wiki search API
      const response = await fetch(
        `${this.WIKI_BASE_URL}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=0&srlimit=10&origin=*`
      );
      const data = await response.json();
      
      if (!data.query?.search) return [];
      
      // Convert search results to our format
      return data.query.search.map((item: any) => ({
        id: Math.random(), // Wiki doesn't provide item IDs in search
        name: item.title,
        wiki_url: `https://oldschool.runescape.wiki/w/${encodeURIComponent(item.title)}`
      }));
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  async fetchPopularItems(): Promise<OSRSItem[]> {
    // Predefined list of popular OSRS items with their wiki item IDs
    const popularItems = [
      { id: 4151, name: 'Abyssal whip' },
      { id: 11802, name: 'Barrows gloves' },
      { id: 6585, name: 'Amulet of fury' },
      { id: 12002, name: 'Twisted bow' },
      { id: 13576, name: 'Dragon warhammer' },
      { id: 11804, name: 'Bandos chestplate' },
      { id: 11806, name: 'Bandos tassets' },
      { id: 12904, name: 'Toxic blowpipe' },
      { id: 19481, name: 'Heavy ballista' },
      { id: 11785, name: 'Armadyl crossbow' },
      { id: 2577, name: 'Ranger boots' },
      { id: 6889, name: 'Mages book' },
      { id: 11773, name: 'Berserker ring (i)' },
      { id: 6737, name: 'Berserker ring' },
      { id: 11771, name: 'Archers ring (i)' }
    ];

    try {
      const prices = await this.fetchItemPrices();
      
      return popularItems.map(item => ({
        ...item,
        current_price: prices[item.id]?.high || 0,
        icon: `https://oldschool.runescape.wiki/images/thumb/${item.name.replace(/ /g, '_')}_detail.png/120px-${item.name.replace(/ /g, '_')}_detail.png`
      }));
    } catch (error) {
      console.error('Error fetching popular items:', error);
      return popularItems;
    }
  }

  getDefaultMoneyMakers(): MoneyMakingGuide[] {
    return [
      {
        name: "Vorkath",
        profit: 3500000,
        category: "bossing",
        requirements: ["Dragon Slayer II", "High combat stats", "Good gear"],
        description: "Consistent dragon boss with valuable drops",
        difficulty: 4
      },
      {
        name: "Zulrah",
        profit: 2800000,
        category: "bossing", 
        requirements: ["Regicide quest", "High magic/range", "Void gear"],
        description: "Snake boss with unique drops and supplies",
        difficulty: 5
      },
      {
        name: "Demonic Gorillas",
        profit: 1800000,
        category: "combat",
        requirements: ["Monkey Madness II", "High combat stats"],
        description: "Slayer monsters with zenyte shard drops",
        difficulty: 4
      },
      {
        name: "Gargoyles",
        profit: 600000,
        category: "combat",
        requirements: ["75 Slayer", "Decent combat gear"],
        description: "AFK slayer task with consistent drops",
        difficulty: 2
      },
      {
        name: "Brutal Black Dragons",
        profit: 1200000,
        category: "combat",
        requirements: ["77 Slayer", "Antifire protection"],
        description: "High level dragons with valuable drops",
        difficulty: 3
      },
      {
        name: "Runite Ore Mining",
        profit: 400000,
        category: "skilling",
        requirements: ["85 Mining", "Dragon pickaxe recommended"],
        description: "Mine valuable runite ore",
        difficulty: 1
      },
      {
        name: "Nature Rune Crafting",
        profit: 450000,
        category: "skilling", 
        requirements: ["44 Runecrafting", "Abyss access"],
        description: "Craft nature runes through the abyss",
        difficulty: 2
      },
      {
        name: "Cooking Karambwans",
        profit: 200000,
        category: "skilling",
        requirements: ["30 Cooking", "Tai Bwo Wannai Trio"],
        description: "Cook karambwans for profit",
        difficulty: 1
      },
      {
        name: "Blast Furnace Steel Bars",
        profit: 800000,
        category: "skilling",
        requirements: ["30 Smithing", "Ice gloves", "Stamina potions"],
        description: "Smelt steel bars at blast furnace",
        difficulty: 2
      },
      {
        name: "Hunting Chinchompas",
        profit: 1500000,
        category: "skilling",
        requirements: ["63 Hunter", "Box traps"],
        description: "Catch red chinchompas in the wilderness",
        difficulty: 3
      }
    ];
  }
}

export const osrsApi = new OSRSApiService();

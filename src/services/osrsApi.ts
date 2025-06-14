
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

export interface OSRSPriceData {
  high?: number;
  highTime?: number;
  low?: number;
  lowTime?: number;
}

export interface MoneyMakingGuide {
  name: string;
  profit: number;
  category: string;
  requirements: string[];
  description: string;
  difficulty: number;
}

export interface OSRSPlayerStats {
  name: string;
  combat_level: number;
  total_level: number;
  account_type: 'regular' | 'ironman' | 'hardcore' | 'ultimate';
  skills: Record<string, { level: number; xp: number }>;
}

class OSRSApiService {
  private readonly WIKI_BASE_URL = 'https://oldschool.runescape.wiki/api.php';
  private readonly PRICES_BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs';
  private readonly HISCORES_BASE_URL = 'https://secure.runescape.com/m=hiscore_oldschool';
  
  async fetchItemPrices(): Promise<Record<string, OSRSPriceData>> {
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
      
      // Convert search results to our format and add thumbnails
      return data.query.search.map((item: any) => ({
        id: Math.random(), // Wiki doesn't provide item IDs in search
        name: item.title,
        wiki_url: `https://oldschool.runescape.wiki/w/${encodeURIComponent(item.title)}`,
        icon: this.getItemIcon(item.title)
      }));
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  getItemIcon(itemName: string): string {
    // Generate OSRS Wiki item icon URL
    const cleanName = itemName.replace(/ /g, '_').replace(/[()]/g, '');
    return `https://oldschool.runescape.wiki/images/${encodeURIComponent(cleanName)}_detail.png`;
  }

  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    const allMethods = this.getDefaultMoneyMakers();
    
    if (!query.trim()) return [];
    
    // Filter methods based on query
    return allMethods.filter(method => 
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async fetchPlayerStats(username: string): Promise<OSRSPlayerStats | null> {
    try {
      console.log(`Attempting to fetch stats for ${username}`);
      
      // Try different account types with proper CORS handling
      const accountTypes = [
        { type: '', name: 'regular' },
        { type: '_ironman', name: 'ironman' },
        { type: '_hardcore_ironman', name: 'hardcore' },
        { type: '_ultimate', name: 'ultimate' }
      ];
      
      for (const account of accountTypes) {
        try {
          console.log(`Trying ${account.name} account type for ${username}`);
          
          // Use a CORS proxy for the hiscores API
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`${this.HISCORES_BASE_URL}${account.type}/index_lite.ws?player=${encodeURIComponent(username)}`)}`;
          
          const response = await fetch(proxyUrl);
          
          if (response.ok) {
            const data = await response.text();
            console.log(`Successfully fetched ${account.name} stats for ${username}`);
            return this.parseHiscoresData(username, data, account.type);
          }
        } catch (error) {
          console.log(`Failed to fetch ${account.name} stats for ${username}:`, error);
        }
      }
      
      console.log(`Could not find any stats for ${username}`);
      return null;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }

  private parseHiscoresData(username: string, data: string, accountType: string): OSRSPlayerStats {
    const lines = data.split('\n');
    const skillNames = [
      'Overall', 'Attack', 'Defence', 'Strength', 'Hitpoints', 'Ranged', 'Prayer', 'Magic',
      'Cooking', 'Woodcutting', 'Fletching', 'Fishing', 'Firemaking', 'Crafting', 'Smithing',
      'Mining', 'Herblore', 'Agility', 'Thieving', 'Slayer', 'Farming', 'Runecraft', 'Hunter', 'Construction'
    ];

    const skills: Record<string, { level: number; xp: number }> = {};
    let totalLevel = 0;
    let combatLevel = 3;

    // Parse skill data
    for (let i = 0; i < Math.min(lines.length, skillNames.length); i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 3) {
        const level = parseInt(parts[1]) || 1;
        const xp = parseInt(parts[2]) || 0;
        
        skills[skillNames[i].toLowerCase()] = { level, xp };
        
        if (i > 0) { // Skip overall for total level calculation
          totalLevel += level;
        }
      }
    }

    // Calculate combat level
    const attack = skills.attack?.level || 1;
    const defence = skills.defence?.level || 1;
    const strength = skills.strength?.level || 1;
    const hitpoints = skills.hitpoints?.level || 10;
    const ranged = skills.ranged?.level || 1;
    const magic = skills.magic?.level || 1;
    const prayer = skills.prayer?.level || 1;

    const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const rangeLevel = 0.325 * (Math.floor(ranged * 1.5));
    const mageLevel = 0.325 * (Math.floor(magic * 1.5));
    
    combatLevel = Math.floor(base + Math.max(melee, Math.max(rangeLevel, mageLevel)));

    let type: 'regular' | 'ironman' | 'hardcore' | 'ultimate' = 'regular';
    if (accountType.includes('ultimate')) type = 'ultimate';
    else if (accountType.includes('hardcore')) type = 'hardcore';
    else if (accountType.includes('ironman')) type = 'ironman';

    return {
      name: username,
      combat_level: combatLevel,
      total_level: totalLevel,
      account_type: type,
      skills
    };
  }

  parseBankCSV(csvData: string): Array<{name: string; quantity: number; value: number}> {
    try {
      const lines = csvData.trim().split('\n');
      const result = [];
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Parse CSV line (handle commas in item names)
        const parts = line.split(',');
        if (parts.length >= 3) {
          const name = parts[0].replace(/"/g, '').trim();
          const quantity = parseInt(parts[1]) || 0;
          const value = parseInt(parts[2]) || 0;
          
          if (name && quantity > 0) {
            result.push({ name, quantity, value });
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error parsing bank CSV:', error);
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
        icon: this.getItemIcon(item.name)
      }));
    } catch (error) {
      console.error('Error fetching popular items:', error);
      return popularItems.map(item => ({
        ...item,
        icon: this.getItemIcon(item.name)
      }));
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

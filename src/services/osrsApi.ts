
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
  membership: 'f2p' | 'p2p';
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
  
  // Expanded mapping of item names to their correct OSRS item IDs
  private readonly ITEM_ID_MAP: Record<string, number> = {
    'twisted bow': 20997,
    'scythe of vitur': 22325,
    'avernic defender': 22322,
    'primordial boots': 13239,
    'pegasian boots': 13237,
    'eternal boots': 13235,
    'dragon claws': 13652,
    'bandos chestplate': 11832,
    'bandos tassets': 11834,
    'armadyl chestplate': 11828,
    'armadyl chainskirt': 11830,
    'prayer scroll (rigour)': 21034,
    'prayer scroll (augury)': 21079,
    'old school bond': 13190,
    'twisted buckler': 21000,
    'dragon hunter crossbow': 21012,
    'dragon hunter lance': 22978,
    'armadyl crossbow': 11785,
    'toxic blowpipe': 12926,
    'trident of the seas': 11905,
    'trident of the swamp': 12899,
    'abyssal whip': 4151,
    'godsword shard 1': 11818,
    'godsword shard 2': 11820,
    'godsword shard 3': 11822,
    'armadyl godsword': 11802,
    'bandos godsword': 11804,
    'saradomin godsword': 11806,
    'zamorak godsword': 11808,
    'ancestral hat': 21018,
    'ancestral robe top': 21021,
    'ancestral robe bottom': 21024,
    'dragon warhammer': 13576,
    'dharoks helmet': 4716,
    'dharoks platebody': 4720,
    'dharoks platelegs': 4722,
    'dharoks greataxe': 4718,
    'berserker ring': 6737,
    'warrior ring': 6735,
    'seers ring': 6731,
    'archers ring': 6733,
    'ring of suffering': 19550,
    'amulet of fury': 6585,
    'amulet of torture': 19553,
    'necklace of anguish': 19547,
    'occult necklace': 12002,
    'barrows gloves': 7462,
    'fire cape': 6570,
    'infernal cape': 21295,
    'ava\'s assembler': 22109,
    'ranger boots': 2577,
    'robin hood hat': 2581,
    'third age platebody': 10348,
    'third age platelegs': 10350,
    'third age full helmet': 10346,
    'elysian spirit shield': 12817,
    'spectral spirit shield': 12821,
    'arcane spirit shield': 12825,
    'blessed spirit shield': 12831,
    'dragon full helm': 11335,
    'dragon platebody': 14479,
    'dragon platelegs': 4087,
    'dragon plateskirt': 4585,
    'dragon boots': 11840,
    'granite maul': 4153,
    'obsidian cape': 6568,
    'berserker necklace': 11128,
    'dragon defender': 12954,
    'rune defender': 8850,
    'black mask': 8901,
    'slayer helmet': 11864,
    'serpentine helm': 12931,
    'magma helm': 12929,
    'tanzanite helm': 12888,
    'helm of neitiznot': 10828,
    'fighter torso': 10551,
    'void knight top': 8839,
    'void knight robe': 8840,
    'void knight gloves': 8842,
    'void knight mace': 8841,
    'void melee helm': 11665,
    'void ranger helm': 11664,
    'void mage helm': 11663,
    'elite void top': 13072,
    'elite void robe': 13073,
    'ghrazi rapier': 22324,
    'blade of saeldor': 23995,
    'inquisitor\'s great helm': 24417,
    'inquisitor\'s hauberk': 24420,
    'inquisitor\'s plateskirt': 24423,
    'inquisitor\'s mace': 24417,
    'justiciar faceguard': 22326,
    'justiciar chestguard': 22327,
    'justiciar legguards': 22328,
    'crystal crown': 23971,
    'crystal legs': 23983,
    'crystal body': 23977,
    'bowfa': 25865,
    'enhanced crystal weapon seed': 23951,
    'crystal armour seed': 23962,
    'zenyte': 19529,
    'onyx': 6573,
    'dragonstone': 1615,
    'diamond': 1601,
    'ruby': 1603,
    'emerald': 1605,
    'sapphire': 1607
  };
  
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

  async fetchSingleItemPrice(itemId: number): Promise<OSRSPriceData | null> {
    try {
      // Validate that itemId is a proper integer
      if (!Number.isInteger(itemId) || itemId <= 0) {
        console.error(`Invalid item ID: ${itemId}`);
        return null;
      }

      console.log(`Fetching price for item ID: ${itemId}`);
      
      // Try multiple price endpoints for better coverage
      const endpoints = [
        `${this.PRICES_BASE_URL}/latest?id=${itemId}`,
        `${this.PRICES_BASE_URL}/latest`, // Get all prices and filter
        `${this.PRICES_BASE_URL}/1h?id=${itemId}` // Try 1 hour average
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          
          if (!response.ok) {
            console.log(`Failed to fetch from ${endpoint}: ${response.status}`);
            continue;
          }
          
          const data = await response.json();
          console.log(`Price data from ${endpoint}:`, data);
          
          let itemData;
          if (endpoint.includes('latest?id=') || endpoint.includes('1h?id=')) {
            // Single item endpoint
            itemData = data.data?.[itemId.toString()];
          } else {
            // All items endpoint - filter for our item
            itemData = data.data?.[itemId.toString()];
          }
          
          if (itemData && (itemData.high || itemData.low)) {
            console.log(`Found price data for item ${itemId}:`, itemData);
            return {
              high: itemData.high,
              highTime: itemData.highTime,
              low: itemData.low,
              lowTime: itemData.lowTime
            };
          }
        } catch (endpointError) {
          console.log(`Error with endpoint ${endpoint}:`, endpointError);
          continue;
        }
      }
      
      console.log(`No price data found for item ${itemId} from any endpoint`);
      return null;
    } catch (error) {
      console.error(`Error fetching price for item ${itemId}:`, error);
      return null;
    }
  }

  getItemIdByName(itemName: string): number | null {
    const normalizedName = itemName.toLowerCase().trim();
    const directMatch = this.ITEM_ID_MAP[normalizedName];
    
    if (directMatch) {
      return directMatch;
    }
    
    // Try partial matching for items with variations
    for (const [key, value] of Object.entries(this.ITEM_ID_MAP)) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        console.log(`Found partial match: ${normalizedName} -> ${key} (ID: ${value})`);
        return value;
      }
    }
    
    return null;
  }

  async searchItems(query: string): Promise<OSRSItem[]> {
    try {
      // First try to find items in our mapping
      const mappedItems = this.searchMappedItems(query);
      
      // Then search the wiki for additional results
      const response = await fetch(
        `${this.WIKI_BASE_URL}?action=query&format=json&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=0&srlimit=10&origin=*`
      );
      const data = await response.json();
      
      const wikiItems = data.query?.search || [];
      
      // Combine and deduplicate results
      const allItems = [...mappedItems];
      
      for (const wikiItem of wikiItems) {
        const existingItem = allItems.find(item => 
          item.name.toLowerCase() === wikiItem.title.toLowerCase()
        );
        
        if (!existingItem) {
          const itemId = this.getItemIdByName(wikiItem.title) || 0;
          allItems.push({
            id: itemId,
            name: wikiItem.title,
            wiki_url: `https://oldschool.runescape.wiki/w/${encodeURIComponent(wikiItem.title)}`,
            icon: this.getItemIcon(wikiItem.title)
          });
        }
      }

      // Fetch prices for items with valid IDs
      for (const item of allItems) {
        if (item.id > 0) {
          try {
            const priceData = await this.fetchSingleItemPrice(item.id);
            if (priceData?.high) {
              item.current_price = priceData.high;
            } else if (priceData?.low) {
              item.current_price = priceData.low;
            }
          } catch (error) {
            console.log(`Could not fetch price for ${item.name}: ${error}`);
          }
        }
      }

      return allItems.slice(0, 10); // Limit results
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }

  private searchMappedItems(query: string): OSRSItem[] {
    const normalizedQuery = query.toLowerCase().trim();
    const results: OSRSItem[] = [];
    
    for (const [itemName, itemId] of Object.entries(this.ITEM_ID_MAP)) {
      if (itemName.includes(normalizedQuery) || normalizedQuery.includes(itemName)) {
        results.push({
          id: itemId,
          name: this.capitalizeWords(itemName),
          icon: this.getItemIcon(itemName)
        });
      }
    }
    
    return results;
  }

  private capitalizeWords(str: string): string {
    return str.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
    // Predefined list of popular OSRS items with their correct item IDs
    const popularItems = [
      { id: 20997, name: 'Twisted bow' },
      { id: 22325, name: 'Scythe of vitur' },
      { id: 22322, name: 'Avernic defender' },
      { id: 13239, name: 'Primordial boots' },
      { id: 13237, name: 'Pegasian boots' },
      { id: 13235, name: 'Eternal boots' },
      { id: 13652, name: 'Dragon claws' },
      { id: 11832, name: 'Bandos chestplate' },
      { id: 11834, name: 'Bandos tassets' },
      { id: 11828, name: 'Armadyl chestplate' },
      { id: 21034, name: 'Prayer scroll (rigour)' },
      { id: 21079, name: 'Prayer scroll (augury)' },
      { id: 13190, name: 'Old school bond' },
      { id: 22324, name: 'Ghrazi rapier' },
      { id: 21000, name: 'Twisted buckler' }
    ];

    const itemsWithPrices = [];
    
    for (const item of popularItems) {
      try {
        const priceData = await this.fetchSingleItemPrice(item.id);
        const currentPrice = priceData?.high || priceData?.low || 0;
        
        itemsWithPrices.push({
          ...item,
          current_price: currentPrice,
          icon: this.getItemIcon(item.name)
        });
        
        if (currentPrice > 0) {
          console.log(`Successfully fetched price for ${item.name}: ${currentPrice}`);
        } else {
          console.log(`No price data available for ${item.name}`);
        }
      } catch (error) {
        console.error(`Error fetching price for ${item.name}:`, error);
        itemsWithPrices.push({
          ...item,
          current_price: 0,
          icon: this.getItemIcon(item.name)
        });
      }
    }
    
    return itemsWithPrices;
  }

  getDefaultMoneyMakers(): MoneyMakingGuide[] {
    return [
      // Exact OSRS Wiki Methods - High-level PvM
      {
        name: "Killing Vorkath (Ranged)",
        profit: 3800000,
        category: "bossing",
        requirements: ["Dragon Slayer II", "High Ranged level", "Elite void", "Dragon hunter crossbow"],
        description: "Kill Vorkath using ranged setup for consistent high profits",
        difficulty: 4,
        membership: "p2p"
      },
      {
        name: "Killing Vorkath (Melee)",
        profit: 3600000,
        category: "bossing",
        requirements: ["Dragon Slayer II", "High melee stats", "Dragon hunter lance", "Elite void"],
        description: "Kill Vorkath using melee setup with dragon hunter lance",
        difficulty: 4,
        membership: "p2p"
      },
      {
        name: "Killing Zulrah",
        profit: 2900000,
        category: "bossing",
        requirements: ["Regicide", "High Magic/Ranged", "Void equipment", "Toxic blowpipe"],
        description: "Kill Zulrah for unique drops and consistent profit",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Killing the Phantom Muspah",
        profit: 4500000,
        category: "bossing",
        requirements: ["Secrets of the North", "Very high combat stats", "End-game gear"],
        description: "Kill the Phantom Muspah for high-value unique drops",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Killing Nex",
        profit: 5200000,
        category: "bossing",
        requirements: ["The Frozen Door", "Very high combat stats", "Team recommended"],
        description: "Kill Nex for extremely valuable unique drops",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Theatre of Blood",
        profit: 4800000,
        category: "bossing",
        requirements: ["Very high combat stats", "Elite gear", "Experienced team"],
        description: "Complete Theatre of Blood raids for rare rewards",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Chambers of Xeric",
        profit: 3400000,
        category: "bossing",
        requirements: ["High combat stats", "Good gear", "Team recommended"],
        description: "Complete Chambers of Xeric raids for unique rewards",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Chambers of Xeric (Solo)",
        profit: 4100000,
        category: "bossing",
        requirements: ["Very high combat stats", "Elite gear", "Advanced knowledge"],
        description: "Solo Chambers of Xeric for higher drop rates",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Killing the Nightmare",
        profit: 2800000,
        category: "bossing",
        requirements: ["Very high combat stats", "Elite gear", "Team required"],
        description: "Kill the Nightmare for rare unique drops",
        difficulty: 5,
        membership: "p2p"
      },
      {
        name: "Killing Phosani's Nightmare",
        profit: 3900000,
        category: "bossing",
        requirements: ["Very high combat stats", "Elite gear", "Solo encounter"],
        description: "Kill Phosani's Nightmare solo for better drop rates",
        difficulty: 5,
        membership: "p2p"
      },

      // Mid-tier PvM
      {
        name: "Killing demonic gorillas",
        profit: 1900000,
        category: "combat",
        requirements: ["Monkey Madness II", "High combat stats", "Good gear switches"],
        description: "Kill demonic gorillas for zenyte shard drops",
        difficulty: 4,
        membership: "p2p"
      },
      {
        name: "Killing brutal black dragons",
        profit: 1400000,
        category: "combat",
        requirements: ["77 Slayer", "Antifire protection", "Good ranged gear"],
        description: "Kill brutal black dragons for consistent profit",
        difficulty: 3,
        membership: "p2p"
      },
      {
        name: "Killing rune dragons",
        profit: 2300000,
        category: "combat",
        requirements: ["Dragon Slayer II", "High combat stats", "Extended antifire"],
        description: "Kill rune dragons for high-value drops",
        difficulty: 4,
        membership: "p2p"
      },
      {
        name: "Killing gargoyles",
        profit: 650000,
        category: "combat",
        requirements: ["75 Slayer", "Decent combat gear", "Rock hammer"],
        description: "Kill gargoyles for AFK profit and alchs",
        difficulty: 2,
        membership: "p2p"
      },
      {
        name: "Killing Cerberus",
        profit: 2100000,
        category: "bossing",
        requirements: ["91 Slayer", "High combat stats", "Elite gear"],
        description: "Kill Cerberus for primordial crystal drops",
        difficulty: 4,
        membership: "p2p"
      },
      {
        name: "Killing Kraken",
        profit: 900000,
        category: "bossing",
        requirements: ["87 Slayer", "High Magic level", "Trident"],
        description: "Kill the Kraken boss for tentacle and jar drops",
        difficulty: 3,
        membership: "p2p"
      },

      // Skilling Methods - P2P
      {
        name: "Crafting double nature runes",
        profit: 1100000,
        category: "skilling",
        requirements: ["91 Runecrafting", "Abyss access", "Graceful outfit"],
        description: "Craft double nature runes through the abyss",
        difficulty: 2,
        membership: "p2p"
      },
      {
        name: "Crafting nature runes",
        profit: 550000,
        category: "skilling",
        requirements: ["44 Runecrafting", "Abyss access"],
        description: "Craft nature runes through the abyss",
        difficulty: 2,
        membership: "p2p"
      },
      {
        name: "Crafting wrath runes",
        profit: 1800000,
        category: "skilling",
        requirements: ["95 Runecrafting", "Dragon Slayer II", "Myths' Guild"],
        description: "Craft wrath runes for very high profit",
        difficulty: 3,
        membership: "p2p"
      },
      {
        name: "Hunting black chinchompas",
        profit: 2400000,
        category: "skilling",
        requirements: ["73 Hunter", "Box traps", "Wilderness survival"],
        description: "Hunt black chinchompas in the wilderness",
        difficulty: 4,
        membership: "p2p"
      },
      {
        name: "Hunting red chinchompas",
        profit: 1600000,
        category: "skilling",
        requirements: ["63 Hunter", "Box traps"],
        description: "Hunt red chinchompas for consistent profit",
        difficulty: 3,
        membership: "p2p"
      },
      {
        name: "Making rune bars at Blast Furnace",
        profit: 1300000,
        category: "skilling",
        requirements: ["85 Smithing", "Ice gloves", "Stamina potions", "Coal bag"],
        description: "Smelt rune bars at the Blast Furnace",
        difficulty: 2,
        membership: "p2p"
      },
      {
        name: "Making adamant bars at Blast Furnace",
        profit: 900000,
        category: "skilling",
        requirements: ["70 Smithing", "Ice gloves", "Stamina potions", "Coal bag"],
        description: "Smelt adamant bars at the Blast Furnace",
        difficulty: 2,
        membership: "p2p"
      },
      {
        name: "Making steel bars at Blast Furnace",
        profit: 700000,
        category: "skilling",
        requirements: ["30 Smithing", "Ice gloves", "Stamina potions"],
        description: "Smelt steel bars at the Blast Furnace",
        difficulty: 2,
        membership: "p2p"
      },
      {
        name: "Farming ranarr weeds",
        profit: 220000,
        category: "skilling",
        requirements: ["32 Farming", "Herb patches unlocked", "Ultracompost"],
        description: "Farm ranarr herbs for consistent daily profit",
        difficulty: 1,
        membership: "p2p"
      },
      {
        name: "Farming snapdragons",
        profit: 280000,
        category: "skilling",
        requirements: ["62 Farming", "Herb patches unlocked", "Ultracompost"],
        description: "Farm snapdragon herbs for higher profit",
        difficulty: 1,
        membership: "p2p"
      },
      {
        name: "Farming toadflax",
        profit: 190000,
        category: "skilling",
        requirements: ["38 Farming", "Herb patches unlocked", "Ultracompost"],
        description: "Farm toadflax herbs for moderate profit",
        difficulty: 1,
        membership: "p2p"
      },
      {
        name: "Making cannonballs",
        profit: 180000,
        category: "skilling",
        requirements: ["35 Smithing", "Dwarf Cannon quest"],
        description: "Smith steel bars into cannonballs (very AFK)",
        difficulty: 1,
        membership: "p2p"
      },
      {
        name: "Cutting magic logs",
        profit: 170000,
        category: "skilling",
        requirements: ["75 Woodcutting", "Dragon axe recommended"],
        description: "Cut magic logs for profit (very AFK)",
        difficulty: 1,
        membership: "p2p"
      },
      {
        name: "Mining amethyst",
        profit: 280000,
        category: "skilling",
        requirements: ["92 Mining", "Dragon pickaxe"],
        description: "Mine amethyst in the Mining Guild (AFK)",
        difficulty: 1,
        membership: "p2p"
      },

      // F2P Methods - Exact Wiki Names
      {
        name: "Smithing rune 2h swords",
        profit: 320000,
        category: "skilling",
        requirements: ["99 Smithing", "Rune bars"],
        description: "Smith rune 2h swords for high F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smithing rune platelegs",
        profit: 300000,
        category: "skilling",
        requirements: ["99 Smithing", "Rune bars"],
        description: "Smith rune platelegs for F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smithing rune plateskirts",
        profit: 290000,
        category: "skilling",
        requirements: ["99 Smithing", "Rune bars"],
        description: "Smith rune plateskirts for F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smithing adamant platebodies",
        profit: 170000,
        category: "skilling",
        requirements: ["88 Smithing", "Adamant bars"],
        description: "Smith adamant platebodies for moderate F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smithing adamant 2h swords",
        profit: 160000,
        category: "skilling",
        requirements: ["89 Smithing", "Adamant bars"],
        description: "Smith adamant 2h swords for F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smelting runite bars",
        profit: 240000,
        category: "skilling",
        requirements: ["85 Smithing", "Runite ore", "Coal"],
        description: "Smelt runite bars for F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smelting adamantite bars",
        profit: 180000,
        category: "skilling",
        requirements: ["70 Smithing", "Adamantite ore", "Coal"],
        description: "Smelt adamantite bars for F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smelting mithril bars",
        profit: 140000,
        category: "skilling",
        requirements: ["50 Smithing", "Mithril ore", "Coal"],
        description: "Smelt mithril bars for moderate F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Smelting steel bars",
        profit: 120000,
        category: "skilling",
        requirements: ["30 Smithing", "Iron ore", "Coal"],
        description: "Smelt steel bars for low-level F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Mining iron ore",
        profit: 130000,
        category: "skilling",
        requirements: ["15 Mining", "Pickaxe"],
        description: "Mine iron ore for steady F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Mining coal",
        profit: 150000,
        category: "skilling",
        requirements: ["30 Mining", "Pickaxe"],
        description: "Mine coal for smithing and F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Cutting yew logs",
        profit: 110000,
        category: "skilling",
        requirements: ["60 Woodcutting", "Axe"],
        description: "Cut yew logs for F2P profit (AFK)",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Making yew longbows",
        profit: 170000,
        category: "skilling",
        requirements: ["70 Fletching", "Yew logs", "Bowstring"],
        description: "Fletch yew longbows for good F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Making oak longbows",
        profit: 90000,
        category: "skilling",
        requirements: ["25 Fletching", "Oak logs", "Bowstring"],
        description: "Fletch oak longbows for moderate F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Fishing lobsters",
        profit: 70000,
        category: "skilling",
        requirements: ["40 Fishing", "Lobster pot"],
        description: "Fish lobsters for F2P food and profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Fishing swordfish",
        profit: 90000,
        category: "skilling",
        requirements: ["50 Fishing", "Harpoon"],
        description: "Fish swordfish for F2P profit",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Killing ogress warriors",
        profit: 220000,
        category: "combat",
        requirements: ["Decent combat stats", "Corsair Cove access"],
        description: "Kill ogress warriors for rune items and gems",
        difficulty: 2,
        membership: "f2p"
      },
      {
        name: "Collecting big bones",
        profit: 80000,
        category: "combat",
        requirements: ["Decent combat stats"],
        description: "Kill hill giants for big bones",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "High Level Alchemy",
        profit: 160000,
        category: "other",
        requirements: ["55 Magic", "High Level Alchemy spell", "Nature runes"],
        description: "Alch profitable items for magic XP and GP",
        difficulty: 1,
        membership: "f2p"
      },
      {
        name: "Tanning cowhides",
        profit: 100000,
        category: "skilling",
        requirements: ["Access to Al-Kharid", "Cowhides", "GP for tanning"],
        description: "Tan cowhides into leather for profit",
        difficulty: 1,
        membership: "f2p"
      }
    ];
  }
}

export const osrsApi = new OSRSApiService();

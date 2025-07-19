
import { PlayerStats } from '@/types';

export interface OSRSItem {
  id: number;
  name: string;
  icon: string;
  value: number;
  high: number;
  low: number;
  current_price?: number;
  today_trend?: string;
}

export interface MoneyMakingGuide {
  id: string;
  name: string;
  profit: number;
  gpHour?: number; // Added for compatibility
  skill: string;
  requirements: string;
  description: string;
  notes?: string; // Added for compatibility
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  clickIntensity?: 1 | 2 | 3 | 4 | 5; // Added for compatibility
  membership: 'f2p' | 'p2p';
}

class OSRSApiService {
  private readonly baseUrl = 'https://secure.runescape.com/m=hiscore_oldschool';
  private readonly wikiApiUrl = 'https://prices.runescape.wiki/api/v1/osrs';
  private readonly userAgent = 'AscendOSRS-PriceTracker/1.0 (Contact: admin@ascendosrs.com)';
  
  // Cache for API responses to avoid rate limiting
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly cacheTimeout = 60000; // 1 minute cache

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.cacheTimeout;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    const defaultOptions: RequestInit = {
      headers: {
        'User-Agent': this.userAgent,
        ...options.headers,
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    for (let i = 0; i < retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...mergedOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) throw error;
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
    
    throw new Error('All retry attempts failed');
  }

  async fetchPlayerStats(username: string): Promise<PlayerStats | null> {
    if (!username?.trim()) {
      throw new Error('Username is required');
    }

    const cleanUsername = username.trim().replace(/\s+/g, ' ');
    const cacheKey = `player-stats-${cleanUsername.toLowerCase()}`;
    
    // Check cache first
    const cached = this.getCachedData<PlayerStats>(cacheKey);
    if (cached) {
      console.log(`Using cached data for ${cleanUsername}`);
      return cached;
    }

    console.log(`Fetching fresh data for ${cleanUsername}`);

    try {
      // Try multiple API endpoints for better success rate
      const endpoints = [
        `${this.baseUrl}/index_lite.ws?player=${encodeURIComponent(cleanUsername)}`,
        `${this.baseUrl}.json?player=${encodeURIComponent(cleanUsername)}`,
      ];

      let lastError: Error | null = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

          const response = await fetch(endpoint, {
            headers: {
              'User-Agent': this.userAgent,
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 404) {
              console.log(`Player ${cleanUsername} not found on hiscores`);
              return null;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const contentType = response.headers.get('content-type') || '';
          let data: any;

          if (contentType.includes('application/json')) {
            data = await response.json();
          } else {
            // Parse CSV format
            const text = await response.text();
            data = this.parseHiscoresCsv(text, cleanUsername);
          }

          if (data) {
            const stats = this.normalizePlayerStats(data, cleanUsername);
            this.setCachedData(cacheKey, stats);
            console.log(`Successfully fetched stats for ${cleanUsername}:`, stats);
            return stats;
          }
        } catch (error) {
          console.warn(`Endpoint ${endpoint} failed:`, error);
          lastError = error as Error;
          continue;
        }
      }

      throw lastError || new Error('All endpoints failed');
      
    } catch (error) {
      console.error(`Failed to fetch stats for ${cleanUsername}:`, error);
      
      if (error instanceof Error) {
        if (error.message.includes('404') || error.message.includes('not found')) {
          return null;
        }
        throw error;
      }
      
      throw new Error(`Failed to fetch player stats: ${error}`);
    }
  }

  private parseHiscoresCsv(csvText: string, username: string): any {
    const lines = csvText.trim().split('\n');
    if (lines.length < 24) {
      throw new Error('Invalid hiscores data format');
    }

    // Parse skills (first 24 lines)
    const skills = lines.slice(0, 24).map(line => {
      const [rank, level, xp] = line.split(',').map(val => parseInt(val) || -1);
      return { rank, level, xp };
    });

    // Calculate combat level
    const attack = skills[1]?.level || 1;
    const defence = skills[2]?.level || 1;
    const strength = skills[3]?.level || 1;
    const hitpoints = skills[4]?.level || 10;
    const ranged = skills[5]?.level || 1;
    const prayer = skills[6]?.level || 1;
    const magic = skills[7]?.level || 1;

    const combatLevel = this.calculateCombatLevel(attack, defence, strength, hitpoints, ranged, prayer, magic);
    
    // Calculate total level
    const totalLevel = skills.slice(1).reduce((sum, skill) => sum + (skill.level > 0 ? skill.level : 1), 0);

    return {
      combat_level: combatLevel,
      total_level: totalLevel,
      username,
      skills,
      // Individual skills
      attack,
      defence,
      strength,
      hitpoints,
      ranged,
      prayer,
      magic,
      cooking: skills[8]?.level || 1,
      woodcutting: skills[9]?.level || 1,
      fletching: skills[10]?.level || 1,
      fishing: skills[11]?.level || 1,
      firemaking: skills[12]?.level || 1,
      crafting: skills[13]?.level || 1,
      smithing: skills[14]?.level || 1,
      mining: skills[15]?.level || 1,
      herblore: skills[16]?.level || 1,
      agility: skills[17]?.level || 1,
      thieving: skills[18]?.level || 1,
      slayer: skills[19]?.level || 1,
      farming: skills[20]?.level || 1,
      runecraft: skills[21]?.level || 1,
      hunter: skills[22]?.level || 1,
      construction: skills[23]?.level || 1,
    };
  }

  private calculateCombatLevel(attack: number, defence: number, strength: number, hitpoints: number, ranged: number, prayer: number, magic: number): number {
    const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
    const melee = 0.325 * (attack + strength);
    const range = 0.325 * Math.floor(ranged * 1.5);
    const mage = 0.325 * Math.floor(magic * 1.5);
    
    return Math.floor(base + Math.max(melee, range, mage));
  }

  private normalizePlayerStats(data: any, username: string): PlayerStats {
    // Handle different data formats
    let combatLevel = data.combat_level || data.combatLevel || 3;
    let totalLevel = data.total_level || data.totalLevel || 32;
    let accountType = data.account_type || data.accountType || 'regular';

    // Ensure valid ranges
    combatLevel = Math.max(3, Math.min(126, parseInt(String(combatLevel)) || 3));
    totalLevel = Math.max(32, Math.min(2277, parseInt(String(totalLevel)) || 32));

    // Detect account type from various sources
    if (typeof accountType === 'string') {
      const type = accountType.toLowerCase();
      if (type.includes('ultimate') || type.includes('uim')) {
        accountType = 'ultimate';
      } else if (type.includes('hardcore') || type.includes('hcim')) {
        accountType = 'hardcore';
      } else if (type.includes('ironman') || type.includes('iron')) {
        accountType = 'ironman';
      } else {
        accountType = 'regular';
      }
    }

    return {
      combat_level: combatLevel,
      total_level: totalLevel,
      account_type: accountType,
      username,
      // Include individual skills if available
      attack: data.attack,
      defence: data.defence,
      strength: data.strength,
      hitpoints: data.hitpoints,
      ranged: data.ranged,
      prayer: data.prayer,
      magic: data.magic,
      cooking: data.cooking,
      woodcutting: data.woodcutting,
      fletching: data.fletching,
      fishing: data.fishing,
      firemaking: data.firemaking,
      crafting: data.crafting,
      smithing: data.smithing,
      mining: data.mining,
      herblore: data.herblore,
      agility: data.agility,
      thieving: data.thieving,
      slayer: data.slayer,
      farming: data.farming,
      runecraft: data.runecraft,
      hunter: data.hunter,
      construction: data.construction,
    };
  }

  async fetchItemPrices(): Promise<Record<string, any>> {
    const cacheKey = 'item-prices';
    const cached = this.getCachedData<Record<string, any>>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${this.wikiApiUrl}/latest`, {
        headers: {
          'User-Agent': this.userAgent,
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to fetch item prices: ${response.status}`);
      }

      const data = await response.json();
      const prices = data.data || {};
      
      this.setCachedData(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error('Error fetching item prices:', error);
      return {};
    }
  }

  async fetchPopularItems(): Promise<OSRSItem[]> {
    // Return mock popular items for now
    return [
      { id: 995, name: "Coins", icon: "", value: 1, high: 1, low: 1, current_price: 1, today_trend: "neutral" },
      { id: 20997, name: "Twisted bow", icon: "", value: 1200000000, high: 1300000000, low: 1100000000, current_price: 1200000000, today_trend: "positive" },
      { id: 11832, name: "Bandos chestplate", icon: "", value: 25000000, high: 26000000, low: 24000000, current_price: 25000000, today_trend: "negative" }
    ];
  }

  async searchItems(query: string): Promise<OSRSItem[]> {
    // Mock search implementation
    const items = await this.fetchPopularItems();
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  async fetchSingleItemPrice(itemId: number): Promise<number> {
    try {
      const prices = await this.fetchItemPrices();
      const itemData = prices[itemId.toString()];
      return itemData?.high || itemData?.low || 0;
    } catch (error) {
      console.error(`Error fetching price for item ${itemId}:`, error);
      return 0;
    }
  }

  getItemIcon(itemId: number): string {
    return `https://oldschool.runescape.wiki/images/thumb/${itemId}.png/32px-${itemId}.png`;
  }

  getItemIdByName(itemName: string): number | null {
    // Simple item name to ID mapping
    const itemMap: Record<string, number> = {
      "coins": 995,
      "twisted bow": 20997,
      "bandos chestplate": 11832,
      "dragon claws": 13652,
      "abyssal whip": 4151
    };
    return itemMap[itemName.toLowerCase()] || null;
  }

  getEstimatedItemValue(itemName: string): number {
    // Simple estimation logic
    if (itemName.toLowerCase().includes('bow')) return 1000000;
    if (itemName.toLowerCase().includes('sword')) return 500000;
    if (itemName.toLowerCase().includes('coin')) return 1;
    return Math.floor(Math.random() * 100000) + 1000;
  }

  async getDefaultMoneyMakers(): Promise<MoneyMakingGuide[]> {
    return [
      {
        id: "vorkath",
        name: "Vorkath",
        profit: 4000000,
        gpHour: 4000000, // Include both for compatibility
        skill: "Combat",
        requirements: "Dragon Slayer II, high combat stats",
        description: "High-level dragon boss with consistent drops",
        notes: "High-level dragon boss with consistent drops", // Include both for compatibility
        category: "bossing",
        difficulty: 4,
        clickIntensity: 4, // Include both for compatibility
        membership: "p2p"
      },
      {
        id: "zulrah",
        name: "Zulrah",
        profit: 3500000,
        gpHour: 3500000, // Include both for compatibility
        skill: "Combat",
        requirements: "Regicide quest, high combat stats",
        description: "Snake boss with valuable unique drops",
        notes: "Snake boss with valuable unique drops", // Include both for compatibility
        category: "bossing", 
        difficulty: 5,
        clickIntensity: 5, // Include both for compatibility
        membership: "p2p"
      },
      {
        id: "blast-furnace",
        name: "Blast Furnace",
        profit: 1500000,
        gpHour: 1500000,
        skill: "Smithing",
        requirements: "60+ Smithing, coal bag recommended",
        description: "Efficient smithing method using the Blast Furnace",
        notes: "Efficient smithing method using the Blast Furnace",
        category: "skilling",
        difficulty: 2,
        clickIntensity: 2,
        membership: "p2p"
      },
      {
        id: "green-dragons",
        name: "Green Dragons",
        profit: 800000,
        gpHour: 800000,
        skill: "Combat",
        requirements: "40+ Combat stats",
        description: "Killing green dragons for hides and bones",
        notes: "Killing green dragons for hides and bones",
        category: "combat",
        difficulty: 2,
        clickIntensity: 3,
        membership: "f2p"
      },
      {
        id: "mining-iron",
        name: "Mining Iron Ore",
        profit: 200000,
        gpHour: 200000,
        skill: "Mining",
        requirements: "15+ Mining",
        description: "Mining iron ore for consistent profit",
        notes: "Mining iron ore for consistent profit",
        category: "skilling",
        difficulty: 1,
        clickIntensity: 1,
        membership: "f2p"
      }
    ];
  }

  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    const methods = await this.getDefaultMoneyMakers();
    return methods.filter(method => 
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  async parseBankCSV(csvData: string): Promise<Array<{name: string; quantity: number; value: number}>> {
    try {
      // Try to parse as JSON first (RuneLite format)
      try {
        const jsonData = JSON.parse(csvData);
        if (Array.isArray(jsonData)) {
          return jsonData.map(item => ({
            name: item.name || 'Unknown Item',
            quantity: parseInt(item.quantity) || 1,
            value: this.getEstimatedItemValue(item.name || 'Unknown Item')
          }));
        }
      } catch (e) {
        // Not JSON, try CSV
      }

      // Parse as CSV
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('Invalid CSV format');
      }

      const headers = lines[0].toLowerCase().split(',');
      const nameIndex = headers.findIndex(h => h.includes('name'));
      const quantityIndex = headers.findIndex(h => h.includes('quantity'));

      if (nameIndex === -1 || quantityIndex === -1) {
        throw new Error('Missing required columns: name, quantity');
      }

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length > Math.max(nameIndex, quantityIndex)) {
          const name = values[nameIndex]?.trim() || 'Unknown Item';
          const quantity = parseInt(values[quantityIndex]) || 1;
          
          items.push({
            name,
            quantity,
            value: this.getEstimatedItemValue(name)
          });
        }
      }

      return items;
    } catch (error) {
      console.error('Error parsing bank CSV:', error);
      throw new Error(`Failed to parse bank data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Clear cache (useful for testing or manual refresh)
  clearCache(): void {
    this.cache.clear();
    console.log('API cache cleared');
  }

  // Get cache stats
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const osrsApi = new OSRSApiService();

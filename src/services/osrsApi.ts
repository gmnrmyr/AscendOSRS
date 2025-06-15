import { WikiPricesApi } from './api/wikiPricesApi';
import { ItemSearchApi } from './api/itemSearchApi';
import { getItemIdByName } from './utils/itemMapping';
import { getItemIcon } from './utils/itemIconUtils';
import { OSRSItem, OSRSPriceData, OSRSSearchResult, OSRSMoneyMakingMethod, MoneyMakingGuide, PlayerStats } from './types/osrs';

// Re-export types for backwards compatibility
export type { OSRSItem, OSRSPriceData, OSRSSearchResult, OSRSMoneyMakingMethod, MoneyMakingGuide, PlayerStats } from './types/osrs';

class OSRSApi {
  // Price fetching methods
  async fetchSingleItemPrice(itemId: number): Promise<OSRSPriceData | null> {
    console.log(`OSRSApi: Fetching price for item ID: ${itemId}`);
    
    if (!itemId || !Number.isInteger(itemId) || itemId <= 0) {
      console.log(`Invalid item ID: ${itemId}`);
      return null;
    }

    // Try wiki prices API first
    const wikiPrice = await WikiPricesApi.fetchSingleItemPrice(itemId);
    if (wikiPrice && wikiPrice.high > 0) {
      console.log(`Successfully fetched price from wiki API: ${wikiPrice.high}`);
      return wikiPrice;
    }

    console.log(`No valid price found for item ${itemId}`);
    return null;
  }

  async fetchMultipleItemPrices(itemIds: number[]): Promise<Record<number, OSRSPriceData>> {
    console.log(`OSRSApi: Fetching prices for ${itemIds.length} items`);
    
    const validIds = itemIds.filter(id => Number.isInteger(id) && id > 0);
    if (validIds.length === 0) {
      console.log('No valid item IDs provided');
      return {};
    }

    return await WikiPricesApi.fetchMultipleItemPrices(validIds);
  }

  // Search methods
  async searchItems(query: string): Promise<OSRSSearchResult[]> {
    console.log(`OSRSApi: Searching for items with query: "${query}"`);
    
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const results = await ItemSearchApi.searchItems(query);
      
      // Try to enhance results with item IDs and prices where possible
      const enhancedResults = results.map(result => {
        const itemId = getItemIdByName(result.name);
        return {
          ...result,
          id: itemId || result.id,
          icon: getItemIcon(result.name)
        };
      });

      return enhancedResults;
    } catch (error) {
      console.error('Error in searchItems:', error);
      return [];
    }
  }

  // Money making methods
  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    console.log(`OSRSApi: Searching for money making methods with query: "${query}"`);
    
    const defaultMethods = this.getDefaultMoneyMakers();
    
    if (!query || query.length < 2) {
      return defaultMethods.slice(0, 5);
    }
    
    const filtered = defaultMethods.filter(method => 
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.category.toLowerCase().includes(query.toLowerCase()) ||
      method.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered;
  }

  async searchMoneyMakingMethods(query: string): Promise<OSRSSearchResult[]> {
    console.log(`OSRSApi: Searching for money making methods with query: "${query}"`);
    
    const defaultMethods = this.getDefaultMoneyMakers();
    
    if (!query || query.length < 2) {
      return defaultMethods.slice(0, 5).map(method => ({
        id: method.name.toLowerCase().replace(/\s+/g, '-'),
        name: method.name,
        subtitle: `${this.formatGP(method.profit)}/hr - ${method.category}`,
        category: 'money-making',
        value: method.profit,
        current_price: method.profit,
        today_trend: 'neutral' as const
      }));
    }
    
    const filtered = defaultMethods.filter(method => 
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.category.toLowerCase().includes(query.toLowerCase()) ||
      method.description.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.map(method => ({
      id: method.name.toLowerCase().replace(/\s+/g, '-'),
      name: method.name,
      subtitle: `${this.formatGP(method.profit)}/hr - ${method.category}`,
      category: 'money-making',
      value: method.profit,
      current_price: method.profit,
      today_trend: 'neutral' as const
    }));
  }

  // Player stats fetching
  async fetchPlayerStats(username: string): Promise<PlayerStats | null> {
    console.log(`Fetching player stats for: ${username}`);
    
    try {
      // Try OSRS Hiscores API
      const response = await fetch(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        console.log(`Hiscores API returned ${response.status} for player ${username}`);
        return null;
      }
      
      const data = await response.text();
      const lines = data.trim().split('\n');
      
      if (lines.length < 24) {
        console.log('Invalid hiscores data format');
        return null;
      }
      
      // Parse overall stats (first line: rank,level,xp)
      const overallStats = lines[0].split(',');
      const totalLevel = parseInt(overallStats[1]) || 0;
      
      // Calculate combat level from individual skills
      const attack = parseInt(lines[1].split(',')[1]) || 1;
      const defence = parseInt(lines[2].split(',')[1]) || 1;
      const strength = parseInt(lines[3].split(',')[1]) || 1;
      const hitpoints = parseInt(lines[4].split(',')[1]) || 10;
      const ranged = parseInt(lines[5].split(',')[1]) || 1;
      const prayer = parseInt(lines[6].split(',')[1]) || 1;
      const magic = parseInt(lines[7].split(',')[1]) || 1;
      
      const combatLevel = Math.floor(
        (defence + hitpoints + Math.floor(prayer / 2)) * 0.25 +
        Math.max(attack + strength, Math.max(magic * 1.5, ranged * 1.5)) * 0.325
      );
      
      // Determine account type (simplified logic)
      let accountType: PlayerStats['account_type'] = 'regular';
      if (username.toLowerCase().includes('fe ') || username.toLowerCase().endsWith(' fe')) {
        accountType = 'ironman';
      } else if (username.toLowerCase().includes('hc ') || username.toLowerCase().includes('hardcore')) {
        accountType = 'hardcore';
      } else if (username.toLowerCase().includes('uim') || username.toLowerCase().includes('ultimate')) {
        accountType = 'ultimate';
      }
      
      return {
        name: username,
        combat_level: combatLevel,
        total_level: totalLevel,
        account_type: accountType
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  }

  // Popular items
  async fetchPopularItems(): Promise<OSRSItem[]> {
    console.log('Fetching popular items...');
    
    const popularItemNames = [
      'Twisted bow', 'Scythe of vitur', 'Dragon claws', 'Bandos chestplate',
      'Armadyl chestplate', 'Primordial boots', 'Avernic defender',
      'Prayer scroll (rigour)', 'Old school bond', 'Shark'
    ];
    
    const items: OSRSItem[] = [];
    
    for (const itemName of popularItemNames) {
      const itemId = getItemIdByName(itemName);
      if (itemId) {
        try {
          const priceData = await this.fetchSingleItemPrice(itemId);
          items.push({
            id: itemId,
            name: itemName,
            current_price: priceData?.high || 0,
            icon: getItemIcon(itemName),
            today_trend: 'neutral'
          });
        } catch (error) {
          console.log(`Error fetching price for ${itemName}:`, error);
          items.push({
            id: itemId,
            name: itemName,
            current_price: 0,
            icon: getItemIcon(itemName),
            today_trend: 'neutral'
          });
        }
      }
    }
    
    return items;
  }

  // Default money makers
  getDefaultMoneyMakers(): MoneyMakingGuide[] {
    return [
      {
        name: "Vorkath",
        profit: 4500000,
        difficulty: 4,
        requirements: ["83+ Ranged", "Dragon Slayer II", "Elite Void"],
        description: "Kill Vorkath for consistent profit from drops and alchables",
        category: "bossing",
        membership: "p2p"
      },
      {
        name: "Zulrah",
        profit: 3800000,
        difficulty: 4,
        requirements: ["80+ Magic/Ranged", "Regicide quest"],
        description: "Kill Zulrah for rare drops and consistent profit",
        category: "bossing",
        membership: "p2p"
      },
      {
        name: "Theatre of Blood",
        profit: 8000000,
        difficulty: 5,
        requirements: ["90+ Combat stats", "Team", "High-end gear"],
        description: "Complete ToB raids for high-value unique drops",
        category: "bossing",
        membership: "p2p"
      },
      {
        name: "Chambers of Xeric",
        profit: 6500000,
        difficulty: 4,
        requirements: ["80+ Combat stats", "Team recommended"],
        description: "Complete CoX raids for valuable unique rewards",
        category: "bossing",
        membership: "p2p"
      },
      {
        name: "Runecrafting (Double Natures)",
        profit: 1200000,
        difficulty: 2,
        requirements: ["91 Runecrafting", "Lunar Diplomacy"],
        description: "Craft nature runes through the Abyss with pouches",
        category: "skilling",
        membership: "p2p"
      },
      {
        name: "Blast Furnace (Gold bars)",
        profit: 1000000,
        difficulty: 2,
        requirements: ["40 Smithing", "Ice gloves", "Stamina potions"],
        description: "Smelt gold bars at Blast Furnace for fast profit",
        category: "skilling",
        membership: "p2p"
      },
      {
        name: "Hunter (Red Chinchompas)",
        profit: 1500000,
        difficulty: 2,
        requirements: ["63 Hunter", "Western Provinces Diary"],
        description: "Catch red chinchompas in the Feldip Hills",
        category: "skilling",
        membership: "p2p"
      },
      {
        name: "High Alchemy",
        profit: 200000,
        difficulty: 1,
        requirements: ["55 Magic", "High Level Alchemy"],
        description: "Alch profitable items while training magic",
        category: "skilling",
        membership: "f2p"
      }
    ];
  }

  // Bank CSV parsing
  parseBankCSV(csvData: string): Array<{name: string; quantity: number; value: number}> {
    console.log('Parsing bank CSV data...');
    
    const lines = csvData.trim().split('\n');
    const items: Array<{name: string; quantity: number; value: number}> = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('Item') || line.startsWith('Name')) continue;
      
      // Try different CSV formats
      const parts = line.split(',');
      
      if (parts.length >= 3) {
        const name = parts[0].replace(/['"]/g, '').trim();
        const quantity = parseInt(parts[1]) || 0;
        const value = parseInt(parts[2]) || 0;
        
        if (name && quantity > 0) {
          items.push({ name, quantity, value });
        }
      }
    }
    
    console.log(`Parsed ${items.length} items from CSV`);
    return items;
  }

  // Utility methods
  getItemIdByName(itemName: string): number | undefined {
    return getItemIdByName(itemName);
  }

  getItemIcon(itemName: string): string {
    return getItemIcon(itemName);
  }

  private formatGP(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  }
}

// Export singleton instance
export const osrsApi = new OSRSApi();

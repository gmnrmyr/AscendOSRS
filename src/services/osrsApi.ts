import { OSRSItem, MoneyMakingGuide, PlayerStats } from "@/types";

const API_BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const WIKI_API_BASE_URL = 'https://oldschool.runescape.wiki/api.php';
const TEMPLE_OSRS_API = 'https://templeosrs.com/api/player_stats.php';
const GE_API_BASE = 'https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json';

export const osrsApi = {
  fetchPlayerStats: async (playerName: string): Promise<PlayerStats | null> => {
    try {
      // Try TempleOSRS first for more reliable data
      const templeResponse = await fetch(`${TEMPLE_OSRS_API}?player=${encodeURIComponent(playerName)}`);
      if (templeResponse.ok) {
        const data = await templeResponse.json();
        if (data && data.data) {
          return {
            combat_level: data.data.combat_level || 3,
            total_level: data.data.total_level || 32,
            account_type: data.data.account_type || 'main',
            username: playerName
          };
        }
      }

      // Fallback to official hiscores
      const response = await fetch(`https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${playerName}`);
      if (!response.ok) {
        console.error('Failed to fetch player stats:', response.status, response.statusText);
        return null;
      }

      const text = await response.text();
      const lines = text.split('\n');
      if (lines.length < 3) {
        console.error('Invalid hiscore format for player:', playerName);
        return null;
      }

      const combatLevelLine = lines[0];
      const totalLevelLine = lines[1];

      const combatLevel = parseInt(combatLevelLine.split(',')[1]) || 3;
      const totalLevel = parseInt(totalLevelLine.split(',')[1]) || 32;

      return {
        combat_level: combatLevel,
        total_level: totalLevel,
        account_type: 'main',
        username: playerName
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  getEstimatedItemValue: async (itemName: string): Promise<number | null> => {
    try {
      // Try Wiki prices API first
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        console.error('Failed to fetch item prices:', response.status, response.statusText);
        return null;
      }
      const data = await response.json();

      // Search through the data for matching item name
      for (const [itemId, itemData] of Object.entries(data.data)) {
        if (itemData && typeof itemData === 'object' && 'high' in itemData) {
          // We'd need to match by name here - this is a limitation without item mapping
          // For now, return a reasonable default if we can't find the exact item
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching item value:', error);
      return null;
    }
  },

  fetchSingleItemPrice: async (itemId: string | number): Promise<number | null> => {
    try {
      const numericId = typeof itemId === 'string' ? parseInt(itemId) : itemId;
      if (isNaN(numericId)) return null;

      // Try Wiki prices API
      const response = await fetch(API_BASE_URL);
      if (!response.ok) return null;
      
      const data = await response.json();
      const itemData = data.data?.[numericId.toString()];
      
      if (itemData && itemData.high) {
        return itemData.high;
      }

      // Fallback to GE API
      const geResponse = await fetch(`${GE_API_BASE}?item=${numericId}`);
      if (geResponse.ok) {
        const geData = await geResponse.json();
        if (geData && geData.item && geData.item.current && geData.item.current.price) {
          // Parse price string (e.g., "1.2m" to 1200000)
          const priceStr = geData.item.current.price.replace(/,/g, '');
          if (priceStr.includes('k')) {
            return parseFloat(priceStr) * 1000;
          } else if (priceStr.includes('m')) {
            return parseFloat(priceStr) * 1000000;
          } else if (priceStr.includes('b')) {
            return parseFloat(priceStr) * 1000000000;
          }
          return parseInt(priceStr) || null;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching single item price:', error);
      return null;
    }
  },

  getItemIcon: async (itemId: string | number): Promise<string | null> => {
    try {
      const numericId = typeof itemId === 'string' ? parseInt(itemId) : itemId;
      if (isNaN(numericId)) return null;
      
      // Use OSRS Wiki item icon URL format
      return `https://oldschool.runescape.wiki/images/thumb/${numericId}.png/32px-${numericId}.png`;
    } catch (error) {
      console.error('Error getting item icon:', error);
      return null;
    }
  },

  getItemIdByName: async (itemName: string): Promise<number | null> => {
    try {
      // Search Wiki API for item
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: itemName,
        srlimit: '1',
      });

      const response = await fetch(`${WIKI_API_BASE_URL}?${params.toString()}`);
      if (!response.ok) return null;
      
      const data = await response.json();
      if (data.query && data.query.search && data.query.search.length > 0) {
        return data.query.search[0].pageid;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting item ID by name:', error);
      return null;
    }
  },

  getItemDetails: async (itemName: string): Promise<OSRSItem> => {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      titles: itemName,
      prop: 'pageimages|extracts',
      piprop: 'original',
      exintro: 'true',
      explaintext: 'true',
    });

    const url = `${WIKI_API_BASE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const pageId = Object.keys(data.query?.pages || {})[0];
      const page = data.query?.pages?.[pageId];

      if (!page || page.missing !== undefined) {
        throw new Error(`Item "${itemName}" not found on the OSRS Wiki.`);
      }

      // Try to get current price with proper null checks
      const currentPrice = page ? await this.fetchSingleItemPrice(page.pageid || 0) || 0 : 0;

      return {
        pageId: page?.pageid || 0,
        title: page?.title || itemName,
        imageUrl: page?.original?.source || null,
        extract: page?.extract || null,
        id: page?.pageid || 0,
        name: page?.title || itemName,
        current_price: currentPrice,
        icon: page?.original?.source || (page ? await this.getItemIcon(page.pageid || 0) : null)
      };
    } catch (error) {
      console.error('Error fetching item details from OSRS Wiki:', error);
      throw error;
    }
  },

  searchItems: async (query: string): Promise<OSRSItem[]> => {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'search',
      srsearch: query,
      srlimit: '10',
    });

    const url = `${WIKI_API_BASE_URL}?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      const items = await Promise.all(
        (data.query?.search || []).map(async (item: any) => {
          if (!item) {
            return null;
          }
          
          const currentPrice = await this.fetchSingleItemPrice(item.pageid || 0) || 0;
          const icon = await this.getItemIcon(item.pageid || 0);
          
          return {
            pageId: item.pageid || 0,
            title: item.title || '',
            imageUrl: icon,
            extract: null,
            id: item.pageid || 0,
            name: item.title || '',
            current_price: currentPrice,
            icon: icon
          };
        })
      );
      
      // Filter out any null items
      return items.filter(item => item !== null);
    } catch (error) {
      console.error('Error searching items on OSRS Wiki:', error);
      return [];
    }
  },

  getMoneyMakingMethods: async (query?: string): Promise<MoneyMakingGuide[]> => {
    const moneyMakers = osrsApi.getDefaultMoneyMakers();
    if (!query) {
      return moneyMakers;
    }
    const lowerQuery = query.toLowerCase();
    return moneyMakers.filter(method =>
      method.name.toLowerCase().includes(lowerQuery) ||
      method.category.toLowerCase().includes(lowerQuery)
    );
  },

  searchMoneyMakers: async (query: string): Promise<MoneyMakingGuide[]> => {
    return osrsApi.getMoneyMakingMethods(query);
  },

  getDefaultMoneyMakers: (): MoneyMakingGuide[] => {
    return [
      {
        id: "vorkath",
        name: "Vorkath",
        category: "bossing" as const,
        gpHour: 4000000,
        clickIntensity: 4 as const,
        requirements: "Dragon Slayer II, high combat stats, good gear",
        notes: "Consistent high-level boss with good drops",
        profit: 4000000,
        difficulty: "High",
        description: "Consistent high-level boss with good drops",
        membership: "p2p"
      },
      {
        id: "zulrah",
        name: "Zulrah",
        category: "bossing" as const,
        gpHour: 3500000,
        clickIntensity: 5 as const,
        requirements: "Regicide quest, high magic/ranged, good gear",
        notes: "Requires memorizing rotations but very profitable",
        profit: 3500000,
        difficulty: "Very High",
        description: "Requires memorizing rotations but very profitable",
        membership: "p2p"
      },
      {
        id: "brutal-black-dragons",
        name: "Brutal Black Dragons",
        category: "combat" as const,
        gpHour: 1000000,
        clickIntensity: 3 as const,
        requirements: "High ranged level, good ranged gear",
        notes: "Very consistent money maker",
        profit: 1000000,
        difficulty: "Medium",
        description: "Very consistent money maker",
        membership: "p2p"
      },
      {
        id: "rune-dragons",
        name: "Rune Dragons",
        category: "combat" as const,
        gpHour: 1200000,
        clickIntensity: 4 as const,
        requirements: "Dragon Slayer II, high stats, good gear",
        notes: "Higher intensity but better gp/hr than brutal blacks",
        profit: 1200000,
        difficulty: "High",
        description: "Higher intensity but better gp/hr than brutal blacks",
        membership: "p2p"
      },
      {
        id: "gargoyles",
        name: "Gargoyles",
        category: "combat" as const,
        gpHour: 567000,
        clickIntensity: 3 as const,
        requirements: "75 Slayer, rock hammer or gargoyle smash",
        notes: "Good slayer task money, very afk",
        profit: 567000,
        difficulty: "Medium",
        description: "Good slayer task money, very afk",
        membership: "p2p"
      },
      {
        id: "kurasks",
        name: "Kurasks",
        category: "combat" as const,
        gpHour: 400000,
        clickIntensity: 2 as const,
        requirements: "70 Slayer, leaf-bladed weapons",
        notes: "Very afk slayer task",
        profit: 400000,
        difficulty: "Low",
        description: "Very afk slayer task",
        membership: "p2p"
      },
      {
        id: "cannonballs",
        name: "Cannonballs",
        category: "skilling" as const,
        gpHour: 150000,
        clickIntensity: 1 as const,
        requirements: "Dwarf Cannon quest, 35 Smithing",
        notes: "Very AFK money making method",
        profit: 150000,
        difficulty: "Very Low",
        description: "Very AFK money making method",
        membership: "p2p"
      },
      {
        id: "blast-furnace-gold",
        name: "Blast Furnace Gold Bars",
        category: "skilling" as const,
        gpHour: 800000,
        clickIntensity: 3 as const,
        requirements: "40 Smithing, goldsmith gauntlets recommended",
        notes: "Good smithing xp and profit",
        profit: 800000,
        difficulty: "Medium",
        description: "Good smithing xp and profit",
        membership: "p2p"
      },
      {
        id: "runecrafting-natures",
        name: "Nature Runes via Abyss",
        category: "skilling" as const,
        gpHour: 1500000,
        clickIntensity: 4 as const,
        requirements: "44 Runecrafting, Enter the Abyss miniquest",
        notes: "High profit but requires attention",
        profit: 1500000,
        difficulty: "High",
        description: "High profit but requires attention",
        membership: "p2p"
      },
      {
        id: "herb-runs",
        name: "Herb Runs (Ranarr)",
        category: "skilling" as const,
        gpHour: 2000000,
        clickIntensity: 3 as const,
        requirements: "32 Farming, access to herb patches",
        notes: "Hourly runs, very profitable over time",
        profit: 2000000,
        difficulty: "Medium",
        description: "Hourly runs, very profitable over time",
        membership: "p2p"
      }
    ];
  },

  fetchPopularItems: async (): Promise<OSRSItem[]> => {
    // Return some popular OSRS items
    const popularItems = [
      'Twisted bow', 'Scythe of vitur', 'Dragon claws', 'Abyssal whip',
      'Bandos chestplate', 'Armadyl crossbow', 'Primordial boots', 'Dragon hunter lance'
    ];

    const items: OSRSItem[] = [];
    for (const itemName of popularItems) {
      try {
        const item = await osrsApi.getItemDetails(itemName);
        items.push(item);
      } catch (error) {
        console.error(`Failed to fetch ${itemName}:`, error);
      }
    }
    return items;
  },

  parseBankCSV: async (csvText: string): Promise<Array<{ name: string; quantity: number; value: number }>> => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const nameIndex = headers.indexOf('name') || headers.indexOf('item');
    const quantityIndex = headers.indexOf('quantity') || headers.indexOf('qty');
    const valueIndex = headers.indexOf('value') || headers.indexOf('price');

    if (nameIndex === -1 || quantityIndex === -1) {
      throw new Error('CSV must have name and quantity columns');
    }

    const items = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 2) {
        const name = values[nameIndex] || '';
        const quantity = parseInt(values[quantityIndex]) || 0;
        const value = valueIndex !== -1 ? parseInt(values[valueIndex]) || 0 : 0;

        if (name && quantity > 0) {
          items.push({ name, quantity, value });
        }
      }
    }

    return items;
  }
};

export type { OSRSItem, MoneyMakingGuide, PlayerStats };

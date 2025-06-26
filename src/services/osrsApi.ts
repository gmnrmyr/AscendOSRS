
import { OSRSItem, MoneyMakingGuide, PlayerStats } from "@/types";

const API_BASE_URL = 'https://rsbuddy.com/exchange/summary.json';
const WIKI_API_BASE_URL = 'https://oldschool.runescape.wiki/api.php';
const TEMPLE_OSRS_API = 'https://templeosrs.com/api/player_stats.php';

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
      const accountTypeLine = lines[2];

      const combatLevel = parseInt(combatLevelLine.split(',')[0]);
      const totalLevel = parseInt(totalLevelLine.split(',')[0]);
      const accountType = accountTypeLine.split(',')[0];

      return {
        combat_level: combatLevel,
        total_level: totalLevel,
        account_type: accountType,
        username: playerName
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  getEstimatedItemValue: async (itemName: string): Promise<number | null> => {
    try {
      const response = await fetch(API_BASE_URL);
      if (!response.ok) {
        console.error('Failed to fetch item summaries:', response.status, response.statusText);
        return null;
      }
      const data = await response.json();

      const item = Object.values(data).find((item: any) =>
        item && item.name && item.name.toLowerCase() === itemName.toLowerCase()
      ) as any;

      if (item && item.overall_average) {
        return item.overall_average;
      } else {
        console.warn(`Item "${itemName}" not found in OSRS Exchange.`);
        return null;
      }
    } catch (error) {
      console.error('Error fetching item value:', error);
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
      const pageId = Object.keys(data.query.pages)[0];
      const page = data.query.pages[pageId];

      if (page.missing !== undefined) {
        throw new Error(`Item "${itemName}" not found on the OSRS Wiki.`);
      }

      return {
        pageId: page.pageid,
        title: page.title,
        imageUrl: page?.original?.source || null,
        extract: page.extract,
        id: page.pageid,
        name: page.title,
        current_price: 0,
        icon: page?.original?.source || null
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
      return data.query.search.map((item: any) => ({
        pageId: item.pageid,
        title: item.title,
        imageUrl: null,
        extract: null,
        id: item.pageid,
        name: item.title,
        current_price: 0,
        icon: null
      }));
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

  fetchSingleItemPrice: async (itemId: string | number): Promise<number | null> => {
    const itemName = typeof itemId === 'number' ? itemId.toString() : itemId;
    return osrsApi.getEstimatedItemValue(itemName);
  },

  getItemIcon: async (itemId: string | number): Promise<string | null> => {
    try {
      const itemName = typeof itemId === 'number' ? itemId.toString() : itemId;
      const item = await osrsApi.getItemDetails(itemName);
      return item.imageUrl;
    } catch (error) {
      console.error('Error getting item icon:', error);
      return null;
    }
  },

  getItemIdByName: async (itemName: string): Promise<number | null> => {
    try {
      const item = await osrsApi.getItemDetails(itemName);
      return item.pageId;
    } catch (error) {
      console.error('Error getting item ID:', error);
      return null;
    }
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

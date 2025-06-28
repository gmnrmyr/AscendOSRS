import { OSRSItem, MoneyMakingGuide, PlayerStats } from "@/types";

const API_BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const WIKI_API_BASE_URL = 'https://oldschool.runescape.wiki/api.php';
const TEMPLE_OSRS_API = 'https://templeosrs.com/api/player_stats.php';
const GE_API_BASE = 'https://secure.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json';

export const osrsApi = {
  fetchPlayerStats: async (playerName: string): Promise<PlayerStats | null> => {
    console.log(`Fetching stats for player: ${playerName}`);
    
    try {
      // Try TempleOSRS first for most reliable data
      console.log('Trying TempleOSRS API...');
      const templeUrl = `${TEMPLE_OSRS_API}?player=${encodeURIComponent(playerName)}`;
      const templeResponse = await fetch(templeUrl);
      
      if (templeResponse.ok) {
        const templeData = await templeResponse.json();
        console.log('TempleOSRS response:', templeData);
        
        if (templeData && templeData.data && !templeData.error) {
          const stats = {
            combat_level: templeData.data.Combat_level || templeData.data.combat_level || 3,
            total_level: templeData.data.Overall || templeData.data.total_level || 32,
            account_type: templeData.data.Game_mode || 'main',
            username: playerName
          };
          console.log('Successfully fetched from TempleOSRS:', stats);
          return stats;
        }
      }

      // Fallback to official hiscores
      console.log('Trying official OSRS hiscores...');
      const hiscoreUrl = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodeURIComponent(playerName)}`;
      const hiscoreResponse = await fetch(hiscoreUrl);
      
      if (!hiscoreResponse.ok) {
        console.error('Hiscore API failed:', hiscoreResponse.status, hiscoreResponse.statusText);
        return null;
      }

      const text = await hiscoreResponse.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 8) {
        console.error('Invalid hiscore format for player:', playerName);
        return null;
      }

      // Parse overall stats (first line is overall)
      const overallStats = lines[0].split(',');
      const totalLevel = parseInt(overallStats[1]) || 32;
      
      // Parse individual combat stats for combat level calculation
      const attackLevel = parseInt(lines[1].split(',')[1]) || 1;
      const defenceLevel = parseInt(lines[2].split(',')[1]) || 1;
      const strengthLevel = parseInt(lines[3].split(',')[1]) || 1;
      const hitpointsLevel = parseInt(lines[4].split(',')[1]) || 10;
      const rangedLevel = parseInt(lines[5].split(',')[1]) || 1;
      const prayerLevel = parseInt(lines[6].split(',')[1]) || 1;
      const magicLevel = parseInt(lines[7].split(',')[1]) || 1;

      // Calculate combat level using OSRS formula
      const baseCombat = (attackLevel + strengthLevel) * 0.325;
      const defenceCombat = defenceLevel * 0.325;
      const hitpointsCombat = hitpointsLevel * 0.25;
      const prayerCombat = Math.floor(prayerLevel / 2) * 0.25;
      const rangedCombat = rangedLevel * 0.325;
      const magicCombat = magicLevel * 0.325;
      
      const meleeCombat = baseCombat + defenceCombat + hitpointsCombat + prayerCombat;
      const rangedCombatTotal = rangedCombat + defenceCombat + hitpointsCombat + prayerCombat;
      const magicCombatTotal = magicCombat + defenceCombat + hitpointsCombat + prayerCombat;
      
      const combatLevel = Math.floor(Math.max(meleeCombat, rangedCombatTotal, magicCombatTotal)) + 1;

      const stats = {
        combat_level: Math.min(126, Math.max(3, combatLevel)),
        total_level: totalLevel,
        account_type: 'main',
        username: playerName
      };
      
      console.log('Successfully parsed from hiscores:', stats);
      return stats;
      
    } catch (error) {
      console.error('Error fetching player stats:', error);
      return null;
    }
  },

  searchOSRSItems: async (query: string): Promise<any[]> => {
    console.log(`Searching OSRS items for: ${query}`);
    
    try {
      if (!query || query.length < 2) return [];

      // Search Wiki for items with better filtering
      const params = new URLSearchParams({
        action: 'opensearch',
        search: query,
        limit: '10',
        namespace: '0',
        format: 'json'
      });

      const response = await fetch(`${WIKI_API_BASE_URL}?${params.toString()}`);
      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length < 2) {
        console.log('No search results from Wiki API');
        return [];
      }

      const [, titles, , urls] = data;
      const items = [];

      for (let i = 0; i < Math.min(titles.length, 10); i++) {
        const title = titles[i];
        
        // Filter out non-item pages more effectively
        if (!title || 
            title.includes('Quest') || 
            title.includes('Guide') || 
            title.includes('Update') || 
            title.includes('Category') ||
            title.includes('Template') || 
            title.includes('User:') ||
            title.includes('Talk:') ||
            title.includes('File:') ||
            title.includes('List of') ||
            title.includes('History of')) {
          continue;
        }
        
        try {
          // Get item ID from wiki page
          const itemId = await osrsApi.getItemIdByName(title);
          let currentPrice = 0;
          let itemIcon = null;
          
          if (itemId) {
            currentPrice = await osrsApi.fetchSingleItemPrice(itemId) || 0;
            itemIcon = `https://oldschool.runescape.wiki/images/thumb/${itemId}.png/32px-${itemId}.png`;
          }
          
          items.push({
            id: itemId || Date.now() + i,
            name: title,
            subtitle: currentPrice > 0 ? `${currentPrice.toLocaleString()} GP` : 'OSRS Item',
            icon: itemIcon || '',
            value: currentPrice,
            category: 'item'
          });
        } catch (error) {
          console.error(`Error processing item ${title}:`, error);
          // Still include the item even if price/icon fails
          items.push({
            id: Date.now() + i,
            name: title,
            subtitle: 'OSRS Item',
            icon: '',
            value: 0,
            category: 'item'
          });
        }
      }

      console.log(`Found ${items.length} OSRS items`);
      return items;
    } catch (error) {
      console.error('Error searching OSRS items:', error);
      return [];
    }
  },

  fetchMoneyMakingMethods: async (query?: string): Promise<MoneyMakingGuide[]> => {
    console.log(`Fetching money making methods, query: ${query}`);
    
    try {
      // Get local methods first
      const localMethods = osrsApi.getDefaultMoneyMakers();
      
      // Try to fetch from OSRS Wiki money making guide
      const wikiMethods = await osrsApi.fetchWikiMoneyMethods();
      
      // Combine and filter
      const allMethods = [...localMethods, ...wikiMethods];
      
      if (!query) {
        return allMethods;
      }

      const lowerQuery = query.toLowerCase();
      return allMethods.filter(method =>
        method.name.toLowerCase().includes(lowerQuery) ||
        method.category.toLowerCase().includes(lowerQuery) ||
        method.description?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('Error fetching money making methods:', error);
      return osrsApi.getDefaultMoneyMakers();
    }
  },

  fetchWikiMoneyMethods: async (): Promise<MoneyMakingGuide[]> => {
    try {
      console.log('Fetching money making methods from OSRS Wiki...');
      
      // Search for money making guide pages
      const searchParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: 'money making guide',
        srlimit: '20',
        srnamespace: '0'
      });

      const searchResponse = await fetch(`${WIKI_API_BASE_URL}?${searchParams.toString()}`);
      const searchData = await searchResponse.json();
      
      if (!searchData.query?.search) {
        return [];
      }

      const methods: MoneyMakingGuide[] = [];
      
      for (const page of searchData.query.search.slice(0, 10)) {
        if (page.title && 
            page.title.includes('Money making guide') && 
            !page.title.includes('Free-to-play')) {
          
          const methodName = page.title.replace('Money making guide/', '').replace('Money making guide', '').trim();
          if (methodName && methodName.length > 0) {
            methods.push({
              id: `wiki-${page.pageid}`,
              name: methodName,
              category: 'other' as const,
              gpHour: 500000, // Default estimate
              clickIntensity: 3 as const,
              requirements: 'See OSRS Wiki for details',
              notes: `From OSRS Wiki: ${page.title}`,
              profit: 500000,
              difficulty: 'Medium',
              description: page.snippet?.replace(/<[^>]*>/g, '') || methodName,
              membership: 'p2p'
            });
          }
        }
      }
      
      console.log(`Fetched ${methods.length} methods from Wiki`);
      return methods;
    } catch (error) {
      console.error('Error fetching Wiki money methods:', error);
      return [];
    }
  },

  fetchSingleItemPrice: async (itemId: string | number): Promise<number | null> => {
    try {
      const numericId = typeof itemId === 'string' ? parseInt(itemId) : itemId;
      if (isNaN(numericId)) return null;

      console.log(`Fetching price for item ID: ${numericId}`);

      // Try Wiki prices API first
      const response = await fetch(API_BASE_URL);
      if (response.ok) {
        const data = await response.json();
        const itemData = data.data?.[numericId.toString()];
        
        if (itemData && (itemData.high || itemData.low)) {
          const price = itemData.high || itemData.low;
          console.log(`Found price from Wiki API: ${price}`);
          return price;
        }
      }

      // Fallback to GE API
      try {
        const geResponse = await fetch(`${GE_API_BASE}?item=${numericId}`);
        if (geResponse.ok) {
          const geData = await geResponse.json();
          if (geData?.item?.current?.price) {
            const priceStr = geData.item.current.price.replace(/,/g, '');
            let price = 0;
            
            if (priceStr.includes('k')) {
              price = parseFloat(priceStr) * 1000;
            } else if (priceStr.includes('m')) {
              price = parseFloat(priceStr) * 1000000;
            } else if (priceStr.includes('b')) {
              price = parseFloat(priceStr) * 1000000000;
            } else {
              price = parseInt(priceStr) || 0;
            }
            
            if (price > 0) {
              console.log(`Found price from GE API: ${price}`);
              return price;
            }
          }
        }
      } catch (geError) {
        console.error('GE API error:', geError);
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
      
      return `https://oldschool.runescape.wiki/images/thumb/${numericId}.png/32px-${numericId}.png`;
    } catch (error) {
      console.error('Error getting item icon:', error);
      return null;
    }
  },

  getItemIdByName: async (itemName: string): Promise<number | null> => {
    try {
      // Search Wiki API for item page ID
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: itemName,
        prop: 'info'
      });

      const response = await fetch(`${WIKI_API_BASE_URL}?${params.toString()}`);
      const data = await response.json();
      
      if (data.query?.pages) {
        const pages = Object.values(data.query.pages) as any[];
        const page = pages[0];
        if (page && !page.missing && page.pageid) {
          return page.pageid;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting item ID by name:', error);
      return null;
    }
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
        id: "tob",
        name: "Theatre of Blood",
        category: "bossing" as const,
        gpHour: 6000000,
        clickIntensity: 5 as const,
        requirements: "Very high combat stats, team coordination, expensive gear",
        notes: "Highest tier PvM content, requires experienced team",
        profit: 6000000,
        difficulty: "Very High",
        description: "Highest tier PvM content with best rewards",
        membership: "p2p"
      },
      {
        id: "cox",
        name: "Chambers of Xeric (Raids)",
        category: "bossing" as const,
        gpHour: 4500000,
        clickIntensity: 5 as const,
        requirements: "High combat stats, raid experience, good gear",
        notes: "Raid content with valuable unique drops",
        profit: 4500000,
        difficulty: "Very High",
        description: "First raid in OSRS with unique rewards",
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

  getEstimatedItemValue: async (itemName: string): Promise<number | null> => {
    try {
      const itemId = await osrsApi.getItemIdByName(itemName);
      if (itemId) {
        return await osrsApi.fetchSingleItemPrice(itemId);
      }
      return null;
    } catch (error) {
      console.error('Error getting estimated item value:', error);
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

      const pageIdValue = (page && typeof page.pageid === 'number') ? page.pageid : 0;
      let currentPrice = 0;
      let iconUrl = null;
      
      if (pageIdValue > 0) {
        currentPrice = (await osrsApi.fetchSingleItemPrice(pageIdValue)) || 0;
        iconUrl = (await osrsApi.getItemIcon(pageIdValue)) || null;
      }

      return {
        pageId: pageIdValue,
        title: (page && typeof page.title === 'string') ? page.title : itemName,
        imageUrl: (page && page.original && typeof page.original.source === 'string') ? page.original.source : null,
        extract: (page && typeof page.extract === 'string') ? page.extract : null,
        id: pageIdValue,
        name: (page && typeof page.title === 'string') ? page.title : itemName,
        current_price: currentPrice,
        icon: (page && page.original && typeof page.original.source === 'string') ? page.original.source : iconUrl
      };
    } catch (error) {
      console.error('Error fetching item details from OSRS Wiki:', error);
      throw error;
    }
  },

  searchItems: async (query: string): Promise<OSRSItem[]> => {
    try {
      return await osrsApi.searchOSRSItems(query);
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  },

  getMoneyMakingMethods: async (query?: string): Promise<MoneyMakingGuide[]> => {
    return osrsApi.fetchMoneyMakingMethods(query);
  },

  searchMoneyMakers: async (query: string): Promise<MoneyMakingGuide[]> => {
    return osrsApi.getMoneyMakingMethods(query);
  },

  fetchPopularItems: async (): Promise<OSRSItem[]> => {
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

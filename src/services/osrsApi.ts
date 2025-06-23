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
  skill: string;
  requirements: string[];
  description: string;
  category: 'combat' | 'skilling' | 'bossing' | 'other';
  difficulty: 1 | 2 | 3 | 4 | 5;
  membership: 'f2p' | 'p2p';
}

export interface PlayerStats {
  total: number;
  attack: number;
  defence: number;
  strength: number;
  hitpoints: number;
  ranged: number;
  prayer: number;
  magic: number;
  cooking: number;
  woodcutting: number;
  fletching: number;
  fishing: number;
  firemaking: number;
  crafting: number;
  smithing: number;
  mining: number;
  herblore: number;
  agility: number;
  thieving: number;
  slayer: number;
  farming: number;
  runecraft: number;
  hunter: number;
  construction: number;
  combat_level: number;
  total_level: number;
  account_type: 'regular' | 'ironman' | 'hardcore' | 'ultimate';
  name: string;
}

const ITEMS_DB = [
  { id: 995, name: "Coins", icon: "", value: 1 },
  { id: 13204, name: "Platinum token", icon: "", value: 1000 },
  // ... more items would be here in a real implementation
];

const MONEY_MAKERS: MoneyMakingGuide[] = [
  {
    id: "fishing-sharks",
    name: "Fishing Sharks",
    profit: 180000,
    skill: "Fishing",
    requirements: ["75 Fishing"],
    description: "Fish sharks at fishing guild",
    category: "skilling",
    difficulty: 2,
    membership: "p2p"
  },
  {
    id: "runecrafting-nature",
    name: "Nature Rune Crafting",
    profit: 500000,
    skill: "Runecrafting",
    requirements: ["44 Runecrafting"],
    description: "Craft nature runes through abyss",
    category: "skilling",
    difficulty: 4,
    membership: "p2p"
  }
];

export const osrsApi = {
  async getItemPrice(itemName: string): Promise<number> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (itemName.toLowerCase().includes('coin')) return 1;
    if (itemName.toLowerCase().includes('platinum')) return 1000;
    
    return Math.floor(Math.random() * 10000) + 100;
  },

  async getMultipleItemPrices(itemNames: string[]): Promise<{ [itemName: string]: number }> {
    const prices: { [itemName: string]: number } = {};
    
    for (const itemName of itemNames) {
      prices[itemName] = await this.getItemPrice(itemName);
    }
    
    return prices;
  },

  parseBankCSV(csvText: string): Array<{name: string; quantity: number; value: number}> {
    try {
      // Try to parse as JSON first (Data Exporter format)
      const jsonData = JSON.parse(csvText);
      if (Array.isArray(jsonData)) {
        return jsonData.map(item => ({
          name: item.name,
          quantity: item.quantity,
          value: this.getEstimatedItemValue(item.name) * item.quantity
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
  },

  getEstimatedItemValue(itemName: string): number {
    if (itemName.toLowerCase().includes('coin')) return 1;
    if (itemName.toLowerCase().includes('platinum')) return 1000;
    return Math.floor(Math.random() * 1000) + 50;
  },

  async fetchPlayerStats(username: string): Promise<PlayerStats | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      total: 1500,
      attack: 80,
      defence: 75,
      strength: 85,
      hitpoints: 82,
      ranged: 78,
      prayer: 70,
      magic: 76,
      cooking: 85,
      woodcutting: 90,
      fletching: 75,
      fishing: 88,
      firemaking: 80,
      crafting: 72,
      smithing: 70,
      mining: 85,
      herblore: 68,
      agility: 75,
      thieving: 70,
      slayer: 82,
      farming: 78,
      runecraft: 65,
      hunter: 70,
      construction: 75,
      combat_level: 126,
      total_level: 1500,
      account_type: 'regular',
      name: username
    };
  },

  async fetchPopularItems(): Promise<OSRSItem[]> {
    return ITEMS_DB.slice(0, 10).map(item => ({
      ...item,
      high: item.value * 1.1,
      low: item.value * 0.9,
      current_price: item.value,
      today_trend: Math.random() > 0.5 ? 'positive' : 'negative'
    }));
  },

  async searchItems(query: string): Promise<OSRSItem[]> {
    const filtered = ITEMS_DB.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    
    return filtered.slice(0, 20).map(item => ({
      ...item,
      high: item.value * 1.1,
      low: item.value * 0.9,
      current_price: item.value,
      today_trend: Math.random() > 0.5 ? 'positive' : 'negative'
    }));
  },

  async searchMoneyMakers(query: string): Promise<MoneyMakingGuide[]> {
    return MONEY_MAKERS.filter(method =>
      method.name.toLowerCase().includes(query.toLowerCase()) ||
      method.skill.toLowerCase().includes(query.toLowerCase())
    );
  },

  async getDefaultMoneyMakers(): Promise<MoneyMakingGuide[]> {
    return MONEY_MAKERS;
  },

  getItemIdByName(itemName: string): number {
    const item = ITEMS_DB.find(item => 
      item.name.toLowerCase() === itemName.toLowerCase()
    );
    return item?.id || 995;
  },

  async fetchSingleItemPrice(itemId: number): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return Math.floor(Math.random() * 10000) + 100;
  },

  getItemIcon(itemId: number): string {
    return `https://oldschool.runescape.wiki/images/thumb/archive/${itemId}.png`;
  }
};

export default osrsApi;

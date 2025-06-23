
import { OSRSItem } from './types';

const ITEMS_DB = [
  { id: 995, name: "Coins", icon: "", value: 1 },
  { id: 13204, name: "Platinum token", icon: "", value: 1000 },
  // ... more items would be here in a real implementation
];

export const itemsApi = {
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

  getEstimatedItemValue(itemName: string): number {
    if (itemName.toLowerCase().includes('coin')) return 1;
    if (itemName.toLowerCase().includes('platinum')) return 1000;
    return Math.floor(Math.random() * 1000) + 50;
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

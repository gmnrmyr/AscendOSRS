
// Dedicated OSRS Items API for proper item search and price fetching
const OSRS_WIKI_API = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const OSRS_ITEMS_API = 'https://oldschool.runescape.wiki/api.php';

interface OSRSItemResult {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  value: number;
  category: string;
}

export class OSRSItemsAPI {
  private static itemCache = new Map<string, OSRSItemResult[]>();
  private static priceCache = new Map<number, number>();

  static async searchOSRSItems(query: string): Promise<OSRSItemResult[]> {
    if (!query || query.length < 2) return [];
    
    const cacheKey = query.toLowerCase();
    if (this.itemCache.has(cacheKey)) {
      return this.itemCache.get(cacheKey) || [];
    }

    try {
      console.log(`Searching OSRS items for: ${query}`);
      
      // Search for items using the OSRS Wiki API
      const searchParams = new URLSearchParams({
        action: 'opensearch',
        search: query,
        limit: '15',
        namespace: '0',
        format: 'json'
      });

      const response = await fetch(`${OSRS_ITEMS_API}?${searchParams.toString()}`);
      const data = await response.json();
      
      if (!data || !Array.isArray(data) || data.length < 2) {
        console.log('No search results from OSRS Wiki API');
        return [];
      }

      const [, titles] = data;
      const items: OSRSItemResult[] = [];

      // Get current prices for all items
      const pricesData = await this.fetchCurrentPrices();

      for (let i = 0; i < Math.min(titles.length, 12); i++) {
        const title = titles[i];
        
        // Filter out non-item pages
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
            title.includes('History of') ||
            title.includes('Diary') ||
            title.includes('Achievement')) {
          continue;
        }
        
        try {
          // Get item ID and price
          const itemData = await this.getItemData(title, pricesData);
          
          if (itemData && itemData.value > 0) {
            items.push({
              id: itemData.id,
              name: title,
              subtitle: `${itemData.value.toLocaleString()} GP`,
              icon: this.getItemIcon(itemData.id),
              value: itemData.value,
              category: 'item'
            });
          }
        } catch (error) {
          console.error(`Error processing item ${title}:`, error);
        }
      }

      // Sort by price (highest first) and cache results
      items.sort((a, b) => b.value - a.value);
      this.itemCache.set(cacheKey, items);
      
      console.log(`Found ${items.length} OSRS items with prices`);
      return items;
    } catch (error) {
      console.error('Error searching OSRS items:', error);
      return [];
    }
  }

  private static async fetchCurrentPrices(): Promise<Record<string, any>> {
    try {
      const response = await fetch(OSRS_WIKI_API);
      if (response.ok) {
        const data = await response.json();
        return data.data || {};
      }
    } catch (error) {
      console.error('Error fetching current prices:', error);
    }
    return {};
  }

  private static async getItemData(itemName: string, pricesData: Record<string, any>): Promise<{id: number, value: number} | null> {
    try {
      // Try to find item ID from known mappings first
      const itemId = this.getKnownItemId(itemName);
      
      if (itemId) {
        const priceData = pricesData[itemId.toString()];
        if (priceData && (priceData.high || priceData.low)) {
          const price = priceData.high || priceData.low;
          this.priceCache.set(itemId, price);
          return { id: itemId, value: price };
        }
      }

      return null;
    } catch (error) {
      console.error(`Error getting item data for ${itemName}:`, error);
      return null;
    }
  }

  private static getKnownItemId(itemName: string): number | null {
    // Common OSRS items with their IDs
    const knownItems: Record<string, number> = {
      'Twisted bow': 20997,
      'Scythe of vitur': 22325,
      'Dragon claws': 13652,
      'Abyssal whip': 4151,
      'Bandos chestplate': 11832,
      'Bandos tassets': 11834,
      'Armadyl chestplate': 11828,
      'Armadyl chainskirt': 11830,
      'Primordial boots': 13239,
      'Pegasian boots': 13237,
      'Eternal boots': 13235,
      'Avernic defender': 22322,
      'Dragon hunter crossbow': 21012,
      'Dragon hunter lance': 22978,
      'Ghrazi rapier': 22324,
      'Justiciar faceguard': 22326,
      'Justiciar chestguard': 22327,
      'Justiciar legguards': 22328,
      'Old school bond': 13190,
      'Prayer scroll (rigour)': 21034,
      'Prayer scroll (augury)': 21079,
      'Coins': 995,
      'Platinum token': 13204,
      'Dragon boots': 11840,
      'Fire cape': 6570,
      'Infernal cape': 21295,
      'Barrows gloves': 7462,
      'Dragon defender': 12954,
      'Berserker ring': 6737,
      'Archer ring': 6733,
      'Seers ring': 6731,
      'Warrior ring': 6735
    };

    return knownItems[itemName] || null;
  }

  private static getItemIcon(itemId: number): string {
    return `https://oldschool.runescape.wiki/images/thumb/${itemId}.png/32px-${itemId}.png`;
  }

  static async getItemPrice(itemId: number): Promise<number | null> {
    if (this.priceCache.has(itemId)) {
      return this.priceCache.get(itemId) || null;
    }

    try {
      const response = await fetch(OSRS_WIKI_API);
      if (response.ok) {
        const data = await response.json();
        const itemData = data.data?.[itemId.toString()];
        
        if (itemData && (itemData.high || itemData.low)) {
          const price = itemData.high || itemData.low;
          this.priceCache.set(itemId, price);
          return price;
        }
      }
    } catch (error) {
      console.error(`Error fetching price for item ${itemId}:`, error);
    }

    return null;
  }
}

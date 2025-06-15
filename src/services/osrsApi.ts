import { WikiPricesApi } from './api/wikiPricesApi';
import { ItemSearchApi } from './api/itemSearchApi';
import { getItemIdByName } from './utils/itemMapping';
import { getItemIcon } from './utils/itemIconUtils';
import { OSRSPriceData, OSRSSearchResult, OSRSMoneyMakingMethod } from './types/osrs';

// Re-export types for backwards compatibility
export type { OSRSItem, OSRSPriceData, OSRSSearchResult, OSRSMoneyMakingMethod } from './types/osrs';

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

  // Money making methods (placeholder - would need real data source)
  async searchMoneyMakingMethods(query: string): Promise<OSRSSearchResult[]> {
    console.log(`OSRSApi: Searching for money making methods with query: "${query}"`);
    
    // This would need to be implemented with a real data source
    // For now, return empty array
    return [];
  }

  // Utility methods
  getItemIdByName(itemName: string): number | undefined {
    return getItemIdByName(itemName);
  }

  getItemIcon(itemName: string): string {
    return getItemIcon(itemName);
  }
}

// Export singleton instance
export const osrsApi = new OSRSApi();

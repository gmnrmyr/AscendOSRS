
import { OSRSPriceData } from '../types/osrs';

const WIKI_PRICES_BASE_URL = 'https://prices.runescape.wiki/api/v1/osrs';

export class WikiPricesApi {
  static async fetchSingleItemPrice(itemId: number): Promise<OSRSPriceData | null> {
    console.log(`Fetching price for item ID: ${itemId}`);
    
    try {
      const response = await fetch(`${WIKI_PRICES_BASE_URL}/latest?id=${itemId}`, {
        headers: {
          'User-Agent': 'OSRS Tracker - Price Fetcher'
        }
      });

      if (!response.ok) {
        console.log(`Wiki prices API returned ${response.status} for item ${itemId}`);
        return null;
      }

      const data = await response.json();
      
      if (!data?.data || !data.data[itemId]) {
        console.log(`No price data found for item ${itemId} in wiki API`);
        return null;
      }

      const itemData = data.data[itemId];
      console.log(`Wiki API returned price data for item ${itemId}:`, itemData);
      
      return {
        high: itemData.high || 0,
        highTime: itemData.highTime || 0,
        low: itemData.low || 0,
        lowTime: itemData.lowTime || 0
      };
    } catch (error) {
      console.error(`Error fetching price from wiki API for item ${itemId}:`, error);
      return null;
    }
  }

  static async fetchMultipleItemPrices(itemIds: number[]): Promise<Record<number, OSRSPriceData>> {
    const idsString = itemIds.join(',');
    console.log(`Fetching prices for multiple items: ${idsString}`);
    
    try {
      const response = await fetch(`${WIKI_PRICES_BASE_URL}/latest?id=${idsString}`, {
        headers: {
          'User-Agent': 'OSRS Tracker - Price Fetcher'
        }
      });

      if (!response.ok) {
        console.log(`Wiki prices API returned ${response.status} for items ${idsString}`);
        return {};
      }

      const data = await response.json();
      const result: Record<number, OSRSPriceData> = {};
      
      if (data?.data) {
        for (const [itemId, priceData] of Object.entries(data.data)) {
          const id = parseInt(itemId);
          const price = priceData as any;
          result[id] = {
            high: price.high || 0,
            highTime: price.highTime || 0,
            low: price.low || 0,
            lowTime: price.lowTime || 0
          };
        }
      }
      
      console.log(`Fetched ${Object.keys(result).length} prices from wiki API`);
      return result;
    } catch (error) {
      console.error('Error fetching multiple prices from wiki API:', error);
      return {};
    }
  }
}

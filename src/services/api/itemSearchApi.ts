
import { OSRSItem, OSRSSearchResult } from '../types/osrs';

const WIKI_API_BASE_URL = 'https://oldschool.runescape.wiki/api.php';

export class ItemSearchApi {
  static async searchItems(query: string): Promise<OSRSSearchResult[]> {
    console.log(`Searching for items with query: "${query}"`);
    
    if (query.length < 2) {
      return [];
    }

    try {
      const searchUrl = `${WIKI_API_BASE_URL}?action=opensearch&search=${encodeURIComponent(query)}&limit=20&namespace=0&format=json&origin=*`;
      
      const response = await fetch(searchUrl);
      if (!response.ok) {
        console.log(`Wiki search API returned ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!Array.isArray(data) || data.length < 2) {
        console.log('Invalid search response format');
        return [];
      }

      const titles = data[1] || [];
      const results: OSRSSearchResult[] = [];

      for (let i = 0; i < Math.min(titles.length, 10); i++) {
        const title = titles[i];
        
        if (title && typeof title === 'string') {
          results.push({
            id: `search_${i}_${Date.now()}`,
            name: title,
            subtitle: 'OSRS Wiki',
            category: 'item',
            value: 0
          });
        }
      }

      console.log(`Found ${results.length} search results`);
      return results;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  }
}

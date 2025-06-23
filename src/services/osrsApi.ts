import { hiscoresApi } from "./hiscoresApi";

interface ItemPrice {
  [key: string]: number;
}

const cachedItemPrices: ItemPrice = {};

export const osrsApi = {
  getItemPrice: async (itemName: string): Promise<number | undefined> => {
    if (cachedItemPrices[itemName]) {
      return cachedItemPrices[itemName];
    }

    try {
      const response = await fetch(`https://prices.runescape.wiki/api/v1/osrs/mapping`);
      const data = await response.json();

      const item = data.find((item: any) => item.name.toLowerCase() === itemName.toLowerCase());

      if (item) {
        const detailResponse = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${item.id}`);
        const detailData = await detailResponse.json();

        const price = detailData.data[item.id]?.high;
        if (price) {
          cachedItemPrices[itemName] = price;
          return price;
        }
      }

      return undefined;
    } catch (error) {
      console.error("Error fetching item price:", error);
      return undefined;
    }
  },

  getMultipleItemPrices: async (itemNames: string[]): Promise<{ [itemName: string]: number | undefined }> => {
    const prices: { [itemName: string]: number | undefined } = {};
    const uncachedItemNames = itemNames.filter(itemName => !cachedItemPrices[itemName]);

    if (uncachedItemNames.length > 0) {
      try {
        const response = await fetch(`https://prices.runescape.wiki/api/v1/osrs/mapping`);
        const data = await response.json();

        const itemMap: { [key: string]: any } = {};
        data.forEach((item: any) => {
          itemMap[item.name.toLowerCase()] = item;
        });

        const ids = uncachedItemNames.map(itemName => itemMap[itemName.toLowerCase()]?.id).filter(id => id);
        const detailResponse = await fetch(`https://prices.runescape.wiki/api/v1/osrs/latest?id=${ids.join(',')}`);
        const detailData = await detailResponse.json();

        uncachedItemNames.forEach(itemName => {
          const item = itemMap[itemName.toLowerCase()];
          if (item) {
            const price = detailData.data[item.id]?.high;
            if (price) {
              cachedItemPrices[itemName] = price;
              prices[itemName] = price;
            } else {
              prices[itemName] = undefined;
            }
          } else {
            prices[itemName] = undefined;
          }
        });
      } catch (error) {
        console.error("Error fetching multiple item prices:", error);
        uncachedItemNames.forEach(itemName => prices[itemName] = undefined);
      }
    }

    itemNames.forEach(itemName => {
      if (cachedItemPrices[itemName]) {
        prices[itemName] = cachedItemPrices[itemName];
      }
    });

    return prices;
  },

  parseBankCSV: (csvText: string) => {
    console.log('Parsing CSV/JSON data:', csvText);
    
    // Check if it's JSON format (RuneLite Data Exporter plugin)
    try {
      const jsonData = JSON.parse(csvText);
      if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].id) {
        console.log('Detected JSON format from Data Exporter plugin');
        return jsonData.map(item => ({
          name: item.name,
          quantity: item.quantity || 0,
          value: (item.quantity || 0) * (osrsApi.getItemPrice(item.name) || 0)
        }));
      }
    } catch (e) {
      // Not JSON, continue with CSV parsing
    }

    // Original CSV parsing logic
    const lines = csvText.trim().split('\n');
    const items: Array<{name: string; quantity: number; value: number}> = [];
    
    // Skip header if present
    const startIndex = lines[0]?.toLowerCase().includes('item') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Handle CSV with quotes and commas
      const parts = line.split(',').map(part => part.replace(/"/g, '').trim());
      
      if (parts.length >= 2) {
        const name = parts[0];
        const quantity = parseInt(parts[1]) || 0;
        const value = parseInt(parts[2]) || (quantity * (osrsApi.getItemPrice(name) || 0));
        
        if (name && quantity > 0) {
          items.push({
            name,
            quantity,
            value
          });
        }
      }
    }
    
    console.log('Parsed items:', items);
    return items;
  },
};

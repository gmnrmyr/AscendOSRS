import { useState } from "react";
import { AutocompleteInput } from "../AutocompleteInput";
import { OSRSItemsAPI } from "@/services/osrsItemsApi";
import { useOsrsItems } from "@/hooks/useOsrsItems";
import { osrsApi } from "@/services/osrsApi";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: any) => void;
  placeholder?: string;
}

export function ItemSearchInput({ value, onChange, onItemSelect, placeholder }: ItemSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { search: localSearch, loading, items } = useOsrsItems();

  // Enhanced fallback prices for common items (only used as last resort)
  const fallbackPrices: Record<string, number> = {
    "dragon hunter lance": 85000000,
    "bandos tassets": 28000000,
    "bandos chestplate": 25000000,
    "armadyl chestplate": 35000000,
    "armadyl chainskirt": 30000000,
    "twisted bow": 1200000000,
    "scythe of vitur": 800000000,
    "sang staff": 120000000,
    "avernic defender": 120000000,
    "primordial boots": 32000000,
    "pegasian boots": 35000000,
    "eternal boots": 4500000,
    "dragon hunter crossbow": 130000000,
    "toxic blowpipe": 4500000,
    "abyssal whip": 2500000,
    "dragon scimitar": 100000,
    "dragon boots": 220000,
    "berserker ring": 2500000,
    "dragon warhammer": 45000000,
    "occult necklace": 1200000,
    "anguish": 15000000,
    "tormented bracelet": 12000000,
    "zenyte": 12000000,
    "onyx": 2700000,
    "amethyst arrow": 150,
    "dragon arrow": 300,
    "rune arrow": 100,
    "adamant arrow": 50,
    "dragon dagger": 17000,
    "runite bar": 12000,
    "runite ore": 11000,
    "coal": 150,
    "nature rune": 180,
    "law rune": 200,
    "death rune": 220,
    "blood rune": 350,
    "soul rune": 180,
    "dragon bones": 2800,
    "superior dragon bones": 8500,
    "shark": 800,
    "manta ray": 1400,
    "karambwan": 1200,
    "anglerfish": 1800,
    "prayer potion(4)": 10000,
    "super combat potion(4)": 15000,
    "ranging potion(4)": 8000,
    "stamina potion(4)": 12000,
    "saradomin brew(4)": 6000,
    "super restore(4)": 12000
  };

  const getItemPrice = async (itemName: string, itemId?: number): Promise<number> => {
    try {
      // First try to get live price using the existing working system
      if (itemId) {
        console.log(`Fetching live price for ${itemName} (ID: ${itemId})`);
        const livePrice = await osrsApi.fetchSingleItemPrice(itemId);
        if (livePrice && livePrice > 0) {
          console.log(`Got live price for ${itemName}: ${livePrice.toLocaleString()} GP`);
          return livePrice;
        }
      }

      // Try to get item ID by name and fetch price
      const foundItemId = await osrsApi.getItemIdByName(itemName);
      if (foundItemId) {
        console.log(`Found item ID ${foundItemId} for ${itemName}, fetching price...`);
        const livePrice = await osrsApi.fetchSingleItemPrice(foundItemId);
        if (livePrice && livePrice > 0) {
          console.log(`Got live price for ${itemName}: ${livePrice.toLocaleString()} GP`);
          return livePrice;
        }
      }

      // Fallback to hardcoded prices
      const fallbackPrice = fallbackPrices[itemName.toLowerCase()];
      if (fallbackPrice) {
        console.log(`Using fallback price for ${itemName}: ${fallbackPrice.toLocaleString()} GP`);
        return fallbackPrice;
      }

      console.log(`No price found for ${itemName}`);
      return 0;
    } catch (error) {
      console.error(`Error getting price for ${itemName}:`, error);
      
      // Fallback to hardcoded prices on error
      const fallbackPrice = fallbackPrices[itemName.toLowerCase()];
      if (fallbackPrice) {
        console.log(`Using fallback price for ${itemName} due to error: ${fallbackPrice.toLocaleString()} GP`);
        return fallbackPrice;
      }
      
      return 0;
    }
  };

  // Search function that prioritizes the working API system
  const searchItems = async (query: string) => {
    if (loading) return [];
    
    setIsSearching(true);
    try {
      // First try the existing working OSRSApi search (this was working before!)
      console.log(`Searching for items using OSRSApi: ${query}`);
      const osrsItems = await OSRSItemsAPI.searchOSRSItems(query || '');
      
      if (osrsItems && osrsItems.length > 0) {
        console.log(`Found ${osrsItems.length} items from OSRSApi`);
        // These already have prices from the working system
        return osrsItems.map(item => ({ ...item, source: 'api' }));
      }

      // Fallback to local search with live price fetching
      console.log(`No results from OSRSApi, trying local search for: ${query}`);
      const localResults = localSearch(query);
      
      if (localResults.length > 0) {
        console.log(`Found ${localResults.length} local items, fetching prices...`);
        
        // Get prices for local results using the working price system
        const itemsWithPrices = await Promise.all(
          localResults.slice(0, 5).map(async (item) => {
            const price = await getItemPrice(item.name, item.id);
            return {
              id: item.id,
              name: item.name,
              subtitle: price > 0 ? `${price.toLocaleString()} GP` : 'Price not available',
              icon: item.image_url,
              value: price,
              category: 'item',
              source: 'local',
            };
          })
        );
        
        return itemsWithPrices;
      }

      console.log(`No items found for query: ${query}`);
      return [];
      
    } catch (error) {
      console.error('Error searching OSRS items:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <AutocompleteInput
        value={value}
        onChange={onChange}
        onSelect={onItemSelect}
        placeholder={placeholder || "Search OSRS items (e.g., Twisted bow, Bandos chestplate)"}
        searchFunction={searchItems}
        className="bg-white dark:bg-slate-800"
      />
      {(isSearching || loading) && (
        <div className="text-xs text-gray-500 mt-1">Searching OSRS items...</div>
      )}
    </div>
  );
}

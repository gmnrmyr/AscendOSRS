import { useState } from "react";
import { AutocompleteInput } from "../AutocompleteInput";
import { OSRSItemsAPI } from "@/services/osrsItemsApi";
import { useOsrsItems } from "@/hooks/useOsrsItems";
import { ensurePrices, priceOf, idByName } from "@/services/priceEngine";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: any) => void;
  placeholder?: string;
}

export function ItemSearchInput({ value, onChange, onItemSelect, placeholder }: ItemSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { search: localSearch, loading, items } = useOsrsItems();

  // Preço GE ao vivo pelo priceEngine (OSRS Wiki realtime, por id). Sem tabela hardcoded.
  const getItemPrice = async (itemName: string, itemId?: number): Promise<number> => {
    try {
      await ensurePrices();
      if (itemId) {
        const p = priceOf(itemId);
        if (p > 0) return p;
      }
      const byName = idByName(itemName); // resolve id pelo nome (exato -> começa-com -> contém)
      return byName ? priceOf(byName) : 0;
    } catch (error) {
      console.error(`Error getting price for ${itemName}:`, error);
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
        className="bg-card"
      />
      {(isSearching || loading) && (
        <div className="text-xs text-muted-foreground mt-1">Searching OSRS items...</div>
      )}
    </div>
  );
}

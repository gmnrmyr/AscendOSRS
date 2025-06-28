
import { useState } from "react";
import { AutocompleteInput } from "../AutocompleteInput";
import { OSRSItemsAPI } from "@/services/osrsItemsApi";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: any) => void;
  placeholder?: string;
}

export function ItemSearchInput({ value, onChange, onItemSelect, placeholder }: ItemSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);

  const searchItems = async (query: string) => {
    console.log('Searching for OSRS items:', query);
    setIsSearching(true);
    
    try {
      if (!query || query.length < 2) return [];

      // Search for OSRS items with proper prices
      const osrsItems = await OSRSItemsAPI.searchOSRSItems(query);
      console.log('Found OSRS items with prices:', osrsItems);
      
      return osrsItems;
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
      {isSearching && (
        <div className="text-xs text-gray-500 mt-1">Searching OSRS items with prices...</div>
      )}
    </div>
  );
}

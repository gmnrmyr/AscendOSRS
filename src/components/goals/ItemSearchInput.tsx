
import { useState } from "react";
import { AutocompleteInput } from "../AutocompleteInput";
import { OSRSItemsAPI } from "@/services/osrsItemsApi";
import { osrsWikiApi } from "@/services/osrsWikiApi";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: any) => void;
  placeholder?: string;
}

export function ItemSearchInput({ value, onChange, onItemSelect, placeholder }: ItemSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);

  // Show all OSRS items (not just popular) with price and icon, using OSRSItemsAPI for all queries
  const searchItems = async (query: string) => {
    setIsSearching(true);
    try {
      // Always use the full item search, even for empty query (show all items people might add as a goal)
      const osrsItems = await OSRSItemsAPI.searchOSRSItems(query || '');
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

import { useState } from "react";
import { AutocompleteInput } from "../AutocompleteInput";
import { OSRSItemsAPI } from "@/services/osrsItemsApi";
import { useOsrsItems } from "@/hooks/useOsrsItems";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: any) => void;
  placeholder?: string;
}

export function ItemSearchInput({ value, onChange, onItemSelect, placeholder }: ItemSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { search: localSearch, loading } = useOsrsItems();

  // Search local items first, then fallback to API if no results
  const searchItems = async (query: string) => {
    if (loading) return [];
    const localResults = localSearch(query).map(item => ({
      id: item.id,
      name: item.name,
      subtitle: '',
      icon: item.image_url,
      value: 0,
      category: 'item',
      source: 'local',
    }));
    if (localResults.length > 0) return localResults;
    setIsSearching(true);
    try {
      const osrsItems = await OSRSItemsAPI.searchOSRSItems(query || '');
      return osrsItems.map(item => ({ ...item, source: 'api' }));
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


import { useState } from "react";
import { AutocompleteInput } from "../AutocompleteInput";
import { osrsApi } from "@/services/osrsApi";

interface ItemSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onItemSelect: (item: any) => void;
  placeholder?: string;
}

export function ItemSearchInput({ value, onChange, onItemSelect, placeholder }: ItemSearchInputProps) {
  const [isSearching, setIsSearching] = useState(false);

  const searchItems = async (query: string) => {
    console.log('Searching for items:', query);
    setIsSearching(true);
    
    try {
      if (!query || query.length < 2) return [];

      // Search for OSRS items
      const osrsItems = await osrsApi.searchOSRSItems(query);
      console.log('Found OSRS items:', osrsItems);
      
      // Also get money making methods as alternative suggestions
      const moneyMethods = await osrsApi.fetchMoneyMakingMethods(query);
      const methodResults = moneyMethods.slice(0, 3).map(method => ({
        id: method.id,
        name: method.name,
        subtitle: `${(method.profit || method.gpHour).toLocaleString()} GP/hr - ${method.category}`,
        icon: '',
        value: method.profit || method.gpHour,
        category: 'method'
      }));

      const allResults = [...osrsItems, ...methodResults];
      console.log('All search results:', allResults);
      return allResults;
    } catch (error) {
      console.error('Error searching items:', error);
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
        placeholder={placeholder || "e.g., Twisted bow, Bandos chestplate"}
        searchFunction={searchItems}
        className="bg-white dark:bg-slate-800"
      />
      {isSearching && (
        <div className="text-xs text-gray-500 mt-1">Searching OSRS items...</div>
      )}
    </div>
  );
}

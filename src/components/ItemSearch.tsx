
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { osrsApi, OSRSItem } from "@/services/osrsApi";

interface ItemSearchProps {
  onItemSelect: (item: OSRSItem) => void;
  placeholder?: string;
}

export function ItemSearch({ onItemSelect, placeholder = "Search OSRS items..." }: ItemSearchProps) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<OSRSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [popularItems, setPopularItems] = useState<OSRSItem[]>([]);

  useEffect(() => {
    // Load popular items on component mount
    osrsApi.fetchPopularItems().then(setPopularItems);
  }, []);

  const searchItems = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const results = await osrsApi.searchItems(searchQuery);
      setItems(results);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    searchItems(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`;
    }
    return price.toLocaleString();
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'positive') return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (trend === 'negative') return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-400" />;
  };

  const displayItems = query.trim() ? items : popularItems;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {displayItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
          {displayItems.map((item, index) => (
            <Card 
              key={`${item.id}-${index}`} 
              className="cursor-pointer hover:bg-amber-50 transition-colors"
              onClick={() => onItemSelect(item)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-amber-800">{item.name}</h4>
                    {item.current_price && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {formatPrice(item.current_price)} gp
                        </Badge>
                        {item.today_trend && getTrendIcon(item.today_trend)}
                      </div>
                    )}
                  </div>
                  {item.icon && (
                    <img 
                      src={item.icon} 
                      alt={item.name}
                      className="w-8 h-8 ml-2"
                      onError={(e) => {
                        // Hide image if it fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!query.trim() && popularItems.length === 0 && (
        <p className="text-center text-gray-500 py-4">Loading popular items...</p>
      )}

      {query.trim() && items.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-4">No items found</p>
      )}

      {loading && (
        <p className="text-center text-gray-500 py-4">Searching...</p>
      )}
    </div>
  );
}

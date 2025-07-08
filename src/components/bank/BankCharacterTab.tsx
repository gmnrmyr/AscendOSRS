import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronDown, ChevronRight } from "lucide-react";
import { BankItemCard } from "./BankItemCard";
import { Button } from "@/components/ui/button";

interface BankCharacterTabProps {
  character: string;
  items: any[];
  onDeleteItem: (itemId: string) => void;
}

const VALUABLE_ITEMS_THRESHOLD = 5; // Show top 5 most valuable items when collapsed

export function BankCharacterTab({ character, items, onDeleteItem }: BankCharacterTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort items by value (quantity * price)
  const sortedItems = [...items].sort((a, b) => 
    (Math.floor(b.quantity) * b.estimatedPrice) - (Math.floor(a.quantity) * a.estimatedPrice)
  );

  const filteredItems = sortedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get items to display based on expanded state
  const displayedItems = isExpanded 
    ? filteredItems 
    : filteredItems.slice(0, VALUABLE_ITEMS_THRESHOLD);

  const totalValue = items.reduce((sum, item) => sum + (Math.floor(item.quantity) * item.estimatedPrice), 0);
  const hiddenItemsCount = filteredItems.length - displayedItems.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{character}'s Bank</span>
          <span className="text-lg text-green-600 font-bold">
            {totalValue.toLocaleString()} GP
          </span>
        </CardTitle>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="stackable">Stackable</SelectItem>
              <SelectItem value="gear">Gear</SelectItem>
              <SelectItem value="materials">Materials</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {filteredItems.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            {items.length === 0 
              ? "No items in this bank yet."
              : "No items match your current filters."
            }
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedItems.map((item) => (
                <BankItemCard
                  key={item.id}
                  item={item}
                  onDelete={onDeleteItem}
                />
              ))}
            </div>
            
            {filteredItems.length > VALUABLE_ITEMS_THRESHOLD && (
              <Button
                variant="ghost"
                className="w-full mt-4 flex items-center justify-center gap-2"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Show {hiddenItemsCount} More Items
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

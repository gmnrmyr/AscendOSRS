
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Coins, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

interface Character {
  id: string;
  name: string;
}

interface CharacterBankDisplayProps {
  characters: Character[];
  bankData: Record<string, BankItem[]>;
  getCharacterBankValue: (character: string) => number;
  getCharacterGoldValue: (character: string) => number;
  formatGP: (amount: number) => string;
  getCategoryColor: (category: string) => string;
  removeItem: (character: string, itemId: string) => void;
  updateItem: (character: string, itemId: string, field: keyof BankItem, value: any) => void;
}

type SortOption = 'value' | 'name' | 'quantity';

export function CharacterBankDisplay({
  characters,
  bankData,
  getCharacterBankValue,
  getCharacterGoldValue,
  formatGP,
  getCategoryColor,
  removeItem,
  updateItem
}: CharacterBankDisplayProps) {
  const [expandedCharacters, setExpandedCharacters] = useState<Record<string, boolean>>({});
  const [expandedItemLists, setExpandedItemLists] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState<SortOption>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const toggleCharacterExpansion = (characterName: string) => {
    setExpandedCharacters(prev => ({
      ...prev,
      [characterName]: !prev[characterName]
    }));
  };

  const toggleItemListExpansion = (characterName: string) => {
    setExpandedItemLists(prev => ({
      ...prev,
      [characterName]: !prev[characterName]
    }));
  };

  const sortItems = (items: BankItem[]): BankItem[] => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'value':
          comparison = (a.quantity * a.estimatedPrice) - (b.quantity * b.estimatedPrice);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (characters.length === 0) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Coins className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No characters available</h3>
          <p className="text-gray-400 text-center">
            Add characters in the Characters tab to start tracking bank values
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Sorting Controls */}
      <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="text-blue-800 dark:text-blue-200 font-medium">Sort by:</Label>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-32 bg-white dark:bg-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="value">Value</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="quantity">Quantity</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSort}
              className="flex items-center gap-2"
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortOrder === 'desc' ? 'High to Low' : 'Low to High'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {characters.map((character) => {
        const characterItems = bankData[character.name] || [];
        const sortedItems = sortItems(characterItems);
        const bankValue = getCharacterBankValue(character.name);
        const goldValue = getCharacterGoldValue(character.name);
        const isExpanded = expandedCharacters[character.name] ?? true;
        const isItemListExpanded = expandedItemLists[character.name] ?? true;
        
        return (
          <Card key={character.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCharacterExpansion(character.name)}
                    className="p-1 h-8 w-8"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
                    {character.name}'s Bank
                  </CardTitle>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 text-lg px-3 py-1">
                    {formatGP(bankValue)} GP
                  </Badge>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-sm px-2 py-1 block">
                    Gold: {formatGP(goldValue)} GP
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <>
                {characterItems.length > 0 ? (
                  <CardContent>
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="font-semibold text-amber-800 dark:text-amber-200">Items</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleItemListExpansion(character.name)}
                        className="p-1 h-6 w-6"
                      >
                        {isItemListExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    
                    {isItemListExpanded ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {sortedItems.map((item) => (
                          <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-amber-800 dark:text-amber-200 truncate">
                                {item.name}
                              </h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(character.name, item.id)}
                                className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            

                            
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <Label className="text-xs text-gray-500">Quantity</Label>
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItem(character.name, item.id, 'quantity', Number(e.target.value))}
                                  className="h-7 text-xs"
                                />
                              </div>
                              
                              <div>
                                <Label className="text-xs text-gray-500">Price Each</Label>
                                <Input
                                  type="number"
                                  value={item.estimatedPrice}
                                  onChange={(e) => updateItem(character.name, item.id, 'estimatedPrice', Number(e.target.value))}
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                            
                            <div className="mt-2 pt-2 border-t text-center">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {formatGP(item.quantity * item.estimatedPrice)} GP
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {sortedItems.slice(0, 5).map((item) => (
                          <div key={item.id} className="flex items-center justify-between py-1 px-2 bg-gray-50 dark:bg-gray-900/50 rounded text-sm">
                            <span className="truncate">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-500">{item.quantity}x</span>
                              <span className="font-medium text-green-600">
                                {formatGP(item.quantity * item.estimatedPrice)}
                              </span>
                            </div>
                          </div>
                        ))}

                      </div>
                    )}
                  </CardContent>
                ) : (
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Coins className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No items in bank yet</p>
                      <p className="text-sm">Select this character above to add items</p>
                    </div>
                  </CardContent>
                )}
              </>
            )}
          </Card>
        );
      })}
    </>
  );
}


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Coins, TrendingUp, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BankCSVImporter } from "./BankCSVImporter";

interface BankItem {
  id: string;
  name: string;
  quantity: number;
  estimatedPrice: number;
  category: 'stackable' | 'gear' | 'materials' | 'other';
  character: string;
}

interface BankTrackerProps {
  bankData: Record<string, BankItem[]>;
  setBankData: (bankData: Record<string, BankItem[]>) => void;
  characters: Array<{ id: string; name: string }>;
}

export function BankTracker({ bankData, setBankData, characters }: BankTrackerProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<string>('');
  const [newItem, setNewItem] = useState<Partial<BankItem>>({
    name: '',
    quantity: 1,
    estimatedPrice: 0,
    category: 'other'
  });
  const { toast } = useToast();

  const addItem = () => {
    if (!selectedCharacter) {
      toast({
        title: "Error",
        description: "Please select a character first",
        variant: "destructive"
      });
      return;
    }

    if (!newItem.name?.trim()) {
      toast({
        title: "Error",
        description: "Item name is required",
        variant: "destructive"
      });
      return;
    }

    const item: BankItem = {
      id: Date.now().toString(),
      name: newItem.name,
      quantity: newItem.quantity || 1,
      estimatedPrice: newItem.estimatedPrice || 0,
      category: newItem.category || 'other',
      character: selectedCharacter
    };

    const currentItems = bankData[selectedCharacter] || [];
    setBankData({
      ...bankData,
      [selectedCharacter]: [...currentItems, item]
    });

    setNewItem({
      name: '',
      quantity: 1,
      estimatedPrice: 0,
      category: 'other'
    });
    
    toast({
      title: "Success",
      description: `${item.name} added to ${selectedCharacter}'s bank`
    });
  };

  const removeItem = (character: string, itemId: string) => {
    const itemToRemove = bankData[character]?.find(item => item.id === itemId);
    setBankData({
      ...bankData,
      [character]: (bankData[character] || []).filter(item => item.id !== itemId)
    });
    
    toast({
      title: "Item Removed",
      description: `${itemToRemove?.name} removed from ${character}'s bank`
    });
  };

  const updateItem = (character: string, itemId: string, field: keyof BankItem, value: any) => {
    setBankData({
      ...bankData,
      [character]: (bankData[character] || []).map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    });
  };

  const addQuickItems = (character: string) => {
    const quickItems = [
      { name: "Coins", quantity: 0, estimatedPrice: 1, category: "stackable" },
      { name: "Platinum Tokens", quantity: 0, estimatedPrice: 1000, category: "stackable" },
      { name: "Prayer Potions(4)", quantity: 0, estimatedPrice: 12000, category: "stackable" },
      { name: "Super Combat Potions(4)", quantity: 0, estimatedPrice: 15000, category: "stackable" },
      { name: "Ranging Potions(4)", quantity: 0, estimatedPrice: 8000, category: "stackable" },
      { name: "Magic Potions(4)", quantity: 0, estimatedPrice: 1200, category: "stackable" }
    ];

    const newItems = quickItems.map(item => ({
      id: Date.now().toString() + Math.random(),
      ...item,
      category: item.category as BankItem['category'],
      character
    }));

    const currentItems = bankData[character] || [];
    setBankData({
      ...bankData,
      [character]: [...currentItems, ...newItems]
    });

    toast({
      title: "Quick Items Added",
      description: `Added common stackable items to ${character}'s bank`
    });
  };

  const handleImportBank = (items: BankItem[], character: string) => {
    setBankData({
      ...bankData,
      [character]: [...(bankData[character] || []), ...items]
    });
  };

  const formatGP = (amount: number) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B`;
    } else if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toLocaleString();
  };

  const getCharacterBankValue = (character: string) => {
    const items = bankData[character] || [];
    return items.reduce((total, item) => total + (item.quantity * item.estimatedPrice), 0);
  };

  // Get gold + platinum tokens value for a character
  const getCharacterGoldValue = (character: string) => {
    const items = bankData[character] || [];
    const coins = items.find(item => item.name.toLowerCase().includes('coin'))?.quantity || 0;
    const platTokens = items.find(item => item.name.toLowerCase().includes('platinum'))?.quantity || 0;
    return coins + (platTokens * 1000);
  };

  const getTotalBankValue = () => {
    return Object.keys(bankData).reduce((total, character) => total + getCharacterBankValue(character), 0);
  };

  // Get total gold value across all characters (coins + plat tokens)
  const getTotalGoldValue = () => {
    return Object.keys(bankData).reduce((total, character) => total + getCharacterGoldValue(character), 0);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'stackable': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'gear': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'materials': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'other': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add/update gold and plat tokens for a character
  const updateGoldTokens = (character: string, type: 'coins' | 'platinum', quantity: number) => {
    const currentItems = bankData[character] || [];
    const itemName = type === 'coins' ? 'Coins' : 'Platinum Tokens';
    const itemPrice = type === 'coins' ? 1 : 1000;
    
    const existingItemIndex = currentItems.findIndex(item => 
      item.name.toLowerCase().includes(type === 'coins' ? 'coin' : 'platinum')
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: quantity
      };
      setBankData({
        ...bankData,
        [character]: updatedItems
      });
    } else {
      // Add new item
      const newItem: BankItem = {
        id: Date.now().toString(),
        name: itemName,
        quantity: quantity,
        estimatedPrice: itemPrice,
        category: 'stackable',
        character: character
      };
      setBankData({
        ...bankData,
        [character]: [...currentItems, newItem]
      });
    }
  };

  const getCharacterCoins = (character: string) => {
    const items = bankData[character] || [];
    return items.find(item => item.name.toLowerCase().includes('coin'))?.quantity || 0;
  };

  const getCharacterPlatTokens = (character: string) => {
    const items = bankData[character] || [];
    return items.find(item => item.name.toLowerCase().includes('platinum'))?.quantity || 0;
  };

  return (
    <div className="space-y-6">
      {/* Bank CSV Importer */}
      <BankCSVImporter 
        onImportBank={handleImportBank}
        characters={characters}
      />

      {/* Total Bank Value Summary */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  Total Bank Value
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {formatGP(getTotalBankValue())} GP
                </p>
                <p className="text-amber-600 dark:text-amber-300">
                  Across {characters.length} characters
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                  Total Gold Value
                </h3>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
                  {formatGP(getTotalGoldValue())} GP
                </p>
                <p className="text-amber-600 dark:text-amber-300">
                  Coins + Plat Tokens
                </p>
              </div>
              <Wallet className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Selection and Add Items */}
      <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <Plus className="h-5 w-5" />
            Bank Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Character</Label>
            <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
              <SelectTrigger className="bg-white dark:bg-slate-800">
                <SelectValue placeholder="Choose a character to manage bank" />
              </SelectTrigger>
              <SelectContent>
                {characters.map((char) => (
                  <SelectItem key={char.id} value={char.name}>{char.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCharacter && (
            <>
              {/* Gold & Platinum Tokens Section */}
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Gold & Platinum Tokens
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Coins</Label>
                    <Input
                      type="number"
                      value={getCharacterCoins(selectedCharacter)}
                      onChange={(e) => updateGoldTokens(selectedCharacter, 'coins', Number(e.target.value))}
                      placeholder="0"
                      className="bg-white dark:bg-slate-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">Value: 1 GP each</p>
                  </div>
                  
                  <div>
                    <Label>Platinum Tokens</Label>
                    <Input
                      type="number"
                      value={getCharacterPlatTokens(selectedCharacter)}
                      onChange={(e) => updateGoldTokens(selectedCharacter, 'platinum', Number(e.target.value))}
                      placeholder="0"
                      className="bg-white dark:bg-slate-800"
                    />
                    <p className="text-xs text-gray-500 mt-1">Value: 1,000 GP each</p>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded border">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Total Gold Value: {formatGP(getCharacterGoldValue(selectedCharacter))} GP
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Item Name</Label>
                  <Input
                    value={newItem.name || ''}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="e.g., Prayer Potion(4)"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={newItem.quantity || ''}
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                    placeholder="1"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <Label>Price Each (GP)</Label>
                  <Input
                    type="number"
                    value={newItem.estimatedPrice || ''}
                    onChange={(e) => setNewItem({...newItem, estimatedPrice: Number(e.target.value)})}
                    placeholder="0"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select 
                    value={newItem.category} 
                    onValueChange={(value) => setNewItem({...newItem, category: value as BankItem['category']})}
                  >
                    <SelectTrigger className="bg-white dark:bg-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stackable">Stackable</SelectItem>
                      <SelectItem value="gear">Gear</SelectItem>
                      <SelectItem value="materials">Materials</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addItem} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
                
                <Button onClick={() => addQuickItems(selectedCharacter)} variant="outline">
                  Add Common Items
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Character Bank Display */}
      {characters.map((character) => {
        const characterItems = bankData[character.name] || [];
        const bankValue = getCharacterBankValue(character.name);
        const goldValue = getCharacterGoldValue(character.name);
        
        return (
          <Card key={character.id} className="bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-amber-800 dark:text-amber-200">
                  {character.name}'s Bank
                </CardTitle>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 dark:bg-green-900/20 text-lg px-3 py-1">
                    {formatGP(bankValue)} GP
                  </Badge>
                  <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 text-sm px-2 py-1 block">
                    Gold: {formatGP(goldValue)} GP
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    {characterItems.length} items
                  </p>
                </div>
              </div>
            </CardHeader>
            
            {characterItems.length > 0 ? (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {characterItems.map((item) => (
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
                      
                      <Badge className={getCategoryColor(item.category)}>
                        {item.category}
                      </Badge>
                      
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
          </Card>
        );
      })}

      {characters.length === 0 && (
        <Card className="bg-gray-50 dark:bg-gray-900/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Coins className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No characters available</h3>
            <p className="text-gray-400 text-center">
              Add characters in the Characters tab to start tracking bank values
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
